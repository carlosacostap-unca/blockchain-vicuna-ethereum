-- Crear tabla de artesanos
CREATE TABLE IF NOT EXISTS artesanos (
  id BIGSERIAL PRIMARY KEY,
  nombres VARCHAR(100) NOT NULL,
  apellidos VARCHAR(100) NOT NULL,
  domicilio TEXT NOT NULL,
  dni VARCHAR(20) UNIQUE NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  contacto VARCHAR(50) NOT NULL,
  fotografia_url TEXT,
  cooperativa_id BIGINT REFERENCES cooperativas(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_artesanos_dni ON artesanos(dni);
CREATE INDEX IF NOT EXISTS idx_artesanos_nombres ON artesanos(nombres);
CREATE INDEX IF NOT EXISTS idx_artesanos_apellidos ON artesanos(apellidos);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_artesanos_updated_at ON artesanos;
CREATE TRIGGER update_artesanos_updated_at 
    BEFORE UPDATE ON artesanos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE artesanos ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad (permitir todas las operaciones por ahora)
-- En producción, deberías ajustar estas políticas según tus necesidades
DROP POLICY IF EXISTS "Enable read access for all users" ON artesanos;
CREATE POLICY "Enable read access for all users" ON artesanos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON artesanos;
CREATE POLICY "Enable insert for all users" ON artesanos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users" ON artesanos;
CREATE POLICY "Enable update for all users" ON artesanos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users" ON artesanos;
CREATE POLICY "Enable delete for all users" ON artesanos FOR DELETE USING (true);

-- Crear bucket para las fotografías en Supabase Storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artesanos-fotos', 'artesanos-fotos', true)
ON CONFLICT (id) DO NOTHING;

-- Crear política de storage para permitir subir archivos
DROP POLICY IF EXISTS "Allow public uploads" ON storage.objects;
CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'artesanos-fotos');

DROP POLICY IF EXISTS "Allow public access" ON storage.objects;
CREATE POLICY "Allow public access" ON storage.objects FOR SELECT USING (bucket_id = 'artesanos-fotos');

DROP POLICY IF EXISTS "Allow public updates" ON storage.objects;
CREATE POLICY "Allow public updates" ON storage.objects FOR UPDATE USING (bucket_id = 'artesanos-fotos');

DROP POLICY IF EXISTS "Allow public deletes" ON storage.objects;
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE USING (bucket_id = 'artesanos-fotos');

-- ========================================
-- TABLA DE COOPERATIVAS
-- ========================================

-- Crear tabla de cooperativas
CREATE TABLE IF NOT EXISTS cooperativas (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  comunidad VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cooperativas_nombre ON cooperativas(nombre);
CREATE INDEX IF NOT EXISTS idx_cooperativas_comunidad ON cooperativas(comunidad);

-- Crear trigger para actualizar updated_at en cooperativas
DROP TRIGGER IF EXISTS update_cooperativas_updated_at ON cooperativas;
CREATE TRIGGER update_cooperativas_updated_at 
    BEFORE UPDATE ON cooperativas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) para cooperativas
ALTER TABLE cooperativas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para cooperativas
DROP POLICY IF EXISTS "Enable read access for all users on cooperativas" ON cooperativas;
CREATE POLICY "Enable read access for all users on cooperativas" ON cooperativas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on cooperativas" ON cooperativas;
CREATE POLICY "Enable insert for all users on cooperativas" ON cooperativas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on cooperativas" ON cooperativas;
CREATE POLICY "Enable update for all users on cooperativas" ON cooperativas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on cooperativas" ON cooperativas;
CREATE POLICY "Enable delete for all users on cooperativas" ON cooperativas FOR DELETE USING (true);

-- ========================================
-- TABLA DE CHAKUS
-- ========================================

-- Crear tabla de chakus
CREATE TABLE IF NOT EXISTS chakus (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_chakus_nombre ON chakus(nombre);

-- Crear trigger para actualizar updated_at en chakus
DROP TRIGGER IF EXISTS update_chakus_updated_at ON chakus;
CREATE TRIGGER update_chakus_updated_at 
    BEFORE UPDATE ON chakus 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) para chakus
ALTER TABLE chakus ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para chakus
DROP POLICY IF EXISTS "Enable read access for all users on chakus" ON chakus;
CREATE POLICY "Enable read access for all users on chakus" ON chakus FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on chakus" ON chakus;
CREATE POLICY "Enable insert for all users on chakus" ON chakus FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on chakus" ON chakus;
CREATE POLICY "Enable update for all users on chakus" ON chakus FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on chakus" ON chakus;
CREATE POLICY "Enable delete for all users on chakus" ON chakus FOR DELETE USING (true);

-- ========================================
-- TABLA DE COLT (Certificado de Origen y Legítima Tenencia)
-- ========================================

-- Crear tipos ENUM para los selectores
DO $$ BEGIN
    CREATE TYPE unidad_tipo AS ENUM ('Kg');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE materia_prima_tipo AS ENUM ('Vicugna vicugna');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE procedencia_tipo AS ENUM ('En silvestría', 'Otro');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE destino_tipo AS ENUM ('Transformación', 'Comercialización');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Crear tabla de COLT
CREATE TABLE IF NOT EXISTS colt (
  id BIGSERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  artesano_id BIGINT REFERENCES artesanos(id) ON DELETE CASCADE,
  unidad unidad_tipo NOT NULL DEFAULT 'Kg',
  cantidad DECIMAL(10,3) NOT NULL,
  materia_prima materia_prima_tipo NOT NULL DEFAULT 'Vicugna vicugna',
  descripcion TEXT NOT NULL,
  lugar_procedencia procedencia_tipo NOT NULL,
  chaku_id BIGINT REFERENCES chakus(id) ON DELETE SET NULL,
  ano INTEGER NOT NULL,
  documentacion_origen TEXT NOT NULL,
  destino destino_tipo NOT NULL,
  fecha_expedicion DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_colt_numero ON colt(numero);
CREATE INDEX IF NOT EXISTS idx_colt_artesano_id ON colt(artesano_id);
CREATE INDEX IF NOT EXISTS idx_colt_chaku_id ON colt(chaku_id);
CREATE INDEX IF NOT EXISTS idx_colt_ano ON colt(ano);
CREATE INDEX IF NOT EXISTS idx_colt_fecha_expedicion ON colt(fecha_expedicion);

-- Crear trigger para actualizar updated_at en colt
DROP TRIGGER IF EXISTS update_colt_updated_at ON colt;
CREATE TRIGGER update_colt_updated_at 
    BEFORE UPDATE ON colt 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS) para colt
ALTER TABLE colt ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para colt
DROP POLICY IF EXISTS "Enable read access for all users on colt" ON colt;
CREATE POLICY "Enable read access for all users on colt" ON colt FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on colt" ON colt;
CREATE POLICY "Enable insert for all users on colt" ON colt FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on colt" ON colt;
CREATE POLICY "Enable update for all users on colt" ON colt FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on colt" ON colt;
CREATE POLICY "Enable delete for all users on colt" ON colt FOR DELETE USING (true);

-- ========================================
-- TABLA DE CTPSFS (Certificado de Transformación de Productos y Subproductos de Fauna Silvestre)
-- ========================================

-- Crear tabla de CTPSFS
CREATE TABLE IF NOT EXISTS ctpsfs (
  id BIGSERIAL PRIMARY KEY,
  numero VARCHAR(50) UNIQUE NOT NULL,
  descripcion_producto TEXT NOT NULL,
  chaku_id BIGINT REFERENCES chakus(id) ON DELETE SET NULL,
  ano INTEGER NOT NULL,
  documentacion_origen TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de procesos de transformación (relación uno a muchos con CTPSFS)
CREATE TABLE IF NOT EXISTS ctpsfs_procesos_transformacion (
  id BIGSERIAL PRIMARY KEY,
  ctpsfs_id BIGINT REFERENCES ctpsfs(id) ON DELETE CASCADE,
  descripcion_producto TEXT NOT NULL,
  cantidad DECIMAL(10,3) NOT NULL,
  unidad VARCHAR(10) NOT NULL DEFAULT 'Kg',
  documentacion_tenencia TEXT NOT NULL,
  fecha_certificacion DATE NOT NULL,
  artesano_id BIGINT REFERENCES artesanos(id) ON DELETE CASCADE, -- Permisionario
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_ctpsfs_numero ON ctpsfs(numero);
CREATE INDEX IF NOT EXISTS idx_ctpsfs_chaku_id ON ctpsfs(chaku_id);
CREATE INDEX IF NOT EXISTS idx_ctpsfs_ano ON ctpsfs(ano);
CREATE INDEX IF NOT EXISTS idx_ctpsfs_procesos_ctpsfs_id ON ctpsfs_procesos_transformacion(ctpsfs_id);
CREATE INDEX IF NOT EXISTS idx_ctpsfs_procesos_artesano_id ON ctpsfs_procesos_transformacion(artesano_id);
CREATE INDEX IF NOT EXISTS idx_ctpsfs_procesos_fecha ON ctpsfs_procesos_transformacion(fecha_certificacion);

-- Crear triggers para actualizar updated_at
DROP TRIGGER IF EXISTS update_ctpsfs_updated_at ON ctpsfs;
CREATE TRIGGER update_ctpsfs_updated_at 
    BEFORE UPDATE ON ctpsfs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ctpsfs_procesos_updated_at ON ctpsfs_procesos_transformacion;
CREATE TRIGGER update_ctpsfs_procesos_updated_at 
    BEFORE UPDATE ON ctpsfs_procesos_transformacion 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE ctpsfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ctpsfs_procesos_transformacion ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para ctpsfs
DROP POLICY IF EXISTS "Enable read access for all users on ctpsfs" ON ctpsfs;
CREATE POLICY "Enable read access for all users on ctpsfs" ON ctpsfs FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on ctpsfs" ON ctpsfs;
CREATE POLICY "Enable insert for all users on ctpsfs" ON ctpsfs FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on ctpsfs" ON ctpsfs;
CREATE POLICY "Enable update for all users on ctpsfs" ON ctpsfs FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on ctpsfs" ON ctpsfs;
CREATE POLICY "Enable delete for all users on ctpsfs" ON ctpsfs FOR DELETE USING (true);

-- Crear políticas de seguridad para ctpsfs_procesos_transformacion
DROP POLICY IF EXISTS "Enable read access for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion;
CREATE POLICY "Enable read access for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion;
CREATE POLICY "Enable insert for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion;
CREATE POLICY "Enable update for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion;
CREATE POLICY "Enable delete for all users on ctpsfs_procesos" ON ctpsfs_procesos_transformacion FOR DELETE USING (true);

-- ========================================
-- TABLA DE TIPOS DE PRENDAS
-- ========================================

-- Crear tabla de tipos de prendas
CREATE TABLE IF NOT EXISTS tipos_prendas (
  id BIGSERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar los tipos de prendas predefinidos
INSERT INTO tipos_prendas (nombre, descripcion) VALUES 
  ('Poncho', 'Prenda de vestir tradicional andina'),
  ('Manta', 'Tejido rectangular utilizado como abrigo o decoración'),
  ('Chalina', 'Prenda de vestir que se lleva alrededor del cuello'),
  ('Bufanda', 'Prenda de vestir larga que se enrolla alrededor del cuello'),
  ('Guantes', 'Prenda que cubre las manos y dedos')
ON CONFLICT (nombre) DO NOTHING;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_tipos_prendas_nombre ON tipos_prendas(nombre);

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_tipos_prendas_updated_at ON tipos_prendas;
CREATE TRIGGER update_tipos_prendas_updated_at 
    BEFORE UPDATE ON tipos_prendas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE tipos_prendas ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para tipos_prendas
DROP POLICY IF EXISTS "Enable read access for all users on tipos_prendas" ON tipos_prendas;
CREATE POLICY "Enable read access for all users on tipos_prendas" ON tipos_prendas FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on tipos_prendas" ON tipos_prendas;
CREATE POLICY "Enable insert for all users on tipos_prendas" ON tipos_prendas FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on tipos_prendas" ON tipos_prendas;
CREATE POLICY "Enable update for all users on tipos_prendas" ON tipos_prendas FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on tipos_prendas" ON tipos_prendas;
CREATE POLICY "Enable delete for all users on tipos_prendas" ON tipos_prendas FOR DELETE USING (true);

-- ========================================
-- TABLA DE PRODUCTOS
-- ========================================

-- Crear tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id BIGSERIAL PRIMARY KEY,
  nombre_prenda VARCHAR(255) NOT NULL,
  tipo_prenda_id BIGINT REFERENCES tipos_prendas(id) ON DELETE SET NULL,
  artesano_id BIGINT REFERENCES artesanos(id) ON DELETE CASCADE,
  ctpsfs_id BIGINT REFERENCES ctpsfs(id) ON DELETE SET NULL,
  localidad_origen VARCHAR(255) NOT NULL,
  tecnicas_utilizadas TEXT NOT NULL,
  ancho_metros DECIMAL(8,3) NOT NULL CHECK (ancho_metros > 0),
  alto_metros DECIMAL(8,3) NOT NULL CHECK (alto_metros > 0),
  tiempo_elaboracion_meses INTEGER NOT NULL CHECK (tiempo_elaboracion_meses > 0),
  peso_fibra_gramos DECIMAL(10,2) CHECK (peso_fibra_gramos > 0),
  fotografias TEXT[], -- Array de URLs de las fotografías en Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_nombre ON productos(nombre_prenda);
CREATE INDEX IF NOT EXISTS idx_productos_tipo_prenda_id ON productos(tipo_prenda_id);
CREATE INDEX IF NOT EXISTS idx_productos_artesano_id ON productos(artesano_id);
CREATE INDEX IF NOT EXISTS idx_productos_ctpsfs_id ON productos(ctpsfs_id);
CREATE INDEX IF NOT EXISTS idx_productos_localidad ON productos(localidad_origen);
CREATE INDEX IF NOT EXISTS idx_productos_tiempo_elaboracion ON productos(tiempo_elaboracion_meses);

-- Crear trigger para actualizar updated_at
DROP TRIGGER IF EXISTS update_productos_updated_at ON productos;
CREATE TRIGGER update_productos_updated_at 
    BEFORE UPDATE ON productos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad para productos
DROP POLICY IF EXISTS "Enable read access for all users on productos" ON productos;
CREATE POLICY "Enable read access for all users on productos" ON productos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users on productos" ON productos;
CREATE POLICY "Enable insert for all users on productos" ON productos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on productos" ON productos;
CREATE POLICY "Enable update for all users on productos" ON productos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Enable delete for all users on productos" ON productos;
CREATE POLICY "Enable delete for all users on productos" ON productos FOR DELETE USING (true);

-- ========================================
-- CONFIGURACIÓN DE STORAGE PARA FOTOGRAFÍAS
-- ========================================

-- Crear políticas RLS para la tabla storage.buckets
DROP POLICY IF EXISTS "Allow bucket creation" ON storage.buckets;
CREATE POLICY "Allow bucket creation" ON storage.buckets FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow bucket read" ON storage.buckets;
CREATE POLICY "Allow bucket read" ON storage.buckets FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow bucket update" ON storage.buckets;
CREATE POLICY "Allow bucket update" ON storage.buckets FOR UPDATE USING (true);

-- Crear bucket para fotografías de productos (esto se debe ejecutar desde el dashboard de Supabase o mediante código)
INSERT INTO storage.buckets (id, name, public) VALUES ('productos-fotos', 'productos-fotos', true) ON CONFLICT (id) DO NOTHING;

-- Crear políticas de storage para fotografías de productos
DROP POLICY IF EXISTS "Allow public uploads productos" ON storage.objects;
CREATE POLICY "Allow public uploads productos" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'productos-fotos');

DROP POLICY IF EXISTS "Allow public access productos" ON storage.objects;
CREATE POLICY "Allow public access productos" ON storage.objects FOR SELECT USING (bucket_id = 'productos-fotos');

DROP POLICY IF EXISTS "Allow public updates productos" ON storage.objects;
CREATE POLICY "Allow public updates productos" ON storage.objects FOR UPDATE USING (bucket_id = 'productos-fotos');

DROP POLICY IF EXISTS "Allow public deletes productos" ON storage.objects;
CREATE POLICY "Allow public deletes productos" ON storage.objects FOR DELETE USING (bucket_id = 'productos-fotos');