ALTER TABLE public.users
ADD COLUMN is_on_trial BOOLEAN DEFAULT FALSE,
ADD COLUMN trial_ends_at TIMESTAMP WITH TIME ZONE;

-- Optional: Add a comment for clarity
COMMENT ON COLUMN public.users.is_on_trial IS 'Indicates if the user is currently on a Pro trial period.';
COMMENT ON COLUMN public.users.trial_ends_at IS 'Timestamp when the Pro trial period ends.';
