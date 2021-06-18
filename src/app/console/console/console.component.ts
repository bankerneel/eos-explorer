import { Component, OnInit } from '@angular/core';
import { from } from 'rxjs';
import { AlaService } from '../../services/ala.service';

@Component({
  selector: 'app-console',
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss']
})
export class ConsoleComponent implements OnInit {

  apiEndpoint$;
  result$;

  constructor(
    private alaService: AlaService
  ) { }

  ngOnInit() {
    this.apiEndpoint$ = this.alaService.apiEndpoint$;
  }

  getInfo() {
    this.result$ = from(this.alaService.ala.getInfo({}));
  }

  getBlock(block_num_or_id: number) {
    this.result$ = from(this.alaService.ala.getBlock(block_num_or_id));
  }

}
