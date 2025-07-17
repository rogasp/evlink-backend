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
    code: 'sv',
    name: 'Swedish',
    flag: '🇸🇪',
    nativeName: 'Svenska'
  }
];

export const defaultLanguage = 'en';

// Future languages to add:
// {
//   code: 'no',
//   name: 'Norwegian',
//   flag: '🇳🇴',
//   nativeName: 'Norsk'
// },
// {
//   code: 'da',
//   name: 'Danish',
//   flag: '🇩🇰',
//   nativeName: 'Dansk'
// },
// {
//   code: 'de',
//   name: 'German',
//   flag: '🇩🇪',
//   nativeName: 'Deutsch'
// },
// {
//   code: 'fr',
//   name: 'French',
//   flag: '🇫🇷',
//   nativeName: 'Français'
// }