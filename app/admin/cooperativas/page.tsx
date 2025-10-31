'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type Cooperativa } from '@/lib/supabase'

export default function AdminCooperativasPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([])
  const [loadingCooperativas, setLoadingCooperativas] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCooperativa, setSelectedCooperativa] = useState<Cooperativa | null>(null)
  const [showDetails, setShowDetails] = useState(false)
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

  const fetchCooperativas = async () => {
    try {
      setLoadingCooperativas(true)
      const { data, error } = await supabase
        .from('cooperativas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCooperativas(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar las cooperativas')
    } finally {
      setLoadingCooperativas(false)
    }
  }

  useEffect(() => {
    fetchCooperativas()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cooperativa?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('cooperativas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Actualizar la lista local
      setCooperativas(prev => prev.filter(cooperativa => cooperativa.id !== id))
      setShowDetails(false)
      setSelectedCooperativa(null)
    } catch (error: any) {
      setError(error.message || 'Error al eliminar la cooperativa')
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

  const filteredCooperativas = cooperativas.filter(cooperativa =>
    cooperativa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cooperativa.comunidad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
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
            Administrar Cooperativas
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Gestiona las cooperativas y sus miembros registrados en el sistema
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
              Lista de Cooperativas ({filteredCooperativas.length})
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Buscar por nombre o comunidad..."
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
                onClick={fetchCooperativas}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Lista de cooperativas */}
        {loadingCooperativas ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
              <p style={{ color: '#0f324b' }}>Cargando cooperativas...</p>
            </div>
          </div>
        ) : filteredCooperativas.length === 0 ? (
          <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-6xl mb-4">🏢</div>
            <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
              {searchTerm ? 'No se encontraron cooperativas' : 'No hay cooperativas registradas'}
            </h3>
            <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Las cooperativas aparecerán aquí cuando se registren'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredCooperativas.map((cooperativa) => (
              <div 
                key={cooperativa.id} 
                className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                style={{ backgroundColor: '#0f324b' }}
                onClick={() => {
                  setSelectedCooperativa(cooperativa)
                  setShowDetails(true)
                }}
              >
                {/* Icono de cooperativa */}
                <div className="h-32 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                  <div className="text-center" style={{ color: '#ecd2b4' }}>
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 21V19C3 16.7909 4.79086 15 7 15H17C19.2091 15 21 16.7909 21 19V21H3Z"/>
                      <path d="M5 7H19C20.1046 7 21 7.89543 21 9V13H3V9C3 7.89543 3.89543 7 5 7Z"/>
                      <path d="M9 3H15C16.1046 3 17 3.89543 17 5V7H7V5C7 3.89543 7.89543 3 9 3Z"/>
                    </svg>
                    <p className="text-sm opacity-60">Cooperativa</p>
                  </div>
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                    {cooperativa.nombre}
                  </h3>
                  
                  <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                    <p><span className="font-medium">Comunidad:</span> {cooperativa.comunidad}</p>
                    {cooperativa.created_at && (
                      <p><span className="font-medium">Registrada:</span> {formatDate(cooperativa.created_at)}</p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: 'rgba(236, 210, 180, 0.2)', color: '#ecd2b4' }}>
                      ID: {cooperativa.id}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (cooperativa.id) handleDelete(cooperativa.id)
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      title="Eliminar cooperativa"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de detalles */}
        {showDetails && selectedCooperativa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-lg shadow-xl" style={{ backgroundColor: '#0f324b' }}>
              <div className="p-6">
                {/* Header del modal */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold font-maria-david" style={{ color: '#ecd2b4' }}>
                    Detalles de la Cooperativa
                  </h2>
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedCooperativa(null)
                    }}
                    className="text-gray-400 hover:text-gray-300 transition-colors duration-200"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="grid grid-cols-1 gap-6">
                  {/* Icono grande */}
                  <div className="flex justify-center">
                    <div className="h-32 w-32 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                      <svg className="w-20 h-20" fill="#ecd2b4" viewBox="0 0 24 24">
                        <path d="M3 21V19C3 16.7909 4.79086 15 7 15H17C19.2091 15 21 16.7909 21 19V21H3Z"/>
                        <path d="M5 7H19C20.1046 7 21 7.89543 21 9V13H3V9C3 7.89543 3.89543 7 5 7Z"/>
                        <path d="M9 3H15C16.1046 3 17 3.89543 17 5V7H7V5C7 3.89543 7.89543 3 9 3Z"/>
                      </svg>
                    </div>
                  </div>

                  {/* Información detallada */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>ID</label>
                      <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {selectedCooperativa.id}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Nombre de la Cooperativa</label>
                      <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {selectedCooperativa.nombre}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Comunidad</label>
                      <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {selectedCooperativa.comunidad}
                      </p>
                    </div>

                    {selectedCooperativa.created_at && (
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Fecha de Registro</label>
                        <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                          {formatDate(selectedCooperativa.created_at)}
                        </p>
                      </div>
                    )}

                    {selectedCooperativa.updated_at && (
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Última Actualización</label>
                        <p className="px-3 py-2 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                          {formatDate(selectedCooperativa.updated_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acciones del modal */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowDetails(false)
                      setSelectedCooperativa(null)
                    }}
                    className="px-4 py-2 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
                    style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => selectedCooperativa.id && handleDelete(selectedCooperativa.id)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Eliminar Cooperativa
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}