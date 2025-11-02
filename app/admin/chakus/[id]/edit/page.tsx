'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Chaku } from '@/lib/supabase'

export default function EditChakuPage() {
  const router = useRouter()
  const params = useParams()
  const chakuId = params.id as string

  // Estados
  const [chaku, setChaku] = useState<Chaku | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    fecha_registro: '',
    ultima_actualizacion: ''
  })

  // Cargar datos del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUserProfile(user)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }

    loadUserProfile()
  }, [])

  // Cargar datos del chaku
  useEffect(() => {
    const fetchChaku = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from('chakus')
          .select('*')
          .eq('id', chakuId)
          .single()

        if (error) {
          throw error
        }

        if (data) {
          setChaku(data)
          setFormData({
            nombre: data.nombre || '',
            fecha_registro: data.fecha_registro || '',
            ultima_actualizacion: data.ultima_actualizacion || ''
          })
        }
      } catch (error: any) {
        console.error('Error fetching chaku:', error)
        setError('Error al cargar los datos del chaku')
      } finally {
        setLoading(false)
      }
    }

    if (chakuId) {
      fetchChaku()
    }
  }, [chakuId])

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      setError(null)

      const updateData = {
        nombre: formData.nombre,
        fecha_registro: formData.fecha_registro,
        ultima_actualizacion: new Date().toISOString()
      }

      const { error } = await supabase
        .from('chakus')
        .update(updateData)
        .eq('id', chakuId)

      if (error) {
        throw error
      }

      // Redirigir a la página de detalles
      router.push(`/admin/chakus/${chakuId}`)
    } catch (error: any) {
      console.error('Error updating chaku:', error)
      setError('Error al actualizar el chaku')
    } finally {
      setSaving(false)
    }
  }

  // Manejar navegación
  const handleGoBack = () => {
    router.push('/admin/chakus')
  }

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f324b' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#ecd2b4' }}></div>
          <p style={{ color: '#ecd2b4' }}>Cargando datos del chaku...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0f324b' }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => router.push('/admin/chakus')}
            className="px-4 py-2 rounded-lg"
            style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
          >
            Volver a la Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Header */}
      <header className="border-b" style={{ backgroundColor: '#0f324b', borderColor: 'rgba(236, 210, 180, 0.2)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y navegación */}
            <div className="flex items-center space-x-8">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold" style={{ color: '#ecd2b4' }}>
                  RUTA DEL TELAR
                </h1>
              </div>
              <nav className="hidden md:flex space-x-8">
                <a href="/admin" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#ecd2b4' }}>
                  INICIO
                </a>
                <a href="/admin/artesanos" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#ecd2b4' }}>
                  ARTESANOS
                </a>
                <a href="/admin/chakus" className="text-sm font-medium hover:opacity-80 transition-opacity" style={{ color: '#ecd2b4' }}>
                  CHAKUS
                </a>
              </nav>
            </div>

            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
                style={{ color: '#ecd2b4' }}
              >
                <span className="font-medium">{userProfile?.email || 'Usuario'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50" style={{ backgroundColor: '#0f324b' }}>
                  <button
                    onClick={() => router.push('/admin')}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
                    style={{ color: '#ecd2b4' }}
                  >
                    Panel de Administración
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
                    style={{ color: '#ecd2b4' }}
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>

            {/* Botón de menú móvil */}
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="md:hidden p-2 rounded-lg transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
              style={{ color: '#ecd2b4' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push(`/admin/chakus/${chakuId}`)}
            className="flex items-center transition-colors duration-200 hover:opacity-80"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles del Chaku
          </button>
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-maria-david" style={{ color: '#0f324b' }}>
            EDITAR CHAKU
          </h1>
          <p className="mt-2" style={{ color: '#0f324b' }}>
            Modifica la información de {chaku?.nombre}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Formulario */}
        <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#0f324b' }}>
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nombre del Chaku */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Nombre del Chaku *
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'rgba(236, 210, 180, 0.1)',
                    color: '#ecd2b4',
                    borderColor: 'rgba(236, 210, 180, 0.3)'
                  }}
                />
              </div>

              {/* Fecha de Registro */}
              <div>
                <label htmlFor="fecha_registro" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Fecha de Registro
                </label>
                <input
                  type="date"
                  id="fecha_registro"
                  name="fecha_registro"
                  value={formData.fecha_registro}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'rgba(236, 210, 180, 0.1)',
                    color: '#ecd2b4',
                    borderColor: 'rgba(236, 210, 180, 0.3)'
                  }}
                />
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 pt-6">
                <button
                  type="button"
                  onClick={() => router.push(`/admin/chakus/${chakuId}`)}
                  className="px-6 py-3 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
                  style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}