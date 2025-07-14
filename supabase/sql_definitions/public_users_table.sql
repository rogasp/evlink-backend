-- Main table for public user data, extending auth.users
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  role text NULL DEFAULT ''::text,
  name text NULL,
  is_approved boolean NOT NULL DEFAULT true,
  accepted_terms boolean NULL DEFAULT true,
  notify_offline boolean NOT NULL DEFAULT false,
  is_subscribed boolean NOT NULL DEFAULT false,
  tier text NOT NULL DEFAULT 'free'::text,
  linked_vehicle_count integer NOT NULL DEFAULT 0,
  stripe_customer_id text NOT NULL DEFAULT ''::text,
  subscription_status text NOT NULL DEFAULT ''::text,
  sms_credits integer NOT NULL DEFAULT 0,
  ha_webhook_id text NULL,
  ha_external_url text NULL,
  is_on_trial boolean NOT NULL DEFAULT false,
  trial_ends_at timestamp with time zone NULL,
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Function to handle new user creation and populate public.users table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    created_at,
    name,
    role,
    -- New trial fields
    tier,
    is_on_trial,
    trial_ends_at
  ) VALUES (
    NEW.id,
    NEW.email,
    now(),
    NEW.raw_user_meta_data ->> 'name',
    COALESCE(
      NULLIF(NEW.raw_user_meta_data ->> 'role', ''),
      'user'
    ),
    -- Set trial details
    'pro',
    TRUE,
    NOW() + interval '30 days'
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute the function on new user creation
-- Drop if exists to ensure the script can be re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Note: The triggers 'trg_init_onboarding_progress' and 'trg_on_users_update_terms'
-- are referenced but their function definitions (fn_init_onboarding_progress, fn_update_onboarding_accepted_terms)
-- are not provided. They are assumed to exist in other files.
