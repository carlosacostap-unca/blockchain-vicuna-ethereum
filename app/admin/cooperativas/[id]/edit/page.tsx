'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type Cooperativa } from '@/lib/supabase'

export default function EditCooperativaPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const cooperativaId = params.id as string

  const [cooperativa, setCooperativa] = useState<Cooperativa | null>(null)
  const [loadingCooperativa, setLoadingCooperativa] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    comunidad: ''
  })

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
      setFormData({
        nombre: data.nombre || '',
        comunidad: data.comunidad || ''
      })
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('cooperativas')
        .update({
          nombre: formData.nombre,
          comunidad: formData.comunidad
        })
        .eq('id', cooperativaId)

      if (error) throw error

      router.push(`/admin/cooperativas/${cooperativaId}`)
    } catch (error) {
      console.error('Error updating cooperativa:', error)
      setError('Error al actualizar la cooperativa')
    } finally {
      setSaving(false)
    }
  }

  if (loadingCooperativa) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de la cooperativa...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button
            onClick={() => router.push('/admin/cooperativas')}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
          >
            Volver a Cooperativas
          </button>
        </div>
      </div>
    )
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
                          {profile?.full_name || user?.email}
                        </p>
                        <p className="text-xs opacity-60 capitalize" style={{ color: '#ecd2b4' }}>
                          {profile?.role?.name}
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
            onClick={() => router.push(`/admin/cooperativas/${cooperativaId}`)}
            className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles de Cooperativa
          </button>
        </div>

        {/* Contenido principal */}
        <div className="space-y-8">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
              EDITAR COOPERATIVA
            </h1>
            <p className="text-lg" style={{ color: '#0f324b', opacity: 0.8 }}>
              Modifica los datos de la cooperativa
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
                <p className="text-lg opacity-60">Editar Cooperativa</p>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nombre */}
                  <div>
                    <label htmlFor="nombre" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                      Nombre de la Cooperativa *
                    </label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                        color: '#ecd2b4',
                        border: '1px solid rgba(236, 210, 180, 0.3)',
                        focusRingColor: '#ecd2b4'
                      }}
                      placeholder="Ingrese el nombre de la cooperativa"
                    />
                  </div>

                  {/* Comunidad */}
                  <div>
                    <label htmlFor="comunidad" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                      Comunidad *
                    </label>
                    <input
                      type="text"
                      id="comunidad"
                      name="comunidad"
                      value={formData.comunidad}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                      style={{ 
                        backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                        color: '#ecd2b4',
                        border: '1px solid rgba(236, 210, 180, 0.3)',
                        focusRingColor: '#ecd2b4'
                      }}
                      placeholder="Ingrese la comunidad"
                    />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/cooperativas/${cooperativaId}`)}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: 'rgba(236, 210, 180, 0.2)', color: '#ecd2b4', border: '1px solid rgba(236, 210, 180, 0.3)' }}
                  >
                    Cancelar
                  </button>
                  
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}