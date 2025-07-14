-- Create the RPC function to atomically decrement user tokens

CREATE OR REPLACE FUNCTION public.decrement_user_tokens(p_user_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET purchased_api_tokens = purchased_api_tokens - 1
  WHERE id = p_user_id AND purchased_api_tokens > 0;
END;
$$ LANGUAGE plpgsql;

-- Optional: Grant execute permission to the authenticated role
-- This allows the function to be called by authenticated users via the API.
GRANT EXECUTE ON FUNCTION public.decrement_user_tokens(uuid) TO authenticated;
