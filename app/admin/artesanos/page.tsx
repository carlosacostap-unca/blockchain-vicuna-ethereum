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

  const fetchArtesanos = async () => {
    try {
      setLoadingArtesanos(true)
      const { data, error } = await supabase
        .from('artesanos')
        .select(`
          *,
          cooperativa:cooperativas(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtesanos(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los artesanos')
    } finally {
      setLoadingArtesanos(false)
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
          <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
            {error}
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
              <button
                onClick={fetchArtesanos}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                Actualizar
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

        {/* Modal de detalles - ELIMINADO - Ahora se navega a una página separada */}
      </main>
    </div>
  )
}