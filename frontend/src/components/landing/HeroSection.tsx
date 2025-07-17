'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function HeroSection() {
  const [clientReady, setClientReady] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setClientReady(true);
  }, [clientReady]);

  return (
    <section className="relative overflow-hidden text-white py-8 bg-indigo-700 min-h-[600px]">
      <Image src="/ev_car.png" alt="" fill className="object-cover opacity-10 z-0" />
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <span className="inline-block text-xs font-semibold uppercase bg-yellow-400 text-black px-3 py-1 rounded-full mb-4">
          {t('landing.hero.badge')}
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold leading-snug mb-3">
          {t('landing.hero.title')}
        </h1>
        <p className="text-lg sm:text-xl font-light mb-6 leading-snug">
          {t('landing.hero.subtitle')}
        </p>
      </div>
    </section>
  );
}
