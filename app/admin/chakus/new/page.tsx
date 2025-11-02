'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function NewChakuPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const router = useRouter()
  const [formData, setFormData] = useState({
    nombre: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
      if (!formData.nombre?.trim()) {
        setError('El nombre es obligatorio')
        setSubmitting(false)
        return
      }

      // Crear nuevo chaku
      const { error } = await supabase
        .from('chakus')
        .insert([{ nombre: formData.nombre.trim() }])

      if (error) throw error

      // Redirigir de vuelta a la lista de chakus
      router.push('/admin/chakus')
    } catch (error: any) {
      setError(error.message || 'Error al crear el chaku')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  const handleAccessOption = (role: string) => {
    setIsMenuOpen(false)
    switch (role) {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ecd2b4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
          <p style={{ color: '#0f324b' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
      {/* Header */}
      <header className="shadow-lg" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold font-maria-david" style={{ color: '#ecd2b4' }}>
                RUTA DEL TELAR
              </h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="hover:opacity-80 transition-opacity duration-200 font-maria-david" style={{ color: '#ecd2b4' }}>INICIO</a>
              <a href="/catalogo" className="hover:opacity-80 transition-opacity duration-200 font-maria-david" style={{ color: '#ecd2b4' }}>CATÁLOGO</a>
              <a href="/productos" className="hover:opacity-80 transition-opacity duration-200 font-maria-david" style={{ color: '#ecd2b4' }}>PRODUCTOS</a>
              <a href="/galeria" className="hover:opacity-80 transition-opacity duration-200 font-maria-david" style={{ color: '#ecd2b4' }}>ENLACES</a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium">{profile?.full_name || 'Usuario'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50" style={{ backgroundColor: '#0f324b' }}>
                    <div className="py-1">
                      <button
                        onClick={() => handleAccessOption('Administrador')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Panel Administrador
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
                      <hr className="my-1" style={{ borderColor: '#ecd2b4' }} />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel de Administración
          </button>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-maria-david mb-2" style={{ color: '#0f324b' }}>
            NUEVO CHAKU
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Registra un nuevo chaku tradicional en el sistema
          </p>
        </div>

        {/* Form Container */}
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#0f324b' }}>
            <h2 className="text-2xl font-bold font-maria-david mb-6" style={{ color: '#ecd2b4' }}>
              Información del Chaku
            </h2>

            {error && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
                <p style={{ color: '#ef4444' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  placeholder="Ingrese el nombre del chaku"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                />
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  {submitting ? 'Creando...' : 'Crear Chaku'}
                </button>
                
                <button
                  type="button"
                  onClick={() => router.push('/admin/chakus')}
                  disabled={submitting}
                  className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: 'rgba(236, 210, 180, 0.2)', color: '#ecd2b4', border: '1px solid #ecd2b4' }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}