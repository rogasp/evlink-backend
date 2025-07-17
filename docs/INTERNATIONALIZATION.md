# Internationalization (i18n) Guide

This document provides a comprehensive guide for adding internationalization support to EVLinkHA components using react-i18next.

## Overview

EVLinkHA uses react-i18next for internationalization, supporting English (en) and Swedish (sv) languages. The system includes:

- Language detection and switching
- Translation key management
- Component-level translation integration
- Persistent language preferences

## Setup and Configuration

### 1. Core i18n Configuration

The i18n system is configured in `/frontend/src/i18n/config.ts`:

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import en from './locales/en.json';
import sv from './locales/sv.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sv: { translation: sv }
    },
    fallbackLng: 'en',
    debug: false,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
```

### 2. Provider Integration

The I18nProvider wraps the entire application in `/frontend/src/components/providers/I18nProvider.tsx`:

```typescript
'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n/config';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

This provider is integrated in both public and app layouts.

## Translation File Structure

Translation files are located in `/frontend/src/i18n/locales/`:

### English (`en.json`)
```json
{
  "common": {
    "loading": "Loading...",
    "save": "Save",
    "cancel": "Cancel"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "profile": "Profile"
  },
  "landing": {
    "hero": {
      "title": "Connect your EV.",
      "subtitle": "EVLinkHA links your electric vehicle..."
    },
    "pricing": {
      "title": "Choose your plan",
      "plans": {
        "free": {
          "title": "Free",
          "price": "0 EUR",
          "features": ["1 connected device", "2 API calls per day"]
        }
      }
    }
  }
}
```

### Swedish (`sv.json`)
```json
{
  "common": {
    "loading": "Laddar...",
    "save": "Spara",
    "cancel": "Avbryt"
  },
  "navigation": {
    "dashboard": "Instrumentpanel",
    "profile": "Profil"
  },
  "landing": {
    "hero": {
      "title": "Koppla ditt elfordon.",
      "subtitle": "EVLinkHA kopplar ditt elfordon..."
    },
    "pricing": {
      "title": "Välj ditt abonnemang",
      "plans": {
        "free": {
          "title": "Gratis",
          "price": "0 EUR",
          "features": ["1 ansluten enhet", "2 API-anrop per dag"]
        }
      }
    }
  }
}
```

## Adding Translations to Components

### Step 1: Import useTranslation Hook

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t } = useTranslation();
  
  // Component logic here
}
```

### Step 2: Replace Static Text

#### Basic Translation
```typescript
// Before
<h1>Welcome to EVLinkHA</h1>

// After
<h1>{t('landing.hero.title')}</h1>
```

#### Arrays (with returnObjects)
```typescript
// Before
const features = [
  '1 connected device',
  '2 API calls per day',
  'No webhooks'
];

// After
const features = t('landing.pricing.plans.free.features', { returnObjects: true }) as string[];
```

#### Complex Objects
```typescript
// Before
const planConfig = {
  free: {
    title: 'Free',
    price: '0 EUR',
    features: ['1 connected device', '2 API calls per day']
  }
};

// After
const planConfig = {
  free: {
    title: t('landing.pricing.plans.free.title'),
    price: t('landing.pricing.plans.free.price'),
    features: t('landing.pricing.plans.free.features', { returnObjects: true }) as string[]
  }
};
```

### Step 3: Handle Dynamic Content

For dynamic content that depends on component state:

```typescript
const getButton = () => {
  if (loading) {
    return { label: t('common.loading'), href: '#', disabled: true };
  }
  if (tier === 'free') {
    return { label: t('landing.pricing.buttons.currentPlan'), href: '#', disabled: true };
  }
  return { label: t('landing.pricing.buttons.upgrade'), href: '/billing', disabled: false };
};
```

## Adding New Translation Keys

### Step 1: Define Keys in English
Add new keys to `/frontend/src/i18n/locales/en.json`:

```json
{
  "dashboard": {
    "title": "Dashboard",
    "vehicles": {
      "title": "My Vehicles",
      "noVehicles": "No vehicles connected",
      "addVehicle": "Add Vehicle"
    }
  }
}
```

### Step 2: Add Swedish Translations
Add corresponding keys to `/frontend/src/i18n/locales/sv.json`:

```json
{
  "dashboard": {
    "title": "Instrumentpanel",
    "vehicles": {
      "title": "Mina fordon",
      "noVehicles": "Inga fordon anslutna",
      "addVehicle": "Lägg till fordon"
    }
  }
}
```

### Step 3: Use in Components
```typescript
export default function VehiclesList() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h2>{t('dashboard.vehicles.title')}</h2>
      {vehicles.length === 0 ? (
        <p>{t('dashboard.vehicles.noVehicles')}</p>
      ) : (
        <VehicleList vehicles={vehicles} />
      )}
      <Button>{t('dashboard.vehicles.addVehicle')}</Button>
    </div>
  );
}
```

## Language Switching

### Language Switcher Component
Located at `/frontend/src/components/LanguageSwitcher.tsx`:

```typescript
'use client';

import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          {currentLanguage.flag} {currentLanguage.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => i18n.changeLanguage(language.code)}
          >
            {language.flag} {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Best Practices

### 1. Key Naming Convention
- Use dot notation for nested keys: `landing.hero.title`
- Group related keys together: `landing.pricing.plans.free.features`
- Use descriptive names: `buttons.upgradeToBasic` instead of `btn1`

### 2. Component Organization
```typescript
// Import at the top
import { useTranslation } from 'react-i18next';

// Initialize hook early in component
export default function MyComponent() {
  const { t } = useTranslation();
  
  // Use consistently throughout component
  return (
    <div>
      <h1>{t('page.title')}</h1>
      <p>{t('page.description')}</p>
    </div>
  );
}
```

### 3. Array Handling
Always specify `returnObjects: true` and type cast arrays:

```typescript
const features = t('landing.pricing.plans.free.features', { returnObjects: true }) as string[];
```

### 4. Default Values
Use fallback text for development:

```typescript
// Good for development
<h1>{t('page.title', 'Default Title')}</h1>

// Better for production
<h1>{t('page.title')}</h1>
```

## Testing Translations

### 1. Manual Testing
- Switch between languages using the language switcher
- Verify all text updates correctly
- Check for missing translation keys (shows key path instead of text)

### 2. Development Tips
- Add `debug: true` in i18n config during development
- Use browser console to check for missing keys
- Test with longer Swedish text to ensure UI handles text expansion

## Common Issues and Solutions

### 1. Missing Translation Keys
**Problem**: Text shows as `landing.hero.title` instead of translated text
**Solution**: Ensure key exists in both language files

### 2. Array Translation Not Working
**Problem**: Array shows as `[object Object]`
**Solution**: Use `returnObjects: true` and type cast:
```typescript
const items = t('path.to.array', { returnObjects: true }) as string[];
```

### 3. Dynamic Content Not Updating
**Problem**: Translation doesn't update when language changes
**Solution**: Ensure `useTranslation()` is called in component, not in static objects

### 4. Component Not Re-rendering
**Problem**: Component doesn't re-render when language changes
**Solution**: Make sure component is wrapped with I18nProvider

## Migration Checklist

When adding i18n to an existing page:

- [ ] Add translation keys to both `en.json` and `sv.json`
- [ ] Import `useTranslation` hook
- [ ] Replace all static text with `t()` calls
- [ ] Handle arrays with `returnObjects: true`
- [ ] Test language switching
- [ ] Verify no missing keys in console
- [ ] Check UI layout with longer Swedish text

## File Structure Summary

```
frontend/src/
├── i18n/
│   ├── config.ts                 # i18n configuration
│   └── locales/
│       ├── en.json              # English translations
│       └── sv.json              # Swedish translations
├── components/
│   ├── LanguageSwitcher.tsx     # Language switcher component
│   └── providers/
│       └── I18nProvider.tsx     # i18n provider wrapper
└── app/
    ├── (app)/layout.tsx         # App layout with provider
    └── (public)/layout.tsx      # Public layout with provider
```

This guide should provide everything needed to add internationalization to any component in EVLinkHA.