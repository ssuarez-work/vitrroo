-- ==========================================
-- 1. CREACIÓN DE TABLAS
-- ==========================================

-- Tabla de Tiendas (Stores)
CREATE TABLE public.stores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    whatsapp_number TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla de Productos (Products)
CREATE TABLE public.products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0, -- Guardamos el precio en centavos (ej. $10.00 = 1000)
    image_url TEXT,
    is_active BOOLEAN DEFAULT true NOT NULL,
    options JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- 2. SEGURIDAD A NIVEL DE FILAS (RLS)
-- ==========================================

-- Activar RLS en ambas tablas
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA 'STORES'
-- Cualquiera puede ver las tiendas (para el catálogo público)
CREATE POLICY "Stores are viewable by everyone" ON public.stores
    FOR SELECT USING (true);

-- Solo el dueño puede insertar su tienda
CREATE POLICY "Users can create their own store" ON public.stores
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Solo el dueño puede editar su tienda
CREATE POLICY "Users can update their own store" ON public.stores
    FOR UPDATE USING (auth.uid() = user_id);

-- Solo el dueño puede borrar su tienda
CREATE POLICY "Users can delete their own store" ON public.stores
    FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS PARA 'PRODUCTS'
-- Cualquiera puede ver los productos
CREATE POLICY "Products are viewable by everyone" ON public.products
    FOR SELECT USING (true);

-- Solo el dueño de la tienda puede insertar/editar/borrar productos
-- (Verificamos que el usuario logueado sea el dueño de la tienda a la que pertenece el producto)
CREATE POLICY "Users can insert products to their store" ON public.products
    FOR INSERT WITH CHECK (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their store's products" ON public.products
    FOR UPDATE USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can delete their store's products" ON public.products
    FOR DELETE USING (
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

-- ==========================================
-- 3. ALMACENAMIENTO (STORAGE BUCKETS)
-- ==========================================
-- Crear el bucket público para los logos e imágenes de productos
INSERT INTO storage.buckets (id, name, public) VALUES ('vitrroo-assets', 'vitrroo-assets', true);

-- Políticas para Storage (Cualquiera puede ver, solo autenticados pueden subir)
CREATE POLICY "Cualquiera puede ver las imágenes" ON storage.objects FOR SELECT USING (bucket_id = 'vitrroo-assets');
CREATE POLICY "Usuarios autenticados pueden subir imágenes" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'vitrroo-assets');
CREATE POLICY "Usuarios pueden actualizar sus imágenes" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'vitrroo-assets');
CREATE POLICY "Usuarios pueden borrar sus imágenes" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'vitrroo-assets');
