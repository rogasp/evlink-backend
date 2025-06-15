'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';

interface OAuthGoogleButtonProps {
  disabled?: boolean;
}

export default function OAuthGoogleButton({ disabled = false }: OAuthGoogleButtonProps) {
  const handleClick = async () => {
    if (disabled) return;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback` },
    });

    if (error) toast.error(error.message);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      variant="outline"
      className="w-full flex items-center justify-center space-x-2 h-9 text-sm mt-2"
    >
      <Image src="/google-icon.png" alt="Google" width={20} height={20} className="h-5 w-5" />
      <span>Continue with Google</span>
    </Button>
  );
}
