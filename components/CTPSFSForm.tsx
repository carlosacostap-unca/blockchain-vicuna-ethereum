'use client'

import { useState, useEffect } from 'react'
import { supabase, CTPSFS, CTPSFSProcesoTransformacion, Artesano, Chaku, CTPSFSWithRelations } from '../lib/supabase'

interface CTPSFSFormProps {
  ctpsfs?: CTPSFSWithRelations
  onSuccess: () => void
  onCancel: () => void
}

interface ProcesoTransformacionForm {
  descripcion_producto: string
  cantidad: string
  unidad: string
  documentacion_tenencia: string
  fecha_certificacion: string
  artesano_id: string
}

export default function CTPSFSForm({ ctpsfs, onSuccess, onCancel }: CTPSFSFormProps) {
  const [formData, setFormData] = useState({
    numero: '',
    descripcion_producto: '',
    chaku_id: '',
    año: new Date().getFullYear().toString(),
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

  const [artesanos, setArtesanos] = useState<Artesano[]>([])
  const [chakus, setChakus] = useState<Chaku[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar artesanos y chakus
  useEffect(() => {
    loadArtesanos()
    loadChakus()
  }, [])

  // Cargar datos del CTPSFS si está editando
  useEffect(() => {
    if (ctpsfs) {
      setFormData({
        numero: ctpsfs.numero,
        descripcion_producto: ctpsfs.descripcion_producto,
        chaku_id: ctpsfs.chaku_id?.toString() || '',
        año: ctpsfs.año.toString(),
        documentacion_origen: ctpsfs.documentacion_origen
      })

      // Cargar procesos de transformación existentes
      if (ctpsfs.procesos_transformacion && ctpsfs.procesos_transformacion.length > 0) {
        setProcesos(ctpsfs.procesos_transformacion.map(proceso => ({
          descripcion_producto: proceso.descripcion_producto,
          cantidad: proceso.cantidad.toString(),
          unidad: proceso.unidad,
          documentacion_tenencia: proceso.documentacion_tenencia,
          fecha_certificacion: proceso.fecha_certificacion,
          artesano_id: proceso.artesano_id.toString()
        })))
      }
    }
  }, [ctpsfs])

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
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
    if (errors[errorKey]) {
      setErrors(prev => ({
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar datos principales
    if (!formData.numero.trim()) {
      newErrors.numero = 'El número es requerido'
    }
    if (!formData.descripcion_producto.trim()) {
      newErrors.descripcion_producto = 'La descripción del producto es requerida'
    }
    if (!formData.año) {
      newErrors.año = 'El año es requerido'
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      let ctpsfsId: number

      if (ctpsfs?.id) {
        // Actualizar CTPSFS existente
        const { error: updateError } = await supabase
          .from('ctpsfs')
          .update({
            numero: formData.numero,
            descripcion_producto: formData.descripcion_producto,
            chaku_id: formData.chaku_id ? parseInt(formData.chaku_id) : null,
            año: parseInt(formData.año),
            documentacion_origen: formData.documentacion_origen
          })
          .eq('id', ctpsfs.id)

        if (updateError) throw updateError
        ctpsfsId = ctpsfs.id

        // Eliminar procesos existentes
        await supabase
          .from('ctpsfs_procesos_transformacion')
          .delete()
          .eq('ctpsfs_id', ctpsfsId)
      } else {
        // Crear nuevo CTPSFS
        const { data: newCTPSFS, error: insertError } = await supabase
          .from('ctpsfs')
          .insert({
            numero: formData.numero,
            descripcion_producto: formData.descripcion_producto,
            chaku_id: formData.chaku_id ? parseInt(formData.chaku_id) : null,
            año: parseInt(formData.año),
            documentacion_origen: formData.documentacion_origen
          })
          .select()
          .single()

        if (insertError) throw insertError
        ctpsfsId = newCTPSFS.id
      }

      // Insertar procesos de transformación
      const procesosToInsert = procesos.map(proceso => ({
        ctpsfs_id: ctpsfsId,
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

      onSuccess()
    } catch (error) {
      console.error('Error al guardar CTPSFS:', error)
      setErrors({ submit: 'Error al guardar el certificado. Por favor, intente nuevamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {ctpsfs ? 'Editar CTPSFS' : 'Nuevo CTPSFS'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Datos principales del CTPSFS */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Datos del Certificado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Número */}
            <div>
              <label htmlFor="numero" className="block text-sm font-medium form-label mb-2">
                Número *
              </label>
              <input
                type="text"
                id="numero"
                name="numero"
                value={formData.numero}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                  errors.numero ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ingrese el número del CTPSFS"
              />
              {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
            </div>

            {/* Chaku */}
            <div>
              <label htmlFor="chaku_id" className="block text-sm font-medium form-label mb-2">
                Chaku
              </label>
              <select
                id="chaku_id"
                name="chaku_id"
                value={formData.chaku_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
              >
                <option value="">Seleccione un chaku (opcional)</option>
                {chakus.map((chaku) => (
                  <option key={chaku.id} value={chaku.id}>
                    {chaku.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div>
              <label htmlFor="año" className="block text-sm font-medium form-label mb-2">
                Año *
              </label>
              <input
                type="number"
                id="año"
                name="año"
                value={formData.año}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear()}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                  errors.año ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.año && <p className="text-red-500 text-sm mt-1">{errors.año}</p>}
            </div>
          </div>

          {/* Descripción del producto */}
          <div className="mt-6">
            <label htmlFor="descripcion_producto" className="block text-sm font-medium form-label mb-2">
              Descripción Detallada del Producto *
            </label>
            <textarea
              id="descripcion_producto"
              name="descripcion_producto"
              value={formData.descripcion_producto}
              onChange={handleInputChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.descripcion_producto ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describa detalladamente el producto..."
            />
            {errors.descripcion_producto && <p className="text-red-500 text-sm mt-1">{errors.descripcion_producto}</p>}
          </div>

          {/* Documentación de origen */}
          <div className="mt-6">
            <label htmlFor="documentacion_origen" className="block text-sm font-medium form-label mb-2">
              Documentación de Origen *
            </label>
            <textarea
              id="documentacion_origen"
              name="documentacion_origen"
              value={formData.documentacion_origen}
              onChange={handleInputChange}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.documentacion_origen ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Detalle la documentación que ampara el origen..."
            />
            {errors.documentacion_origen && <p className="text-red-500 text-sm mt-1">{errors.documentacion_origen}</p>}
          </div>
        </div>

        {/* Procesos de Transformación */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Procesos de Transformación</h3>
            <button
              type="button"
              onClick={addProceso}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + Agregar Proceso
            </button>
          </div>

          {procesos.map((proceso, index) => (
            <div key={index} className="bg-white p-4 rounded-lg mb-4 border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-md font-medium text-gray-700">Proceso {index + 1}</h4>
                {procesos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeProceso(index)}
                    className="text-red-600 hover:text-red-800 focus:outline-none"
                  >
                    ✕ Eliminar
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Descripción del producto */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium form-label mb-1">
                    Descripción del Producto *
                  </label>
                  <input
                    type="text"
                    value={proceso.descripcion_producto}
                    onChange={(e) => handleProcesoChange(index, 'descripcion_producto', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                      errors[`proceso_${index}_descripcion_producto`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Descripción del producto transformado"
                  />
                  {errors[`proceso_${index}_descripcion_producto`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`proceso_${index}_descripcion_producto`]}</p>
                  )}
                </div>

                {/* Cantidad */}
                <div>
                  <label className="block text-sm font-medium form-label mb-1">
                    Cantidad *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0"
                    value={proceso.cantidad}
                    onChange={(e) => handleProcesoChange(index, 'cantidad', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                      errors[`proceso_${index}_cantidad`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.000"
                  />
                  {errors[`proceso_${index}_cantidad`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`proceso_${index}_cantidad`]}</p>
                  )}
                </div>

                {/* Unidad */}
                <div>
                  <label className="block text-sm font-medium form-label mb-1">
                    Unidad
                  </label>
                  <input
                    type="text"
                    value={proceso.unidad}
                    onChange={(e) => handleProcesoChange(index, 'unidad', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
                    placeholder="Kg"
                  />
                </div>

                {/* Fecha de certificación */}
                <div>
                  <label className="block text-sm font-medium form-label mb-1">
                    Fecha de Certificación *
                  </label>
                  <input
                    type="date"
                    value={proceso.fecha_certificacion}
                    onChange={(e) => handleProcesoChange(index, 'fecha_certificacion', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                      errors[`proceso_${index}_fecha_certificacion`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors[`proceso_${index}_fecha_certificacion`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`proceso_${index}_fecha_certificacion`]}</p>
                  )}
                </div>

                {/* Permisionario */}
                <div>
                  <label className="block text-sm font-medium form-label mb-1">
                    Permisionario (Artesano) *
                  </label>
                  <select
                    value={proceso.artesano_id}
                    onChange={(e) => handleProcesoChange(index, 'artesano_id', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                      errors[`proceso_${index}_artesano_id`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccione un artesano</option>
                    {artesanos.map((artesano) => (
                      <option key={artesano.id} value={artesano.id}>
                        {artesano.apellidos}, {artesano.nombres} - DNI: {artesano.dni}
                      </option>
                    ))}
                  </select>
                  {errors[`proceso_${index}_artesano_id`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`proceso_${index}_artesano_id`]}</p>
                  )}
                </div>

                {/* Documentación de tenencia */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium form-label mb-1">
                    Documentación que Ampara la Tenencia *
                  </label>
                  <textarea
                    value={proceso.documentacion_tenencia}
                    onChange={(e) => handleProcesoChange(index, 'documentacion_tenencia', e.target.value)}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                      errors[`proceso_${index}_documentacion_tenencia`] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Detalle la documentación que ampara la tenencia..."
                  />
                  {errors[`proceso_${index}_documentacion_tenencia`] && (
                    <p className="text-red-500 text-sm mt-1">{errors[`proceso_${index}_documentacion_tenencia`]}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error general */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600 text-sm">{errors.submit}</p>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Guardando...' : ctpsfs ? 'Actualizar' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}