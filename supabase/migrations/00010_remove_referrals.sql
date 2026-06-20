CREATE OR REPLACE FUNCTION public.handle_new_store()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.trial_ends_at IS NULL THEN
        NEW.trial_ends_at := now() + INTERVAL '14 days';
    END IF;
    RETURN NEW;
END;
$$;

DROP FUNCTION IF EXISTS public.redeem_referral(TEXT, UUID);
DROP FUNCTION IF EXISTS public.generate_referral_code();

DROP TABLE IF EXISTS public.referrals;

DROP INDEX IF EXISTS public.idx_stores_referral_code;
ALTER TABLE public.stores DROP COLUMN IF EXISTS referral_code;
