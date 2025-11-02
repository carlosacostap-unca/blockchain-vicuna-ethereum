'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function NewCooperativaPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    comunidad: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.nombre.trim() || !formData.comunidad.trim()) {
        throw new Error('Todos los campos son obligatorios')
      }

      // Crear nueva cooperativa
      const { error } = await supabase
        .from('cooperativas')
        .insert([{
          nombre: formData.nombre.trim(),
          comunidad: formData.comunidad.trim(),
        }])

      if (error) throw error

      // Redirigir a la página de administrar cooperativas
      router.push('/admin/cooperativas')
    } catch (err) {
      console.error('Error al crear cooperativa:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setSubmitting(false)
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
        {/* Título y navegación */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin/cooperativas')}
              className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mr-4"
              style={{ color: '#0f324b' }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Administrar Cooperativas
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Nueva Cooperativa
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Registra una nueva cooperativa en el sistema
          </p>
        </div>

        {/* Formulario */}
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#0f324b' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
                {error}
              </div>
            )}

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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
                placeholder="Ingresa el nombre de la cooperativa"
                required
              />
            </div>

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
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
                placeholder="Ingresa la comunidad donde se ubica"
                required
              />
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                {submitting ? 'Creando...' : 'Crear Cooperativa'}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/admin/cooperativas')}
                className="flex-1 py-3 px-6 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
                style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}