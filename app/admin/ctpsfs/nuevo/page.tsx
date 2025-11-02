'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, Artesano, Chaku } from '@/lib/supabase'

export default function NewCTPSFSPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [artesanos, setArtesanos] = useState<Artesano[]>([])
  const [chakus, setChakus] = useState<Chaku[]>([])
  const [formData, setFormData] = useState({
    numero: '',
    descripcion_producto: '',
    chaku_id: '',
    ano: new Date().getFullYear().toString(),
    documentacion_origen: '',
  })
  const [procesosTransformacion, setProcesosTransformacion] = useState([{
    descripcion_producto: '',
    cantidad: '',
    unidad: 'Kg',
    documentacion_tenencia: '',
    fecha_certificacion: new Date().toISOString().split('T')[0],
    artesano_id: ''
  }])
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

  const handleProcesoChange = (index: number, field: string, value: string) => {
    const updatedProcesos = [...procesosTransformacion]
    updatedProcesos[index] = { ...updatedProcesos[index], [field]: value }
    setProcesosTransformacion(updatedProcesos)
  }

  const addProceso = () => {
    setProcesosTransformacion([...procesosTransformacion, {
      descripcion_producto: '',
      cantidad: '',
      unidad: 'Kg',
      documentacion_tenencia: '',
      fecha_certificacion: new Date().toISOString().split('T')[0],
      artesano_id: ''
    }])
  }

  const removeProceso = (index: number) => {
    if (procesosTransformacion.length > 1) {
      setProcesosTransformacion(procesosTransformacion.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.numero.trim() || !formData.descripcion_producto.trim() || !formData.documentacion_origen.trim()) {
        throw new Error('Los campos número, descripción del producto y documentación de origen son obligatorios')
      }

      // Validar procesos de transformación
      for (let i = 0; i < procesosTransformacion.length; i++) {
        const proceso = procesosTransformacion[i]
        if (!proceso.descripcion_producto.trim() || !proceso.cantidad || !proceso.documentacion_tenencia.trim() || !proceso.artesano_id) {
          throw new Error(`Complete todos los campos del proceso de transformación ${i + 1}`)
        }
        if (parseFloat(proceso.cantidad) <= 0) {
          throw new Error(`La cantidad del proceso ${i + 1} debe ser mayor a 0`)
        }
      }

      // Crear nuevo certificado C.T.P.S.F.S.
      const { data: ctpsfsData, error: ctpsfsError } = await supabase
        .from('ctpsfs')
        .insert([{
          numero: formData.numero.trim(),
          descripcion_producto: formData.descripcion_producto.trim(),
          chaku_id: formData.chaku_id ? parseInt(formData.chaku_id) : null,
          ano: parseInt(formData.ano),
          documentacion_origen: formData.documentacion_origen.trim(),
        }])
        .select()

      if (ctpsfsError) throw ctpsfsError

      const ctpsfsId = ctpsfsData[0].id

      // Crear procesos de transformación
      const procesosData = procesosTransformacion.map(proceso => ({
        ctpsfs_id: ctpsfsId,
        descripcion_producto: proceso.descripcion_producto.trim(),
        cantidad: parseFloat(proceso.cantidad),
        unidad: proceso.unidad,
        documentacion_tenencia: proceso.documentacion_tenencia.trim(),
        fecha_certificacion: proceso.fecha_certificacion,
        artesano_id: parseInt(proceso.artesano_id)
      }))

      const { error: procesosError } = await supabase
        .from('ctpsfs_procesos_transformacion')
        .insert(procesosData)

      if (procesosError) throw procesosError

      // Redirigir a la página de administrar C.T.P.S.F.S.
      router.push('/admin/ctpsfs')
    } catch (err) {
      console.error('Error al crear certificado C.T.P.S.F.S.:', err)
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
              onClick={() => router.push('/admin/ctpsfs')}
              className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mr-4"
              style={{ color: '#0f324b' }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a Certificados C.T.P.S.F.S.
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Nuevo Certificado C.T.P.S.F.S.
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Registra un nuevo Certificado de Transformación Primaria de Subproductos de Fibra de Vicuña en el sistema
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

            {/* Información básica del certificado */}
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>
                Información del Certificado
              </h3>

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
                    placeholder="Ej: CTPSFS-2024-001"
                    required
                  />
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
                    min="2020"
                    max="2030"
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
                <label htmlFor="descripcion_producto" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                  Descripción del Producto *
                </label>
                <textarea
                  id="descripcion_producto"
                  name="descripcion_producto"
                  value={formData.descripcion_producto}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                  style={{ 
                    backgroundColor: '#ecd2b4', 
                    color: '#0f324b',
                    borderColor: '#ecd2b4'
                  }}
                  placeholder="Ej: Fibra procesada de vicuña"
                  required
                />
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
                  <label htmlFor="documentacion_origen" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                    Documentación de Origen *
                  </label>
                  <input
                    type="text"
                    id="documentacion_origen"
                    name="documentacion_origen"
                    value={formData.documentacion_origen}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                    style={{ 
                      backgroundColor: '#ecd2b4', 
                      color: '#0f324b',
                      borderColor: '#ecd2b4'
                    }}
                    placeholder="Ej: Certificado COLT-2024-001"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Procesos de Transformación */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold" style={{ color: '#ecd2b4' }}>
                  Procesos de Transformación
                </h3>
                <button
                  type="button"
                  onClick={addProceso}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  + Agregar Proceso
                </button>
              </div>

              {procesosTransformacion.map((proceso, index) => (
                <div key={index} className="p-6 rounded-lg border-2" style={{ borderColor: '#ecd2b4', backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium" style={{ color: '#ecd2b4' }}>
                      Proceso {index + 1}
                    </h4>
                    {procesosTransformacion.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProceso(index)}
                        className="text-red-400 hover:text-red-300 transition-colors duration-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Descripción del Producto *
                      </label>
                      <input
                        type="text"
                        value={proceso.descripcion_producto}
                        onChange={(e) => handleProcesoChange(index, 'descripcion_producto', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                        style={{ 
                          backgroundColor: '#ecd2b4', 
                          color: '#0f324b',
                          borderColor: '#ecd2b4'
                        }}
                        placeholder="Ej: Hilo de vicuña"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Artesano *
                      </label>
                      <select
                        value={proceso.artesano_id}
                        onChange={(e) => handleProcesoChange(index, 'artesano_id', e.target.value)}
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

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={proceso.cantidad}
                        onChange={(e) => handleProcesoChange(index, 'cantidad', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                        style={{ 
                          backgroundColor: '#ecd2b4', 
                          color: '#0f324b',
                          borderColor: '#ecd2b4'
                        }}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Unidad *
                      </label>
                      <select
                        value={proceso.unidad}
                        onChange={(e) => handleProcesoChange(index, 'unidad', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                        style={{ 
                          backgroundColor: '#ecd2b4', 
                          color: '#0f324b',
                          borderColor: '#ecd2b4'
                        }}
                        required
                      >
                        <option value="Kg">Kg</option>
                        <option value="g">g</option>
                        <option value="m">m</option>
                        <option value="cm">cm</option>
                        <option value="unidad">unidad</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Documentación de Tenencia *
                      </label>
                      <input
                        type="text"
                        value={proceso.documentacion_tenencia}
                        onChange={(e) => handleProcesoChange(index, 'documentacion_tenencia', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200"
                        style={{ 
                          backgroundColor: '#ecd2b4', 
                          color: '#0f324b',
                          borderColor: '#ecd2b4'
                        }}
                        placeholder="Ej: Recibo de transformación"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Fecha de Certificación *
                      </label>
                      <input
                        type="date"
                        value={proceso.fecha_certificacion}
                        onChange={(e) => handleProcesoChange(index, 'fecha_certificacion', e.target.value)}
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
                </div>
              ))}
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/ctpsfs')}
                className="px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: 'transparent', color: '#ecd2b4', border: '2px solid #ecd2b4' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-200 hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                {submitting ? 'Creando...' : 'Crear Certificado'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}