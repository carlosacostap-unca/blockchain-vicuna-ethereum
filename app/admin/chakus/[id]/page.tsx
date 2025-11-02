'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type Chaku } from '@/lib/supabase'

export default function ChakuDetailPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const chakuId = params.id as string

  const [chaku, setChaku] = useState<Chaku | null>(null)
  const [loadingChaku, setLoadingChaku] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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

  const fetchChaku = async () => {
    try {
      setLoadingChaku(true)
      setError(null)

      const { data, error } = await supabase
        .from('chakus')
        .select('*')
        .eq('id', chakuId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Chaku no encontrado')
        } else {
          throw error
        }
        return
      }

      setChaku(data)
    } catch (error) {
      console.error('Error fetching chaku:', error)
      setError('Error al cargar los datos del chaku')
    } finally {
      setLoadingChaku(false)
    }
  }

  useEffect(() => {
    if (chakuId) {
      fetchChaku()
    }
  }, [chakuId])

  const handleDelete = async () => {
    if (!chaku || !confirm(`¿Está seguro de que desea eliminar el chaku "${chaku.nombre}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('chakus')
        .delete()
        .eq('id', chaku.id)

      if (error) throw error

      alert('Chaku eliminado exitosamente')
      router.push('/admin/chakus')
    } catch (error) {
      console.error('Error deleting chaku:', error)
      alert('Error al eliminar el chaku')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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

  if (loadingChaku) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
          <p style={{ color: '#0f324b' }}>Cargando datos del chaku...</p>
        </div>
      </div>
    )
  }

  if (error || !chaku) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
        <div className="text-center">
          <div className="text-6xl mb-4" style={{ color: '#dc2626' }}>⚠️</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0f324b' }}>
            {error || 'Chaku no encontrado'}
          </h1>
          <button
            onClick={() => router.push('/admin/chakus')}
            className="mt-4 px-6 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
          >
            Volver a la lista de chakus
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
      {/* Header - Igual al de la página de lista */}
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
                  onClick={() => router.push('/galeria')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  ENLACES
                </button>
              </div>
            </nav>

            {/* Menú de usuario */}
            <div className="flex items-center space-x-4">
              <span className="text-sm" style={{ color: '#ecd2b4' }}>
                {user?.email}
              </span>
              
              {/* Menú desplegable */}
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  style={{ color: '#ecd2b4' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isMenuOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50" style={{ backgroundColor: '#0f324b' }}>
                    <div className="py-1">
                      {/* Opciones de acceso */}
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

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/chakus')}
            className="flex items-center text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles del Chaku
          </button>
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-maria-david" style={{ color: '#0f324b' }}>
            DETALLES DEL CHAKU
          </h1>
          <p className="mt-2 text-lg" style={{ color: '#0f324b' }}>
            Información de {chaku?.nombre}
          </p>
        </div>

        {/* Contenido del formulario */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
          {/* Icono del chaku */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#ecd2b4' }}>
              Representación del Chaku
            </h3>
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-600 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                <div className="text-center" style={{ color: '#ecd2b4' }}>
                  <svg className="w-20 h-20 mx-auto mb-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10,9 9,9 8,9"/>
                  </svg>
                  <p className="text-sm font-medium">Chaku Tradicional</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del chaku */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Nombre del Chaku
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {chaku?.nombre || 'No especificado'}
              </p>
            </div>

            {/* ID del Sistema */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                ID del Sistema
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg font-mono">
                {chaku?.id || 'No especificado'}
              </p>
            </div>

            {/* Fecha de Registro */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Fecha de Registro
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {chaku?.created_at ? formatDate(chaku.created_at) : 'No especificado'}
              </p>
            </div>

            {/* Última Actualización */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Última Actualización
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {chaku?.updated_at ? formatDate(chaku.updated_at) : formatDate(chaku?.created_at || '')}
              </p>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => router.push('/admin/chakus')}
              className="px-6 py-3 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
              style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
            >
              Volver a la Lista
            </button>
            <button
              onClick={() => router.push(`/admin/chakus/${chakuId}/edit`)}
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
            >
              Editar Chaku
            </button>
            <button
              onClick={handleDelete}
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 bg-red-600 text-white"
            >
              Eliminar
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}