'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type Cooperativa } from '@/lib/supabase'

export default function CooperativaDetailPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const cooperativaId = params.id as string

  const [cooperativa, setCooperativa] = useState<Cooperativa | null>(null)
  const [loadingCooperativa, setLoadingCooperativa] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fetchCooperativa = async () => {
    try {
      setLoadingCooperativa(true)
      setError(null)

      const { data, error } = await supabase
        .from('cooperativas')
        .select('*')
        .eq('id', cooperativaId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Cooperativa no encontrada')
        } else {
          throw error
        }
        return
      }

      setCooperativa(data)
    } catch (error) {
      console.error('Error fetching cooperativa:', error)
      setError('Error al cargar los datos de la cooperativa')
    } finally {
      setLoadingCooperativa(false)
    }
  }

  useEffect(() => {
    if (cooperativaId) {
      fetchCooperativa()
    }
  }, [cooperativaId])

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

  const handleDelete = async () => {
    if (!cooperativa || !confirm(`¿Está seguro de que desea eliminar la cooperativa "${cooperativa.nombre}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('cooperativas')
        .delete()
        .eq('id', cooperativa.id)

      if (error) throw error

      alert('Cooperativa eliminada exitosamente')
      router.push('/admin/cooperativas')
    } catch (error) {
      console.error('Error deleting cooperativa:', error)
      alert('Error al eliminar la cooperativa')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de regreso */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/cooperativas')}
            className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Administrar Cooperativas
          </button>
        </div>

        {/* Contenido principal */}
        {loadingCooperativa ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
              <p style={{ color: '#0f324b' }}>Cargando detalles de la cooperativa...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
              Error
            </h3>
            <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
              {error}
            </p>
            <button
              onClick={() => router.push('/admin/cooperativas')}
              className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
            >
              Volver al listado
            </button>
          </div>
        ) : cooperativa ? (
          <div className="space-y-8">
            {/* Título */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
                {cooperativa.nombre}
              </h1>
              <p className="text-lg" style={{ color: '#0f324b', opacity: 0.8 }}>
                Detalles de la cooperativa
              </p>
            </div>

            {/* Tarjeta principal */}
            <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#0f324b' }}>
              {/* Icono grande */}
              <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                <div className="text-center" style={{ color: '#ecd2b4' }}>
                  <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 21V19C3 16.7909 4.79086 15 7 15H17C19.2091 15 21 16.7909 21 19V21H3Z"/>
                    <path d="M5 7H19C20.1046 7 21 7.89543 21 9V13H3V9C3 7.89543 3.89543 7 5 7Z"/>
                    <path d="M9 3H15C16.1046 3 17 3.89543 17 5V7H7V5C7 3.89543 7.89543 3 9 3Z"/>
                  </svg>
                  <p className="text-lg opacity-60">Cooperativa</p>
                </div>
              </div>

              {/* Información detallada */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>ID</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {cooperativa.id}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Nombre de la Cooperativa</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {cooperativa.nombre}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Comunidad</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {cooperativa.comunidad}
                    </div>
                  </div>

                  {cooperativa.created_at && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Fecha de Registro</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {formatDate(cooperativa.created_at)}
                      </div>
                    </div>
                  )}

                  {cooperativa.updated_at && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Última Actualización</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {formatDate(cooperativa.updated_at)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push(`/admin/cooperativas/${cooperativa.id}/edit`)}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    Editar Cooperativa
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Eliminar Cooperativa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}