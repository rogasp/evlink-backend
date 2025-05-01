create table "public"."apikeys" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "key_hash" text not null,
    "description" text,
    "active" boolean default true,
    "created_at" timestamp with time zone default now()
);


create table "public"."linked_vendors" (
    "user_id" uuid not null,
    "vendor" text not null
);


create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "email" text not null,
    "hashed_password" text not null,
    "created_at" timestamp with time zone default now()
);


create table "public"."vehicles" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "vendor" text not null,
    "vehicle_id" text not null,
    "vehicle_cache" jsonb,
    "updated_at" timestamp with time zone default now()
);


create table "public"."webhook_logs" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid,
    "vehicle_id" uuid,
    "event_type" text not null,
    "event" text,
    "version" text,
    "payload" jsonb not null,
    "created_at" timestamp with time zone default now()
);


CREATE UNIQUE INDEX apikeys_api_key_key ON public.apikeys USING btree (key_hash);

CREATE UNIQUE INDEX apikeys_pkey ON public.apikeys USING btree (id);

CREATE UNIQUE INDEX linked_vendors_pkey ON public.linked_vendors USING btree (user_id, vendor);

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX vehicles_pkey ON public.vehicles USING btree (id);

CREATE UNIQUE INDEX vehicles_vehicle_id_unique ON public.vehicles USING btree (vehicle_id);

CREATE UNIQUE INDEX webhook_logs_pkey ON public.webhook_logs USING btree (id);

alter table "public"."apikeys" add constraint "apikeys_pkey" PRIMARY KEY using index "apikeys_pkey";

alter table "public"."linked_vendors" add constraint "linked_vendors_pkey" PRIMARY KEY using index "linked_vendors_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."vehicles" add constraint "vehicles_pkey" PRIMARY KEY using index "vehicles_pkey";

alter table "public"."webhook_logs" add constraint "webhook_logs_pkey" PRIMARY KEY using index "webhook_logs_pkey";

alter table "public"."apikeys" add constraint "apikeys_api_key_key" UNIQUE using index "apikeys_api_key_key";

alter table "public"."apikeys" add constraint "apikeys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."apikeys" validate constraint "apikeys_user_id_fkey";

alter table "public"."users" add constraint "users_email_key" UNIQUE using index "users_email_key";

alter table "public"."vehicles" add constraint "vehicles_vehicle_id_unique" UNIQUE using index "vehicles_vehicle_id_unique";

grant delete on table "public"."apikeys" to "anon";

grant insert on table "public"."apikeys" to "anon";

grant references on table "public"."apikeys" to "anon";

grant select on table "public"."apikeys" to "anon";

grant trigger on table "public"."apikeys" to "anon";

grant truncate on table "public"."apikeys" to "anon";

grant update on table "public"."apikeys" to "anon";

grant delete on table "public"."apikeys" to "authenticated";

grant insert on table "public"."apikeys" to "authenticated";

grant references on table "public"."apikeys" to "authenticated";

grant select on table "public"."apikeys" to "authenticated";

grant trigger on table "public"."apikeys" to "authenticated";

grant truncate on table "public"."apikeys" to "authenticated";

grant update on table "public"."apikeys" to "authenticated";

grant delete on table "public"."apikeys" to "service_role";

grant insert on table "public"."apikeys" to "service_role";

grant references on table "public"."apikeys" to "service_role";

grant select on table "public"."apikeys" to "service_role";

grant trigger on table "public"."apikeys" to "service_role";

grant truncate on table "public"."apikeys" to "service_role";

grant update on table "public"."apikeys" to "service_role";

grant delete on table "public"."linked_vendors" to "anon";

grant insert on table "public"."linked_vendors" to "anon";

grant references on table "public"."linked_vendors" to "anon";

grant select on table "public"."linked_vendors" to "anon";

grant trigger on table "public"."linked_vendors" to "anon";

grant truncate on table "public"."linked_vendors" to "anon";

grant update on table "public"."linked_vendors" to "anon";

grant delete on table "public"."linked_vendors" to "authenticated";

grant insert on table "public"."linked_vendors" to "authenticated";

grant references on table "public"."linked_vendors" to "authenticated";

grant select on table "public"."linked_vendors" to "authenticated";

grant trigger on table "public"."linked_vendors" to "authenticated";

grant truncate on table "public"."linked_vendors" to "authenticated";

grant update on table "public"."linked_vendors" to "authenticated";

grant delete on table "public"."linked_vendors" to "service_role";

grant insert on table "public"."linked_vendors" to "service_role";

grant references on table "public"."linked_vendors" to "service_role";

grant select on table "public"."linked_vendors" to "service_role";

grant trigger on table "public"."linked_vendors" to "service_role";

grant truncate on table "public"."linked_vendors" to "service_role";

grant update on table "public"."linked_vendors" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

grant delete on table "public"."vehicles" to "anon";

grant insert on table "public"."vehicles" to "anon";

grant references on table "public"."vehicles" to "anon";

grant select on table "public"."vehicles" to "anon";

grant trigger on table "public"."vehicles" to "anon";

grant truncate on table "public"."vehicles" to "anon";

grant update on table "public"."vehicles" to "anon";

grant delete on table "public"."vehicles" to "authenticated";

grant insert on table "public"."vehicles" to "authenticated";

grant references on table "public"."vehicles" to "authenticated";

grant select on table "public"."vehicles" to "authenticated";

grant trigger on table "public"."vehicles" to "authenticated";

grant truncate on table "public"."vehicles" to "authenticated";

grant update on table "public"."vehicles" to "authenticated";

grant delete on table "public"."vehicles" to "service_role";

grant insert on table "public"."vehicles" to "service_role";

grant references on table "public"."vehicles" to "service_role";

grant select on table "public"."vehicles" to "service_role";

grant trigger on table "public"."vehicles" to "service_role";

grant truncate on table "public"."vehicles" to "service_role";

grant update on table "public"."vehicles" to "service_role";

grant delete on table "public"."webhook_logs" to "anon";

grant insert on table "public"."webhook_logs" to "anon";

grant references on table "public"."webhook_logs" to "anon";

grant select on table "public"."webhook_logs" to "anon";

grant trigger on table "public"."webhook_logs" to "anon";

grant truncate on table "public"."webhook_logs" to "anon";

grant update on table "public"."webhook_logs" to "anon";

grant delete on table "public"."webhook_logs" to "authenticated";

grant insert on table "public"."webhook_logs" to "authenticated";

grant references on table "public"."webhook_logs" to "authenticated";

grant select on table "public"."webhook_logs" to "authenticated";

grant trigger on table "public"."webhook_logs" to "authenticated";

grant truncate on table "public"."webhook_logs" to "authenticated";

grant update on table "public"."webhook_logs" to "authenticated";

grant delete on table "public"."webhook_logs" to "service_role";

grant insert on table "public"."webhook_logs" to "service_role";

grant references on table "public"."webhook_logs" to "service_role";

grant select on table "public"."webhook_logs" to "service_role";

grant trigger on table "public"."webhook_logs" to "service_role";

grant truncate on table "public"."webhook_logs" to "service_role";

grant update on table "public"."webhook_logs" to "service_role";


