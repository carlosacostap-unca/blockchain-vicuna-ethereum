'use client'

import { useState, useEffect } from 'react'
import { supabase, COLT, Artesano, Chaku, UNIDAD_OPTIONS, MATERIA_PRIMA_OPTIONS, PROCEDENCIA_OPTIONS, DESTINO_OPTIONS, ProcedenciaTipo, DestinoTipo } from '../lib/supabase'

interface COLTFormProps {
  colt?: COLT
  onSuccess: () => void
  onCancel: () => void
}

export default function COLTForm({ colt, onSuccess, onCancel }: COLTFormProps) {
  const [formData, setFormData] = useState({
    numero: '',
    artesano_id: '',
    unidad: 'Kg' as const,
    cantidad: '',
    materia_prima: 'Vicugna vicugna' as const,
    descripcion: '',
    lugar_procedencia: 'En silvestría' as ProcedenciaTipo,
    chaku_id: '',
    año: new Date().getFullYear().toString(),
    documentacion_origen: '',
    destino: 'Transformación' as DestinoTipo,
    fecha_expedicion: new Date().toISOString().split('T')[0]
  })

  const [artesanos, setArtesanos] = useState<Artesano[]>([])
  const [chakus, setChakus] = useState<Chaku[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar artesanos y chakus
  useEffect(() => {
    loadArtesanos()
    loadChakus()
  }, [])

  // Cargar datos del COLT si está editando
  useEffect(() => {
    if (colt) {
      setFormData({
        numero: colt.numero,
        artesano_id: colt.artesano_id.toString(),
        unidad: colt.unidad,
        cantidad: colt.cantidad.toString(),
        materia_prima: colt.materia_prima,
        descripcion: colt.descripcion,
        lugar_procedencia: colt.lugar_procedencia,
        chaku_id: colt.chaku_id?.toString() || '',
        año: colt.año.toString(),
        documentacion_origen: colt.documentacion_origen,
        destino: colt.destino,
        fecha_expedicion: colt.fecha_expedicion
      })
    }
  }, [colt])

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.numero.trim()) {
      newErrors.numero = 'El número es requerido'
    }

    if (!formData.artesano_id) {
      newErrors.artesano_id = 'Debe seleccionar un artesano'
    }

    if (!formData.cantidad || parseFloat(formData.cantidad) <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }

    if (!formData.año || parseInt(formData.año) < 1900 || parseInt(formData.año) > new Date().getFullYear()) {
      newErrors.año = 'El año debe ser válido'
    }

    if (!formData.documentacion_origen.trim()) {
      newErrors.documentacion_origen = 'La documentación de origen es requerida'
    }

    if (!formData.fecha_expedicion) {
      newErrors.fecha_expedicion = 'La fecha de expedición es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)

    try {
      const coltData = {
        numero: formData.numero.trim(),
        artesano_id: parseInt(formData.artesano_id),
        unidad: formData.unidad,
        cantidad: parseFloat(formData.cantidad),
        materia_prima: formData.materia_prima,
        descripcion: formData.descripcion.trim(),
        lugar_procedencia: formData.lugar_procedencia,
        chaku_id: formData.chaku_id ? parseInt(formData.chaku_id) : null,
        año: parseInt(formData.año),
        documentacion_origen: formData.documentacion_origen.trim(),
        destino: formData.destino,
        fecha_expedicion: formData.fecha_expedicion
      }

      if (colt) {
        // Actualizar COLT existente
        const { error } = await supabase
          .from('colt')
          .update(coltData)
          .eq('id', colt.id)

        if (error) throw error
      } else {
        // Crear nuevo COLT
        const { error } = await supabase
          .from('colt')
          .insert([coltData])

        if (error) throw error
      }

      onSuccess()
    } catch (error) {
      console.error('Error al guardar COLT:', error)
      alert('Error al guardar el certificado. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        {colt ? 'Editar COLT' : 'Nuevo COLT'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              placeholder="Ingrese el número del COLT"
            />
            {errors.numero && <p className="text-red-500 text-sm mt-1">{errors.numero}</p>}
          </div>

          {/* Artesano */}
          <div>
            <label htmlFor="artesano_id" className="block text-sm font-medium form-label mb-2">
              Autoriza a (Artesano) *
            </label>
            <select
              id="artesano_id"
              name="artesano_id"
              value={formData.artesano_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.artesano_id ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Seleccione un artesano</option>
              {artesanos.map((artesano) => (
                <option key={artesano.id} value={artesano.id}>
                  {artesano.apellidos}, {artesano.nombres} - DNI: {artesano.dni}
                </option>
              ))}
            </select>
            {errors.artesano_id && <p className="text-red-500 text-sm mt-1">{errors.artesano_id}</p>}
          </div>

          {/* Unidad */}
          <div>
            <label htmlFor="unidad" className="block text-sm font-medium form-label mb-2">
              Unidad
            </label>
            <select
              id="unidad"
              name="unidad"
              value={formData.unidad}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              {UNIDAD_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div>
            <label htmlFor="cantidad" className="block text-sm font-medium form-label mb-2">
              Cantidad *
            </label>
            <input
              type="number"
              id="cantidad"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.cantidad ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.cantidad && <p className="text-red-500 text-sm mt-1">{errors.cantidad}</p>}
          </div>

          {/* Materia Prima */}
          <div>
            <label htmlFor="materia_prima" className="block text-sm font-medium form-label mb-2">
              Materia Prima
            </label>
            <select
              id="materia_prima"
              name="materia_prima"
              value={formData.materia_prima}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              {MATERIA_PRIMA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Lugar de Procedencia */}
          <div>
            <label htmlFor="lugar_procedencia" className="block text-sm font-medium form-label mb-2">
              Lugar de Procedencia
            </label>
            <select
              id="lugar_procedencia"
              name="lugar_procedencia"
              value={formData.lugar_procedencia}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              {PROCEDENCIA_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
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

          {/* Destino */}
          <div>
            <label htmlFor="destino" className="block text-sm font-medium form-label mb-2">
              Destino o Motivo de la Tenencia
            </label>
            <select
              id="destino"
              name="destino"
              value={formData.destino}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              {DESTINO_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de Expedición */}
          <div>
            <label htmlFor="fecha_expedicion" className="block text-sm font-medium form-label mb-2">
              Fecha de Expedición *
            </label>
            <input
              type="date"
              id="fecha_expedicion"
              name="fecha_expedicion"
              value={formData.fecha_expedicion}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.fecha_expedicion ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.fecha_expedicion && <p className="text-red-500 text-sm mt-1">{errors.fecha_expedicion}</p>}
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium form-label mb-2">
            Descripción *
          </label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
              errors.descripcion ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Descripción detallada del certificado"
          />
          {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
        </div>

        {/* Documentación de Origen */}
        <div>
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
            placeholder="Documentación que respalda el origen"
          />
          {errors.documentacion_origen && <p className="text-red-500 text-sm mt-1">{errors.documentacion_origen}</p>}
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (colt ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  )
}