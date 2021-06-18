import { Component, OnChanges, Input, Output, EventEmitter } from '@angular/core';
// import { TransactionComponent } from '../../../transaction/transaction/transaction.component' ;

@Component({
  selector: 'app-account-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class ActionsComponent implements OnChanges {

  @Input() actions;
  @Input() newActions;
  // @Input() ngSwitch: any;
  // @Input() transaction: TransactionComponent;
  @Output() onLoadMore = new EventEmitter<number>();
  actionsColumns = [
    'id',
    'blockId',
    'transactionId',
    'timestamp',
    'action',
    'data'
  ];
  accountActionSequence = 0;
  sanchit ="sanchit"

  constructor() { }

  ngOnChanges() {
    if (this.newActions && !this.newActions.isError) {
      this.actions.value = this.actions.value.concat(this.newActions.value);
      this.newActions = null;
    }
    if (this.actions && !this.actions.isError && this.actions.value.length) {
      this.accountActionSequence = this.actions.value[this.actions.value.length - 1].account_action_seq;
    }
    // console.log("aasasas",this.transaction.ngOnInit());
  }
}
