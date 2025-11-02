'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type CTPSFSWithRelations, type Artesano, type Chaku } from '@/lib/supabase'

interface ProcesoTransformacionForm {
  id?: number
  descripcion_producto: string
  cantidad: string
  unidad: string
  documentacion_tenencia: string
  fecha_certificacion: string
  artesano_id: string
}

export default function EditCTPSFSPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()
  const params = useParams()
  const ctpsfsId = params.id as string

  const [ctpsfs, setCTPSFS] = useState<CTPSFSWithRelations | null>(null)
  const [loadingCTPSFS, setLoadingCTPSFS] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [artesanos, setArtesanos] = useState<Artesano[]>([])
  const [chakus, setChakus] = useState<Chaku[]>([])

  // Estados del formulario
  const [formData, setFormData] = useState({
    numero: '',
    descripcion_producto: '',
    chaku_id: '',
    ano: new Date().getFullYear().toString(),
    documentacion_origen: ''
  })

  const [procesos, setProcesos] = useState<ProcesoTransformacionForm[]>([
    {
      descripcion_producto: '',
      cantidad: '',
      unidad: 'Kg',
      documentacion_tenencia: '',
      fecha_certificacion: new Date().toISOString().split('T')[0],
      artesano_id: ''
    }
  ])

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const fetchCTPSFS = async () => {
    try {
      setLoadingCTPSFS(true)
      setError(null)

      const { data, error } = await supabase
        .from('ctpsfs')
        .select(`
          *,
          chaku:chakus(*),
          procesos_transformacion:ctpsfs_procesos_transformacion(
            *,
            artesano:artesanos(*)
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
      setFormData({
        numero: data.numero || '',
        descripcion_producto: data.descripcion_producto || '',
        chaku_id: data.chaku_id?.toString() || '',
        ano: data.ano?.toString() || new Date().getFullYear().toString(),
        documentacion_origen: data.documentacion_origen || ''
      })

      // Cargar procesos de transformación existentes
      if (data.procesos_transformacion && data.procesos_transformacion.length > 0) {
        setProcesos(data.procesos_transformacion.map((proceso: any) => ({
          id: proceso.id,
          descripcion_producto: proceso.descripcion_producto,
          cantidad: proceso.cantidad.toString(),
          unidad: proceso.unidad,
          documentacion_tenencia: proceso.documentacion_tenencia,
          fecha_certificacion: proceso.fecha_certificacion,
          artesano_id: proceso.artesano_id.toString()
        })))
      }
    } catch (error) {
      console.error('Error fetching CTPSFS:', error)
      setError('Error al cargar los datos del certificado C.T.P.S.F.S.')
    } finally {
      setLoadingCTPSFS(false)
    }
  }

  const loadArtesanos = async () => {
    const { data } = await supabase
      .from('artesanos')
      .select('*')
      .order('apellidos', { ascending: true })
    
    if (data) setArtesanos(data)
  }

  const loadChakus = async () => {
    const { data } = await supabase
      .from('chakus')
      .select('*')
      .order('nombre', { ascending: true })
    
    if (data) setChakus(data)
  }

  useEffect(() => {
    if (ctpsfsId) {
      fetchCTPSFS()
    }
    loadArtesanos()
    loadChakus()
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleProcesoChange = (index: number, field: keyof ProcesoTransformacionForm, value: string) => {
    setProcesos(prev => prev.map((proceso, i) => 
      i === index ? { ...proceso, [field]: value } : proceso
    ))
    
    // Limpiar error del campo
    const errorKey = `proceso_${index}_${field}`
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }))
    }
  }

  const addProceso = () => {
    setProcesos(prev => [...prev, {
      descripcion_producto: '',
      cantidad: '',
      unidad: 'Kg',
      documentacion_tenencia: '',
      fecha_certificacion: new Date().toISOString().split('T')[0],
      artesano_id: ''
    }])
  }

  const removeProceso = (index: number) => {
    if (procesos.length > 1) {
      setProcesos(prev => prev.filter((_, i) => i !== index))
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar datos principales
    if (!formData.numero.trim()) {
      newErrors.numero = 'El número es requerido'
    }
    if (!formData.descripcion_producto.trim()) {
      newErrors.descripcion_producto = 'La descripción del producto es requerida'
    }
    if (!formData.ano) {
      newErrors.ano = 'El año es requerido'
    }
    if (!formData.documentacion_origen.trim()) {
      newErrors.documentacion_origen = 'La documentación de origen es requerida'
    }

    // Validar procesos de transformación
    procesos.forEach((proceso, index) => {
      if (!proceso.descripcion_producto.trim()) {
        newErrors[`proceso_${index}_descripcion_producto`] = 'La descripción del producto es requerida'
      }
      if (!proceso.cantidad || parseFloat(proceso.cantidad) <= 0) {
        newErrors[`proceso_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (!proceso.documentacion_tenencia.trim()) {
        newErrors[`proceso_${index}_documentacion_tenencia`] = 'La documentación de tenencia es requerida'
      }
      if (!proceso.fecha_certificacion) {
        newErrors[`proceso_${index}_fecha_certificacion`] = 'La fecha de certificación es requerida'
      }
      if (!proceso.artesano_id) {
        newErrors[`proceso_${index}_artesano_id`] = 'El permisionario es requerido'
      }
    })

    setFormErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Actualizar CTPSFS
      const { error: updateError } = await supabase
        .from('ctpsfs')
        .update({
          numero: formData.numero,
          descripcion_producto: formData.descripcion_producto,
          chaku_id: formData.chaku_id ? parseInt(formData.chaku_id) : null,
          ano: parseInt(formData.ano),
          documentacion_origen: formData.documentacion_origen
        })
        .eq('id', ctpsfsId)

      if (updateError) throw updateError

      // Eliminar procesos existentes
      await supabase
        .from('ctpsfs_procesos_transformacion')
        .delete()
        .eq('ctpsfs_id', ctpsfsId)

      // Insertar procesos de transformación actualizados
      const procesosToInsert = procesos.map(proceso => ({
        ctpsfs_id: parseInt(ctpsfsId),
        descripcion_producto: proceso.descripcion_producto,
        cantidad: parseFloat(proceso.cantidad),
        unidad: proceso.unidad,
        documentacion_tenencia: proceso.documentacion_tenencia,
        fecha_certificacion: proceso.fecha_certificacion,
        artesano_id: parseInt(proceso.artesano_id)
      }))

      const { error: procesosError } = await supabase
        .from('ctpsfs_procesos_transformacion')
        .insert(procesosToInsert)

      if (procesosError) throw procesosError

      router.push(`/admin/ctpsfs/${ctpsfsId}`)
    } catch (error) {
      console.error('Error updating CTPSFS:', error)
      setError('Error al actualizar el certificado C.T.P.S.F.S.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingCTPSFS) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del certificado C.T.P.S.F.S....</p>
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
            onClick={() => router.push('/admin/ctpsfs')}
            className="px-6 py-3 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
          >
            Volver a Certificados C.T.P.S.F.S.
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación de regreso */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/admin/ctpsfs/${ctpsfsId}`)}
            className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Detalles del Certificado C.T.P.S.F.S.
          </button>
        </div>

        {/* Contenido principal */}
        <div className="space-y-8">
          {/* Título */}
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
              EDITAR CERTIFICADO C.T.P.S.F.S.
            </h1>
            <p className="text-lg" style={{ color: '#0f324b', opacity: 0.8 }}>
              Modifica los datos del certificado de transformación
            </p>
          </div>

          {/* Tarjeta principal */}
          <div className="rounded-lg shadow-lg overflow-hidden" style={{ backgroundColor: '#0f324b' }}>
            {/* Icono grande */}
            <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
              <div className="text-center" style={{ color: '#ecd2b4' }}>
                <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2M18 20H6V4H13V9H18V20Z"/>
                </svg>
                <p className="text-lg opacity-60">Certificado C.T.P.S.F.S.</p>
              </div>
            </div>

            {/* Formulario */}
            <div className="p-8">
              {error && (
                <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', border: '1px solid #dc2626', color: '#dc2626' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Datos principales del certificado */}
                <div>
                  <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>
                    Datos del Certificado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Número */}
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
                        required
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                          color: '#ecd2b4',
                          border: '1px solid rgba(236, 210, 180, 0.3)'
                        }}
                        placeholder="Ingrese el número del certificado"
                      />
                      {formErrors.numero && <p className="text-red-400 text-sm mt-1">{formErrors.numero}</p>}
                    </div>

                    {/* Año */}
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
                        required
                        min="2000"
                        max="2100"
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                          color: '#ecd2b4',
                          border: '1px solid rgba(236, 210, 180, 0.3)'
                        }}
                        placeholder="Ingrese el año"
                      />
                      {formErrors.ano && <p className="text-red-400 text-sm mt-1">{formErrors.ano}</p>}
                    </div>

                    {/* Chaku */}
                    <div>
                      <label htmlFor="chaku_id" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Chaku (Opcional)
                      </label>
                      <select
                        id="chaku_id"
                        name="chaku_id"
                        value={formData.chaku_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{ 
                          backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                          color: '#ecd2b4',
                          border: '1px solid rgba(236, 210, 180, 0.3)'
                        }}
                      >
                        <option value="">Seleccione un chaku</option>
                        {chakus.map((chaku) => (
                          <option key={chaku.id} value={chaku.id} style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>
                            {chaku.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Descripción del producto */}
                    <div className="md:col-span-2">
                      <label htmlFor="descripcion_producto" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Descripción del Producto *
                      </label>
                      <textarea
                        id="descripcion_producto"
                        name="descripcion_producto"
                        value={formData.descripcion_producto}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{ 
                           backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                           color: '#ecd2b4',
                           border: '1px solid rgba(236, 210, 180, 0.3)'
                         }}
                        placeholder="Ingrese la descripción del producto"
                      />
                      {formErrors.descripcion_producto && <p className="text-red-400 text-sm mt-1">{formErrors.descripcion_producto}</p>}
                    </div>

                    {/* Documentación de origen */}
                    <div className="md:col-span-2">
                      <label htmlFor="documentacion_origen" className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                        Documentación de Origen *
                      </label>
                      <textarea
                        id="documentacion_origen"
                        name="documentacion_origen"
                        value={formData.documentacion_origen}
                        onChange={handleInputChange}
                        required
                        rows={3}
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                        style={{ 
                           backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                           color: '#ecd2b4',
                           border: '1px solid rgba(236, 210, 180, 0.3)'
                         }}
                        placeholder="Ingrese la documentación de origen"
                      />
                      {formErrors.documentacion_origen && <p className="text-red-400 text-sm mt-1">{formErrors.documentacion_origen}</p>}
                    </div>
                  </div>
                </div>

                {/* Procesos de transformación */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold" style={{ color: '#ecd2b4' }}>
                      Procesos de Transformación
                    </h3>
                    <button
                      type="button"
                      onClick={addProceso}
                      className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                      style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                    >
                      + Agregar Proceso
                    </button>
                  </div>

                  {procesos.map((proceso, index) => (
                    <div key={index} className="mb-6 p-6 rounded-lg" style={{ backgroundColor: 'rgba(236, 210, 180, 0.05)', border: '1px solid rgba(236, 210, 180, 0.2)' }}>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium" style={{ color: '#ecd2b4' }}>
                          Proceso {index + 1}
                        </h4>
                        {procesos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeProceso(index)}
                            className="text-red-400 hover:text-red-300 transition-colors duration-200"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Descripción del producto transformado */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                            Producto Transformado *
                          </label>
                          <input
                            type="text"
                            value={proceso.descripcion_producto}
                            onChange={(e) => handleProcesoChange(index, 'descripcion_producto', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ 
                              backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                              color: '#ecd2b4',
                              border: '1px solid rgba(236, 210, 180, 0.3)'
                            }}
                            placeholder="Descripción del producto transformado"
                          />
                          {formErrors[`proceso_${index}_descripcion_producto`] && (
                            <p className="text-red-400 text-sm mt-1">{formErrors[`proceso_${index}_descripcion_producto`]}</p>
                          )}
                        </div>

                        {/* Cantidad */}
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
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ 
                              backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                              color: '#ecd2b4',
                              border: '1px solid rgba(236, 210, 180, 0.3)'
                            }}
                            placeholder="0.00"
                          />
                          {formErrors[`proceso_${index}_cantidad`] && (
                            <p className="text-red-400 text-sm mt-1">{formErrors[`proceso_${index}_cantidad`]}</p>
                          )}
                        </div>

                        {/* Unidad */}
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                            Unidad *
                          </label>
                          <select
                            value={proceso.unidad}
                            onChange={(e) => handleProcesoChange(index, 'unidad', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ 
                              backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                              color: '#ecd2b4',
                              border: '1px solid rgba(236, 210, 180, 0.3)'
                            }}
                          >
                            <option value="Kg" style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>Kg</option>
                            <option value="g" style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>g</option>
                            <option value="Unidad" style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>Unidad</option>
                          </select>
                        </div>

                        {/* Artesano */}
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                            Permisionario (Artesano) *
                          </label>
                          <select
                            value={proceso.artesano_id}
                            onChange={(e) => handleProcesoChange(index, 'artesano_id', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ 
                              backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                              color: '#ecd2b4',
                              border: '1px solid rgba(236, 210, 180, 0.3)'
                            }}
                          >
                            <option value="" style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>Seleccione un artesano</option>
                            {artesanos.map((artesano) => (
                              <option key={artesano.id} value={artesano.id} style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}>
                                {artesano.apellidos}, {artesano.nombres} - DNI: {artesano.dni}
                              </option>
                            ))}
                          </select>
                          {formErrors[`proceso_${index}_artesano_id`] && (
                            <p className="text-red-400 text-sm mt-1">{formErrors[`proceso_${index}_artesano_id`]}</p>
                          )}
                        </div>

                        {/* Fecha de certificación */}
                        <div>
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                            Fecha de Certificación *
                          </label>
                          <input
                            type="date"
                            value={proceso.fecha_certificacion}
                            onChange={(e) => handleProcesoChange(index, 'fecha_certificacion', e.target.value)}
                            required
                            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ 
                              backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                              color: '#ecd2b4',
                              border: '1px solid rgba(236, 210, 180, 0.3)'
                            }}
                          />
                          {formErrors[`proceso_${index}_fecha_certificacion`] && (
                            <p className="text-red-400 text-sm mt-1">{formErrors[`proceso_${index}_fecha_certificacion`]}</p>
                          )}
                        </div>

                        {/* Documentación de tenencia */}
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-2" style={{ color: '#ecd2b4' }}>
                            Documentación de Tenencia *
                          </label>
                          <textarea
                            value={proceso.documentacion_tenencia}
                            onChange={(e) => handleProcesoChange(index, 'documentacion_tenencia', e.target.value)}
                            required
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200"
                            style={{ 
                              backgroundColor: 'rgba(236, 210, 180, 0.1)', 
                              color: '#ecd2b4',
                              border: '1px solid rgba(236, 210, 180, 0.3)'
                            }}
                            placeholder="Documentación de tenencia"
                          />
                          {formErrors[`proceso_${index}_documentacion_tenencia`] && (
                            <p className="text-red-400 text-sm mt-1">{formErrors[`proceso_${index}_documentacion_tenencia`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Botones de acción */}
                <div className="mt-8 flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => router.push(`/admin/ctpsfs/${ctpsfsId}`)}
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