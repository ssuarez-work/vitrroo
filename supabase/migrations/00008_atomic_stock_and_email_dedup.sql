CREATE OR REPLACE FUNCTION public.decrement_variant_stock(p_variant_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_new_stock INTEGER;
BEGIN
    UPDATE public.product_variants
    SET stock_quantity = stock_quantity - 1
    WHERE id = p_variant_id
      AND stock_quantity IS NOT NULL
      AND stock_quantity > 0
    RETURNING stock_quantity INTO v_new_stock;

    RETURN v_new_stock;
END;
$$;

REVOKE ALL ON FUNCTION public.decrement_variant_stock(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.decrement_variant_stock(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.handle_store_event_notifications()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_month_start TIMESTAMPTZ;
    v_already_queued BOOLEAN;
BEGIN
    IF NEW.event_type <> 'whatsapp_click' THEN
        RETURN NEW;
    END IF;

    v_month_start := date_trunc('month', NEW.created_at AT TIME ZONE 'utc');

    SELECT EXISTS (
        SELECT 1
        FROM public.email_queue
        WHERE store_id = NEW.store_id
          AND kind = 'first_click_of_month'
          AND created_at >= v_month_start
    ) INTO v_already_queued;

    IF v_already_queued THEN
        RETURN NEW;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public.store_events
        WHERE store_id = NEW.store_id
          AND event_type = 'whatsapp_click'
          AND created_at >= v_month_start
          AND id <> NEW.id
    ) THEN
        INSERT INTO public.email_queue (store_id, kind, payload)
        VALUES (NEW.store_id, 'first_click_of_month', jsonb_build_object('event_id', NEW.id));
    END IF;

    RETURN NEW;
END;
$$;
