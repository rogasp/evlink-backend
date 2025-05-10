'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type ContextType = {
  registrationAllowed: boolean | null;
  refresh: () => void;
};

const RegistrationContext = createContext<ContextType>({
  registrationAllowed: null,
  refresh: () => {},
});

export const useRegistrationStatus = () => useContext(RegistrationContext);

export function RegistrationProvider({ children }: { children: React.ReactNode }) {
  const [registrationAllowed, setRegistrationAllowed] = useState<boolean | null>(null);

  const load = async () => {
    try {
      const res = await fetch('/api/public/registration-allowed');
      const json = await res.json();
      setRegistrationAllowed(json.allowed === true);
    } catch (err) {
      console.error('❌ Failed to load registration setting', err);
      setRegistrationAllowed(null);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <RegistrationContext.Provider value={{ registrationAllowed, refresh: load }}>
      {children}
    </RegistrationContext.Provider>
  );
}
