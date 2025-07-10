create table public.users (
  id uuid not null,
  email text not null,
  created_at timestamp with time zone null default now(),
  role text null default ''::text,
  name text null,
  is_approved boolean not null default false,
  accepted_terms boolean null default false,
  notify_offline boolean not null default false,
  sms_credits integer not null default 0,
  is_subscribed boolean not null default false,
  tier text not null default 'free'::text,
  linked_vehicle_count integer not null default 0,
  stripe_customer_id text not null default ''::text,
  subscription_status text not null default ''::text,
  ha_webhook_id text null,
  ha_external_url text null,
  is_on_trial boolean not null default false,
  trial_ends_at timestamp with time zone null,
  constraint users_pkey primary key (id),
  constraint users_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger trg_init_onboarding_progress
after INSERT on users for EACH row
execute FUNCTION fn_init_onboarding_progress ();

create trigger trg_on_users_update_terms
after
update on users for EACH row
execute FUNCTION fn_update_onboarding_accepted_terms ();
