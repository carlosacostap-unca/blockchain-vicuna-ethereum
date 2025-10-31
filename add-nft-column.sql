-- ========================================
-- AÑADIR COLUMNA NFT_CREADO A LA TABLA PRODUCTOS
-- ========================================

-- Añadir columna para indicar si ya se ha creado un NFT del producto
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS nft_creado BOOLEAN DEFAULT FALSE NOT NULL;

-- Añadir comentario para documentar el propósito de la columna
COMMENT ON COLUMN productos.nft_creado IS 'Indica si ya se ha creado un NFT para este producto';

-- Crear índice para mejorar el rendimiento de consultas por estado de NFT
CREATE INDEX IF NOT EXISTS idx_productos_nft_creado ON productos(nft_creado);

-- Opcional: Añadir columna para almacenar el hash de la transacción del NFT
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS nft_transaction_hash VARCHAR(66);

-- Añadir comentario para la columna del hash de transacción
COMMENT ON COLUMN productos.nft_transaction_hash IS 'Hash de la transacción blockchain cuando se creó el NFT';

-- Crear índice para el hash de transacción
CREATE INDEX IF NOT EXISTS idx_productos_nft_tx_hash ON productos(nft_transaction_hash);

-- Opcional: Añadir columna para el token ID del NFT
ALTER TABLE productos 
ADD COLUMN IF NOT EXISTS nft_token_id BIGINT;

-- Añadir comentario para la columna del token ID
COMMENT ON COLUMN productos.nft_token_id IS 'ID del token NFT en el contrato inteligente';

-- Crear índice para el token ID
CREATE INDEX IF NOT EXISTS idx_productos_nft_token_id ON productos(nft_token_id);

-- Añadir restricción única para el token ID (cada NFT debe tener un token ID único)
ALTER TABLE productos 
ADD CONSTRAINT unique_nft_token_id UNIQUE (nft_token_id);