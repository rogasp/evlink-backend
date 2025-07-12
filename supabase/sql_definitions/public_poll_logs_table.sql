create table public.poll_logs (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  endpoint text not null,
  created_at timestamp with time zone not null default now(),
  constraint poll_logs_pkey primary key (id),
  constraint poll_logs_user_id_fkey foreign KEY (user_id) references users (id)
) TABLESPACE pg_default;