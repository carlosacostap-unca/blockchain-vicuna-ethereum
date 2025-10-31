'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type Chaku } from '@/lib/supabase'

export default function AdminChakusPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const router = useRouter()
  const [chakus, setChakus] = useState<Chaku[]>([])
  const [loadingChakus, setLoadingChakus] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)
  const [selectedChaku, setSelectedChaku] = useState<Chaku | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    if (!loading && user && profile) {
      fetchChakus()
    }
  }, [user, profile, loading])

  const fetchChakus = async () => {
    try {
      setLoadingChakus(true)
      const { data, error } = await supabase
        .from('chakus')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChakus(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los chakus')
    } finally {
      setLoadingChakus(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este chaku?')) {
      return
    }

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('chakus')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setChakus(prev => prev.filter(chaku => chaku.id !== id))
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el chaku')
    } finally {
      setDeleting(null)
    }
  }

  const handleViewDetails = (chaku: Chaku) => {
    setSelectedChaku(chaku)
    setShowModal(true)
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleAccessOption = (role: string) => {
    setIsMenuOpen(false)
    switch (role) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const filteredChakus = chakus.filter(chaku =>
    chaku.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
                          {profile.nombre || profile.full_name || user.email}
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
            Administrar Chakus
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Gestiona la información y registro de chakus tradicionales en el sistema
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
              Lista de Chakus ({filteredChakus.length})
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Buscar por nombre o descripción..."
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
                onClick={fetchChakus}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de chakus */}
        {loadingChakus ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
              <p style={{ color: '#0f324b' }}>Cargando chakus...</p>
            </div>
          </div>
        ) : filteredChakus.length === 0 ? (
          <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-6xl mb-4">🧶</div>
            <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
              {searchTerm ? 'No se encontraron chakus' : 'No hay chakus registrados'}
            </h3>
            <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los chakus aparecerán aquí cuando se registren'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredChakus.map((chaku) => (
              <div 
                key={chaku.id} 
                className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#0f324b' }}
                onClick={() => handleViewDetails(chaku)}
              >
                {/* Icono de chaku */}
                <div className="h-32 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                  <div className="text-center" style={{ color: '#ecd2b4' }}>
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.9 1 3 1.9 3 3V21C3 22.1 3.9 23 5 23H19C20.1 23 21 22.1 21 21V9H21ZM19 21H5V3H13V9H19V21Z"/>
                    </svg>
                    <p className="text-sm opacity-60">Chaku Tradicional</p>
                  </div>
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                    {chaku.nombre}
                  </h3>
                  
                  <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                    <p><span className="font-medium">Registrado:</span> {chaku.created_at ? new Date(chaku.created_at).toLocaleDateString('es-ES') : 'N/A'}</p>
                    {chaku.updated_at && chaku.updated_at !== chaku.created_at && (
                      <p><span className="font-medium">Actualizado:</span> {new Date(chaku.updated_at).toLocaleDateString('es-ES')}</p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(236, 210, 180, 0.2)', color: '#ecd2b4' }}>
                      ID: {chaku.id}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (chaku.id) handleDelete(chaku.id)
                      }}
                      disabled={deleting === chaku.id}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200 disabled:opacity-50"
                      title="Eliminar chaku"
                    >
                      {deleting === chaku.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-400"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal for Chaku Details */}
      {showModal && selectedChaku && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" style={{ backgroundColor: '#0f324b' }}>
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-maria-david" style={{ color: '#ecd2b4' }}>
                  Detalles del Chaku
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="hover:opacity-80 transition-opacity duration-200 text-2xl"
                  style={{ color: '#ecd2b4' }}
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                    Nombre
                  </label>
                  <p className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                    {selectedChaku.nombre}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                    Fecha de Registro
                  </label>
                  <p className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                    {selectedChaku.created_at ? new Date(selectedChaku.created_at).toLocaleString('es-ES') : 'N/A'}
                  </p>
                </div>
                
                {selectedChaku.updated_at && selectedChaku.updated_at !== selectedChaku.created_at && (
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                      Última Actualización
                    </label>
                    <p className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {new Date(selectedChaku.updated_at).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                    ID del Sistema
                  </label>
                  <p className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                    {selectedChaku.id}
                  </p>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}