CREATE TYPE public.store_plan AS ENUM ('free', 'pro');

ALTER TABLE public.stores
    ADD COLUMN plan public.store_plan NOT NULL DEFAULT 'free',
    ADD COLUMN trial_ends_at TIMESTAMPTZ,
    ADD COLUMN pro_until TIMESTAMPTZ,
    ADD COLUMN stripe_customer_id TEXT,
    ADD COLUMN stripe_subscription_id TEXT,
    ADD COLUMN theme_color TEXT,
    ADD COLUMN referral_code TEXT UNIQUE;

CREATE INDEX idx_stores_stripe_customer ON public.stores (stripe_customer_id);
CREATE INDEX idx_stores_referral_code ON public.stores (referral_code);

ALTER TABLE public.products
    ADD COLUMN custom_wa_message TEXT,
    ADD COLUMN is_pinned BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX idx_products_pinned
    ON public.products (store_id, sort_order)
    WHERE is_pinned = true;

CREATE TABLE public.product_images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_product_images_product_sort
    ON public.product_images (product_id, sort_order, created_at);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product images viewable by everyone"
    ON public.product_images
    FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert product images"
    ON public.product_images
    FOR INSERT
    WITH CHECK (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON s.id = p.store_id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update product images"
    ON public.product_images
    FOR UPDATE
    USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON s.id = p.store_id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete product images"
    ON public.product_images
    FOR DELETE
    USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON s.id = p.store_id
            WHERE s.user_id = auth.uid()
        )
    );

INSERT INTO public.product_images (product_id, url, sort_order)
SELECT id, image_url, 0
FROM public.products
WHERE image_url IS NOT NULL AND image_url <> '';

CREATE TABLE public.referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    referrer_store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    referred_store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    code TEXT NOT NULL,
    rewarded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT referrals_unique_referred UNIQUE (referred_store_id)
);

CREATE INDEX idx_referrals_referrer ON public.referrals (referrer_store_id);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read their referrals"
    ON public.referrals
    FOR SELECT
    USING (
        referrer_store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
        OR referred_store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE TABLE public.email_queue (
    id BIGSERIAL PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    kind TEXT NOT NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'pending',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT email_queue_status_check CHECK (status IN ('pending', 'sent', 'failed'))
);

CREATE INDEX idx_email_queue_status ON public.email_queue (status, created_at);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_store_pro(p_store_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.stores
        WHERE id = p_store_id
          AND (
              plan = 'pro'
              OR (trial_ends_at IS NOT NULL AND trial_ends_at > now())
              OR (pro_until IS NOT NULL AND pro_until > now())
          )
    );
$$;

GRANT EXECUTE ON FUNCTION public.is_store_pro(UUID) TO authenticated, anon;

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
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

CREATE OR REPLACE FUNCTION public.handle_new_store()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := public.generate_referral_code();
    END IF;
    IF NEW.trial_ends_at IS NULL THEN
        NEW.trial_ends_at := now() + INTERVAL '14 days';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_new_store ON public.stores;
CREATE TRIGGER trg_new_store
    BEFORE INSERT ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_store();

UPDATE public.stores SET referral_code = public.generate_referral_code() WHERE referral_code IS NULL;
UPDATE public.stores SET trial_ends_at = now() + INTERVAL '14 days' WHERE trial_ends_at IS NULL AND plan = 'free';

CREATE OR REPLACE FUNCTION public.handle_store_event_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    month_clicks BIGINT;
BEGIN
    IF NEW.event_type = 'whatsapp_click' THEN
        SELECT COUNT(*) INTO month_clicks
        FROM public.store_events
        WHERE store_id = NEW.store_id
          AND event_type = 'whatsapp_click'
          AND created_at >= date_trunc('month', now() AT TIME ZONE 'utc');

        IF month_clicks = 1 THEN
            INSERT INTO public.email_queue (store_id, kind, payload)
            VALUES (NEW.store_id, 'first_click_of_month', jsonb_build_object('event_id', NEW.id));
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_store_event_notifications ON public.store_events;
CREATE TRIGGER trg_store_event_notifications
    AFTER INSERT ON public.store_events
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_store_event_notifications();

CREATE OR REPLACE FUNCTION public.get_store_analytics(
    p_store_id UUID,
    p_since TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) - INTERVAL '30 days')
)
RETURNS TABLE (
    bucket DATE,
    visits BIGINT,
    whatsapp_clicks BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        (created_at AT TIME ZONE 'utc')::date AS bucket,
        COUNT(*) FILTER (WHERE event_type = 'visit')          AS visits,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS whatsapp_clicks
    FROM public.store_events
    WHERE store_id = p_store_id
      AND created_at >= p_since
      AND p_store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    GROUP BY (created_at AT TIME ZONE 'utc')::date
    ORDER BY bucket DESC;
$$;

REVOKE ALL ON FUNCTION public.get_store_analytics(UUID, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_store_analytics(UUID, TIMESTAMPTZ) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_top_products(
    p_store_id UUID,
    p_since TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) - INTERVAL '30 days'),
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    whatsapp_clicks BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        p.id,
        p.name,
        COUNT(e.id) AS whatsapp_clicks
    FROM public.store_events e
    JOIN public.products p ON p.id = e.product_id
    WHERE e.store_id = p_store_id
      AND e.event_type = 'whatsapp_click'
      AND e.created_at >= p_since
      AND p_store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    GROUP BY p.id, p.name
    ORDER BY whatsapp_clicks DESC
    LIMIT p_limit;
$$;

REVOKE ALL ON FUNCTION public.get_top_products(UUID, TIMESTAMPTZ, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_top_products(UUID, TIMESTAMPTZ, INTEGER) TO authenticated;

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

CREATE OR REPLACE FUNCTION public.get_weekly_summary(p_store_id UUID)
RETURNS TABLE (
    visits BIGINT,
    whatsapp_clicks BIGINT,
    top_product TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    WITH events AS (
        SELECT *
        FROM public.store_events
        WHERE store_id = p_store_id
          AND created_at >= now() - INTERVAL '7 days'
    ),
    totals AS (
        SELECT
            COUNT(*) FILTER (WHERE event_type = 'visit')          AS v,
            COUNT(*) FILTER (WHERE event_type = 'whatsapp_click') AS c
        FROM events
    ),
    top AS (
        SELECT p.name AS product_name
        FROM events e
        JOIN public.products p ON p.id = e.product_id
        WHERE e.event_type = 'whatsapp_click'
        GROUP BY p.name
        ORDER BY COUNT(*) DESC
        LIMIT 1
    )
    SELECT totals.v, totals.c, (SELECT product_name FROM top)
    FROM totals;
$$;

GRANT EXECUTE ON FUNCTION public.get_weekly_summary(UUID) TO authenticated, service_role;
