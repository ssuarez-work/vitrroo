ALTER TABLE public.email_queue
    ADD COLUMN retry_count INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN next_retry_at TIMESTAMPTZ;

CREATE INDEX idx_email_queue_pending_retry
    ON public.email_queue (next_retry_at)
    WHERE status = 'pending';

UPDATE storage.buckets
SET
    file_size_limit = 4194304,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'vitrroo-assets';

DROP POLICY IF EXISTS "Usuarios autenticados pueden subir imágenes" ON storage.objects;
CREATE POLICY "Authenticated uploads validated"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'vitrroo-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Usuarios pueden actualizar sus imágenes" ON storage.objects;
CREATE POLICY "Owners can update their assets"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'vitrroo-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

DROP POLICY IF EXISTS "Usuarios pueden borrar sus imágenes" ON storage.objects;
CREATE POLICY "Owners can delete their assets"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'vitrroo-assets'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE TABLE public.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID,
    store_id UUID,
    action TEXT NOT NULL,
    target_type TEXT,
    target_id TEXT,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs (user_id, created_at DESC);
CREATE INDEX idx_audit_logs_store ON public.audit_logs (store_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON public.audit_logs (action, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can read their audit logs"
    ON public.audit_logs
    FOR SELECT
    USING (
        user_id = auth.uid()
        OR store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE OR REPLACE FUNCTION public.is_reserved_slug(p_slug TEXT)
RETURNS BOOLEAN
LANGUAGE sql
IMMUTABLE
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

ALTER TABLE public.stores
    ADD CONSTRAINT stores_slug_not_reserved
    CHECK (NOT public.is_reserved_slug(slug));
