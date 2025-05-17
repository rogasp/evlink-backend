'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabaseClient';
import UserInfoCard from '@/components/profile/UserInfoCard';
import ApiKeySection from '@/components/profile/ApiKeySection';

export default function ProfilePage() {
  const { user, accessToken, loading: authLoading, mergedUser } = useAuth();

  const [name, setName] = useState('');

  // Initiera namn från mergedUser
  useEffect(() => {
    if (mergedUser?.name) {
      setName(mergedUser.name);
    }
  }, [mergedUser]);

  const saveName = async (newName: string) => {
    if (!newName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { name: newName },
    });

    if (updateError) {
      toast.error('Failed to update name');
      return;
    }

    setName(newName);

    const { data, error: fetchError } = await supabase.auth.getUser();

    if (fetchError || !data.user) {
      toast.success('Name updated, but could not refresh user data');
    } else {
      toast.success('Name updated!');
    }
  };

  if (authLoading || !user || !accessToken || name === '') return null;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      <UserInfoCard
        userId={user.id}
        email={user.email ?? ''}
        name={name}
        onNameSave={saveName}
      />
      <ApiKeySection userId={user.id} accessToken={accessToken} />
    </div>
  );
}
