'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Cooperativa } from '@/lib/supabase'
import ArtesanoPhotoUpload from '@/components/ArtesanoPhotoUpload'

export default function NewArtesanoPage() {
  const router = useRouter()

  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    dni: '',
    fecha_nacimiento: '',
    contacto: '',
    domicilio: '',
    cooperativa_id: '',
    fotografia_url: ''
  })

  // Estado para la fotografía subida
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('')

  // Función para manejar la URL de la foto subida con log
  const handlePhotoUploaded = (url: string) => {
    console.log('📸 [PHOTO CALLBACK] URL recibida del componente:', url)
    setUploadedPhotoUrl(url)
  }

  useEffect(() => {
    fetchCooperativas()
  }, [])

  const fetchCooperativas = async () => {
    try {
      const { data, error } = await supabase
        .from('cooperativas')
        .select('*')
        .order('nombre')

      if (error) throw error
      setCooperativas(data || [])
    } catch (error) {
      console.error('Error fetching cooperativas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNavigation = (section: string) => {
    switch (section) {
      case 'inicio':
        router.push('/')
        break
      case 'catalogo':
        router.push('/catalogo')
        break
      case 'productos':
        router.push('/productos')
        break
      case 'enlaces':
        console.log('Navegando a Enlaces')
        break
      default:
        console.log(`Navegando a ${section}`)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Buscando:', searchTerm)
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    console.log('🔍 [FORM DEBUG] Datos del formulario antes de enviar:', {
      formData,
      uploadedPhotoUrl,
      finalPhotoUrl: uploadedPhotoUrl || formData.fotografia_url
    })

    try {
      const { data, error } = await supabase
        .from('artesanos')
        .insert({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          dni: formData.dni,
          fecha_nacimiento: formData.fecha_nacimiento,
          contacto: formData.contacto,
          domicilio: formData.domicilio,
          cooperativa_id: formData.cooperativa_id || null,
          fotografia_url: uploadedPhotoUrl || formData.fotografia_url
        })
        .select()
        .single()

      if (error) throw error

      console.log('✅ [FORM SUCCESS] Artesano creado exitosamente:', data)
      router.push(`/admin/artesanos/${data.id}`)
    } catch (error) {
      console.error('Error creating artesano:', error)
      setError('Error al crear el artesano')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Copiado de la página admin */}
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
                  onClick={() => handleNavigation('inicio')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  INICIO
                </button>
                <button
                  onClick={() => handleNavigation('catalogo')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  CATÁLOGO
                </button>
                <button
                  onClick={() => handleNavigation('productos')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  PRODUCTOS
                </button>
                <button
                  onClick={() => handleNavigation('enlaces')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  ENLACES
                </button>
              </div>
            </nav>

            {/* Barra de búsqueda y menú hamburguesa */}
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-custom"
                />
              </form>
              
              {/* Menú hamburguesa */}
              <div className="relative">
                <button
                  className="flex flex-row justify-center items-center w-8 h-8 space-x-1 hover:opacity-80 transition-opacity duration-200"
                  onClick={handleMenuToggle}
                >
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                </button>

                {/* Menú desplegable */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50" style={{ backgroundColor: '#0f324b' }}>
                    <div className="py-1">
                      <button
                        onClick={() => router.push('/admin')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Panel de Administración
                      </button>
                      <button
                        onClick={() => router.push('/admin/artesanos')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Lista de Artesanos
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de Bienvenida */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Nuevo Artesano
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Registra un nuevo artesano en el sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Formulario con estilo de tarjeta admin */}
        <div className="max-w-4xl mx-auto">
          <div
            className="p-8 rounded-lg shadow-lg"
            style={{ backgroundColor: '#0f324b' }}
          >
            <div className="mb-6">
              <button
                onClick={() => router.push('/admin/artesanos')}
                className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mb-4"
                style={{ color: '#ecd2b4' }}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a la Lista
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-xl font-bold mb-6 font-maria-david" style={{ color: '#ecd2b4' }}>
                Información del Artesano
              </h3>

              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nombres" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                    Nombres *
                  </label>
                  <input
                    type="text"
                    id="nombres"
                    name="nombres"
                    value={formData.nombres}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white placeholder-gray-500"
                    style={{ borderColor: '#ecd2b4' }}
                    placeholder="Ingrese los nombres del artesano"
                  />
                </div>
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    id="apellidos"
                    name="apellidos"
                    value={formData.apellidos}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white placeholder-gray-500"
                    style={{ borderColor: '#ecd2b4' }}
                    placeholder="Ingrese los apellidos del artesano"
                  />
                </div>
              </div>

              {/* DNI y Fecha de Nacimiento */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dni" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                    DNI *
                  </label>
                  <input
                    type="text"
                    id="dni"
                    name="dni"
                    value={formData.dni}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white placeholder-gray-500"
                    style={{ borderColor: '#ecd2b4' }}
                    placeholder="Ingrese el número de DNI"
                  />
                </div>
                <div>
                  <label htmlFor="fecha_nacimiento" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    value={formData.fecha_nacimiento}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white"
                    style={{ borderColor: '#ecd2b4' }}
                  />
                </div>
              </div>

              {/* Contacto y Cooperativa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contacto" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                    Contacto
                  </label>
                  <input
                    type="text"
                    id="contacto"
                    name="contacto"
                    value={formData.contacto}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white placeholder-gray-500"
                    style={{ borderColor: '#ecd2b4' }}
                    placeholder="Teléfono o email de contacto"
                  />
                </div>
                <div>
                  <label htmlFor="cooperativa_id" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                    Cooperativa
                  </label>
                  <select
                    id="cooperativa_id"
                    name="cooperativa_id"
                    value={formData.cooperativa_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white"
                    style={{ borderColor: '#ecd2b4' }}
                  >
                    <option value="">Seleccionar cooperativa...</option>
                    {cooperativas.map((cooperativa) => (
                      <option key={cooperativa.id} value={cooperativa.id}>
                        {cooperativa.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Domicilio */}
              <div>
                <label htmlFor="domicilio" className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Domicilio
                </label>
                <textarea
                  id="domicilio"
                  name="domicilio"
                  value={formData.domicilio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white placeholder-gray-500"
                  style={{ borderColor: '#ecd2b4' }}
                  placeholder="Dirección completa del artesano"
                />
              </div>

              {/* Subida de Fotografía */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Fotografía del Artesano
                </label>
                <ArtesanoPhotoUpload
                  onPhotoUploaded={handlePhotoUploaded}
                />
              </div>

              {/* Botón de Crear Artesano */}
              <button
                type="submit"
                disabled={saving}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 ${
                  saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
                }`}
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                {saving ? '⏳ Creando Artesano...' : '🚀 Crear Artesano'}
              </button>

              {/* Botón Cancelar */}
              <button
                type="button"
                onClick={() => router.push('/admin/artesanos')}
                className="w-full px-6 py-3 rounded-lg font-medium border-2 transition-colors duration-200 hover:opacity-80"
                style={{ borderColor: '#ecd2b4', color: '#ecd2b4', backgroundColor: 'transparent' }}
              >
                Cancelar
              </button>

              {/* Instrucciones */}
              <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', border: '1px solid #ecd2b4' }}>
                <h4 className="text-lg font-bold mb-4 font-maria-david" style={{ color: '#ecd2b4' }}>
                  📋 Instrucciones para el registro
                </h4>
                <ul className="space-y-2 text-sm" style={{ color: '#ecd2b4' }}>
                  <li>• Los campos marcados con (*) son obligatorios</li>
                  <li>• El DNI debe ser único en el sistema</li>
                  <li>• La fecha de nacimiento debe ser válida</li>
                  <li>• Puede subir una fotografía del artesano (formatos: JPG, PNG, WebP, máximo 5MB)</li>
                  <li>• Asegúrese de que todos los datos sean correctos antes de crear el artesano</li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}