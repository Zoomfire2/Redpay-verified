ALTER TABLE public.public_payment_settings ADD COLUMN IF NOT EXISTS payment_mode text NOT NULL DEFAULT 'normal';
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS payment_provider text NOT NULL DEFAULT 'normal';
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS payment_reference text;
ALTER PUBLICATION supabase_realtime ADD TABLE public.deposits;