import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AlaService } from '../../services/ala.service';
import { Observable, of, timer, combineLatest } from 'rxjs';
import { map, share, switchMap, catchError, retry } from 'rxjs/operators';
import { Result } from '../../models';
import { ActivatedRoute } from '@angular/router';
import countryCodeToFlag from "country-code-to-flag";
import { getCountryName } from './countrycodes';

var countries = require("i18n-iso-countries");

@Component({
  templateUrl: './producers.component.html',
  styleUrls: ['./producers.component.scss']
})
export class ProducersComponent implements OnInit {

  columnHeaders$: Observable<string[]> = of(PRODUCERS_COLUMNS);
  producers$: Observable<any[]>;
  chainStatus$: Observable<any>;
  oracles$: Observable<any>;
  oracleReward$: Observable<any>;
  info$: Observable<any>;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private alaService: AlaService
  ) { }

  ngOnInit() {
    this.columnHeaders$ = this.breakpointObserver.observe(Breakpoints.XSmall).pipe(
      map(result => result.matches ? PRODUCERS_COLUMNS.filter((c: any) => (c !== 'url' && c !== 'numVotes')) : PRODUCERS_COLUMNS)
    );
    this.chainStatus$ = timer(0, 10000).pipe(
      switchMap(() => this.alaService.getChainStatus()),
      share()
    );
    this.oracles$ = timer(0, 10000).pipe(
      switchMap(() => this.alaService.getOraclesTable()),
      share()
    );
    this.oracleReward$ = timer(0, 10000).pipe(
      switchMap(() => this.alaService.getOraclesRewardTable()),
      share()
    );
    this.info$ = timer(0, 10000).pipe(
      switchMap(() => this.alaService.getBPInfo()),
      share()
    );
   
    this.producers$ = combineLatest(
      this.chainStatus$,
      this.alaService.getProducers(),
      this.alaService.getOraclesRewardTable(),
      this.alaService.getOraclesTable(),
      this.alaService.getRequestTable(),
      this.alaService.getBPInfo()
    ).pipe(
      map(([chainStatus, producers, rewardTable, oracleTable, requests, info]) => {
        const votesToRemove = producers.reduce((acc, cur) => {
          const percentageVotes = cur.total_votes / chainStatus.total_producer_vote_weight * 100;
          if (percentageVotes * 200 < 100) {
            acc += parseFloat(cur.total_votes);
          }
          return acc;
        }, 0);
        return producers.map((producer, index) => {
          let position = parseInt(index) + 1;
          let reward = 0;
          let oracleR = 0;
          let failed_request
          oracleTable.map(test => {
            let test1 = producer.owner;
            if (test.producer === test1) {
              let op = ((chainStatus.oracle_bucket * test.successful_requests) / rewardTable.total_successful_requests)
              op=(op/10000) - test.failed_requests
              failed_request= test.failed_requests
              if(isNaN(op)){
                return 0
              }
              if (op === NaN) {
                oracleR = 0
                return oracleR
              } else {
                oracleR = op
                return oracleR
              }
            }
          });
          let percentageVotes = producer.total_votes / chainStatus.total_producer_vote_weight * 100;
          let percentageVotesRewarded = producer.total_votes / (chainStatus.total_producer_vote_weight - votesToRemove) * 100;

          reward = ((chainStatus.perblock_bucket * producer.unpaid_blocks) / chainStatus.total_unpaid_blocks) / 10000;
          if (percentageVotesRewarded >= 0.5) {
            reward = reward + 164.3835616;
          }
          let abc
          abc = countries.numericToAlpha2(producer.location)
          if (typeof(abc) == 'undefined') {
            abc='Zt'
          }
          let xyz;
          xyz = countryCodeToFlag(abc)
          abc = getCountryName(abc)
          oracleR = (oracleR === NaN) ? 0 : oracleR;
          let totalReward
          totalReward = reward + oracleR
          return {
            ...producer,
            position: position,
            reward: reward.toFixed(4),
            votes: percentageVotes.toFixed(2),
            numVotes: (producer.total_votes / 10000),
            oracleReward: oracleR.toFixed(4),
            abc: abc,
            totalReward: totalReward.toFixed(4)
          }

        });
      }),
      share()
    );
  }

  private calculateVoteWeight() {
    //time epoch:
    //https://github.com/ALAIO/ala/blob/master/contracts/alaiolib/time.hpp#L160
    //stake to vote
    //https://github.com/ALAIO/ala/blob/master/contracts/alaio.system/voting.cpp#L105-L109
    let timestamp_epoch: number = 946684800000;
    let dates_: number = (Date.now() / 1000) - (timestamp_epoch / 1000);
    let weight_: number = Math.floor(dates_ / (86400 * 7)) / 52;  //86400 = seconds per day 24*3600
    ////console.log("vote weight:= " + Math.pow(2, weight_));
    return Math.pow(2, weight_);
  }

}

export const PRODUCERS_COLUMNS = [
  'owner',
  'position',
  'buttontd',
  'location',
  'url',
  'numVotes',
  'votes',
  'reward',
  'oracleReward',
  'totalReward'
];