'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, Artesano, Chaku, UNIDAD_OPTIONS, MATERIA_PRIMA_OPTIONS, PROCEDENCIA_OPTIONS, DESTINO_OPTIONS } from '@/lib/supabase'

export default function NewCOLTPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [artesanos, setArtesanos] = useState<Artesano[]>([])
  const [chakus, setChakus] = useState<Chaku[]>([])
  const [formData, setFormData] = useState({
    numero: '',
    artesano_id: '',
    unidad: 'Kg' as const,
    cantidad: '',
    materia_prima: 'Vicugna vicugna' as const,
    descripcion: '',
    lugar_procedencia: 'En silvestría' as const,
    chaku_id: '',
    ano: new Date().getFullYear().toString(),
    documentacion_origen: '',
    destino: 'Transformación' as const,
    fecha_expedicion: new Date().toISOString().split('T')[0],
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

  // Cargar datos necesarios
  useEffect(() => {
    loadArtesanos()
    loadChakus()
  }, [])

  const loadArtesanos = async () => {
    try {
      const { data, error } = await supabase
        .from('artesanos')
        .select('*')
        .order('apellidos', { ascending: true })
      
      if (error) throw error
      setArtesanos(data || [])
    } catch (error) {
      console.error('Error al cargar artesanos:', error)
    }
  }

  const loadChakus = async () => {
    try {
      const { data, error } = await supabase
        .from('chakus')
        .select('*')
        .order('nombre', { ascending: true })
      
      if (error) throw error
      setChakus(data || [])
    } catch (error) {
      console.error('Error al cargar chakus:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.numero.trim() || !formData.descripcion.trim() || !formData.documentacion_origen.trim()) {
        throw new Error('Los campos número, descripción y documentación de origen son obligatorios')
      }

      if (!formData.artesano_id) {
        throw new Error('Debe seleccionar un artesano')
      }

      if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
        throw new Error('La cantidad debe ser mayor a 0')
      }

      // Crear nuevo certificado C.O.L.T.
      const { error } = await supabase
        .from('colt')
        .insert([{
          numero: formData.numero.trim(),
          artesano_id: parseInt(formData.artesano_id),
          unidad: formData.unidad,
          cantidad: parseFloat(formData.cantidad),
          materia_prima: formData.materia_prima,
          descripcion: formData.descripcion.trim(),
          lugar_procedencia: formData.lugar_procedencia,
          chaku_id: formData.chaku_id ? parseInt(formData.chaku_id) : null,
          ano: parseInt(formData.ano),
          documentacion_origen: formData.documentacion_origen.trim(),
          destino: formData.destino,
          fecha_expedicion: formData.fecha_expedicion,
        }])

      if (error) throw error

      // Redirigir a la página de administrar C.O.L.T.
      router.push('/admin/colt')
    } catch (err) {
      console.error('Error al crear certificado C.O.L.T.:', err)
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
              onClick={() => router.push('/admin/colt')}
              className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mr-4"
              style={{ color: '#0f324b' }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Certificados C.O.L.T.
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Nuevo Certificado C.O.L.T.
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Registra un nuevo Certificado de Origen y Legítima Tenencia en el sistema
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="numero" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Número de Certificado *
                </label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  placeholder="Ej: COLT-2024-001"
                  required
                />
              </div>

              <div>
                <label htmlFor="artesano_id" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Artesano *
                </label>
                <select
                  id="artesano_id"
                  name="artesano_id"
                  value={formData.artesano_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                >
                  <option value="">Seleccionar artesano</option>
                  {artesanos.map((artesano) => (
                    <option key={artesano.id} value={artesano.id}>
                      {artesano.apellidos}, {artesano.nombres} - DNI: {artesano.dni}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Descripción *
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
                placeholder="Ej: Fibra en bruto de vellón"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="materia_prima" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Materia Prima *
                </label>
                <select
                  id="materia_prima"
                  name="materia_prima"
                  value={formData.materia_prima}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                >
                  {MATERIA_PRIMA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="lugar_procedencia" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Lugar de Procedencia *
                </label>
                <select
                  id="lugar_procedencia"
                  name="lugar_procedencia"
                  value={formData.lugar_procedencia}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                >
                  {PROCEDENCIA_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="cantidad" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Cantidad *
                </label>
                <input
                  type="number"
                  step="0.001"
                  id="cantidad"
                  name="cantidad"
                  value={formData.cantidad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  placeholder="Ej: 1.500"
                  required
                />
              </div>

              <div>
                <label htmlFor="unidad" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Unidad *
                </label>
                <select
                  id="unidad"
                  name="unidad"
                  value={formData.unidad}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                >
                  {UNIDAD_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="destino" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Destino *
                </label>
                <select
                  id="destino"
                  name="destino"
                  value={formData.destino}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                >
                  {DESTINO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="chaku_id" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Chaku (Opcional)
                </label>
                <select
                  id="chaku_id"
                  name="chaku_id"
                  value={formData.chaku_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                >
                  <option value="">Seleccionar chaku (opcional)</option>
                  {chakus.map((chaku) => (
                    <option key={chaku.id} value={chaku.id}>
                      {chaku.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ano" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Año *
                </label>
                <input
                  type="number"
                  id="ano"
                  name="ano"
                  value={formData.ano}
                  onChange={handleInputChange}
                  min="2000"
                  max="2100"
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="documentacion_origen" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Documentación de Origen *
              </label>
              <textarea
                id="documentacion_origen"
                name="documentacion_origen"
                value={formData.documentacion_origen}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
                placeholder="Descripción de la documentación que respalda el origen del material"
                required
              />
            </div>

            <div>
              <label htmlFor="fecha_expedicion" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Fecha de Expedición *
              </label>
              <input
                type="date"
                id="fecha_expedicion"
                name="fecha_expedicion"
                value={formData.fecha_expedicion}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
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
                type="button"
                onClick={() => router.push('/admin/colt')}
                className="flex-1 py-3 px-6 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
                style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 rounded-lg font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                {submitting ? 'Creando...' : 'Crear Certificado C.O.L.T.'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}