import React from 'react';
import { Button } from '@/components/ui/button';
import { useUserContext } from '@/contexts/UserContext';
import { startTrial } from '@/lib/authFetch';

const TrialButton: React.FC = () => {
  const { accessToken, refreshUser } = useUserContext();

  const handleStartTrial = async () => {
    if (accessToken) {
      try {
        const response = await startTrial(accessToken);
        if (response.data) {
          alert('Trial started successfully!');
          refreshUser(); // Refresh user data to reflect trial status
        } else if (response.error) {
          alert(`Failed to start trial: ${response.error.message}`);
        }
      } catch (error) {
        alert(`An unexpected error occurred: ${error}`);
      }
    } else {
      alert('No access token available. Please log in.');
    }
  };

  return (
    <Button onClick={handleStartTrial}>
      Start 30-day Free Trial
    </Button>
  );
};

export default TrialButton;
