-- Create the RPC function to atomically add purchased tokens to a user's balance

CREATE OR REPLACE FUNCTION public.add_user_tokens(p_user_id uuid, p_quantity integer)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET purchased_api_tokens = purchased_api_tokens + p_quantity
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to the service_role or other relevant roles
-- This function should likely be called from a secure backend context (e.g., after a successful payment)
GRANT EXECUTE ON FUNCTION public.add_user_tokens(uuid, integer) TO service_role;
