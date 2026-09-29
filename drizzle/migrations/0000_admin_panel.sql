ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_seen_at timestamptz;
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS link text;
ALTER TABLE public.broadcasts ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE TABLE public.admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  admin_label text,
  action text NOT NULL,
  target_user_id uuid,
  target_label text,
  amount numeric,
  details jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_activity_log TO authenticated;
GRANT ALL ON public.admin_activity_log TO service_role;
ALTER TABLE public.admin_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read activity" ON public.admin_activity_log FOR SELECT TO authenticated
  USING (private.has_role(auth.uid(), 'admin'::app_role));

-- Account status check used by RLS
CREATE OR REPLACE FUNCTION private.account_active(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT status = 'active' FROM public.profiles WHERE id = _uid), true)
$$;
GRANT EXECUTE ON FUNCTION private.account_active(uuid) TO authenticated;

-- Users may never change their own status / balance-protection fields
CREATE OR REPLACE FUNCTION public.protect_profile_status()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF COALESCE(auth.role(), '') = 'service_role' OR auth.uid() IS NULL OR private.has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN NEW;
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status
     OR NEW.status_reason IS DISTINCT FROM OLD.status_reason
     OR NEW.status_changed_at IS DISTINCT FROM OLD.status_changed_at THEN
    RAISE EXCEPTION 'Not allowed to change account status';
  END IF;
  IF OLD.status <> 'active' AND NEW.balance IS DISTINCT FROM OLD.balance THEN
    RAISE EXCEPTION 'Account is not active';
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER profiles_protect_status BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_status();

-- Block restricted/banned accounts from writing activity
CREATE POLICY "active only" ON public.task_completions AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (private.account_active(auth.uid()));
CREATE POLICY "active only" ON public.withdrawal_attempts AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (private.account_active(auth.uid()));
CREATE POLICY "active only" ON public.deposits AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (private.account_active(auth.uid()));
CREATE POLICY "active only" ON public.rpc_intakes AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (private.account_active(auth.uid()));
CREATE POLICY "active only" ON public.bank_accounts AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (private.account_active(auth.uid()));

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.broadcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.public_payment_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_activity_log;