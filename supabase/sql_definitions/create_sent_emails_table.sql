        -- supabase/sql_definitions/create_sent_emails_table.sql

        -- Drop the table if it exists to ensure a clean slate during development
        DROP TABLE IF EXISTS public.sent_emails CASCADE;

        -- Create the table to log sent emails
        CREATE TABLE public.sent_emails (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
            template_name TEXT NOT NULL,
            sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            event_context JSONB,

            -- Ensure that a one-off email template is sent only once per user
            CONSTRAINT uq_user_template_one_off UNIQUE (user_id, template_name)
        );

        -- Add comments to the table and columns
        COMMENT ON TABLE public.sent_emails IS 'Logs all sent emails, especially one-off notifications.';
        COMMENT ON COLUMN public.sent_emails.user_id IS 'The ID of the user to whom the email was sent.';
        COMMENT ON COLUMN public.sent_emails.template_name IS 'The name of the email template used.';
        COMMENT ON COLUMN public.sent_emails.sent_at IS 'The timestamp when the email was sent.';
        COMMENT ON COLUMN public.sent_emails.event_context IS 'Optional JSONB field for storing context related to the email event.';

        -- Enable Row-Level Security (RLS)
        ALTER TABLE public.sent_emails ENABLE ROW LEVEL SECURITY;

        -- RLS Policies for sent_emails
        -- Allow authenticated users to read their own sent email logs
        CREATE POLICY "Allow authenticated users to read their own sent emails"
        ON public.sent_emails
        FOR SELECT
        TO authenticated
        USING (auth.uid() = user_id);

        -- Allow authenticated users to insert new sent email logs (e.g., from backend service)
        -- This policy might need to be adjusted based on how the backend service interacts.
        -- For now, assuming backend service uses authenticated user context or a service role.
        CREATE POLICY "Allow authenticated users to insert sent emails"
        ON public.sent_emails
        FOR INSERT
        TO authenticated
        WITH CHECK (auth.uid() = user_id);

        -- Disallow public update and delete. These should only be done by admins or through specific backend logic.
        CREATE POLICY "Disallow all for anonymous users on sent_emails"
        ON public.sent_emails
        FOR ALL
        TO public
        USING (false);
