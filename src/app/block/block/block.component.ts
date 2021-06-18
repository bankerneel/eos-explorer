import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlaService } from '../../services/ala.service';
import { Result } from '../../models';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';

@Component({
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {

  id$: Observable<number>;
  block$: Observable<Result<any>>;

  constructor(
    private route: ActivatedRoute,
    private alaService: AlaService
  ) { }

  ngOnInit() {
    this.id$ = this.route.params.pipe(
      map(params => +params.id)
    );
    this.block$ = this.id$.pipe(
      switchMap(id => this.alaService.getBlockRaw(id))
    );
  }

}
