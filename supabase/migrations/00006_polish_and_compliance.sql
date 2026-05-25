ALTER TABLE public.stores
    ADD COLUMN is_published BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN welcome_email_sent_at TIMESTAMPTZ,
    ADD COLUMN trial_warning_sent_at TIMESTAMPTZ,
    ADD COLUMN trial_expired_email_sent_at TIMESTAMPTZ;

CREATE INDEX idx_stores_published ON public.stores (slug) WHERE is_published = true;

CREATE OR REPLACE FUNCTION public.cleanup_after_downgrade(p_store_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_keep_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id ORDER BY sort_order ASC, created_at DESC)
    INTO v_keep_ids
    FROM (
        SELECT id, sort_order, created_at
        FROM public.products
        WHERE store_id = p_store_id
        ORDER BY sort_order ASC, created_at DESC
        LIMIT 15
    ) AS top_products;

    IF v_keep_ids IS NOT NULL THEN
        UPDATE public.products
        SET is_active = false
        WHERE store_id = p_store_id
          AND NOT (id = ANY(v_keep_ids));
    END IF;

    UPDATE public.products
    SET is_pinned = false
    WHERE store_id = p_store_id AND is_pinned = true;

    UPDATE public.stores
    SET theme_id = NULL, theme_color = NULL
    WHERE id = p_store_id;
END;
$$;

REVOKE ALL ON FUNCTION public.cleanup_after_downgrade(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.cleanup_after_downgrade(UUID) TO service_role;

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

CREATE OR REPLACE FUNCTION public.queue_welcome_emails()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.email_queue (store_id, kind, payload)
    VALUES (NEW.id, 'welcome', jsonb_build_object('store_name', NEW.name));

    UPDATE public.stores
    SET welcome_email_sent_at = now()
    WHERE id = NEW.id;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_store_welcome ON public.stores;
CREATE TRIGGER trg_store_welcome
    AFTER INSERT ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.queue_welcome_emails();

CREATE OR REPLACE FUNCTION public.enqueue_trial_warnings()
RETURNS TABLE (queued_3d INTEGER, queued_expired INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_warning_count INTEGER := 0;
    v_expired_count INTEGER := 0;
BEGIN
    WITH inserted AS (
        INSERT INTO public.email_queue (store_id, kind, payload)
        SELECT
            s.id,
            'trial_ending_soon',
            jsonb_build_object('store_name', s.name, 'trial_ends_at', s.trial_ends_at)
        FROM public.stores s
        WHERE s.plan = 'free'
          AND s.trial_warning_sent_at IS NULL
          AND s.trial_ends_at IS NOT NULL
          AND s.trial_ends_at > now()
          AND s.trial_ends_at <= now() + INTERVAL '3 days'
        RETURNING store_id
    )
    SELECT COUNT(*) INTO v_warning_count FROM inserted;

    UPDATE public.stores
    SET trial_warning_sent_at = now()
    WHERE plan = 'free'
      AND trial_warning_sent_at IS NULL
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at > now()
      AND trial_ends_at <= now() + INTERVAL '3 days';

    WITH inserted AS (
        INSERT INTO public.email_queue (store_id, kind, payload)
        SELECT
            s.id,
            'trial_expired',
            jsonb_build_object('store_name', s.name)
        FROM public.stores s
        WHERE s.plan = 'free'
          AND s.trial_expired_email_sent_at IS NULL
          AND s.trial_ends_at IS NOT NULL
          AND s.trial_ends_at <= now()
          AND s.trial_ends_at > now() - INTERVAL '2 days'
        RETURNING store_id
    )
    SELECT COUNT(*) INTO v_expired_count FROM inserted;

    UPDATE public.stores
    SET trial_expired_email_sent_at = now()
    WHERE plan = 'free'
      AND trial_expired_email_sent_at IS NULL
      AND trial_ends_at IS NOT NULL
      AND trial_ends_at <= now()
      AND trial_ends_at > now() - INTERVAL '2 days';

    RETURN QUERY SELECT v_warning_count, v_expired_count;
END;
$$;

REVOKE ALL ON FUNCTION public.enqueue_trial_warnings() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_trial_warnings() TO service_role;
