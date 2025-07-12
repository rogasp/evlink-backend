'use client';

import { useEffect, useState } from 'react';
import RegisterForm from '@/components/register/RegisterForm';
import RegisterInterestForm from '@/components/register/RegisterInterestForm';
import RegisterSuccess from '@/components/register/RegisterSuccess';

export default function RegisterPage() {
  const [allowRegister, setAllowRegister] = useState<boolean | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const res = await fetch('/api/public/registration-allowed');
        const json = await res.json();
        setAllowRegister(json.allowed === true);
      } catch (err) {
        console.error('❌ Failed to check registration status:', err); /* Hardcoded string */
        setAllowRegister(false);
      }
    };
    checkRegistration();
  }, []);

  if (allowRegister === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        {/* Hardcoded string */}
        <p className="text-gray-500 text-sm">Checking registration status...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-white px-4">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        {/* Hardcoded string */}
        <h1 className="text-2xl font-extrabold text-indigo-700 mb-4 text-center">
          {allowRegister ? 'Create Account' : 'Stay Updated'}
        </h1>

        {magicLinkSent ? (
          <RegisterSuccess email={email} />
        ) : allowRegister ? (
          <RegisterForm setMagicLinkSent={setMagicLinkSent} setEmail={setEmail} />
        ) : (
          <RegisterInterestForm />
        )}

        {/* Hardcoded string */}
        <p className="text-center text-xs text-gray-500 mt-4">
          {allowRegister ? (
            <>
              Already have an account?{' '}
              <a href="/login" className="text-indigo-600 hover:underline">
                Log In
              </a>
            </>
          ) : (
            <>EVLinkHA is currently under development. You&apos;ll be the first to know when we launch.</>
          )}
        </p>
      </div>
    </main>
  );
}
