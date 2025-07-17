'use client';

import { useTranslation } from 'react-i18next';

export default function SupportSection() {
  const { t } = useTranslation();
  return (
    <section className="max-w-4xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-4">{t('landing.support.title')}</h2>
      <p className="text-gray-600 text-base mb-4">
        {t('landing.support.description')}
      </p>
      {/* Bronze-level supporters message */}
      <div className="mb-6">
        <p className="text-gray-700 text-base">
          {t('landing.support.bronzeSupporter')}
        </p>
      </div>
      {/* Sponsor button embedded via iframe */}
      <div className="mb-6 flex justify-center">
        <iframe
          src="https://github.com/sponsors/rogasp/button"
          title="Sponsor rogasp"
          height="32"
          width="114"
          style={{ border: '0', borderRadius: '6px' }}
        />
      </div>
      {/* Call-to-action buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        <a
          href="https://github.com/rogasp/evlink"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2 border border-gray-300 text-sm font-medium rounded-md bg-white hover:bg-gray-50"
        >
          {t('landing.support.buttons.starOnGithub')}
        </a>
        <a
          href="https://www.buymeacoffee.com/rogasp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2 border border-yellow-400 text-sm font-medium rounded-md bg-yellow-300 text-black hover:bg-yellow-400"
        >
          {t('landing.support.buttons.buyMeACoffee')}
        </a>
      </div>
    </section>
  );
}
