import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlaService } from '../../services/ala.service';
import { Result } from '../../models';
import { Observable } from 'rxjs';
import { switchMap, filter } from 'rxjs/operators';
// import { filter } from 'rxjs/operators';

@Component({
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

  transaction$: Observable<Result<any>>;
  constructor(
    private route: ActivatedRoute,
    private alaService: AlaService
  ) { }

  ngOnInit() {
    this.transaction$ = this.route.params.pipe(
      switchMap(params => this.alaService.getTransactionRaw(+params.blockId, params.id))
    );    
  }

}
