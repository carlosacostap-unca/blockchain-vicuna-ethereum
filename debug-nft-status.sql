-- Script para verificar el estado de los NFTs en la base de datos
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar que las columnas NFT existen en la tabla productos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'productos' 
  AND column_name IN ('nft_creado', 'nft_transaction_hash', 'nft_token_id')
ORDER BY column_name;

-- 2. Verificar todos los productos y su estado NFT
SELECT 
    id,
    nombre_prenda,
    nft_creado,
    nft_transaction_hash,
    nft_token_id,
    created_at,
    updated_at
FROM productos 
ORDER BY created_at DESC;

-- 3. Contar productos por estado NFT
SELECT 
    'Total productos' as categoria,
    COUNT(*) as cantidad
FROM productos
UNION ALL
SELECT 
    'Productos con NFT creado' as categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE nft_creado = true
UNION ALL
SELECT 
    'Productos sin NFT' as categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE nft_creado = false OR nft_creado IS NULL
UNION ALL
SELECT 
    'Productos con transaction_hash' as categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE nft_transaction_hash IS NOT NULL
UNION ALL
SELECT 
    'Productos con token_id' as categoria,
    COUNT(*) as cantidad
FROM productos 
WHERE nft_token_id IS NOT NULL;

-- 4. Verificar si hay productos recientes que deberían tener NFT
SELECT 
    id,
    nombre_prenda,
    nft_creado,
    nft_transaction_hash,
    nft_token_id,
    created_at
FROM productos 
WHERE created_at > NOW() - INTERVAL '1 day'
ORDER BY created_at DESC;