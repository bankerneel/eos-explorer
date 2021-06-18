import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorage } from 'ngx-webstorage';
import { take } from 'rxjs/operators';
import { AlaService } from '../../services/ala.service';

@Component({
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  @LocalStorage() language: string;
  languages = LANGUAGES;
  apis = APIS;
  languageControl: FormControl;
  apiControl: FormControl;

  constructor(
    private translate: TranslateService,
    private alaService: AlaService
  ) { }

  ngOnInit() {
    // initialize language select control
    this.languageControl = new FormControl();
    // set initial language select control value with LocalStorage value
    this.languageControl.setValue(this.language);
    // subscribe to language select control value change
    this.languageControl.valueChanges.subscribe(language => {
      this.language = language;
      this.translate.use(language);
    });

    // setup api control
    this.apiControl = new FormControl();
    this.alaService.apiEndpoint$.pipe(
      take(1)
    ).subscribe(apiEndpoint => {
      this.apiControl.setValue(apiEndpoint);
    });
    this.apiControl.valueChanges.subscribe(apiEndpoint => {
      this.alaService.setApiEndpoint(apiEndpoint);
    });
  }

}

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hr', name: 'Croatian' },
  { code: 'it', name: 'Italian' },
  { code: 'ko', name: 'Korean' },
  { code: 'de', name: 'German' },
  { code: 'dk', name: 'Danish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'zh', name: 'Chinese' }
];

export const APIS = [
  { name: 'ALA Dublin', endpoint: 'https://api1.aladublin.io' },
  { name: 'ALA New York', endpoint: 'http://api.alanewyork.io' },
  { name: 'ALA Proxy', endpoint: 'https://proxy.alanode.tools' },
  { name: 'Cypherglass', endpoint: 'http://api.cypherglass.com' }
]
