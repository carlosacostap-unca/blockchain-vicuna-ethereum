'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type COLTWithRelations } from '@/lib/supabase'

export default function COLTDetailPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const coltId = params.id as string

  const [colt, setColt] = useState<COLTWithRelations | null>(null)
  const [loadingColt, setLoadingColt] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fetchColt = async () => {
    try {
      setLoadingColt(true)
      setError(null)

      const { data, error } = await supabase
        .from('colt')
        .select(`
          *,
          artesano:artesanos!artesano_id(*),
          chaku:chakus!chaku_id(*)
        `)
        .eq('id', coltId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Certificado C.O.L.T. no encontrado')
        } else {
          throw error
        }
        return
      }

      setColt(data)
    } catch (error) {
      console.error('Error fetching COLT:', error)
      setError('Error al cargar los datos del certificado C.O.L.T.')
    } finally {
      setLoadingColt(false)
    }
  }

  useEffect(() => {
    if (coltId) {
      fetchColt()
    }
  }, [coltId])

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
    if (!colt || !confirm(`¿Está seguro de que desea eliminar el certificado C.O.L.T. N° ${colt.numero}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('colt')
        .delete()
        .eq('id', colt.id)

      if (error) throw error

      alert('Certificado C.O.L.T. eliminado exitosamente')
      router.push('/admin/colt')
    } catch (error) {
      console.error('Error deleting COLT:', error)
      alert('Error al eliminar el certificado C.O.L.T.')
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
            onClick={() => router.push('/admin/colt')}
            className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Certificados de Origen y Legítima Tenencia
          </button>
        </div>

        {/* Contenido principal */}
        {loadingColt ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
              <p style={{ color: '#0f324b' }}>Cargando detalles del certificado C.O.L.T....</p>
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
              onClick={() => router.push('/admin/colt')}
              className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
            >
              Volver al listado
            </button>
          </div>
        ) : colt ? (
          <div className="space-y-8">
            {/* Título */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
                Certificado C.O.L.T. N° {colt.numero}
              </h1>
              <p className="text-lg" style={{ color: '#0f324b', opacity: 0.8 }}>
                Certificado de Origen y Legítima Tenencia
              </p>
            </div>

            {/* Tarjeta principal */}
            <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#0f324b' }}>
              {/* Icono grande */}
              <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                <div className="text-center" style={{ color: '#ecd2b4' }}>
                  <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                    <path d="M8,12V14H16V12H8M8,16V18H13V16H8Z"/>
                  </svg>
                  <p className="text-lg opacity-60">Certificado C.O.L.T.</p>
                </div>
              </div>

              {/* Información detallada */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Número de Certificado</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.numero}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Artesano</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.artesano ? `${colt.artesano.apellidos}, ${colt.artesano.nombres}` : 'No asignado'}
                      {colt.artesano?.dni && (
                        <div className="text-sm opacity-80 mt-1">DNI: {colt.artesano.dni}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Descripción</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.descripcion}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Cantidad</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.cantidad} {colt.unidad}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Lugar de Procedencia</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.lugar_procedencia}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Destino</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        colt.destino === 'Transformación' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {colt.destino}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Año</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.ano}
                    </div>
                  </div>

                  {colt.chaku && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Chaku</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {colt.chaku.nombre}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Fecha de Expedición</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {formatDate(colt.fecha_expedicion)}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Documentación de Origen</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {colt.documentacion_origen}
                    </div>
                  </div>

                  {colt.created_at && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Fecha de Registro</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {formatDate(colt.created_at)}
                      </div>
                    </div>
                  )}

                  {colt.updated_at && colt.updated_at !== colt.created_at && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Última Actualización</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {formatDate(colt.updated_at)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push(`/admin/colt/${colt.id}/edit`)}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    Editar Certificado C.O.L.T.
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Eliminar Certificado C.O.L.T.
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
