create table public.charging_samples (
  id uuid not null default gen_random_uuid (),
  source_event_id uuid null,
  vehicle_id uuid null,
  user_id uuid null,
  sample_time timestamp with time zone not null,
  created_at timestamp with time zone null,
  is_charging boolean null,
  is_plugged_in boolean null,
  is_fully_charged boolean null,
  is_reachable boolean null,
  battery_level numeric null,
  battery_capacity_kwh numeric null,
  charge_limit_percent integer null,
  charge_rate_kw numeric null,
  charge_time_remaining_min integer null,
  range_km numeric null,
  odometer_km numeric null,
  power_delivery_state text null,
  vin text null,
  location geography null,
  brand text null,
  model text null,
  year integer null,
  processed_at timestamp with time zone null default now(),
  constraint charging_samples_pkey primary key (id),
  constraint charging_samples_source_event_id_key unique (source_event_id)
) TABLESPACE pg_default;

create index IF not exists idx_charging_samples_vehicle_time on public.charging_samples using btree (vehicle_id, sample_time desc) TABLESPACE pg_default;

create index IF not exists idx_charging_samples_user_id on public.charging_samples using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_charging_samples_is_charging on public.charging_samples using btree (is_charging) TABLESPACE pg_default;

create index IF not exists idx_charging_samples_location on public.charging_samples using gist (location) TABLESPACE pg_default;