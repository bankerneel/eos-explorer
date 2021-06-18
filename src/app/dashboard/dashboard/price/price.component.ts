import { Component, OnInit, Input } from '@angular/core';
import {environment} from '../../../../environments/environment';
import { AppService } from '../../../services/app.service';
import { AlaService } from '../../../services/ala.service';
import { Observable, of, timer, combineLatest } from 'rxjs';
import { map, share, switchMap, catchError, retry } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.scss']
})
export class PriceComponent implements OnInit {

  @Input() price: any;
  token = environment.token;
  price$: Observable<any>;

  constructor(
    private appService: AppService,
    private alaService: AlaService
  ) { }

  ngOnInit() {
    this.price$ = timer(0, 10000).pipe(
      switchMap(() => this.alaService.getPriceInfo()),
      share()
    );
    // this.price$ = this.appService.getPriceInfo$;
  }

}
