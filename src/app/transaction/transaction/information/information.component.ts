import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-transaction-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  @Input() transaction;
  @Input() blockPay;
  @Input() witnessPay;
  @Input() oraclePay;
  constructor() { }

  ngOnInit() {
    this.blockPay = this.transaction.traces[0].inline_traces.filter(traces => traces.act.data.from == 'alaio.bpay')
    this.witnessPay = this.transaction.traces[0].inline_traces.filter(traces => traces.act.data.from == 'alaio.wpay')
    this.oraclePay = this.transaction.traces[0].inline_traces.filter(traces => traces.act.data.from == 'alaio.opay')
  }
}
