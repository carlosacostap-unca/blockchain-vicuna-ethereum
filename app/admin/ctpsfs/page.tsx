'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type CTPSFS } from '@/lib/supabase'

export default function AdminCTPSFSPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  
  // Estados
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [ctpsfs, setCTPSFS] = useState<CTPSFS[]>([])
  const [loadingCTPSFS, setLoadingCTPSFS] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Cargar datos cuando el usuario esté autenticado
  useEffect(() => {
    if (user && profile) {
      fetchCTPSFS()
    }
  }, [user, profile])

  // Función para obtener CTPSFS
  const fetchCTPSFS = async () => {
    try {
      setLoadingCTPSFS(true)
      setError(null)
      const { data, error } = await supabase
        .from('ctpsfs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCTPSFS(data || [])
    } catch (error: any) {
      const message = error?.message || 'Error al cargar certificados C.T.P.S.F.S.'
      setError(message)
      try {
        console.error('Error fetching CTPSFS:', JSON.parse(JSON.stringify(error)))
      } catch {
        console.error('Error fetching CTPSFS:', error)
      }
    } finally {
      setLoadingCTPSFS(false)
    }
  }

  // Función para eliminar CTPSFS
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este certificado CTPSFS?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('ctpsfs')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Actualizar la lista local
      setCTPSFS(prev => prev.filter(ctpsfs => ctpsfs.id !== id))
    } catch (error) {
      console.error('Error deleting CTPSFS:', error)
      alert('Error al eliminar el certificado CTPSFS')
    }
  }

  // Función para formatear fechas
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para alternar el menú
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  // Función para navegar
  const handleNavigation = (path: string) => {
    router.push(path)
    setIsMenuOpen(false)
  }

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

  // Filtrar CTPSFS
  const filteredCTPSFS = ctpsfs.filter(ctpsfs =>
    ctpsfs.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ctpsfs.descripcion_producto?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ctpsfs.documentacion_origen?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
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
            Certificados de Transformación de Productos y Subproductos de Fauna Silvestre
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Gestiona los certificados C.T.P.S.F.S. del sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2 flex justify-between items-start" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Error al cargar certificados C.T.P.S.F.S.</span>
              </div>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={() => {
                setError(null)
                fetchCTPSFS()
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
              Lista de Certificados C.T.P.S.F.S. ({filteredCTPSFS.length})
            </h2>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder="Buscar por número de certificado, descripción o documentación..."
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
                onClick={() => router.push('/admin/ctpsfs/nuevo')}
                className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                Nuevo C.T.P.S.F.S.
              </button>
            </div>
          </div>
        </div>

        {/* Lista de certificados */}
        {loadingCTPSFS ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0f324b' }}></div>
          </div>
        ) : filteredCTPSFS.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg">
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#6b7280' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium mb-2" style={{ color: '#374151' }}>
                No se encontraron certificados C.T.P.S.F.S.
              </h3>
              <p className="text-sm" style={{ color: '#6b7280' }}>
                {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Aún no hay certificados registrados'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCTPSFS.map((ctpsfs) => (
              <div
                key={ctpsfs.id}
                className="rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer p-6"
                style={{ backgroundColor: '#0f324b' }}
                onClick={() => router.push(`/admin/ctpsfs/${ctpsfs.id}`)}
              >
                {/* Icono del certificado */}
                <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                  <div className="text-center" style={{ color: '#ecd2b4' }}>
                    <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                      <path d="M8,12V14H16V12H8M8,16V18H13V16H8Z"/>
                    </svg>
                    <p className="text-lg opacity-60">Certificado</p>
                  </div>
                </div>

                {/* Información del certificado */}
                 <div className="mt-4">
                   <h3 className="text-xl font-bold mb-2" style={{ color: '#ecd2b4' }}>
                     #{ctpsfs.numero}
                   </h3>
                   <div className="space-y-2 text-sm" style={{ color: '#ecd2b4' }}>
                     <p><span className="opacity-60">Producto:</span> {ctpsfs.descripcion_producto}</p>
                     <p><span className="opacity-60">Año:</span> {ctpsfs.ano}</p>
                   </div>
                   
                   {/* Badge de transformación */}
                   <div className="mt-4">
                     <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                       Transformación
                     </span>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
