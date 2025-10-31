import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 TEST DE AUTENTICACIÓN Y SUBIDA')
console.log('=====================================')

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  try {
    // Verificar usuario actual
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('1. ESTADO DE AUTENTICACIÓN:')
    if (authError) {
      console.log('   ❌ Error:', authError.message)
    } else if (user) {
      console.log('   ✅ Usuario autenticado:', user.email)
      console.log('   📧 ID:', user.id)
    } else {
      console.log('   ⚠️  No hay usuario autenticado')
    }

    // Verificar sesión
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    console.log('\n2. ESTADO DE SESIÓN:')
    if (sessionError) {
      console.log('   ❌ Error:', sessionError.message)
    } else if (session) {
      console.log('   ✅ Sesión activa')
      console.log('   🔑 Access Token:', session.access_token ? 'Presente' : 'Ausente')
    } else {
      console.log('   ⚠️  No hay sesión activa')
    }

    // Verificar buckets
    console.log('\n3. VERIFICACIÓN DE BUCKETS:')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.log('   ❌ Error listando buckets:', bucketsError.message)
    } else {
      console.log('   📦 Buckets encontrados:', buckets.length)
      buckets.forEach(bucket => {
        console.log(`     - ${bucket.id} (público: ${bucket.public})`)
      })
    }

    // Verificar políticas del bucket artesanos-fotos
    console.log('\n4. TEST DE ACCESO AL BUCKET:')
    try {
      const { data: files, error: listError } = await supabase.storage
        .from('artesanos-fotos')
        .list('', { limit: 1 })
      
      if (listError) {
        console.log('   ❌ Error accediendo al bucket:', listError.message)
      } else {
        console.log('   ✅ Acceso al bucket exitoso')
      }
    } catch (err) {
      console.log('   ❌ Error de acceso:', err.message)
    }

  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

testAuth()