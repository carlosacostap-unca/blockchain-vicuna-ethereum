'use client'

import { useState } from 'react'
import { supabase, type Cooperativa } from '@/lib/supabase'

interface CooperativaFormProps {
  cooperativa?: Cooperativa
  onSuccess?: () => void
  onCancel?: () => void
}

export default function CooperativaForm({ cooperativa, onSuccess, onCancel }: CooperativaFormProps) {
  const [formData, setFormData] = useState<Partial<Cooperativa>>({
    nombre: cooperativa?.nombre || '',
    comunidad: cooperativa?.comunidad || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.nombre || !formData.comunidad) {
        throw new Error('Todos los campos son obligatorios')
      }

      if (cooperativa?.id) {
        // Actualizar cooperativa existente
        const { error } = await supabase
          .from('cooperativas')
          .update({
            nombre: formData.nombre,
            comunidad: formData.comunidad,
            updated_at: new Date().toISOString()
          })
          .eq('id', cooperativa.id)

        if (error) throw error
      } else {
        // Crear nueva cooperativa
        const { error } = await supabase
          .from('cooperativas')
          .insert([{
            nombre: formData.nombre,
            comunidad: formData.comunidad,
          }])

        if (error) throw error
      }

      onSuccess?.()
    } catch (err) {
      console.error('Error al guardar cooperativa:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {cooperativa ? 'Editar Cooperativa' : 'Nueva Cooperativa'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="nombre" className="block text-sm font-medium form-label mb-2">
            Nombre de la Cooperativa *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            required
          />
        </div>

        <div>
          <label htmlFor="comunidad" className="block text-sm font-medium form-label mb-2">
            Comunidad *
          </label>
          <input
            type="text"
            id="comunidad"
            name="comunidad"
            value={formData.comunidad}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : (cooperativa ? 'Actualizar' : 'Crear')}
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