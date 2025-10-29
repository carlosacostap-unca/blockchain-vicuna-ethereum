import { supabase } from './supabase'

// Configuración del bucket para fotografías de productos
export const PRODUCTOS_BUCKET = 'productos-fotos'

// Función para subir una fotografía
export async function uploadProductPhoto(file: File, productId: number, index: number): Promise<string | null> {
  try {
    console.log('🔍 [STORAGE DEBUG] Iniciando subida de archivo:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      productId,
      index,
      bucket: PRODUCTOS_BUCKET
    })

    // Verificar que el bucket existe
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    console.log('🔍 [STORAGE DEBUG] Buckets disponibles:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })))
    
    if (bucketsError) {
      console.error('❌ [STORAGE ERROR] Error listando buckets:', bucketsError)
    }

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔍 [STORAGE DEBUG] Estado de autenticación:', {
      user: user ? { id: user.id, email: user.email } : null,
      authError: authError?.message
    })

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop()
    const fileName = `producto_${productId}_${index}_${Date.now()}.${fileExt}`
    const filePath = `${productId}/${fileName}`

    console.log('🔍 [STORAGE DEBUG] Ruta del archivo:', filePath)

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(PRODUCTOS_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ [STORAGE ERROR] Error detallado al subir archivo:', {
        message: error.message,
        statusCode: error.statusCode,
        error: error.error,
        details: error
      })
      return null
    }

    console.log('✅ [STORAGE SUCCESS] Archivo subido exitosamente:', data)

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(PRODUCTOS_BUCKET)
      .getPublicUrl(filePath)

    console.log('🔍 [STORAGE DEBUG] URL pública generada:', publicUrl)

    return publicUrl
  } catch (error) {
    console.error('❌ [STORAGE ERROR] Error general en uploadProductPhoto:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    })
    return null
  }
}

// Función para eliminar una fotografía
export async function deleteProductPhoto(photoUrl: string): Promise<boolean> {
  try {
    // Extraer el path del archivo de la URL
    const url = new URL(photoUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.findIndex(part => part === PRODUCTOS_BUCKET)
    
    if (bucketIndex === -1) {
      console.error('Invalid photo URL format')
      return false
    }

    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage
      .from(PRODUCTOS_BUCKET)
      .remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteProductPhoto:', error)
    return false
  }
}

// Función para eliminar todas las fotografías de un producto
export async function deleteAllProductPhotos(productId: number): Promise<boolean> {
  try {
    const { data: files, error: listError } = await supabase.storage
      .from(PRODUCTOS_BUCKET)
      .list(`${productId}/`)

    if (listError) {
      console.error('Error listing files:', listError)
      return false
    }

    if (!files || files.length === 0) {
      return true // No hay archivos que eliminar
    }

    const filePaths = files.map(file => `${productId}/${file.name}`)

    const { error: deleteError } = await supabase.storage
      .from(PRODUCTOS_BUCKET)
      .remove(filePaths)

    if (deleteError) {
      console.error('Error deleting files:', deleteError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteAllProductPhotos:', error)
    return false
  }
}

// Función para validar el tipo de archivo
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten imágenes JPEG, PNG y WebP.'
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. El tamaño máximo es 5MB.'
    }
  }

  return { valid: true }
}

// Función para crear el bucket si no existe (para uso en desarrollo)
export async function createProductsBucketIfNotExists(): Promise<boolean> {
  try {
    console.log('🔍 [BUCKET DEBUG] Verificando existencia del bucket:', PRODUCTOS_BUCKET)
    
    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('❌ [BUCKET ERROR] Error listando buckets:', listError)
      return false
    }

    console.log('🔍 [BUCKET DEBUG] Buckets existentes:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })))

    const bucketExists = buckets?.some(bucket => bucket.id === PRODUCTOS_BUCKET)
    console.log('🔍 [BUCKET DEBUG] ¿Bucket existe?:', bucketExists)

    if (!bucketExists) {
      console.log('🔧 [BUCKET INFO] Creando bucket:', PRODUCTOS_BUCKET)
      
      // Crear el bucket
      const { error: createError } = await supabase.storage.createBucket(PRODUCTOS_BUCKET, {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })

      if (createError) {
        console.error('❌ [BUCKET ERROR] Error creando bucket:', {
          message: createError.message,
          statusCode: createError.statusCode,
          error: createError.error,
          details: createError
        })
        return false
      }

      console.log('✅ [BUCKET SUCCESS] Bucket creado exitosamente:', PRODUCTOS_BUCKET)
    } else {
      console.log('✅ [BUCKET INFO] Bucket ya existe:', PRODUCTOS_BUCKET)
    }

    return true
  } catch (error) {
    console.error('❌ [BUCKET ERROR] Error general en createProductsBucketIfNotExists:', {
      error,
      message: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined
    })
    return false
  }
}