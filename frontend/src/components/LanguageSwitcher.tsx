'use client';

import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { supportedLanguages } from '@/i18n/languages';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { US, SE, DK, NO, NL, DE, IT, FR, ES } from 'country-flag-icons/react/3x2';

const FlagIcon = ({ code }: { code: string }) => {
  const flagProps = { className: "w-4 h-3 rounded-sm" };
  
  switch (code) {
    case 'en':
      return <US {...flagProps} />;
    case 'sv':
      return <SE {...flagProps} />;
    case 'da':
      return <DK {...flagProps} />;
    case 'no':
      return <NO {...flagProps} />;
    case 'nl':
      return <NL {...flagProps} />;
    case 'de':
      return <DE {...flagProps} />;
    case 'it':
      return <IT {...flagProps} />;
    case 'fr':
      return <FR {...flagProps} />;
    case 'es':
      return <ES {...flagProps} />;
    default:
      return <Globe className="w-4 h-4" />;
  }
};

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const currentLanguage = supportedLanguages.find(lang => lang.code === i18n.language) || supportedLanguages[0];

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 text-white hover:bg-white/10 hover:text-white border-white/20">
          <FlagIcon code={currentLanguage.code} />
          <span className="hidden sm:inline ml-2 mr-2">{currentLanguage.nativeName}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {supportedLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1">
              <FlagIcon code={language.code} />
              <div className="flex flex-col">
                <span className="font-medium">{language.nativeName}</span>
                <span className="text-xs text-muted-foreground">{language.name}</span>
              </div>
            </div>
            {i18n.language === language.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}