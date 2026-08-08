CREATE UNIQUE INDEX IF NOT EXISTS idx_stores_user_id ON public.stores (user_id);

ALTER TABLE public.products
    ADD CONSTRAINT products_price_non_negative CHECK (price >= 0);

REVOKE EXECUTE ON FUNCTION public.get_weekly_summary(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_weekly_summary(UUID) TO service_role;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    candidate TEXT;
    exists_already BOOLEAN;
BEGIN
    LOOP
        candidate := lower(substring(replace(gen_random_uuid()::text, '-', '') FROM 1 FOR 8));
        SELECT EXISTS (SELECT 1 FROM public.stores WHERE referral_code = candidate) INTO exists_already;
        EXIT WHEN NOT exists_already;
    END LOOP;
    RETURN candidate;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_reserved_slug(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
    SELECT p_slug = ANY (ARRAY[
        'admin', 'api', 'app', 'auth', 'blog', 'billing', 'catalog',
        'dashboard', 'docs', 'forgot-password', 'help', 'home', 'index',
        'login', 'logout', 'mail', 'me', 'new', 'pricing', 'privacy',
        'public', 'register', 'reset-password', 'root', 'settings',
        'signin', 'signup', 'static', 'status', 'store', 'support',
        'system', 'terms', 'test', 'user', 'vitrroo', 'webhooks', 'www'
    ]);
$$;

CREATE OR REPLACE FUNCTION public.redeem_referral(p_code TEXT, p_referred_store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_referrer_id UUID;
    v_referred_owner UUID;
    v_referrer_owner UUID;
    v_already BOOLEAN;
BEGIN
    SELECT user_id INTO v_referred_owner FROM public.stores WHERE id = p_referred_store_id;
    IF v_referred_owner IS NULL OR v_referred_owner <> auth.uid() THEN
        RETURN FALSE;
    END IF;

    SELECT id, user_id INTO v_referrer_id, v_referrer_owner FROM public.stores WHERE referral_code = lower(p_code);
    IF v_referrer_id IS NULL OR v_referrer_id = p_referred_store_id THEN
        RETURN FALSE;
    END IF;

    IF v_referrer_owner = v_referred_owner THEN
        RETURN FALSE;
    END IF;

    SELECT EXISTS (SELECT 1 FROM public.referrals WHERE referred_store_id = p_referred_store_id) INTO v_already;
    IF v_already THEN
        RETURN FALSE;
    END IF;

    INSERT INTO public.referrals (referrer_store_id, referred_store_id, code, rewarded_at)
    VALUES (v_referrer_id, p_referred_store_id, lower(p_code), now());

    UPDATE public.stores
    SET pro_until = GREATEST(COALESCE(pro_until, now()), now()) + INTERVAL '30 days'
    WHERE id IN (v_referrer_id, p_referred_store_id);

    RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.redeem_referral(TEXT, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_referral(TEXT, UUID) TO authenticated;

DROP POLICY IF EXISTS "Owners can update their assets" ON storage.objects;
CREATE POLICY "Owners can update their assets"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'vitrroo-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'vitrroo-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE TABLE public.stripe_events (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    received_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.email_queue
    ADD COLUMN claimed_at TIMESTAMPTZ;

ALTER TABLE public.email_queue
    DROP CONSTRAINT email_queue_status_check;

ALTER TABLE public.email_queue
    ADD CONSTRAINT email_queue_status_check CHECK (status IN ('pending', 'processing', 'sent', 'failed'));

CREATE OR REPLACE FUNCTION public.claim_email_jobs(p_limit INTEGER, p_stale_minutes INTEGER DEFAULT 15)
RETURNS TABLE (
    id BIGINT,
    store_id UUID,
    kind TEXT,
    payload JSONB,
    retry_count INTEGER
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    UPDATE public.email_queue AS q
    SET status = 'processing', claimed_at = now()
    WHERE q.id IN (
        SELECT candidate.id
        FROM public.email_queue AS candidate
        WHERE (
                candidate.status = 'pending'
                AND (candidate.next_retry_at IS NULL OR candidate.next_retry_at <= now())
            )
            OR (
                candidate.status = 'processing'
                AND candidate.claimed_at < now() - make_interval(mins => p_stale_minutes)
            )
        ORDER BY candidate.created_at
        FOR UPDATE SKIP LOCKED
        LIMIT p_limit
    )
    RETURNING q.id, q.store_id, q.kind, q.payload, q.retry_count;
$$;

REVOKE ALL ON FUNCTION public.claim_email_jobs(INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_email_jobs(INTEGER, INTEGER) TO service_role;
