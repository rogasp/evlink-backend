-- Update all existing users with tier 'free'.
UPDATE public.users
SET
  tier = 'pro',
  is_on_trial = TRUE,
  -- Set the trial end date to the greater of:
  -- 1. Their creation date + 30 days
  -- 2. Today's date + 10 days
  trial_ends_at = GREATEST(created_at + interval '30 days', NOW() + interval '10 days')
WHERE
  tier = 'free';
