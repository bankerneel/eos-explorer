import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AlaService } from './ala.service';
import { Observable, Subject, timer, from, forkJoin, of } from 'rxjs';
import { map, filter, share, withLatestFrom, switchMap, catchError, take } from 'rxjs/operators';
import {environment} from '../../environments/environment';

const ALA_QUOTE = 60000;
const RAM_QUOTE = 60000;
const GET_INFO_INTERVAL = 5000;
const GET_PRICE_INFO_INTERVAL = 5000;

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private latestBlockNumberSource = new Subject<number>();

  latestBlockNumber$ = this.latestBlockNumberSource.asObservable();
  isMaintenance$: Observable<boolean>;
  alaQuote$: Observable<any>;
  ramQuote$: Observable<any>;
  info$: Observable<any>;
  getPriceInfo$: Observable<any>;
  latestBlock$: Observable<any>;
  recentBlocks$: Observable<any[]>;
  recentTransactions$: Observable<any[]>;

  constructor(
    private http: HttpClient,
    private alaService: AlaService
  ) {
    this.info$ = timer(0, GET_INFO_INTERVAL).pipe(
      switchMap(() => this.alaService.getDeferInfo()),
      share()
    );
    this.getPriceInfo$ = timer(0, GET_PRICE_INFO_INTERVAL).pipe(
      switchMap(() => this.alaService.getPriceInfo()),
      share()
    );
    this.latestBlock$ = this.info$.pipe(
      switchMap((info: any) => from(this.alaService.getDeferBlock(info.head_block_num))),
      share()
    );
    this.recentBlocks$ = this.latestBlock$.pipe(
      switchMap((block: any) => {
        const blockNumber: number = block.block_num;
        const blockNumbers: number[] = [blockNumber - 1, blockNumber - 2, blockNumber - 3, blockNumber - 4];
        const blockNumbers$: Observable<any>[] = blockNumbers.map(blockNum => this.alaService.getDeferBlock(blockNum).pipe(catchError(() => of(null))));
        return forkJoin(blockNumbers$).pipe(
          map((blocks) => [block, ...blocks].filter(block => block !== null))
        );
      }),
      share()
    );
    this.recentTransactions$ = this.recentBlocks$.pipe(
      map((blocks: any[]) => {
        return blocks.reduce((previous, current) => {
          const transactions = current.transactions.map(transaction => {
            return {
              ...transaction,
              block_num: current.block_num,
              trx: typeof transaction.trx === 'string' ? { id: transaction.trx } : transaction.trx
            };
          })
          return previous.concat(transactions);
        }, []);
      }),
      share()
    );
    this.isMaintenance$ = this.info$.pipe(
      withLatestFrom(this.latestBlockNumber$),
      map(([chainStatus, blockNumber]) => {
        return (chainStatus.head_block_num - blockNumber) > 600;
      }),
      share()
    );
    this.alaQuote$ = timer(0, ALA_QUOTE).pipe(
      switchMap(() => this.getALATicker()),
      filter(ticker => !!ticker.data),
      map(ticker => ticker.data),
      share()
    );
    this.ramQuote$ = timer(0, RAM_QUOTE).pipe(
      switchMap(() => from(this.alaService.ala.getTableRows({
        json: true,
        code: "alaio",
        scope: "alaio",
        table: "rammarket"
      }))),
      filter((data: any) => data.rows && data.rows.length),
      map(data => data.rows[0]),
      map(data => {
        const base = Number(data.base.balance.replace('RAM', ''));
        const quote = Number(data.quote.balance.replace('ALA', ''));
        return {
          ...data,
          price: quote / base
        };
      }),
      share()
    );
  }

  getBlocks(blockNumber?: number, limit = 10): Observable<any[]> {
    let blockNumber$: Observable<number>;
    if (blockNumber) {
      blockNumber$ = of(blockNumber);
    } else {
      blockNumber$ = this.info$.pipe(
        take(1),
        map(info => info.head_block_num)
      );
    }
    return blockNumber$.pipe(
      switchMap(blockNumber => {
        let blockNumbers: number[] = [];
        for (let i = blockNumber; i > blockNumber - limit && i > 0; i--) {
          blockNumbers.push(i);
        }
        const blockNumbers$: Observable<any>[] = blockNumbers.map(blockNumber => {
          return this.alaService.getDeferBlock(blockNumber).pipe(
            catchError(() => of(null))
          );
        });
        return forkJoin(blockNumbers$).pipe(
          map(blocks => blocks.filter(block => block !== null))
        );
      })
    );
  }

  getTokens(): Observable<any[]> {
    return this.http.get<any[]>(environment.tokensUrl);
  }

  getALATicker(): Observable<CMCTicker> {
    return this.http.get<CMCTicker>(environment.tickerUrl);
  }

  getBpJson(url: string): Observable<any> {
    return this.http.get<any>(`${url}/bp.json`);
  }

  setLatestBlockNumber(blockNumber: number) {
    if (blockNumber) {
      this.latestBlockNumberSource.next(blockNumber);
    }
  }

}

export interface CMCTicker {
  data?: {
    name: string;
    symbol: string;
    quotes: {
      USD: {
        price: number,
        market_cap: number,
        volume_24h: number
      }
    }
  };
  metadata?: any
}
