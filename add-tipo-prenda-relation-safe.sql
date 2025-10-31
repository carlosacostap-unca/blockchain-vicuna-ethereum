-- Script SEGURO para agregar la relación entre productos y tipos_prendas
-- Versión con verificaciones adicionales y rollback automático en caso de error

BEGIN;

-- Verificar que la tabla tipos_prendas existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tipos_prendas') THEN
        RAISE EXCEPTION 'La tabla tipos_prendas no existe. Crear primero la tabla.';
    END IF;
END $$;

-- Verificar que la columna tipo_prenda_id no existe ya
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'productos' AND column_name = 'tipo_prenda_id'
    ) THEN
        RAISE NOTICE 'La columna tipo_prenda_id ya existe en la tabla productos.';
    ELSE
        -- Agregar la columna tipo_prenda_id
        ALTER TABLE public.productos ADD COLUMN tipo_prenda_id bigint;
        RAISE NOTICE 'Columna tipo_prenda_id agregada exitosamente.';
    END IF;
END $$;

-- Insertar tipos de prendas por defecto solo si no existen
INSERT INTO public.tipos_prendas (nombre, descripcion) 
VALUES 
  ('Bufanda', 'Prenda de vestir larga que se enrolla alrededor del cuello'),
  ('Chalina', 'Prenda de vestir que se lleva alrededor del cuello'),
  ('Guantes', 'Prenda que cubre las manos y dedos'),
  ('Manta', 'Tejido rectangular utilizado como abrigo o decoración'),
  ('Poncho', 'Prenda de vestir tradicional andina')
ON CONFLICT (nombre) DO NOTHING;

-- Contar productos sin tipo_prenda_id
DO $$
DECLARE
    productos_sin_tipo INTEGER;
BEGIN
    SELECT COUNT(*) INTO productos_sin_tipo 
    FROM public.productos 
    WHERE tipo_prenda_id IS NULL;
    
    RAISE NOTICE 'Productos sin tipo_prenda_id: %', productos_sin_tipo;
    
    IF productos_sin_tipo > 0 THEN
        -- Actualizar productos existentes con el primer tipo disponible
        UPDATE public.productos 
        SET tipo_prenda_id = (
            SELECT id FROM public.tipos_prendas 
            ORDER BY id ASC 
            LIMIT 1
        )
        WHERE tipo_prenda_id IS NULL;
        
        RAISE NOTICE 'Productos actualizados: %', productos_sin_tipo;
    END IF;
END $$;

-- Agregar foreign key constraint si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'productos_tipo_prenda_id_fkey'
    ) THEN
        ALTER TABLE public.productos 
        ADD CONSTRAINT productos_tipo_prenda_id_fkey 
        FOREIGN KEY (tipo_prenda_id) 
        REFERENCES public.tipos_prendas(id);
        
        RAISE NOTICE 'Foreign key constraint agregado exitosamente.';
    ELSE
        RAISE NOTICE 'Foreign key constraint ya existe.';
    END IF;
END $$;

-- Crear índice si no existe
CREATE INDEX IF NOT EXISTS idx_productos_tipo_prenda_id 
ON public.productos(tipo_prenda_id);

-- Verificación final
SELECT 
    'Verificación final:' as status,
    COUNT(*) as total_productos,
    COUNT(tipo_prenda_id) as productos_con_tipo,
    COUNT(*) - COUNT(tipo_prenda_id) as productos_sin_tipo
FROM public.productos;

-- Si llegamos aquí, todo salió bien
COMMIT;

-- Mostrar algunos ejemplos
SELECT 
    p.id,
    p.nombre_prenda,
    tp.nombre as tipo_prenda
FROM public.productos p
LEFT JOIN public.tipos_prendas tp ON p.tipo_prenda_id = tp.id
LIMIT 5;