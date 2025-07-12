create table public.charging_sessions (
  session_id uuid not null default gen_random_uuid (),
  vehicle_id uuid not null,
  user_id uuid null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  start_battery_level numeric null,
  end_battery_level numeric null,
  energy_added_kwh numeric null,
  duration_minutes numeric null,
  max_charge_rate_kw numeric null,
  average_charge_rate_kw numeric null,
  brand text null,
  model text null,
  year integer null,
  start_location geography null,
  end_location geography null,
  created_at timestamp with time zone null default now(),
  constraint charging_sessions_pkey primary key (session_id)
) TABLESPACE pg_default;

create index IF not exists idx_charging_sessions_vehicle_id on public.charging_sessions using btree (vehicle_id) TABLESPACE pg_default;

create index IF not exists idx_charging_sessions_user_id on public.charging_sessions using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_charging_sessions_vehicle_id_start_time on public.charging_sessions using btree (vehicle_id, start_time desc) TABLESPACE pg_default;

create index IF not exists idx_charging_sessions_start_location on public.charging_sessions using gist (start_location) TABLESPACE pg_default;

create index IF not exists idx_charging_sessions_end_location on public.charging_sessions using gist (end_location) TABLESPACE pg_default;