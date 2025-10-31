-- Script para agregar la relación entre productos y tipos_prendas
-- Ejecutar en Supabase SQL Editor

-- Paso 1: Agregar la columna tipo_prenda_id a la tabla productos
-- La columna será nullable inicialmente para no romper datos existentes
ALTER TABLE public.productos 
ADD COLUMN IF NOT EXISTS tipo_prenda_id bigint;

-- Paso 2: Crear algunos tipos de prendas por defecto si no existen
INSERT INTO public.tipos_prendas (nombre, descripcion) 
VALUES 
  ('Bufanda', 'Prenda de vestir larga que se enrolla alrededor del cuello'),
  ('Chalina', 'Prenda de vestir que se lleva alrededor del cuello'),
  ('Guantes', 'Prenda que cubre las manos y dedos'),
  ('Manta', 'Tejido rectangular utilizado como abrigo o decoración'),
  ('Poncho', 'Prenda de vestir tradicional andina')
ON CONFLICT (nombre) DO NOTHING;

-- Paso 3: Actualizar productos existentes con un tipo de prenda por defecto
-- Asignar el primer tipo de prenda disponible a productos que no tengan uno
UPDATE public.productos 
SET tipo_prenda_id = (
  SELECT id FROM public.tipos_prendas 
  ORDER BY id ASC 
  LIMIT 1
)
WHERE tipo_prenda_id IS NULL;

-- Paso 4: Agregar la foreign key constraint
ALTER TABLE public.productos 
ADD CONSTRAINT productos_tipo_prenda_id_fkey 
FOREIGN KEY (tipo_prenda_id) 
REFERENCES public.tipos_prendas(id);

-- Paso 5: Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_productos_tipo_prenda_id 
ON public.productos(tipo_prenda_id);

-- Verificar que todo se ejecutó correctamente
SELECT 
  p.id,
  p.nombre_prenda,
  tp.nombre as tipo_prenda
FROM public.productos p
LEFT JOIN public.tipos_prendas tp ON p.tipo_prenda_id = tp.id
LIMIT 5;