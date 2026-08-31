ALTER TABLE public.stores
    ADD CONSTRAINT stores_whatsapp_number_e164
    CHECK (whatsapp_number IS NULL OR whatsapp_number ~ '^\+[1-9][0-9]{7,14}$')
    NOT VALID;
