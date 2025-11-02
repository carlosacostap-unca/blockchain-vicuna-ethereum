'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type Artesano, type ArtesanoWithRelations } from '@/lib/supabase'

export default function AdminArtesanosPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [artesanos, setArtesanos] = useState<ArtesanoWithRelations[]>([])
  const [loadingArtesanos, setLoadingArtesanos] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMoreData, setHasMoreData] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const ITEMS_PER_PAGE = 50
  const router = useRouter()

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario o perfil, no mostrar nada (el hook se encarga de redirigir)
  if (!user || !profile) {
    return null
  }

  const fetchArtesanos = async (page = 0, append = false) => {
    const timeoutId = setTimeout(() => {
      console.error('⏰ [ARTESANOS] Timeout: La consulta está tardando demasiado')
      setError('La carga está tardando demasiado. Por favor, recargue la página.')
      setLoadingArtesanos(false)
      setLoadingMore(false)
    }, 10000) // 10 segundos timeout (reducido por optimización)

    try {
      console.log(`🔍 [ARTESANOS] Iniciando carga de artesanos (página ${page})...`)
      if (!append) {
        setLoadingArtesanos(true)
        setCurrentPage(0)
        setHasMoreData(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      // Verificar autenticación antes de hacer la consulta
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      console.log('🔍 [ARTESANOS] Estado de autenticación:', {
        user: user ? { id: user.id, email: user.email } : null,
        authError: authError?.message
      })

      if (authError || !user) {
        console.error('❌ [ARTESANOS] Usuario no autenticado:', authError?.message || 'No user found')
        setError('Usuario no autenticado. Por favor, inicie sesión nuevamente.')
        clearTimeout(timeoutId)
        setLoadingArtesanos(false)
        setLoadingMore(false)
        return
      }

      console.log('🔄 [ARTESANOS] Ejecutando consulta optimizada a Supabase...')
      const { data, error } = await supabase
        .from('artesanos')
        .select(`
          id,
          nombres,
          apellidos,
          dni,
          contacto,
          domicilio,
          fecha_nacimiento,
          cooperativa_id,
          fotografia_url,
          created_at,
          updated_at
        `)
        .order('nombres', { ascending: true })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)

      console.log('🔍 [ARTESANOS] Resultado de la consulta:', {
        data: data ? `${data.length} artesanos encontrados` : 'No data',
        error: error ? { message: error.message, details: error } : null
      })

      if (error) {
        console.error('❌ [ARTESANOS] Error en la consulta:', error)
        throw error
      }

      console.log('✅ [ARTESANOS] Artesanos cargados exitosamente:', data?.length || 0)
      
      // Verificar si hay más datos disponibles
      const hasMore = data && data.length === ITEMS_PER_PAGE
      setHasMoreData(hasMore)
      
      // Cargar cooperativas solo para los artesanos que las tienen
      if (data && data.length > 0) {
        const cooperativaIds = [...new Set(data.filter(a => a.cooperativa_id).map(a => a.cooperativa_id))]
        
        if (cooperativaIds.length > 0) {
          console.log('🔄 [ARTESANOS] Cargando cooperativas asociadas...')
          const { data: cooperativas, error: cooperativasError } = await supabase
            .from('cooperativas')
            .select('id, nombre')
            .in('id', cooperativaIds)
          
          if (!cooperativasError && cooperativas) {
            // Crear un mapa de cooperativas para acceso rápido
            const cooperativasMap = new Map(cooperativas.map(c => [c.id, c]))
            
            // Agregar información de cooperativa a cada artesano
            const artesanosWithCooperativas = data.map(artesano => ({
              ...artesano,
              cooperativa: artesano.cooperativa_id ? cooperativasMap.get(artesano.cooperativa_id) : null
            }))
            
            console.log('✅ [ARTESANOS] Cooperativas cargadas exitosamente')
            
            // Actualizar la lista según el modo (append o replace)
            if (append) {
              setArtesanos(prev => [...prev, ...artesanosWithCooperativas])
              setCurrentPage(page)
            } else {
              setArtesanos(artesanosWithCooperativas)
              setCurrentPage(0)
            }
          } else {
            console.warn('⚠️ [ARTESANOS] Error al cargar cooperativas:', cooperativasError)
            if (append) {
              setArtesanos(prev => [...prev, ...(data || [])])
              setCurrentPage(page)
            } else {
              setArtesanos(data || [])
              setCurrentPage(0)
            }
          }
        } else {
          if (append) {
            setArtesanos(prev => [...prev, ...(data || [])])
            setCurrentPage(page)
          } else {
            setArtesanos(data || [])
            setCurrentPage(0)
          }
        }
      } else {
        if (!append) {
          setArtesanos([])
          setCurrentPage(0)
        }
      }
      
    } catch (error: any) {
      console.error('❌ [ARTESANOS] Error general en fetchArtesanos:', {
        error,
        message: error.message || 'Error desconocido',
        stack: error.stack
      })
      setError(error.message || 'Error al cargar los artesanos. Por favor, intente nuevamente.')
    } finally {
      clearTimeout(timeoutId)
      console.log('🏁 [ARTESANOS] Finalizando carga de artesanos')
      setLoadingArtesanos(false)
      setLoadingMore(false)
    }
  }

  // Función para cargar más artesanos
  const loadMoreArtesanos = () => {
    if (!loadingMore && hasMoreData) {
      fetchArtesanos(currentPage + 1, true)
    }
  }

  useEffect(() => {
    fetchArtesanos()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artesano?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('artesanos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Actualizar la lista local
      setArtesanos(prev => prev.filter(artesano => artesano.id !== id))
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el artesano')
    }
  }

  const handleAccessOption = (option: string) => {
    setIsMenuOpen(false)
    switch (option) {
      case 'Administrador':
        router.push('/admin')
        break
      case 'Artesano':
        router.push('/artesano')
        break
      case 'Cooperativa':
        router.push('/cooperativa')
        break
    }
  }

  const filteredArtesanos = artesanos.filter(artesano =>
    artesano.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artesano.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artesano.dni.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Igual al de la página admin */}
      <header className="shadow-lg relative" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <div className="flex-shrink-0">
              <h1 className="text-xl tracking-wide font-maria-david" style={{ color: '#ecd2b4' }}>RUTA DEL TELAR</h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => router.push('/')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  INICIO
                </button>
                <button
                  onClick={() => router.push('/catalogo')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  CATÁLOGO
                </button>
                <button
                  onClick={() => router.push('/productos')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  PRODUCTOS
                </button>
                <button
                  onClick={() => router.push('/enlaces')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  ENLACES
                </button>
              </div>
            </nav>

            {/* Menú de usuario */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  className="flex flex-row justify-center items-center w-8 h-8 space-x-1 hover:opacity-80 transition-opacity duration-200"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                </button>

                {/* Dropdown del menú */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50"
                    style={{ backgroundColor: '#0f324b' }}
                  >
                    <div className="py-2">
                      {/* Información del usuario */}
                      <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                          {profile.full_name || user.email}
                        </p>
                        <p className="text-xs opacity-60 capitalize" style={{ color: '#ecd2b4' }}>
                          {profile.role?.name}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => handleAccessOption('Administrador')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Administrador
                      </button>
                      <button
                        onClick={() => handleAccessOption('Artesano')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Artesano
                      </button>
                      <button
                        onClick={() => handleAccessOption('Cooperativa')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Cooperativa
                      </button>
                      
                      {/* Separador */}
                      <div className="border-t border-gray-600 my-1"></div>
                      
                      {/* Botón de cerrar sesión */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200 text-red-400"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título y navegación */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mr-4"
              style={{ color: '#0f324b' }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Panel de Administración
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Administrar Artesanos
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Gestiona la información de artesanos registrados en el sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2 flex justify-between items-start" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error al cargar artesanos</span>
              </div>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null)
                fetchArtesanos()
              }}
              className="ml-4 px-3 py-1 text-sm rounded-md border border-red-300 hover:bg-red-50 transition-colors duration-200"
              style={{ color: '#dc2626' }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Barra de búsqueda y acciones */}
        <div className="mb-8 p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <h2 className="text-2xl font-bold font-maria-david" style={{ color: '#ecd2b4' }}>
              Lista de Artesanos ({filteredArtesanos.length})
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Buscar por nombre o DNI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
              />
              <button
                onClick={() => router.push('/admin/artesanos/new')}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                Nuevo Artesano
              </button>
            </div>
          </div>
        </div>

        {/* Lista de artesanos */}
        {loadingArtesanos ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
              <p style={{ color: '#0f324b' }}>Cargando artesanos...</p>
            </div>
          </div>
        ) : filteredArtesanos.length === 0 ? (
          <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
              {searchTerm ? 'No se encontraron artesanos' : 'No hay artesanos registrados'}
            </h3>
            <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los artesanos aparecerán aquí cuando se registren'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArtesanos.map((artesano) => (
              <div 
                key={artesano.id} 
                className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#0f324b' }}
                onClick={() => {
                    router.push(`/admin/artesanos/${artesano.id}`)
                  }}
              >
                {/* Fotografía */}
                <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                  {artesano.fotografia_url ? (
                    <img
                      src={artesano.fotografia_url}
                      alt={`${artesano.nombres} ${artesano.apellidos}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center" style={{ color: '#ecd2b4' }}>
                      <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm opacity-60">Sin fotografía</p>
                    </div>
                  )}
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                    {artesano.nombres} {artesano.apellidos}
                  </h3>
                  
                  <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                    <p><span className="font-medium">DNI:</span> {artesano.dni}</p>
                    <p><span className="font-medium">Edad:</span> {calculateAge(artesano.fecha_nacimiento)} años</p>
                    {artesano.cooperativa && (
                      <p><span className="font-medium">Cooperativa:</span> {artesano.cooperativa.nombre}</p>
                    )}
                    <p><span className="font-medium">Contacto:</span> {artesano.contacto || 'No especificado'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para cargar más artesanos */}
        {!loadingArtesanos && filteredArtesanos.length > 0 && hasMoreData && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMoreArtesanos}
              disabled={loadingMore}
              className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: loadingMore ? '#6b7280' : '#0f324b',
                color: '#ecd2b4',
                border: '2px solid #ecd2b4'
              }}
            >
              {loadingMore ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Cargando más...</span>
                </div>
              ) : (
                `Cargar más artesanos (${artesanos.length} de muchos)`
              )}
            </button>
          </div>
        )}

        {/* Información de paginación */}
        {!loadingArtesanos && filteredArtesanos.length > 0 && (
          <div className="mt-4 text-center text-sm" style={{ color: '#0f324b', opacity: 0.7 }}>
            Mostrando {filteredArtesanos.length} artesanos
            {hasMoreData && ' (hay más disponibles)'}
          </div>
        )}

        {/* Modal de detalles - ELIMINADO - Ahora se navega a una página separada */}
      </main>
    </div>
  )
}