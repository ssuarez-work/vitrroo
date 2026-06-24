ALTER TABLE public.stores
  ADD COLUMN IF NOT EXISTS social_links JSONB NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.stores
  DROP CONSTRAINT IF EXISTS stores_social_links_is_array;

ALTER TABLE public.stores
  ADD CONSTRAINT stores_social_links_is_array
  CHECK (jsonb_typeof(social_links) = 'array');
