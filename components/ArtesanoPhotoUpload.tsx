'use client'

import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { uploadArtesanoPhoto } from '@/lib/storage'

interface ArtesanoPhotoUploadProps {
  artesanoId?: number
  onPhotoUploaded: (photoUrl: string) => void
  currentPhotoUrl?: string
  disabled?: boolean
}

export default function ArtesanoPhotoUpload({ 
  artesanoId, 
  onPhotoUploaded, 
  currentPhotoUrl, 
  disabled = false 
}: ArtesanoPhotoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Validar archivo
  const validateFile = (file: File): string | null => {
    // Verificar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return 'Solo se permiten archivos JPG, PNG o WebP'
    }

    // Verificar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return 'El archivo no puede ser mayor a 5MB'
    }

    return null
  }

  // Verificar autenticación antes de subir
  const checkAuthentication = async (): Promise<boolean> => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.error('❌ [AUTH CHECK] Usuario no autenticado:', error?.message)
        setError('Debes estar logueado para subir fotografías. Por favor, inicia sesión.')
        return false
      }
      
      console.log('✅ [AUTH CHECK] Usuario autenticado:', user.email)
      return true
    } catch (err) {
      console.error('❌ [AUTH CHECK] Error verificando autenticación:', err)
      setError('Error verificando autenticación. Inténtalo de nuevo.')
      return false
    }
  }

  // Manejar subida de archivo
  const handleFileUpload = async (file: File) => {
    setError(null)
    
    // Verificar autenticación primero
    const isAuthenticated = await checkAuthentication()
    if (!isAuthenticated) {
      return
    }
    
    // Validar archivo
    const validationError = validateFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploading(true)

    try {
      // Usar un ID temporal si no hay artesanoId (para formulario de creación)
      const tempId = artesanoId || Date.now()
      const photoUrl = await uploadArtesanoPhoto(file, tempId)
      
      if (photoUrl) {
        console.log('✅ [PHOTO UPLOAD] URL generada exitosamente:', photoUrl)
        onPhotoUploaded(photoUrl)
        setPreviewUrl(photoUrl)
        setError(null)
      } else {
        console.error('❌ [PHOTO UPLOAD] No se generó URL')
        setError('Error al subir la fotografía. Inténtalo de nuevo.')
        setPreviewUrl(null)
      }
    } catch (err) {
      console.error('Error uploading photo:', err)
      setError(err instanceof Error ? err.message : 'Error al subir la fotografía')
      setPreviewUrl(null)
    } finally {
      setUploading(false)
    }
  }

  // Manejar cambio en input de archivo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  // Manejar drag and drop
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [disabled])

  // Abrir selector de archivos
  const openFileSelector = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  // Limpiar preview
  const clearPreview = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {/* Área de subida */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        style={{ 
          borderColor: dragActive ? '#60a5fa' : '#ecd2b4',
          backgroundColor: dragActive ? 'rgba(96, 165, 250, 0.1)' : disabled ? 'rgba(0,0,0,0.05)' : 'transparent'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileSelector}
      >
        {uploading ? (
          <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#ecd2b4' }}></div>
            <p className="text-sm" style={{ color: '#ecd2b4' }}>Subiendo fotografía...</p>
          </div>
        ) : previewUrl ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full max-h-48 rounded-lg shadow-md"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  clearPreview()
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                ×
              </button>
            </div>
            <p className="text-sm" style={{ color: '#ecd2b4' }}>
              Haz clic para cambiar la fotografía
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(236, 210, 180, 0.2)' }}>
              <svg className="w-6 h-6" style={{ color: '#ecd2b4' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                Haz clic para seleccionar o arrastra una fotografía
              </p>
              <p className="text-xs mt-1" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                JPG, PNG o WebP (máximo 5MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Información adicional */}
      <div className="text-xs" style={{ color: '#ecd2b4', opacity: 0.7 }}>
        <p>• La fotografía se subirá automáticamente al seleccionarla</p>
        <p>• Formatos soportados: JPG, PNG, WebP</p>
        <p>• Tamaño máximo: 5MB</p>
      </div>
    </div>
  )
}