'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BrandsModal } from '@/components/landing/BrandsModal';
import { useTranslation } from 'react-i18next';

export default function FeaturesSection() {
  const { t } = useTranslation();
  return (
    <section className="max-w-6xl mx-auto px-6 py-10 text-center">
      <h2 className="text-2xl font-bold mb-6">{t('landing.features.title')}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-700 text-base">{t('landing.features.items.connectEV.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              {t('landing.features.items.connectEV.description')}
            </p>
            <div className="mt-3">
              <BrandsModal />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-700 text-base">{t('landing.features.items.realTimeInsights.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              {t('landing.features.items.realTimeInsights.description')}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md border border-gray-100 hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-indigo-700 text-base">{t('landing.features.items.smartAutomation.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 text-sm">
              {t('landing.features.items.smartAutomation.description')}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
