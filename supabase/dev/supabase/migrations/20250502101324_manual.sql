
CREATE TABLE IF NOT EXISTS "public"."webhook_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "enode_webhook_id" "text" NOT NULL,
    "url" "text" NOT NULL,
    "events" "text"[] NOT NULL,
    "secret" "text",
    "api_version" "text",
    "is_active" boolean DEFAULT true,
    "last_success" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "ended_at" timestamp with time zone,
    "authentication" "jsonb"
);



ALTER TABLE ONLY "public"."webhook_subscriptions"
    ADD CONSTRAINT "webhook_subscriptions_enode_webhook_id_key" UNIQUE ("enode_webhook_id");



ALTER TABLE ONLY "public"."webhook_subscriptions"
    ADD CONSTRAINT "webhook_subscriptions_pkey" PRIMARY KEY ("id");




GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."webhook_subscriptions" TO "service_role";

