'use client';

import { PropsWithChildren } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SupabaseContext } from '@/lib/supabaseContext'; // skapar vi nedan
import { useState } from 'react';
import { createBrowserClient as createClient } from '@supabase/ssr';

export const SupabaseProvider = ({ children }: PropsWithChildren) => {
  const [supabase] = useState(() =>
    createClient(
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
