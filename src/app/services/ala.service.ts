import * as Ala from 'alaxplorerjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, from, of, defer, combineLatest, BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Result } from '../models';
import { LoggerService } from './logger.service';

@Injectable()
export class AlaService {

  private apiEndpointSource = new BehaviorSubject<string>(environment.blockchainUrl);

  public apiEndpoint$ = this.apiEndpointSource.asObservable();
  public ala: any;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) {
    this.apiEndpoint$.subscribe(apiEndpoint => {
      this.ala = Ala({
        httpEndpoint: apiEndpoint,
        blockId: environment.chainId
      });
    });
  }

  setApiEndpoint(url: string) {
    this.apiEndpointSource.next(url);
  }

  // Note: to convert chain promise to cold observable, use defer

  private getResult<T>(source$: Observable<T>): Observable<Result<T>> {
    return source$.pipe(
      map(data => {
        return {
          isError: false,
          value: data
        };
      }),
      catchError(error => {
        this.logger.error('CHAIN_ERROR', error);
        return of({
          isError: true,
          value: error
        });
      })
    );
  }

  getDeferInfo(): Observable<any> {
    return defer(() => from(this.ala.getInfo({})));
  }
  
  // getPriceInfo(): Observable<any> {
  //   return defer(() => from(this.ala.getInfo({})));
  // }
  getBPInfo(): Observable<any> {
    return this.ala.getInfo({});
  }

  getDeferBlock(id: string | number): Observable<any> {
    return defer(() => from(this.ala.getBlock(id)));
  }

  getDeferAccount(name: string): Observable<any> {
    return defer(() => from(this.ala.getAccount(name)));
  }

  getDeferTransaction(id: string): Observable<any> {
    return defer(() => from(this.ala.getTransaction(id)));
  }

  getAccountRaw(name: string): Observable<Result<any>> {
    const getAccount$ = defer(() => from(this.ala.getAccount(name)));
    return this.getResult<any>(getAccount$);
  }

  getAccountActions(name: string, position = -1, offset = -20): Observable<Result<any[]>> {
    const getAccountActions$ = defer(() => from(this.ala.getActions({
      account_name: name,
      pos: position,
      offset: offset
    })));
    return this.getResult<any[]>(getAccountActions$.pipe(
      map((data: any) => data.actions),
      map((actions: any[]) => actions.sort((a, b) => b.account_action_seq - a.account_action_seq))
    ));
  }

  getAccountTokens(name: string): Observable<Result<any[]>> {
    const allTokens$: Observable<any[]> = this.http.get<any[]>(`https://raw.githubusercontent.com/alacafe/ala-airdrops/master/tokens.json`);
    const getCurrencyBalance = function (token: any, account: string): Observable<any> {
      return from(this.ala.getCurrencyBalance(token.account, account, token.symbol)).pipe(
        map((balance: string[]) => ({
          ...token,
          balance: balance[0] ? Number(balance[0].split(' ', 1)) : 0
        })),
        catchError(() => of({
          ...token,
          balance: 0
        }))
      );
    };
    const accountTokens$ = allTokens$.pipe(
      switchMap(tokens => {
        return combineLatest(
          tokens.map(token => getCurrencyBalance.bind(this)(token, name))
        ).pipe(
          map(tokens => tokens.filter(token => token.balance > 0))
        )
      })
    );
    return this.getResult<any[]>(accountTokens$);
  }

  getAbi(name: string): Observable<Result<any>> {
    const getCode$ = defer(() => from(this.ala.getAbi({
      account_name: name
    })));
    return this.getResult<any>(getCode$);
  }

  getBlockRaw(id: string | number): Observable<Result<any>> {
    const getBlock$ = defer(() => from(this.ala.getBlock(id)));
    return this.getResult<any>(getBlock$);
  }

  getTransactionRaw(blockId: number, id: string): Observable<Result<any>> {
    const getTransaction$ = defer(() => from(this.ala.getTransaction({
      id: id,
      block_num_hint: blockId
    })));
    return this.getResult<any>(getTransaction$);
  }

  getPriceInfo() {
    return from(this.ala.getTableRows({
      json: true,
      code: "alaio.token",
      scope: "........c5a41",
      table: "stat"
    })).pipe(
      map((result: any) => {
        return result.rows
      })
    )
  }

  getProducers() {
    return from(this.ala.getTableRows({
      json: true,
      code: "alaio",
      scope: "alaio",
      table: "producers",
      limit: 700,
      table_key: ""
    })).pipe(
      map((result: any) => {
        return result.rows
          .map(row => ({ ...row, total_votes: parseFloat(row.total_votes) }))
          .sort((a, b) => b.total_votes - a.total_votes);
      })
    );
  }

  getChainStatus() {
    return from(this.ala.getTableRows({
      json: true,
      code: "alaio",
      scope: "alaio",
      table: "global",
      limit: 1
    })).pipe(
      map((result: any) => result.rows[0])
    );
  }
  getOraclesTable() {
    return from(this.ala.getTableRows({
      json: true,
      code: "alaio",
      scope: "alaio",
      table: "oracles"
    })).pipe(
      map((result: any) => {
        return result.rows
      })
    );
  }
  getOraclesRewardTable() {
    return from(this.ala.getTableRows({
      json: true,
      code: "alaio",
      scope: "alaio",
      table: "oraclereward",
      limit: 1
    })).pipe(
      map((result: any) => result.rows[0])
    );
  }
  getRequestTable() {
    return from(this.ala.getTableRows({
      json: true,
      code: "alaio",
      scope: "client",
      table: "requests"
    })).pipe(
      map((result: any) => {
        return result.rows
      })
    );
  }
}
