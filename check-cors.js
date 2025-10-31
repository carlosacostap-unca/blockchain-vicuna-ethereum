import { createClient } from '@supabase/supabase-js';

// Variables de entorno (reemplazar con valores reales)
const supabaseUrl = 'https://okpswnjzzilsfcihoqen.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9rcHN3bmp6emlsc2ZjaWhvcWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2NzcyMDYsImV4cCI6MjA3NzI1MzIwNn0.mWui89OrJWStbf6y9i5wgQ5D5WRsDO4zLHb1PB0nSws';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCORSAndImageAccess() {
  console.log('🔍 Verificando configuración de CORS y acceso a imágenes...\n');

  try {
    // 1. Obtener un producto con fotografías
    const { data: productos, error: productosError } = await supabase
      .from('productos')
      .select('id, nombre_prenda, fotografias')
      .not('fotografias', 'is', null)
      .limit(1);

    if (productosError) {
      console.error('❌ Error al obtener productos:', productosError);
      return;
    }

    if (!productos || productos.length === 0) {
      console.log('⚠️ No se encontraron productos con fotografías');
      return;
    }

    const producto = productos[0];
    console.log(`📦 Producto encontrado: ${producto.nombre_prenda}`);
    console.log(`📸 Fotografías: ${producto.fotografias.length}`);

    // 2. Probar acceso a cada imagen
    for (let i = 0; i < producto.fotografias.length; i++) {
      const imageUrl = producto.fotografias[i];
      console.log(`\n🖼️ Probando imagen ${i + 1}: ${imageUrl}`);

      try {
        // Intentar obtener la imagen usando fetch
        const response = await fetch(imageUrl, {
          method: 'HEAD', // Solo obtener headers
          mode: 'cors'
        });

        console.log(`   Status: ${response.status} ${response.statusText}`);
        console.log(`   Headers:`);
        
        // Mostrar headers relevantes para CORS
        const corsHeaders = [
          'access-control-allow-origin',
          'access-control-allow-methods',
          'access-control-allow-headers',
          'content-type',
          'cache-control'
        ];

        corsHeaders.forEach(header => {
          const value = response.headers.get(header);
          if (value) {
            console.log(`     ${header}: ${value}`);
          }
        });

        if (response.ok) {
          console.log('   ✅ Imagen accesible');
        } else {
          console.log('   ❌ Imagen no accesible');
        }

      } catch (fetchError) {
        console.log(`   ❌ Error al acceder a la imagen: ${fetchError.message}`);
      }
    }

    // 3. Probar generar URL pública
    console.log('\n🔗 Probando generación de URL pública...');
    const { data: publicUrlData } = supabase.storage
      .from('productos-fotos')
      .getPublicUrl('1/producto_1_0_1761693017141.png');

    console.log(`URL pública generada: ${publicUrlData.publicUrl}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkCORSAndImageAccess();