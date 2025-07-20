-- supabase/sql_definitions/create_email_templates_table.sql

-- Drop the table if it exists to ensure a clean slate
DROP TABLE IF EXISTS public.email_templates CASCADE;

-- Enable the moddatetime extension to automatically update updated_at columns
CREATE EXTENSION IF NOT EXISTS moddatetime WITH SCHEMA extensions;

-- Create the table to store email templates
CREATE TABLE public.email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT NOT NULL,
    language_code VARCHAR(5) NOT NULL DEFAULT 'en',
    is_one_off BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_template_name_lang UNIQUE (template_name, language_code)
);

-- Add comments to the table and columns
COMMENT ON TABLE public.email_templates IS 'Stores email templates for various transactional emails.';
COMMENT ON COLUMN public.email_templates.template_name IS 'A unique identifier for the template, e.g., "welcome_email".';
COMMENT ON COLUMN public.email_templates.language_code IS 'The language of the template, e.g., "en" or "sv".';

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER handle_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE PROCEDURE moddatetime (updated_at);

-- Enable Row-Level Security (RLS)
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
-- Allow authenticated users to read all templates.
-- In a more restrictive environment, this could be limited to service roles.
CREATE POLICY "Allow authenticated users to read email templates"
ON public.email_templates
FOR SELECT
TO authenticated
USING (true);

-- Disallow public insert, update, delete. These should only be done by admins or through migrations.
CREATE POLICY "Disallow all for anonymous users"
ON public.email_templates
FOR ALL
TO public
USING (false);
