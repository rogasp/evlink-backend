'use client';

import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import I18nProvider from '@/components/I18nProvider';

function TestI18nContent() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Language Switcher */}
        <div className="flex justify-end mb-8">
          <LanguageSwitcher />
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {t('landing.title')}
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            {t('landing.description')}
          </p>

          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              {t('landing.getStarted')}
            </button>
            
            <button className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              {t('landing.learnMore')}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {t('navigation.dashboard')}
            </h2>
            <p className="text-gray-600">
              {t('dashboard.welcome')}
            </p>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p><strong>{t('profile.language')}:</strong> {t('common.loading')}</p>
            <p><strong>{t('common.save')}:</strong> {t('common.submit')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestI18nPage() {
  return (
    <I18nProvider>
      <TestI18nContent />
    </I18nProvider>
  );
}