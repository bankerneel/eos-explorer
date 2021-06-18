import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, combineLatest, of } from 'rxjs';
import { map, switchMap, share, catchError } from 'rxjs/operators';
import { AlaService } from '../../services/ala.service';
import { AppService } from '../../services/app.service';
import countryCodeToFlag from "country-code-to-flag";
import { getCountryName } from '../producers/countrycodes';

var countries = require("i18n-iso-countries");

@Component({
  templateUrl: './producer.component.html',
  styleUrls: ['./producer.component.scss']
})
export class ProducerComponent implements OnInit {

  name$: Observable<string>;
  producer$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private alaService: AlaService,
    private appService: AppService
  ) { }

  ngOnInit() {
    this.name$ = this.route.params.pipe(
      map(params => params.id)
    );
    this.producer$ = combineLatest(
      this.name$,
      this.alaService.getChainStatus(),
      this.alaService.getProducers(),
      this.name$.pipe(
        switchMap(name => this.alaService.getDeferAccount(name))
      )
    ).pipe(
      map(([name, chainStatus, producers, account]) => {
        const producer = producers.find(producer => producer.owner === name);
        const index = producers.findIndex(producer => producer.owner === name);
        const votesToRemove = producers.reduce((acc, cur) => {
          const percentageVotes = cur.total_votes / chainStatus.total_producer_vote_weight * 100;
          // if (percentageVotes * 200 < 100) {
          //   acc += parseFloat(cur.total_votes);
          // }
          return acc;
        }, 0);
        let position = parseInt(index) + 1;
        let reward = 0;
        let percentageVotes = producer.total_votes / chainStatus.total_producer_vote_weight * 100;
        let percentageVotesRewarded = producer.total_votes / (chainStatus.total_producer_vote_weight - votesToRemove) * 100;
        
        let abc
        abc = countries.numericToAlpha2(producer.location)
        if (typeof(abc) == 'undefined') {
          abc='Zt'
        }
        let xyz;
        xyz = countryCodeToFlag(abc)
        abc = getCountryName(abc)
        reward = ((chainStatus.perblock_bucket*producer.unpaid_blocks)/chainStatus.total_unpaid_blocks)/10000;
        if (percentageVotesRewarded >= 0.5) {
          reward = reward + 164.3835616;
        }
        return {
          ...producer,
          account: account,
          position: position,
          reward: reward.toFixed(4),
          votes: percentageVotes.toFixed(2),
          abc: abc
        }
      }),
      switchMap(producer => {
        if (!producer.url) {
          return of(producer);
        } else {
          return this.appService.getBpJson(producer.url).pipe(
            catchError(() => of(null)),
            map(bpJson => ({
              ...producer,
              bpJson,
              location: bpJson && bpJson.nodes && bpJson.nodes[0] && bpJson.nodes[0].location,
              validated: bpJson && bpJson.producer_public_key === producer.producer_key && bpJson.producer_account_name === producer.owner
            }))
          );
        }
      }),
      share()
    );
  }

}
