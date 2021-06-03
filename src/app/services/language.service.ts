import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { SystemGeneralService } from 'app/services/system-general.service';
import * as _ from 'lodash';
import { map, switchMap } from 'rxjs/operators';

import { WebSocketService } from './ws.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Injectable()
export class LanguageService {
  currentLanguage: string = null;
  availableLangs = [
    {
      code: 'af',
      name: 'Afrikaans',
    },
    {
      code: 'ar',
      name: 'Arabic',
    },
    {
      code: 'ast',
      name: 'Asturian',
    },
    {
      code: 'az',
      name: 'Azerbaijani',
    },
    {
      code: 'bg',
      name: 'Bulgarian',
    },
    {
      code: 'be',
      name: 'Belarusian',
    },
    {
      code: 'bn',
      name: 'Bengali',
    },
    {
      code: 'br',
      name: 'Breton',
    },
    {
      code: 'bs',
      name: 'Bosnian',
    },
    {
      code: 'ca',
      name: 'Catalan',
    },
    {
      code: 'cs',
      name: 'Czech',
    },
    {
      code: 'cy',
      name: 'Welsh',
    },
    {
      code: 'da',
      name: 'Danish',
    },
    {
      code: 'de',
      name: 'Deutsch',
    },
    {
      code: 'dsb',
      name: 'Lower Sorbian',
    },
    {
      code: 'el',
      name: 'Greek',
    },
    {
      name: 'English',
      code: 'en',
    },
    {
      code: 'en-au',
      name: 'Australian English',
    },
    {
      code: 'en-gb',
      name: 'British English',
    },
    {
      code: 'eo',
      name: 'Esperanto',
    },
    {
      name: 'Español',
      code: 'es',
    },
    {
      code: 'es-ar',
      name: 'Argentinian Spanish',
    },
    {
      code: 'es-co',
      name: 'Colombian Spanish',
    },
    {
      code: 'es-mx',
      name: 'Mexican Spanish',
    },
    {
      code: 'es-ni',
      name: 'Nicaraguan Spanish',
    },
    {
      code: 'es-ve',
      name: 'Venezuelan Spanish',
    },
    {
      code: 'et',
      name: 'Estonian',
    },
    {
      code: 'eu',
      name: 'Basque',
    },
    {
      code: 'fa',
      name: 'Persian',
    },
    {
      code: 'fi',
      name: 'Finnish',
    },
    {
      code: 'fr',
      name: 'Français',
    },
    {
      code: 'fy',
      name: 'Frisian',
    },
    {
      code: 'ga',
      name: 'Irish',
    },
    {
      code: 'gd',
      name: 'Scottish Gaelic',
    },
    {
      code: 'gl',
      name: 'Galician',
    },
    {
      code: 'he',
      name: 'Hebrew',
    },
    {
      code: 'hi',
      name: 'Hindi',
    },
    {
      code: 'hr',
      name: 'Croatian',
    },
    {
      code: 'hsb',
      name: 'Upper Sorbian',
    },
    {
      code: 'hu',
      name: 'Hungarian',
    },
    {
      code: 'ia',
      name: 'Interlingua',
    },
    {
      code: 'id',
      name: 'Indonesian',
    },
    {
      code: 'io',
      name: 'Ido',
    },
    {
      code: 'is',
      name: 'Icelandic',
    },
    {
      code: 'it',
      name: 'Italiano',
    },
    {
      code: 'ja',
      name: 'Japanese',
    },
    {
      code: 'ka',
      name: 'Georgian',
    },
    {
      code: 'kk',
      name: 'Kazakh',
    },
    {
      code: 'km',
      name: 'Khmer',
    },
    {
      code: 'kn',
      name: 'Kannada',
    },
    {
      code: 'ko',
      name: 'Korean',
    },
    {
      code: 'lb',
      name: 'Luxembourgish',
    },
    {
      code: 'lt',
      name: 'Lithuanian',
    },
    {
      code: 'lv',
      name: 'Latvian',
    },
    {
      code: 'mk',
      name: 'Macedonian',
    },
    {
      code: 'ml',
      name: 'Malayalam',
    },
    {
      code: 'mn',
      name: 'Mongolian',
    },
    {
      code: 'mr',
      name: 'Marathi',
    },
    {
      code: 'my',
      name: 'Burmese',
    },
    {
      code: 'nb',
      name: 'Norwegian Bokmål',
    },
    {
      code: 'ne',
      name: 'Nepali',
    },
    {
      code: 'nl',
      name: 'Dutch',
    },
    {
      code: 'nn',
      name: 'Norwegian Nynorsk',
    },
    {
      code: 'os',
      name: 'Ossetic',
    },
    {
      code: 'pa',
      name: 'Punjabi',
    },
    {
      code: 'pl',
      name: 'Polish',
    },
    {
      code: 'pt',
      name: 'Portuguese',
    },
    {
      code: 'pt-br',
      name: 'Brazilian Portuguese',
    },
    {
      code: 'ro',
      name: 'Romanian',
    },
    {
      code: 'ru',
      name: 'Russian',
    },
    {
      code: 'sk',
      name: 'Slovak',
    },
    {
      code: 'sl',
      name: 'Slovenian',
    },
    {
      code: 'sq',
      name: 'Albanian',
    },
    {
      code: 'sr',
      name: 'Serbian',
    },
    {
      code: 'sr-latn',
      name: 'Serbian Latin',
    },
    {
      code: 'sv',
      name: 'Swedish',
    },
    {
      code: 'sw',
      name: 'Swahili',
    },
    {
      code: 'ta',
      name: 'Tamil',
    },
    {
      code: 'te',
      name: 'Telugu',
    },
    {
      code: 'th',
      name: 'Thai',
    },
    {
      code: 'tr',
      name: 'Turkish',
    },
    {
      code: 'tt',
      name: 'Tatar',
    },
    {
      code: 'udm',
      name: 'Udmurt',
    },
    {
      code: 'uk',
      name: 'Ukrainian',
    },
    {
      code: 'ur',
      name: 'Urdu',
    },
    {
      code: 'vi',
      name: 'Vietnamese',
    },
    {
      code: 'zh-hant',
      name: 'Traditional Chinese',
    },
    {
      name: '中文',
      code: 'zh-hans',
    },
  ];
  updateCall: 'system.general.update' = 'system.general.update';

  constructor(
    protected translate: TranslateService,
    protected ws: WebSocketService,
    private sysGeneralService: SystemGeneralService,
  ) {
  }

  setLanguageFromBrowser(): Observable<boolean> {
    if (this.currentLanguage) {
      return of(true);
    }

    const browserLang = this.translate.getBrowserLang();
    return this.setLanguage(browserLang);
  }

  setLanguageFromMiddleware(): Observable<boolean> {
    return this.sysGeneralService.getGeneralConfig.pipe(switchMap((res) => {
      if (res?.language) {
        return this.setLanguage(res.language);
      }

      return this.setLanguageFromBrowser();
    }));
  }

  setMiddlewareLanguage(lang: any): void {
    this.ws.call(this.updateCall,
      [{ language: lang }]).pipe(untilDestroyed(this)).subscribe(
      () => {},
      (err) => {
        console.error(err);
      },
    );
    this.setLanguage(lang);
  }

  /**
   * @return Observable that completes when translations have been loaded.
   */
  setLanguage(lang: string): Observable<boolean> {
    if (_.find(this.availableLangs, { code: lang })) {
      this.currentLanguage = lang;
    } else {
      this.currentLanguage = 'en';
    }

    return this.translate.use(this.currentLanguage).pipe(
      map(() => true),
    );
  }
}
