CREATE TYPE public.store_event_type AS ENUM ('visit', 'whatsapp_click');

CREATE TABLE public.store_events (
    id BIGSERIAL PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    event_type public.store_event_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_store_events_store_created
    ON public.store_events (store_id, created_at DESC);

CREATE INDEX idx_store_events_store_type_created
    ON public.store_events (store_id, event_type, created_at DESC);

ALTER TABLE public.store_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can register a store event"
    ON public.store_events
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Store owners can read their events"
    ON public.store_events
    FOR SELECT
    USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE OR REPLACE FUNCTION public.get_store_stats(
    p_store_id UUID,
    p_since TIMESTAMPTZ DEFAULT (timezone('utc'::text, now()) - INTERVAL '30 days')
)
RETURNS TABLE (visits BIGINT, whatsapp_clicks BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        COUNT(*) FILTER (WHERE event_type = 'visit')           AS visits,
        COUNT(*) FILTER (WHERE event_type = 'whatsapp_click')  AS whatsapp_clicks
    FROM public.store_events
    WHERE store_id = p_store_id
      AND created_at >= p_since
      AND p_store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid());
$$;

REVOKE ALL ON FUNCTION public.get_store_stats(UUID, TIMESTAMPTZ) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_store_stats(UUID, TIMESTAMPTZ) TO authenticated;
