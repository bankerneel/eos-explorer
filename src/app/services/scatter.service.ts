import {Injectable} from '@angular/core';
import * as Ala from 'alaxplorerjs';
import {LocalStorage} from 'ngx-webstorage';

@Injectable()
export class ScatterService {
  @LocalStorage()
  identity: any;
  ala: any;
  scatter: any;
  network: any;

  load() {
    this.scatter = (<any>window).scatter;

    this.network = {
      blockchain: 'ala',
      host: 'api1.aladublin.io',
      port: 443,
      chainId: '471d1e3887d8a1aeb18c2ed6a38e92ae209811f864cf9690bfd8166a446615c0'
    };
    if (this.scatter) {
      this.ala = this.scatter.ala(this.network, Ala, {chainId: this.network.chainId}, 'https');
    }

  }

  login() {
    this.load();
    const requirements = {accounts: [this.network]};
    if (!this.scatter) {
      alert("You need to install Scatter to use the form.");
      return;
    }
    return this.scatter.getIdentity(requirements);
  }

  logout() {
    this.scatter.forgetIdentity();
  }

  isLoggedIn() {
    return this.scatter && !!this.scatter.identity;
  }

  accountName() {
    if (!this.scatter || !this.scatter.identity) {
      return;
    }
    const account = this.scatter.identity.accounts.find(acc => acc.blockchain === 'ala');
    return account.name;
  }

  support(amount: string) {
    this.load();
    const account = this.scatter.identity.accounts.find(acc => acc.blockchain === 'ala');
    return this.ala.transfer(account.name, 'trackeraegis', amount + " ALA", 'Aegis Support');
  }

  refund() {
    this.load();
    const account = this.scatter.identity.accounts.find(acc => acc.blockchain === 'ala');
    const options = {authorization: [`${account.name}@${account.authority}`]};
    return this.ala.contract('trackeraegis').then(contract => contract.refund(account.name, options));
  }
}
