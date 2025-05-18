'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/register/RegisterForm';
import RegisterSuccess from '@/components/register/RegisterSuccess';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function RegisterWithCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const router = useRouter();

  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [codeValid, setCodeValid] = useState<boolean | null>(null);
  const [accessData, setAccessData] = useState<{ email?: string; name?: string } | null>(null);
  const [showError, setShowError] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const validate = async () => {
      const regRes = await fetch('/api/public/registration-allowed');
      const regJson = await regRes.json();
      if (regJson.allowed === true) {
        router.push('/register');
        return;
      }
      setAllowed(false);

      try {
        const codeRes = await fetch(`/api/public/access-code/${code}`);
        if (codeRes.ok) {
          const data = await codeRes.json();
          setCodeValid(true);
          setAccessData({ email: data.email, name: data.name });
        } else {
          throw new Error('Invalid code');
        }
      } catch (err) {
        setCodeValid(false);
        setShowError(true);
      }
    };

    validate();
  }, [code, router]);

  if (allowed === null || codeValid === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500 text-sm">Validating access...</p>
      </main>
    );
  }

  return (
    <>
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-white px-4">
        {codeValid && (
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <h1 className="text-2xl font-extrabold text-indigo-700 mb-4 text-center">
              Create Account (via invite)
            </h1>

            {magicLinkSent ? (
              <RegisterSuccess email={email} />
            ) : (
              <RegisterForm
                setMagicLinkSent={setMagicLinkSent}
                setEmail={setEmail}
                prefillEmail={accessData?.email}
                prefillName={accessData?.name}
              />
            )}
          </div>
        )}
      </main>

      <Dialog open={showError} onOpenChange={(open) => {
        if (!open) {
          setTimeout(() => router.push('/register'), 200);
        }
        setShowError(open);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Access denied</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-gray-600 space-y-2">
            <p>The invite code you used is either invalid or already used.</p>
            <p>You will be redirected to the main registration page shortly.</p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
