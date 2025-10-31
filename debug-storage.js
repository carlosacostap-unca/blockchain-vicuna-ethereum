import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

const supabase = createClient(supabaseUrl, supabaseKey)

const PRODUCTOS_BUCKET = 'productos-fotos'
const ARTESANOS_BUCKET = 'artesanos-fotos'

async function debugStorage() {
  console.log('🔍 DIAGNÓSTICO DE SUPABASE STORAGE')
  console.log('=====================================')
  
  try {
    // 1. Verificar configuración
    console.log('\n1. CONFIGURACIÓN:')
    console.log('   URL:', supabaseUrl)
    console.log('   Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NO CONFIGURADA')
    
    // 2. Verificar autenticación
    console.log('\n2. AUTENTICACIÓN:')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) {
      console.log('   ❌ Error de autenticación:', authError.message)
    } else {
      console.log('   ✅ Usuario autenticado:', user ? user.email : 'Usuario anónimo')
    }
    
    // 3. Listar buckets existentes
    console.log('\n3. BUCKETS EXISTENTES:')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('   ❌ Error listando buckets:', bucketsError.message)
      console.log('   📋 Detalles:', bucketsError)
    } else {
      console.log('   📦 Buckets encontrados:', buckets?.length || 0)
      buckets?.forEach(bucket => {
        console.log(`     - ${bucket.id} (público: ${bucket.public})`)
      })
    }
    
    // 4. Verificar buckets específicos
    console.log('\n4. VERIFICACIÓN DE BUCKETS REQUERIDOS:')
    const requiredBuckets = [PRODUCTOS_BUCKET, ARTESANOS_BUCKET]
    
    for (const bucketName of requiredBuckets) {
      const bucketExists = buckets?.some(bucket => bucket.id === bucketName)
      console.log(`   ${bucketName}: ${bucketExists ? '✅ Existe' : '❌ No existe'}`)
      
      if (!bucketExists) {
        console.log(`   🔧 Intentando crear bucket: ${bucketName}`)
        
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })
        
        if (createError) {
          console.log(`   ❌ Error creando bucket ${bucketName}:`, createError.message)
          console.log(`   📋 Detalles:`, createError)
        } else {
          console.log(`   ✅ Bucket ${bucketName} creado exitosamente`)
        }
      }
    }
    
    // 5. Verificar políticas RLS
    console.log('\n5. VERIFICACIÓN DE POLÍTICAS RLS:')
    console.log('   ℹ️  Las políticas RLS deben permitir:')
    console.log('     - INSERT en storage.objects para usuarios autenticados')
    console.log('     - SELECT en storage.objects para acceso público')
    console.log('     - UPDATE en storage.objects para propietarios')
    console.log('     - DELETE en storage.objects para propietarios')
    
    // 6. Test de subida (si hay buckets)
    if (buckets?.some(bucket => bucket.id === PRODUCTOS_BUCKET)) {
      console.log('\n6. TEST DE SUBIDA:')
      
      // Crear un archivo de prueba
      const testContent = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZiIvPjx0ZXh0IHg9IjUwIiB5PSI1NSIgZm9udC1zaXplPSIxNCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+VEVTVDWVT</text>'
      
      try {
        const testFileName = `test_${Date.now()}.svg`
        const testPath = `test/${testFileName}`
        
        // Convertir base64 a blob
        const response = await fetch(testContent)
        const blob = await response.blob()
        
        console.log('   🧪 Subiendo archivo de prueba...')
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from(PRODUCTOS_BUCKET)
          .upload(testPath, blob)
        
        if (uploadError) {
          console.log('   ❌ Error en test de subida:', uploadError.message)
          console.log('   📋 Detalles:', uploadError)
        } else {
          console.log('   ✅ Test de subida exitoso:', uploadData.path)
          
          // Obtener URL pública
          const { data: { publicUrl } } = supabase.storage
            .from(PRODUCTOS_BUCKET)
            .getPublicUrl(testPath)
          
          console.log('   🔗 URL pública:', publicUrl)
          
          // Limpiar archivo de prueba
          await supabase.storage
            .from(PRODUCTOS_BUCKET)
            .remove([testPath])
          
          console.log('   🧹 Archivo de prueba eliminado')
        }
      } catch (testError) {
        console.log('   ❌ Error en test de subida:', testError.message)
      }
    }
    
  } catch (error) {
    console.error('💥 Error general:', error)
  }
  
  console.log('\n=====================================')
  console.log('🏁 DIAGNÓSTICO COMPLETADO')
}

// Ejecutar diagnóstico
debugStorage().catch(console.error)