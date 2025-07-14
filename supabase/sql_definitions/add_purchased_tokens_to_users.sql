-- Add column for purchased API tokens to the users table

ALTER TABLE public.users
ADD COLUMN purchased_api_tokens INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.users.purchased_api_tokens IS 'Stores the balance of non-expiring API call credits purchased by the user.';
