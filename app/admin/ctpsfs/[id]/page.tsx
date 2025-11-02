'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

interface CTPSFSWithRelations {
  id: string
  numero: string
  descripcion_producto: string
  chaku_id: string
  ano: number
  documentacion_origen: string
  fecha_expedicion: string
  created_at: string
  updated_at: string
  chakus?: {
    id: string
    nombre: string
  }
  ctpsfs_procesos_transformacion?: Array<{
    id: string
    descripcion_producto: string
    cantidad: number
    unidad: string
    documentacion_tenencia: string
    fecha_certificacion: string
    artesano_id: string
    artesanos?: {
      id: string
      nombres: string
      apellidos: string
      dni: string
    }
  }>
}

export default function CTPSFSDetailPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const ctpsfsId = params.id as string

  const [ctpsfs, setCTPSFS] = useState<CTPSFSWithRelations | null>(null)
  const [loadingCTPSFS, setLoadingCTPSFS] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fetchCTPSFS = async () => {
    try {
      setLoadingCTPSFS(true)
      setError(null)

      const { data, error } = await supabase
        .from('ctpsfs')
        .select(`
          *,
          chakus!chaku_id(*),
          ctpsfs_procesos_transformacion(
            *,
            artesanos!artesano_id(*)
          )
        `)
        .eq('id', ctpsfsId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Certificado C.T.P.S.F.S. no encontrado')
        } else {
          throw error
        }
        return
      }

      setCTPSFS(data)
    } catch (error) {
      console.error('Error fetching CTPSFS:', error)
      setError('Error al cargar los datos del certificado C.T.P.S.F.S.')
    } finally {
      setLoadingCTPSFS(false)
    }
  }

  useEffect(() => {
    if (ctpsfsId) {
      fetchCTPSFS()
    }
  }, [ctpsfsId])

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
    if (!ctpsfs || !confirm(`¿Está seguro de que desea eliminar el certificado C.T.P.S.F.S. N° ${ctpsfs.numero}?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('ctpsfs')
        .delete()
        .eq('id', ctpsfs.id)

      if (error) throw error

      alert('Certificado C.T.P.S.F.S. eliminado exitosamente')
      router.push('/admin/ctpsfs')
    } catch (error) {
      console.error('Error deleting CTPSFS:', error)
      alert('Error al eliminar el certificado C.T.P.S.F.S.')
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
            onClick={() => router.push('/admin/ctpsfs')}
            className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Certificados de Transformación de Productos y Subproductos de Fauna Silvestre
          </button>
        </div>

        {/* Contenido principal */}
        {loadingCTPSFS ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
              <p style={{ color: '#0f324b' }}>Cargando detalles del certificado C.T.P.S.F.S....</p>
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
              onClick={() => router.push('/admin/ctpsfs')}
              className="mt-4 px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
            >
              Volver al listado
            </button>
          </div>
        ) : ctpsfs ? (
          <div className="space-y-8">
            {/* Título */}
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
                Certificado C.T.P.S.F.S. N° {ctpsfs.numero}
              </h1>
              <p className="text-lg" style={{ color: '#0f324b', opacity: 0.8 }}>
                Certificado de Transformación de Productos y Subproductos de Fauna Silvestre
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
                  <p className="text-lg opacity-60">Certificado C.T.P.S.F.S.</p>
                </div>
              </div>

              {/* Información detallada */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Número de Certificado</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {ctpsfs.numero}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Descripción del Producto</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {ctpsfs.descripcion_producto}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Año</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {ctpsfs.ano}
                    </div>
                  </div>

                  {ctpsfs.chakus && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Chaku</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {ctpsfs.chakus.nombre}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Fecha de Expedición</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {formatDate(ctpsfs.fecha_expedicion)}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Tipo de Certificado</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        Transformación
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Documentación de Origen</label>
                    <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                      {ctpsfs.documentacion_origen}
                    </div>
                  </div>

                  {ctpsfs.created_at && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Fecha de Registro</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {formatDate(ctpsfs.created_at)}
                      </div>
                    </div>
                  )}

                  {ctpsfs.updated_at && ctpsfs.updated_at !== ctpsfs.created_at && (
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>Última Actualización</label>
                      <div className="px-4 py-3 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}>
                        {formatDate(ctpsfs.updated_at)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Procesos de Transformación */}
                {ctpsfs.ctpsfs_procesos_transformacion && ctpsfs.ctpsfs_procesos_transformacion.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#ecd2b4' }}>
                      Procesos de Transformación
                    </h3>
                    <div className="space-y-4">
                      {ctpsfs.ctpsfs_procesos_transformacion.map((proceso, index) => (
                        <div key={proceso.id} className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.05)' }}>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Producto Transformado</label>
                              <p className="text-sm" style={{ color: '#ecd2b4', opacity: 0.9 }}>{proceso.descripcion_producto}</p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Cantidad</label>
                              <p className="text-sm" style={{ color: '#ecd2b4', opacity: 0.9 }}>{proceso.cantidad} {proceso.unidad}</p>
                            </div>
                            {proceso.artesanos && (
                              <div>
                                <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Artesano</label>
                                <p className="text-sm" style={{ color: '#ecd2b4', opacity: 0.9 }}>
                                  {proceso.artesanos.apellidos}, {proceso.artesanos.nombres}
                                  {proceso.artesanos.dni && (
                                    <span className="block text-xs opacity-70">DNI: {proceso.artesanos.dni}</span>
                                  )}
                                </p>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Fecha de Certificación</label>
                              <p className="text-sm" style={{ color: '#ecd2b4', opacity: 0.9 }}>{formatDate(proceso.fecha_certificacion)}</p>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>Documentación de Tenencia</label>
                              <p className="text-sm" style={{ color: '#ecd2b4', opacity: 0.9 }}>{proceso.documentacion_tenencia}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={() => router.push(`/admin/ctpsfs/${ctpsfs.id}/edit`)}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    Editar Certificado C.T.P.S.F.S.
                  </button>
                  
                  <button
                    onClick={handleDelete}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Eliminar Certificado C.T.P.S.F.S.
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