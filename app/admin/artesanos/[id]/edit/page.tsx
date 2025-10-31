'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Artesano, Cooperativa } from '@/lib/supabase'
import { uploadArtesanoPhoto, deleteArtesanoPhoto, validateImageFile, createArtesanosBucketIfNotExists } from '@/lib/storage'

export default function EditArtesanoPage() {
  const router = useRouter()
  const params = useParams()
  const artesanoId = params.id as string

  const [artesano, setArtesano] = useState<Artesano | null>(null)
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profile, setProfile] = useState<any>(null)

  // Estados para la funcionalidad de fotografía
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  useEffect(() => {
    fetchProfile()
    fetchArtesano()
    fetchCooperativas()
  }, [artesanoId])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        setProfile(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const fetchArtesano = async () => {
    try {
      const { data, error } = await supabase
        .from('artesanos')
        .select(`
          *,
          cooperativa:cooperativas(*)
        `)
        .eq('id', artesanoId)
        .single()

      if (error) throw error

      setArtesano(data)
      setFormData({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        dni: data.dni || '',
        fecha_nacimiento: data.fecha_nacimiento || '',
        contacto: data.contacto || '',
        domicilio: data.domicilio || '',
        cooperativa_id: data.cooperativa_id || '',
        fotografia_url: data.fotografia_url || ''
      })
    } catch (error) {
      console.error('Error fetching artesano:', error)
      setError('Error al cargar los datos del artesano')
    } finally {
      setLoading(false)
    }
  }

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
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('artesanos')
        .update({
          nombres: formData.nombres,
          apellidos: formData.apellidos,
          dni: formData.dni,
          fecha_nacimiento: formData.fecha_nacimiento,
          contacto: formData.contacto,
          domicilio: formData.domicilio,
          cooperativa_id: formData.cooperativa_id || null,
          fotografia_url: formData.fotografia_url
        })
        .eq('id', artesanoId)

      if (error) throw error

      router.push(`/admin/artesanos/${artesanoId}`)
    } catch (error) {
      console.error('Error updating artesano:', error)
      setError('Error al actualizar el artesano')
    } finally {
      setSaving(false)
    }
  }

  // Funciones para manejar la fotografía
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setPhotoError(null)

    // Validar el archivo
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setPhotoError(validation.error || 'Archivo no válido')
      return
    }

    setUploadingPhoto(true)

    try {
      // Crear bucket si no existe
      await createArtesanosBucketIfNotExists()

      // Eliminar fotografía anterior si existe
      if (formData.fotografia_url) {
        await deleteArtesanoPhoto(formData.fotografia_url)
      }

      // Subir nueva fotografía
      const photoUrl = await uploadArtesanoPhoto(file, parseInt(artesanoId))
      
      if (photoUrl) {
        setFormData(prev => ({
          ...prev,
          fotografia_url: photoUrl
        }))
      } else {
        setPhotoError('Error al subir la fotografía')
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      setPhotoError('Error al subir la fotografía')
    } finally {
      setUploadingPhoto(false)
      // Limpiar el input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemovePhoto = async () => {
    if (!formData.fotografia_url) return

    setUploadingPhoto(true)
    setPhotoError(null)

    try {
      const success = await deleteArtesanoPhoto(formData.fotografia_url)
      if (success) {
        setFormData(prev => ({
          ...prev,
          fotografia_url: ''
        }))
      } else {
        setPhotoError('Error al eliminar la fotografía')
      }
    } catch (error) {
      console.error('Error removing photo:', error)
      setPhotoError('Error al eliminar la fotografía')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
          <p className="text-xl font-medium" style={{ color: '#0f324b' }}>Cargando datos del artesano...</p>
        </div>
      </div>
    )
  }

  if (!artesano) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f5f5dc' }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: '#0f324b' }}>Artesano no encontrado</h1>
          <button
            onClick={() => router.push('/admin/artesanos')}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
          >
            Volver a la Lista
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5dc' }}>
      {/* Header */}
      <header className="shadow-lg" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo y título */}
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold font-maria-david" style={{ color: '#ecd2b4' }}>
                RUTA DEL TELAR
              </h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => router.push('/')}
                className="font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: '#ecd2b4' }}
              >
                INICIO
              </button>
              <button
                onClick={() => router.push('/catalogo')}
                className="font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: '#ecd2b4' }}
              >
                CATÁLOGO
              </button>
              <button
                onClick={() => router.push('/productos')}
                className="font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: '#ecd2b4' }}
              >
                PRODUCTOS
              </button>
              <button
                onClick={() => router.push('/galeria')}
                className="font-medium transition-colors duration-200 hover:opacity-80"
                style={{ color: '#ecd2b4' }}
              >
                ENLACES
              </button>
            </nav>

            {/* Menú de usuario */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
                style={{ color: '#ecd2b4' }}
              >
                <span className="font-medium">{profile?.nombres || 'Usuario'}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg py-2 z-50" style={{ backgroundColor: '#0f324b' }}>
                  <button
                    onClick={() => router.push('/admin')}
                    className="block w-full text-left px-4 py-2 text-sm transition-colors duration-200 hover:bg-white hover:bg-opacity-10"
                    style={{ color: '#ecd2b4' }}
                  >
                    Panel de Administración
                  </button>
                  <button
                    onClick={signOut}
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
              onClick={() => setIsMenuOpen(!isMenuOpen)}
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
            onClick={() => router.push(`/admin/artesanos/${artesanoId}`)}
            className="flex items-center transition-colors duration-200 hover:opacity-80"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles del Artesano
          </button>
        </div>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-maria-david" style={{ color: '#0f324b' }}>
            EDITAR ARTESANO
          </h1>
          <p className="mt-2" style={{ color: '#0f324b' }}>
            Modifica la información de {artesano?.nombres} {artesano?.apellidos}
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
            {/* Nombres y Apellidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nombres" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Nombres *
                </label>
                <input
                  type="text"
                  id="nombres"
                  name="nombres"
                  value={formData.nombres}
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
              <div>
                <label htmlFor="apellidos" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Apellidos *
                </label>
                <input
                  type="text"
                  id="apellidos"
                  name="apellidos"
                  value={formData.apellidos}
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
            </div>

            {/* DNI y Fecha de Nacimiento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="dni" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  DNI *
                </label>
                <input
                  type="text"
                  id="dni"
                  name="dni"
                  value={formData.dni}
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
              <div>
                <label htmlFor="fecha_nacimiento" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  id="fecha_nacimiento"
                  name="fecha_nacimiento"
                  value={formData.fecha_nacimiento}
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
            </div>

            {/* Contacto y Cooperativa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="contacto" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Contacto
                </label>
                <input
                  type="text"
                  id="contacto"
                  name="contacto"
                  value={formData.contacto}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'rgba(236, 210, 180, 0.1)',
                    color: '#ecd2b4',
                    borderColor: 'rgba(236, 210, 180, 0.3)'
                  }}
                />
              </div>
              <div>
                <label htmlFor="cooperativa_id" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Cooperativa
                </label>
                <select
                  id="cooperativa_id"
                  name="cooperativa_id"
                  value={formData.cooperativa_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                  style={{ 
                    backgroundColor: 'rgba(236, 210, 180, 0.1)',
                    color: '#ecd2b4',
                    borderColor: 'rgba(236, 210, 180, 0.3)'
                  }}
                >
                  <option value="" style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>Seleccionar cooperativa</option>
                  {cooperativas.map((cooperativa) => (
                    <option key={cooperativa.id} value={cooperativa.id} style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>
                      {cooperativa.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Domicilio */}
            <div>
              <label htmlFor="domicilio" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Domicilio
              </label>
              <textarea
                id="domicilio"
                name="domicilio"
                value={formData.domicilio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: 'rgba(236, 210, 180, 0.1)',
                  color: '#ecd2b4',
                  borderColor: 'rgba(236, 210, 180, 0.3)'
                }}
              />
            </div>

            {/* Fotografía */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                Fotografía
              </label>
              
              <div className="space-y-4">
                {/* Miniatura actual */}
                {formData.fotografia_url && (
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={formData.fotografia_url}
                        alt="Fotografía actual"
                        className="w-24 h-24 object-cover rounded-lg border-2"
                        style={{ borderColor: 'rgba(236, 210, 180, 0.3)' }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm mb-2" style={{ color: '#ecd2b4' }}>
                        Fotografía actual
                      </p>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        disabled={uploadingPhoto}
                        className="px-3 py-1 text-sm rounded border transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                        style={{ 
                          borderColor: '#dc2626', 
                          color: '#dc2626',
                          backgroundColor: 'rgba(220, 38, 38, 0.1)'
                        }}
                      >
                        {uploadingPhoto ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </div>
                  </div>
                )}

                {/* Botón para subir nueva fotografía */}
                <div>
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    disabled={uploadingPhoto}
                    className="w-full px-4 py-3 rounded-lg border-2 border-dashed transition-colors duration-200 hover:opacity-80 disabled:opacity-50 flex items-center justify-center space-x-2"
                    style={{ 
                      borderColor: 'rgba(236, 210, 180, 0.3)',
                      backgroundColor: 'rgba(236, 210, 180, 0.05)',
                      color: '#ecd2b4'
                    }}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>
                      {uploadingPhoto 
                        ? 'Subiendo fotografía...' 
                        : formData.fotografia_url 
                          ? 'Cambiar fotografía' 
                          : 'Subir fotografía'
                      }
                    </span>
                  </button>
                  
                  {/* Input de archivo oculto */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </div>

                {/* Error de fotografía */}
                {photoError && (
                  <p className="text-sm" style={{ color: '#dc2626' }}>
                    {photoError}
                  </p>
                )}

                {/* Campo URL manual (opcional) */}
                <div>
                  <label htmlFor="fotografia_url" className="block text-xs font-medium mb-1 opacity-75" style={{ color: '#ecd2b4' }}>
                    O ingresa URL manualmente
                  </label>
                  <input
                    type="url"
                    id="fotografia_url"
                    name="fotografia_url"
                    value={formData.fotografia_url}
                    onChange={handleInputChange}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-opacity-50"
                    style={{ 
                      backgroundColor: 'rgba(236, 210, 180, 0.1)',
                      color: '#ecd2b4',
                      borderColor: 'rgba(236, 210, 180, 0.2)'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push(`/admin/artesanos/${artesanoId}`)}
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