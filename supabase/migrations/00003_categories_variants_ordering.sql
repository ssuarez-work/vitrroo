CREATE TABLE public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT categories_name_per_store_unique UNIQUE (store_id, name)
);

CREATE INDEX idx_categories_store_sort ON public.categories (store_id, sort_order, created_at);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
    ON public.categories
    FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert categories"
    ON public.categories
    FOR INSERT
    WITH CHECK (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Owners can update categories"
    ON public.categories
    FOR UPDATE
    USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Owners can delete categories"
    ON public.categories
    FOR DELETE
    USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

ALTER TABLE public.products
    ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY created_at DESC) AS rn
    FROM public.products
)
UPDATE public.products p
SET sort_order = ordered.rn
FROM ordered
WHERE p.id = ordered.id;

CREATE INDEX idx_products_store_sort ON public.products (store_id, sort_order, created_at);
CREATE INDEX idx_products_category ON public.products (category_id);

CREATE TABLE public.product_variants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
    label TEXT NOT NULL,
    stock_quantity INTEGER,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT product_variants_stock_non_negative CHECK (stock_quantity IS NULL OR stock_quantity >= 0)
);

CREATE INDEX idx_product_variants_product_sort
    ON public.product_variants (product_id, sort_order, created_at);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Variants are viewable by everyone"
    ON public.product_variants
    FOR SELECT
    USING (true);

CREATE POLICY "Owners can insert variants"
    ON public.product_variants
    FOR INSERT
    WITH CHECK (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON s.id = p.store_id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can update variants"
    ON public.product_variants
    FOR UPDATE
    USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON s.id = p.store_id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE POLICY "Owners can delete variants"
    ON public.product_variants
    FOR DELETE
    USING (
        product_id IN (
            SELECT p.id FROM public.products p
            JOIN public.stores s ON s.id = p.store_id
            WHERE s.user_id = auth.uid()
        )
    );

CREATE OR REPLACE FUNCTION public.reorder_products(
    p_store_id UUID,
    p_ordered_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.stores WHERE id = p_store_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'No autorizado para reordenar esta tienda';
    END IF;

    UPDATE public.products AS p
    SET sort_order = positions.position
    FROM (
        SELECT id, ordinality AS position
        FROM unnest(p_ordered_ids) WITH ORDINALITY AS t(id, ordinality)
    ) AS positions
    WHERE p.id = positions.id AND p.store_id = p_store_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_products(UUID, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_products(UUID, UUID[]) TO authenticated;

CREATE OR REPLACE FUNCTION public.reorder_categories(
    p_store_id UUID,
    p_ordered_ids UUID[]
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM public.stores WHERE id = p_store_id AND user_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'No autorizado para reordenar esta tienda';
    END IF;

    UPDATE public.categories AS c
    SET sort_order = positions.position
    FROM (
        SELECT id, ordinality AS position
        FROM unnest(p_ordered_ids) WITH ORDINALITY AS t(id, ordinality)
    ) AS positions
    WHERE c.id = positions.id AND c.store_id = p_store_id;
END;
$$;

REVOKE ALL ON FUNCTION public.reorder_categories(UUID, UUID[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reorder_categories(UUID, UUID[]) TO authenticated;
