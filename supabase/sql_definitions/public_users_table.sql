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