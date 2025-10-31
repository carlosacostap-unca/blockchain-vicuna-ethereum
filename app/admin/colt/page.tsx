'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type COLT } from '@/lib/supabase'

export default function AdminCOLTPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [colts, setCOLTs] = useState<COLT[]>([])
  const [loadingCOLTs, setLoadingCOLTs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCOLT, setSelectedCOLT] = useState<COLT | null>(null)
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

  const fetchCOLTs = async () => {
    try {
      setLoadingCOLTs(true)
      const { data, error } = await supabase
        .from('colt')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCOLTs(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los C.O.L.T.')
    } finally {
      setLoadingCOLTs(false)
    }
  }

  useEffect(() => {
    fetchCOLTs()
  }, [])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este certificado COLT?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('colt')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Actualizar la lista local
      setCOLTs(prev => prev.filter(colt => colt.id !== id))
      
      // Cerrar el modal si el COLT eliminado estaba seleccionado
      setSelectedCOLT(null)
      setShowDetails(false)
    } catch (error) {
      console.error('Error deleting COLT:', error)
      alert('Error al eliminar el certificado COLT')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredCOLTs = colts.filter(colt =>
    colt.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colt.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colt.materia_prima?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    colt.documentacion_origen?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold" style={{ color: '#ecd2b4' }}>
                RUTA DEL TELAR
              </h1>
            </div>

            {/* Navegación central */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: '#ecd2b4' }}>
                INICIO
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: '#ecd2b4' }}>
                CATÁLOGO
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: '#ecd2b4' }}>
                PRODUCTOS
              </a>
              <a href="#" className="px-3 py-2 text-sm font-medium hover:opacity-80" style={{ color: '#ecd2b4' }}>
                ENLACES
              </a>
            </nav>

            {/* Barra de búsqueda y menú de usuario */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  className="px-4 py-2 rounded-full text-sm w-64 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                />
              </div>

              {/* Menú de usuario */}
              <div className="relative">
                <button
                  className="flex items-center space-x-1 p-2 rounded-md hover:bg-opacity-80"
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

                      {/* Opciones de acceso */}
                      <div className="py-2">
                        <p className="px-4 py-2 text-xs font-semibold uppercase tracking-wide opacity-60" style={{ color: '#ecd2b4' }}>
                          Acceder como
                        </p>
                        {['Administrador', 'Artesano', 'Cooperativa'].map((option) => (
                          <button
                            key={option}
                            onClick={() => handleAccessOption(option)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-80 hover:bg-gray-700"
                            style={{ color: '#ecd2b4' }}
                          >
                            {option}
                          </button>
                        ))}
                      </div>

                      {/* Cerrar sesión */}
                      <div className="border-t border-gray-600 py-2">
                        <button
                          onClick={signOut}
                          className="block w-full text-left px-4 py-2 text-sm hover:bg-opacity-80 hover:bg-gray-700"
                          style={{ color: '#ecd2b4' }}
                        >
                          Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título y navegación */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 text-sm mb-4">
            <button 
              onClick={() => router.push('/admin')}
              className="hover:underline"
              style={{ color: '#0f324b' }}
            >
              Panel de Administración
            </button>
            <span style={{ color: '#0f324b' }}>›</span>
            <span className="font-medium" style={{ color: '#0f324b' }}>
              Administrar C.O.L.T.
            </span>
          </div>
          
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#0f324b' }}>
            Certificados de Origen y Legítima Tenencia
          </h1>
          <p className="text-lg opacity-80" style={{ color: '#0f324b' }}>
            Gestiona los certificados C.O.L.T. del sistema
          </p>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Buscar por número de certificado, artesano o cooperativa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              style={{ backgroundColor: 'white', color: '#0f324b' }}
            />
          </div>
        </div>

        {/* Contenido de la lista */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {loadingCOLTs ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <span className="ml-3" style={{ color: '#0f324b' }}>Cargando certificados C.O.L.T...</span>
          </div>
        ) : filteredCOLTs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: '#0f324b' }}>
              No se encontraron certificados C.O.L.T.
            </h3>
            <p className="opacity-60" style={{ color: '#0f324b' }}>
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay certificados registrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCOLTs.map((colt) => (
              <div
                key={colt.id}
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer p-6"
                style={{ backgroundColor: '#0f324b' }}
                onClick={() => {
                  setSelectedCOLT(colt)
                  setShowDetails(true)
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">📋</div>
                    <div>
                      <h3 className="font-semibold text-lg" style={{ color: '#ecd2b4' }}>
                        {colt.numero || 'Sin número'}
                      </h3>
                      <p className="text-sm opacity-60" style={{ color: '#ecd2b4' }}>
                        Certificado C.O.L.T.
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    colt.destino === 'Transformación' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {colt.destino}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: '#ecd2b4' }}>Descripción:</span>
                    <span className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                      {colt.descripcion || 'No especificada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: '#ecd2b4' }}>Materia Prima:</span>
                    <span className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                      {colt.materia_prima || 'No especificada'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: '#ecd2b4' }}>Cantidad:</span>
                    <span className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                      {colt.cantidad} {colt.unidad}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm opacity-60" style={{ color: '#ecd2b4' }}>Fecha:</span>
                    <span className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                      {colt.created_at ? formatDate(colt.created_at) : 'No disponible'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de detalles */}
      {showDetails && selectedCOLT && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div 
            className="rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ backgroundColor: '#0f324b' }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold" style={{ color: '#ecd2b4' }}>
                  Detalles del Certificado C.O.L.T.
                </h2>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-2xl hover:opacity-70"
                  style={{ color: '#ecd2b4' }}
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Número de Certificado:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.numero || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Descripción:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.descripcion || 'No especificada'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Materia Prima:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.materia_prima || 'No especificada'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Cantidad:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.cantidad} {selectedCOLT.unidad}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Destino:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.destino || 'No especificado'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Documentación de Origen:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.documentacion_origen || 'No especificada'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Fecha de Registro:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.created_at ? formatDate(selectedCOLT.created_at) : 'No disponible'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    Última Actualización:
                  </label>
                  <p className="text-lg" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.updated_at ? formatDate(selectedCOLT.updated_at) : 'No disponible'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                    ID del Sistema:
                  </label>
                  <p className="text-lg font-mono" style={{ color: '#ecd2b4' }}>
                    {selectedCOLT.id}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-600">
                <button
                  onClick={() => setShowDetails(false)}
                  className="px-6 py-2 rounded-lg border hover:opacity-80"
                  style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => selectedCOLT?.id && handleDelete(selectedCOLT.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}