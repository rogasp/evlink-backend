'use client';

import { useState } from 'react';
import { PropsWithChildren } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseContext } from '@/lib/supabaseContext';

export const SupabaseProvider = ({ children }: PropsWithChildren) => {
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
};
