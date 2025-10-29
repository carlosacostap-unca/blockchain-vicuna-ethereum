'use client'

import { useState, useRef, useEffect } from 'react'
import { supabase, type Artesano, type Cooperativa } from '@/lib/supabase'

interface ArtesanoFormProps {
  artesano?: Artesano
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ArtesanoForm({ artesano, onSuccess, onCancel }: ArtesanoFormProps) {
  const [formData, setFormData] = useState<Partial<Artesano>>({
    nombres: artesano?.nombres || '',
    apellidos: artesano?.apellidos || '',
    domicilio: artesano?.domicilio || '',
    dni: artesano?.dni || '',
    fecha_nacimiento: artesano?.fecha_nacimiento || '',
    contacto: artesano?.contacto || '',
    cooperativa_id: artesano?.cooperativa_id || undefined,
  })
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'cooperativa_id' ? (value ? parseInt(value) : undefined) : value 
    }))
  }

  // Cargar cooperativas disponibles
  useEffect(() => {
    const fetchCooperativas = async () => {
      try {
        const { data, error } = await supabase
          .from('cooperativas')
          .select('*')
          .order('nombre')

        if (error) throw error
        setCooperativas(data || [])
      } catch (error) {
        console.error('Error al cargar cooperativas:', error)
      }
    }

    fetchCooperativas()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido')
        return
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede ser mayor a 5MB')
        return
      }
      setSelectedFile(file)
      setError(null)
    }
  }

  const uploadPhoto = async (file: File, artesanoId: number): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${artesanoId}-${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('artesanos-fotos')
        .upload(filePath, file)

      if (uploadError) {
        console.error('Error uploading file:', uploadError)
        return null
      }

      const { data } = supabase.storage
        .from('artesanos-fotos')
        .getPublicUrl(filePath)

      return data.publicUrl
    } catch (error) {
      console.error('Error in uploadPhoto:', error)
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.nombres || !formData.apellidos || !formData.domicilio || 
          !formData.dni || !formData.fecha_nacimiento || !formData.contacto) {
        setError('Todos los campos son obligatorios')
        setLoading(false)
        return
      }

      let fotografiaUrl = artesano?.fotografia_url || null

      if (artesano) {
        // Actualizar artesano existente
        const updateData: Partial<Artesano> = { ...formData }
        
        if (selectedFile) {
          fotografiaUrl = await uploadPhoto(selectedFile, artesano.id!)
          updateData.fotografia_url = fotografiaUrl
        }

        const { error } = await supabase
          .from('artesanos')
          .update(updateData)
          .eq('id', artesano.id)

        if (error) throw error
      } else {
        // Crear nuevo artesano
        const { data, error } = await supabase
          .from('artesanos')
          .insert([formData])
          .select()
          .single()

        if (error) throw error

        // Subir foto si se seleccionó una
        if (selectedFile && data) {
          fotografiaUrl = await uploadPhoto(selectedFile, data.id)
          
          // Actualizar el registro con la URL de la foto
          if (fotografiaUrl) {
            await supabase
              .from('artesanos')
              .update({ fotografia_url: fotografiaUrl })
              .eq('id', data.id)
          }
        }
      }

      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Error al guardar el artesano')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {artesano ? 'Editar Artesano' : 'Registrar Nuevo Artesano'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="nombres" className="block text-sm font-medium form-label mb-1">
              Nombres *
            </label>
            <input
              type="text"
              id="nombres"
              name="nombres"
              value={formData.nombres}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            />
          </div>

          <div>
            <label htmlFor="apellidos" className="block text-sm font-medium form-label mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              id="apellidos"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="domicilio" className="block text-sm font-medium form-label mb-1">
            Domicilio *
          </label>
          <textarea
            id="domicilio"
            name="domicilio"
            value={formData.domicilio}
            onChange={handleInputChange}
            required
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="dni" className="block text-sm font-medium form-label mb-1">
              DNI *
            </label>
            <input
              type="text"
              id="dni"
              name="dni"
              value={formData.dni}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            />
          </div>

          <div>
            <label htmlFor="fecha_nacimiento" className="block text-sm font-medium form-label mb-1">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              id="fecha_nacimiento"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            />
          </div>
        </div>

        <div>
          <label htmlFor="contacto" className="block text-sm font-medium form-label mb-1">
            Contacto *
          </label>
          <input
            type="text"
            id="contacto"
            name="contacto"
            value={formData.contacto}
            onChange={handleInputChange}
            required
            placeholder="Teléfono, email, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
          />
        </div>

        <div>
          <label htmlFor="cooperativa_id" className="block text-sm font-medium form-label mb-1">
            Cooperativa
          </label>
          <select
            id="cooperativa_id"
            name="cooperativa_id"
            value={formData.cooperativa_id || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
          >
            <option value="">Sin cooperativa</option>
            {cooperativas.map((cooperativa) => (
              <option key={cooperativa.id} value={cooperativa.id}>
                {cooperativa.nombre} - {cooperativa.comunidad}
              </option>
            ))}
          </select>
          <p className="text-sm form-text-muted mt-1">
            Selecciona la cooperativa a la que pertenece el artesano (opcional)
          </p>
        </div>

        <div>
          <label htmlFor="fotografia" className="block text-sm font-medium form-label mb-1">
            Fotografía
          </label>
          <input
            type="file"
            id="fotografia"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
          />
          <p className="text-sm form-text-muted mt-1">
            Formatos permitidos: JPG, PNG, GIF. Tamaño máximo: 5MB
          </p>
        </div>

        {artesano?.fotografia_url && (
          <div>
            <label className="block text-sm font-medium form-label mb-1">
              Fotografía actual
            </label>
            <img
              src={artesano.fotografia_url}
              alt="Foto actual"
              className="w-32 h-32 object-cover rounded-md border"
            />
          </div>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (artesano ? 'Actualizar' : 'Registrar')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}