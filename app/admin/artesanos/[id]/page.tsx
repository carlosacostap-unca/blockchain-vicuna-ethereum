'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type ArtesanoWithRelations } from '@/lib/supabase'

export default function ArtesanoDetailPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const artesanoId = params.id as string

  const [artesano, setArtesano] = useState<ArtesanoWithRelations | null>(null)
  const [loadingArtesano, setLoadingArtesano] = useState(true)
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

  const fetchArtesano = async () => {
    try {
      setLoadingArtesano(true)
      setError(null)

      const { data, error } = await supabase
        .from('artesanos')
        .select(`
          *,
          cooperativa:cooperativas(*)
        `)
        .eq('id', artesanoId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Artesano no encontrado')
        } else {
          throw error
        }
        return
      }

      setArtesano(data)
    } catch (error) {
      console.error('Error fetching artesano:', error)
      setError('Error al cargar los datos del artesano')
    } finally {
      setLoadingArtesano(false)
    }
  }

  useEffect(() => {
    if (artesanoId) {
      fetchArtesano()
    }
  }, [artesanoId])

  const handleDelete = async () => {
    if (!artesano || !confirm(`¿Está seguro de que desea eliminar al artesano "${artesano.nombres} ${artesano.apellidos}"?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('artesanos')
        .delete()
        .eq('id', artesano.id)

      if (error) throw error

      alert('Artesano eliminado exitosamente')
      router.push('/admin/artesanos')
    } catch (error) {
      console.error('Error deleting artesano:', error)
      alert('Error al eliminar el artesano')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
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



  if (loadingArtesano) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
          <p style={{ color: '#0f324b' }}>Cargando datos del artesano...</p>
        </div>
      </div>
    )
  }

  if (error || !artesano) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
        <div className="text-center">
          <div className="text-6xl mb-4" style={{ color: '#dc2626' }}>⚠️</div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#0f324b' }}>
            {error || 'Artesano no encontrado'}
          </h1>
          <button
            onClick={() => router.push('/admin/artesanos')}
            className="mt-4 px-6 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
          >
            Volver a la lista de artesanos
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

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/artesanos')}
            className="flex items-center text-sm font-medium transition-colors duration-200 hover:opacity-80"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles del Artesano
          </button>
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-maria-david" style={{ color: '#0f324b' }}>
            DETALLES DEL ARTESANO
          </h1>
          <p className="mt-2 text-lg" style={{ color: '#0f324b' }}>
            Información de {artesano?.nombres} {artesano?.apellidos}
          </p>
        </div>

        {/* Contenido del formulario */}
        <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
          {/* Fotografía del artesano */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#ecd2b4' }}>
              Fotografía del Artesano
            </h3>
            <div className="flex justify-center">
              {/* Vista previa de la imagen */}
              <div className="w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-600">
                {artesano?.fotografia_url ? (
                  <img
                    src={artesano.fotografia_url}
                    alt={`Fotografía de ${artesano.nombres} ${artesano.apellidos}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información del artesano */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombres */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Nombres
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {artesano?.nombres || 'No especificado'}
              </p>
            </div>

            {/* Apellidos */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Apellidos
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {artesano?.apellidos || 'No especificado'}
              </p>
            </div>

            {/* DNI */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                DNI
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {artesano?.dni || 'No especificado'}
              </p>
            </div>

            {/* Fecha de nacimiento */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Fecha de Nacimiento
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {artesano?.fecha_nacimiento ? formatDate(artesano.fecha_nacimiento) : 'No especificado'}
                {artesano?.fecha_nacimiento && (
                  <span className="text-gray-400 ml-2">
                    ({calculateAge(artesano.fecha_nacimiento)} años)
                  </span>
                )}
              </p>
            </div>

            {/* Contacto */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Contacto
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {artesano?.contacto || 'No especificado'}
              </p>
            </div>

            {/* Cooperativa */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Cooperativa
              </label>
              <p className="text-white bg-gray-700 px-3 py-2 rounded-lg">
                {artesano?.cooperativa?.nombre || 'Sin cooperativa asignada'}
              </p>
            </div>
          </div>

          {/* Domicilio */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
              Domicilio
            </label>
            <p className="text-white bg-gray-700 px-3 py-2 rounded-lg min-h-[80px]">
              {artesano?.domicilio || 'No especificado'}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              onClick={() => router.push('/admin/artesanos')}
              className="px-6 py-3 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
              style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
            >
              Volver a la Lista
            </button>
            <button
              onClick={() => router.push(`/admin/artesanos/${artesanoId}/edit`)}
              className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
            >
              Editar Artesano
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