ALTER TABLE public.stores
    ADD COLUMN theme_id TEXT;

CREATE INDEX idx_stores_theme_id ON public.stores (theme_id);
