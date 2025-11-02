// Script de diagnóstico para verificar el storage de artesanos
// Ejecutar en la consola del navegador en http://localhost:3000/admin/artesanos/new

console.log('🔍 [DIAGNÓSTICO] Iniciando verificación del storage de artesanos...')

async function diagnosticarStorageArtesanos() {
  try {
    // 1. Verificar autenticación
    console.log('1️⃣ Verificando autenticación...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Usuario no autenticado:', authError?.message)
      return
    }
    
    console.log('✅ Usuario autenticado:', user.email)
    
    // 2. Listar buckets disponibles
    console.log('2️⃣ Listando buckets disponibles...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listando buckets:', bucketsError)
      return
    }
    
    console.log('📦 Buckets disponibles:', buckets?.map(b => ({ 
      id: b.id, 
      name: b.name, 
      public: b.public,
      created_at: b.created_at 
    })))
    
    // 3. Verificar si existe el bucket de artesanos
    const artesanosBucket = buckets?.find(b => b.id === 'artesanos-fotos')
    
    if (!artesanosBucket) {
      console.error('❌ Bucket "artesanos-fotos" no encontrado')
      console.log('🔧 Intentando crear el bucket...')
      
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('artesanos-fotos', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      })
      
      if (createError) {
        console.error('❌ Error creando bucket:', createError)
        return
      }
      
      console.log('✅ Bucket creado exitosamente:', newBucket)
    } else {
      console.log('✅ Bucket "artesanos-fotos" encontrado:', artesanosBucket)
    }
    
    // 4. Probar subida de archivo de prueba
    console.log('3️⃣ Probando subida de archivo de prueba...')
    
    // Crear un archivo de prueba (imagen SVG pequeña)
    const svgContent = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#ecd2b4"/>
      <text x="50" y="50" text-anchor="middle" dy=".3em" fill="#0f324b">TEST</text>
    </svg>`
    
    const testFile = new File([svgContent], 'test-artesano.svg', { type: 'image/svg+xml' })
    const testPath = `test/test-${Date.now()}.svg`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('artesanos-fotos')
      .upload(testPath, testFile, {
        cacheControl: '3600',
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Error en subida de prueba:', uploadError)
      
      // Verificar políticas RLS
      console.log('4️⃣ Verificando políticas de storage...')
      
      // Intentar listar archivos para verificar permisos
      const { data: files, error: listError } = await supabase.storage
        .from('artesanos-fotos')
        .list('', { limit: 1 })
      
      if (listError) {
        console.error('❌ Error listando archivos (problema de políticas):', listError)
        console.log('💡 Posible solución: Verificar políticas RLS en Supabase Dashboard')
      } else {
        console.log('✅ Permisos de listado funcionan correctamente')
      }
      
      return
    }
    
    console.log('✅ Subida de prueba exitosa:', uploadData)
    
    // 5. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('artesanos-fotos')
      .getPublicUrl(testPath)
    
    console.log('🔗 URL pública generada:', publicUrl)
    
    // 6. Limpiar archivo de prueba
    const { error: deleteError } = await supabase.storage
      .from('artesanos-fotos')
      .remove([testPath])
    
    if (deleteError) {
      console.warn('⚠️ No se pudo eliminar el archivo de prueba:', deleteError)
    } else {
      console.log('🗑️ Archivo de prueba eliminado')
    }
    
    console.log('🎉 ¡Diagnóstico completado! El storage de artesanos funciona correctamente.')
    
  } catch (error) {
    console.error('💥 Error general en diagnóstico:', error)
  }
}

// Ejecutar diagnóstico
diagnosticarStorageArtesanos()