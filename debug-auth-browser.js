// Script de diagnóstico para ejecutar en la consola del navegador
// Copia y pega este código en la consola del navegador (F12 → Console)

console.log('🔍 DIAGNÓSTICO DE AUTENTICACIÓN EN EL NAVEGADOR');
console.log('==============================================');

// Verificar si Supabase está disponible
if (typeof window !== 'undefined' && window.supabase) {
  console.log('✅ Supabase client disponible');
  
  // Verificar sesión actual
  window.supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
      console.error('❌ Error obteniendo sesión:', error.message);
    } else if (session) {
      console.log('✅ Usuario autenticado:', {
        email: session.user.email,
        id: session.user.id,
        expires_at: new Date(session.expires_at * 1000).toLocaleString()
      });
    } else {
      console.log('⚠️ No hay sesión activa - Usuario no autenticado');
      console.log('💡 Necesitas iniciar sesión para subir fotos');
    }
  });
  
  // Verificar usuario actual
  window.supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (error) {
      console.error('❌ Error obteniendo usuario:', error.message);
    } else if (user) {
      console.log('✅ Usuario verificado:', user.email);
    } else {
      console.log('❌ No se pudo verificar el usuario');
    }
  });
  
} else {
  console.error('❌ Supabase client no está disponible en window');
  console.log('💡 Esto podría indicar un problema de configuración');
}

// Verificar variables de entorno (solo las públicas)
console.log('🔍 Variables de entorno públicas:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process?.env?.NEXT_PUBLIC_SUPABASE_URL || 'No disponible');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process?.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[CONFIGURADA]' : 'No disponible');