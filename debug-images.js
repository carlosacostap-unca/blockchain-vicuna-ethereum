// Script para diagnosticar problemas con las imágenes de productos
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://okpswnjzzilsfcihoqen.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcHN3bmp6emlsc2ZjaWhvcWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzcyMDYsImV4cCI6MjA3NzI1MzIwNn0.mWui89OrJWStbf6y9i5wgQ5D5WRsDO4zLHb1PB0nSws'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugImages() {
  console.log('🔍 Iniciando diagnóstico de imágenes...')
  
  try {
    // 1. Verificar buckets disponibles
    console.log('\n📦 Verificando buckets de storage...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error obteniendo buckets:', bucketsError)
    } else {
      console.log('✅ Buckets disponibles:')
      buckets.forEach(bucket => {
        console.log(`  - ${bucket.name} (público: ${bucket.public})`)
      })
    }
    
    // 2. Verificar archivos en el bucket productos-fotos
    console.log('\n📁 Verificando archivos en bucket productos-fotos...')
    const { data: files, error: filesError } = await supabase.storage
      .from('productos-fotos')
      .list('', { limit: 10 })
    
    if (filesError) {
      console.error('❌ Error listando archivos:', filesError)
    } else {
      console.log(`✅ Encontrados ${files.length} archivos/carpetas:`)
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'N/A'} bytes)`)
      })
    }
    
    // 3. Obtener productos con fotografías
    console.log('\n🖼️ Verificando productos con fotografías...')
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre_prenda, fotografias')
      .not('fotografias', 'is', null)
      .limit(5)
    
    if (productosError) {
      console.error('❌ Error obteniendo productos:', productosError)
    } else {
      console.log(`✅ Encontrados ${productos.length} productos con fotografías:`)
      productos.forEach(producto => {
        console.log(`\n  📋 Producto: ${producto.nombre_prenda} (ID: ${producto.id})`)
        console.log(`     Fotografías (${producto.fotografias?.length || 0}):`)
        producto.fotografias?.forEach((url, index) => {
          console.log(`     ${index + 1}. ${url}`)
          
          // Verificar si la URL es accesible
          if (url.includes('supabase.co')) {
            console.log(`        ✅ URL válida de Supabase`)
          } else {
            console.log(`        ⚠️ URL no parece ser de Supabase`)
          }
        })
      })
    }
    
    // 4. Probar generar URL pública para un archivo de ejemplo
    console.log('\n🔗 Probando generación de URL pública...')
    const testPath = 'test/ejemplo.jpg'
    const { data: publicUrlData } = supabase.storage
      .from('productos-fotos')
      .getPublicUrl(testPath)
    
    console.log(`✅ URL pública de ejemplo: ${publicUrlData.publicUrl}`)
    
  } catch (error) {
    console.error('💥 Error general:', error)
  }
}

debugImages()