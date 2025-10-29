'use client'

import { useState, useEffect } from 'react'
import { supabase, Producto, ProductoWithRelations, Artesano, CTPSFS } from '../lib/supabase'
import { uploadProductPhoto, deleteProductPhoto, validateImageFile, createProductsBucketIfNotExists } from '../lib/storage'

interface TipoPrenda {
  id: number
  nombre: string
  descripcion?: string
}

interface ProductoFormProps {
  producto?: ProductoWithRelations
  onSuccess: () => void
  onCancel: () => void
}

export default function ProductoForm({ producto, onSuccess, onCancel }: ProductoFormProps) {
  const [formData, setFormData] = useState<Omit<Producto, 'id' | 'created_at' | 'updated_at'>>({
    nombre_prenda: '',
    tipo_prenda_id: undefined,
    artesano_id: 0,
    ctpsfs_id: undefined,
    localidad_origen: '',
    tecnicas_utilizadas: '',
    ancho_metros: 0,
    alto_metros: 0,
    tiempo_elaboracion_meses: 1,
    fotografias: []
  })

  const [artesanos, setArtesanos] = useState<Artesano[]>([])
  const [ctpsfs, setCTPSFS] = useState<CTPSFS[]>([])
  const [tiposPrendas, setTiposPrendas] = useState<TipoPrenda[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadArtesanos()
    loadCTPSFS()
    loadTiposPrendas()
    createProductsBucketIfNotExists() // Crear bucket si no existe

    if (producto) {
      setFormData({
        nombre_prenda: producto.nombre_prenda,
        tipo_prenda_id: producto.tipo_prenda_id,
        artesano_id: producto.artesano_id,
        ctpsfs_id: producto.ctpsfs_id,
        localidad_origen: producto.localidad_origen,
        tecnicas_utilizadas: producto.tecnicas_utilizadas,
        ancho_metros: producto.ancho_metros,
        alto_metros: producto.alto_metros,
        tiempo_elaboracion_meses: producto.tiempo_elaboracion_meses,
        peso_fibra_gramos: producto.peso_fibra_gramos || undefined,
        fotografias: producto.fotografias || []
      })
    }
  }, [producto])

  const loadArtesanos = async () => {
    try {
      const { data, error } = await supabase
        .from('artesanos')
        .select('*')
        .order('apellidos', { ascending: true })

      if (error) throw error
      setArtesanos(data || [])
    } catch (error) {
      console.error('Error loading artesanos:', error)
    }
  }

  const loadCTPSFS = async () => {
    try {
      const { data, error } = await supabase
        .from('ctpsfs')
        .select('*')
        .order('numero', { ascending: true })

      if (error) throw error
      setCTPSFS(data || [])
    } catch (error) {
      console.error('Error loading CTPSFS:', error)
    }
  }

  const loadTiposPrendas = async () => {
    try {
      const { data, error } = await supabase
        .from('tipos_prendas')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setTiposPrendas(data || [])
    } catch (error) {
      console.error('Error loading tipos de prendas:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }

    // Convertir valores numéricos
    let processedValue: any = value
    if (name === 'artesano_id' || name === 'ctpsfs_id' || name === 'tipo_prenda_id') {
      processedValue = value ? parseInt(value) : (name === 'ctpsfs_id' || name === 'tipo_prenda_id' ? undefined : 0)
    } else if (name === 'ancho_metros' || name === 'alto_metros') {
      processedValue = value ? parseFloat(value) : 0
    } else if (name === 'tiempo_elaboracion_meses') {
      processedValue = value ? parseInt(value) : 1
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }))
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    // Validar archivos
    const validFiles: File[] = []
    const newPreviewUrls: string[] = []
    
    for (const file of files) {
      const validation = validateImageFile(file)
      if (validation.valid) {
        validFiles.push(file)
        newPreviewUrls.push(URL.createObjectURL(file))
      } else {
        alert(`Error en archivo ${file.name}: ${validation.error}`)
      }
    }

    setPhotoFiles(prev => [...prev, ...validFiles])
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])
  }

  const removePhoto = (index: number, isExisting: boolean = false) => {
    if (isExisting) {
      // Remover foto existente
      setFormData(prev => ({
        ...prev,
        fotografias: prev.fotografias?.filter((_, i) => i !== index) || []
      }))
    } else {
      // Remover foto nueva
      const adjustedIndex = index - (formData.fotografias?.length || 0)
      setPhotoFiles(prev => prev.filter((_, i) => i !== adjustedIndex))
      setPreviewUrls(prev => {
        const newUrls = prev.filter((_, i) => i !== adjustedIndex)
        // Liberar URL del objeto
        if (prev[adjustedIndex]) {
          URL.revokeObjectURL(prev[adjustedIndex])
        }
        return newUrls
      })
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre_prenda.trim()) {
      newErrors.nombre_prenda = 'El nombre de la prenda es requerido'
    }

    if (!formData.artesano_id) {
      newErrors.artesano_id = 'Debe seleccionar un artesano'
    }

    if (!formData.localidad_origen.trim()) {
      newErrors.localidad_origen = 'La localidad de origen es requerida'
    }

    if (!formData.tecnicas_utilizadas.trim()) {
      newErrors.tecnicas_utilizadas = 'Las técnicas utilizadas son requeridas'
    }

    if (formData.ancho_metros <= 0) {
      newErrors.ancho_metros = 'El ancho debe ser mayor a 0'
    }

    if (formData.alto_metros <= 0) {
      newErrors.alto_metros = 'El alto debe ser mayor a 0'
    }

    if (formData.tiempo_elaboracion_meses <= 0) {
      newErrors.tiempo_elaboracion_meses = 'El tiempo de elaboración debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setUploadingPhotos(true)

    try {
      console.log('🚀 Iniciando proceso de guardado de producto...')
      console.log('📝 Datos del formulario:', formData)
      console.log('📸 Archivos de fotos:', photoFiles.length)
      
      let finalFormData = { ...formData }

      // Si estamos editando, primero guardamos el producto para obtener el ID
      if (producto) {
        console.log('✏️ Actualizando producto existente:', producto.id)
        // Actualizar producto existente
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            nombre_prenda: formData.nombre_prenda,
            artesano_id: formData.artesano_id,
            ctpsfs_id: formData.ctpsfs_id,
            localidad_origen: formData.localidad_origen,
            tecnicas_utilizadas: formData.tecnicas_utilizadas,
            ancho_metros: formData.ancho_metros,
            alto_metros: formData.alto_metros,
            tiempo_elaboracion_meses: formData.tiempo_elaboracion_meses
          })
          .eq('id', producto.id)

        if (updateError) {
          console.error('❌ Error actualizando producto:', updateError)
          throw updateError
        }
        console.log('✅ Producto actualizado exitosamente')

        // Subir nuevas fotografías si las hay
        if (photoFiles.length > 0) {
          console.log('📸 Subiendo nuevas fotografías...')
          const uploadedUrls: string[] = []
          
          for (let i = 0; i < photoFiles.length; i++) {
            console.log(`📸 Subiendo foto ${i + 1}/${photoFiles.length}...`)
            const url = await uploadProductPhoto(photoFiles[i], producto.id!, (formData.fotografias?.length || 0) + i)
            if (url) {
              uploadedUrls.push(url)
              console.log(`✅ Foto ${i + 1} subida exitosamente:`, url)
            } else {
              console.warn(`⚠️ No se pudo subir la foto ${i + 1}`)
            }
          }

          // Actualizar array de fotografías
          const allPhotos = [...(formData.fotografias || []), ...uploadedUrls]
          console.log('📸 Actualizando array de fotografías:', allPhotos)
          
          const { error: photoError } = await supabase
            .from('productos')
            .update({ fotografias: allPhotos })
            .eq('id', producto.id)

          if (photoError) {
            console.error('❌ Error actualizando fotografías:', photoError)
            throw photoError
          }
          console.log('✅ Fotografías actualizadas exitosamente')
        }

      } else {
        console.log('➕ Creando nuevo producto...')
        // Crear nuevo producto
        const { data: newProduct, error: insertError } = await supabase
          .from('productos')
          .insert([{
            nombre_prenda: formData.nombre_prenda,
            artesano_id: formData.artesano_id,
            ctpsfs_id: formData.ctpsfs_id,
            localidad_origen: formData.localidad_origen,
            tecnicas_utilizadas: formData.tecnicas_utilizadas,
            ancho_metros: formData.ancho_metros,
            alto_metros: formData.alto_metros,
            tiempo_elaboracion_meses: formData.tiempo_elaboracion_meses,
            fotografias: []
          }])
          .select()
          .single()

        if (insertError) {
          console.error('❌ Error insertando producto:', insertError)
          console.error('❌ Detalles del error:', {
            message: insertError.message,
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          })
          throw insertError
        }
        console.log('✅ Producto creado exitosamente:', newProduct)

        // Subir fotografías si las hay
        if (photoFiles.length > 0) {
          console.log('📸 Subiendo fotografías para nuevo producto...')
          const uploadedUrls: string[] = []
          
          for (let i = 0; i < photoFiles.length; i++) {
            console.log(`📸 Subiendo foto ${i + 1}/${photoFiles.length} para producto ${newProduct.id}...`)
            try {
              const url = await uploadProductPhoto(photoFiles[i], newProduct.id, i)
              if (url) {
                uploadedUrls.push(url)
                console.log(`✅ Foto ${i + 1} subida exitosamente:`, url)
              } else {
                console.warn(`⚠️ No se pudo subir la foto ${i + 1}`)
              }
            } catch (uploadError) {
              console.error(`❌ Error subiendo foto ${i + 1}:`, uploadError)
              // Continuamos con las demás fotos
            }
          }

          // Actualizar producto con URLs de fotografías
          if (uploadedUrls.length > 0) {
            console.log('📸 Actualizando producto con URLs de fotografías:', uploadedUrls)
            const { error: photoError } = await supabase
              .from('productos')
              .update({ fotografias: uploadedUrls })
              .eq('id', newProduct.id)

            if (photoError) {
              console.error('❌ Error actualizando fotografías en producto:', photoError)
              throw photoError
            }
            console.log('✅ Fotografías actualizadas en producto exitosamente')
          }
        }
      }

      // Limpiar URLs de preview
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      console.log('🎉 Proceso completado exitosamente')
      
      onSuccess()
    } catch (error) {
      console.error('💥 Error completo saving producto:', error)
      
      // Logging detallado del error
      if (error && typeof error === 'object') {
        console.error('📋 Detalles del error:', {
          name: (error as any).name,
          message: (error as any).message,
          stack: (error as any).stack,
          details: (error as any).details,
          hint: (error as any).hint,
          code: (error as any).code
        })
      }
      
      alert('Error al guardar el producto. Por favor, revise la consola para más detalles.')
    } finally {
      setLoading(false)
      setUploadingPhotos(false)
    }
  }

  const totalPhotos = (formData.fotografias?.length || 0) + photoFiles.length

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {producto ? 'Editar Producto' : 'Nuevo Producto'}
        </h2>
        <p className="text-gray-600 mt-1">
          {producto ? 'Modifica los datos del producto' : 'Completa la información del nuevo producto'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre de la prenda */}
          <div>
            <label htmlFor="nombre_prenda" className="block text-sm font-medium form-label mb-1">
              Nombre de la Prenda *
            </label>
            <input
              type="text"
              id="nombre_prenda"
              name="nombre_prenda"
              value={formData.nombre_prenda}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.nombre_prenda ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Chalina de vicuña"
            />
            {errors.nombre_prenda && (
              <p className="mt-1 text-sm text-red-600">{errors.nombre_prenda}</p>
            )}
          </div>

          {/* Tipo de Prenda */}
          <div>
            <label htmlFor="tipo_prenda_id" className="block text-sm font-medium form-label mb-1">
              Tipo de Prenda
            </label>
            <select
              id="tipo_prenda_id"
              name="tipo_prenda_id"
              value={formData.tipo_prenda_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              <option value="">Seleccionar tipo de prenda</option>
              {tiposPrendas.map(tipo => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Artesano */}
          <div>
            <label htmlFor="artesano_id" className="block text-sm font-medium form-label mb-1">
              Artesano *
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
              <option value="">Seleccionar artesano</option>
              {artesanos.map(artesano => (
                <option key={artesano.id} value={artesano.id}>
                  {artesano.apellidos}, {artesano.nombres} (DNI: {artesano.dni})
                </option>
              ))}
            </select>
            {errors.artesano_id && (
              <p className="mt-1 text-sm text-red-600">{errors.artesano_id}</p>
            )}
          </div>

          {/* CTPSFS */}
          <div>
            <label htmlFor="ctpsfs_id" className="block text-sm font-medium form-label mb-1">
              CTPSFS (Opcional)
            </label>
            <select
              id="ctpsfs_id"
              name="ctpsfs_id"
              value={formData.ctpsfs_id || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              <option value="">Sin CTPSFS asociado</option>
              {ctpsfs.map(cert => (
                <option key={cert.id} value={cert.id}>
                  CTPSFS N° {cert.numero} ({cert.año})
                </option>
              ))}
            </select>
          </div>

          {/* Localidad de origen */}
          <div>
            <label htmlFor="localidad_origen" className="block text-sm font-medium form-label mb-1">
              Localidad de Origen *
            </label>
            <input
              type="text"
              id="localidad_origen"
              name="localidad_origen"
              value={formData.localidad_origen}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.localidad_origen ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: Cusco, Perú"
            />
            {errors.localidad_origen && (
              <p className="mt-1 text-sm text-red-600">{errors.localidad_origen}</p>
            )}
          </div>
        </div>

        {/* Técnicas utilizadas */}
        <div>
          <label htmlFor="tecnicas_utilizadas" className="block text-sm font-medium form-label mb-1">
            Técnicas Utilizadas *
          </label>
          <textarea
            id="tecnicas_utilizadas"
            name="tecnicas_utilizadas"
            value={formData.tecnicas_utilizadas}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
              errors.tecnicas_utilizadas ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe las técnicas artesanales utilizadas..."
          />
          {errors.tecnicas_utilizadas && (
            <p className="mt-1 text-sm text-red-600">{errors.tecnicas_utilizadas}</p>
          )}
        </div>

        {/* Dimensiones, tiempo y peso */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Ancho */}
          <div>
            <label htmlFor="ancho_metros" className="block text-sm font-medium form-label mb-1">
              Ancho (metros) *
            </label>
            <input
              type="number"
              id="ancho_metros"
              name="ancho_metros"
              value={formData.ancho_metros}
              onChange={handleInputChange}
              step="0.001"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.ancho_metros ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.000"
            />
            {errors.ancho_metros && (
              <p className="mt-1 text-sm text-red-600">{errors.ancho_metros}</p>
            )}
          </div>

          {/* Alto */}
          <div>
            <label htmlFor="alto_metros" className="block text-sm font-medium form-label mb-1">
              Alto (metros) *
            </label>
            <input
              type="number"
              id="alto_metros"
              name="alto_metros"
              value={formData.alto_metros}
              onChange={handleInputChange}
              step="0.001"
              min="0"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.alto_metros ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.000"
            />
            {errors.alto_metros && (
              <p className="mt-1 text-sm text-red-600">{errors.alto_metros}</p>
            )}
          </div>

          {/* Tiempo de elaboración */}
          <div>
            <label htmlFor="tiempo_elaboracion_meses" className="block text-sm font-medium form-label mb-1">
              Tiempo de Elaboración (meses) *
            </label>
            <input
              type="number"
              id="tiempo_elaboracion_meses"
              name="tiempo_elaboracion_meses"
              value={formData.tiempo_elaboracion_meses}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input ${
                errors.tiempo_elaboracion_meses ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="1"
            />
            {errors.tiempo_elaboracion_meses && (
              <p className="mt-1 text-sm text-red-600">{errors.tiempo_elaboracion_meses}</p>
            )}
          </div>

          {/* Peso de fibra */}
          <div>
            <label htmlFor="peso_fibra_gramos" className="block text-sm font-medium form-label mb-1">
              Peso Fibra (gramos)
            </label>
            <input
              type="number"
              id="peso_fibra_gramos"
              name="peso_fibra_gramos"
              value={formData.peso_fibra_gramos || ''}
              onChange={handleInputChange}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Fotografías */}
        <div>
          <label className="block text-sm font-medium form-label mb-2">
            Fotografías ({totalPhotos}/10)
          </label>
          
          {/* Input para subir fotos */}
          {totalPhotos < 10 && (
            <div className="mb-4">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                onChange={handlePhotoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Formatos permitidos: JPEG, PNG, WebP. Tamaño máximo: 5MB por imagen.
              </p>
            </div>
          )}

          {/* Galería de fotos */}
          {(totalPhotos > 0) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Fotos existentes */}
              {formData.fotografias?.map((url, index) => (
                <div key={`existing-${index}`} className="relative group">
                  <img
                    src={url}
                    alt={`Foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(index, true)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                    Existente
                  </div>
                </div>
              ))}

              {/* Fotos nuevas */}
              {previewUrls.map((url, index) => (
                <div key={`new-${index}`} className="relative group">
                  <img
                    src={url}
                    alt={`Nueva foto ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto((formData.fotografias?.length || 0) + index, false)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                    Nueva
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading || uploadingPhotos}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (uploadingPhotos ? 'Subiendo fotos...' : 'Guardando...') : (producto ? 'Actualizar' : 'Guardar')}
          </button>
        </div>
      </form>
    </div>
  )
}