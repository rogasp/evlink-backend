-- supabase/sql_definitions/seed_email_templates.sql

-- Seed the email_templates table with initial data.
-- This script is idempotent, meaning it can be run multiple times without causing errors.

INSERT INTO public.email_templates (template_name, subject, html_body, text_body, language_code, is_one_off)
VALUES 
    ('welcome_email', 'Welcome to EVLinkHA', '<h1>Welcome, {{name}}!</h1><p>Thank you for joining EVLinkHA. We are excited to have you on board.</p>', 'Welcome, {{name}}! Thank you for joining EVLinkHA.', 'en', FALSE),
    ('welcome_email', 'Välkommen till EVLinkHA', '<h1>Välkommen, {{name}}!</h1><p>Tack för att du har gått med i EVLinkHA. Vi är glada att ha dig ombord.</p>', 'Välkommen, {{name}}! Tack för att du har gått med i EVLinkHA.', 'sv', FALSE),
    ('trial_reminder_3_days', 'Your EVLinkHA trial ends soon!', '<h1>Your trial ends in {{days_left}} days!</h1><p>Your EVLinkHA trial period will end in {{days_left}} days. Upgrade to a paid plan to continue enjoying all features.</p>', 'Your EVLinkHA trial period will will end in {{days_left}} days. Upgrade to a paid plan to continue enjoying all features.', 'en', TRUE),
    ('trial_reminder_3_days', 'Din EVLinkHA provperiod avslutas snart!', '<h1>Din provperiod avslutas om {{days_left}} dagar!</h1><p>Din EVLinkHA provperiod kommer att avslutas om {{days_left}} dagar. Uppgradera till en betald plan för att fortsätta använda alla funktioner.</p>', 'Din EVLinkHA provperiod kommer att avslutas om {{days_left}} dagar. Uppgradera till en betald plan för att fortsätta använda alla funktioner.', 'sv', TRUE)
ON CONFLICT (template_name, language_code) DO NOTHING;
