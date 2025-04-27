'use client';

import SessionProviderWrapper from "@/components/SessionProviderWrapper";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      {children}
    </SessionProviderWrapper>
  );
}
