export interface Language {
  code: string;
  name: string;
  flag: string;
  nativeName: string;
}

export const supportedLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    flag: '🇺🇸',
    nativeName: 'English'
  },
  {
    code: 'da',
    name: 'Danish',
    flag: '🇩🇰',
    nativeName: 'Dansk'
  },
  {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    nativeName: 'Deutsch'
  },
  {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    nativeName: 'Español'
  },
  {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    nativeName: 'Français'
  },
  {
    code: 'it',
    name: 'Italian',
    flag: '🇮🇹',
    nativeName: 'Italiano'
  },
  {
    code: 'nl',
    name: 'Dutch',
    flag: '🇳🇱',
    nativeName: 'Nederlands'
  },
  {
    code: 'no',
    name: 'Norwegian',
    flag: '🇳🇴',
    nativeName: 'Norsk'
  },
  {
    code: 'sv',
    name: 'Swedish',
    flag: '🇸🇪',
    nativeName: 'Svenska'
  }
];

export const defaultLanguage = 'en';