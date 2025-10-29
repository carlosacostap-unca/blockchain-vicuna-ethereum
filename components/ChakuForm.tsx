'use client'

import { useState } from 'react'
import { supabase, type Chaku } from '@/lib/supabase'

interface ChakuFormProps {
  chaku?: Chaku
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ChakuForm({ chaku, onSuccess, onCancel }: ChakuFormProps) {
  const [formData, setFormData] = useState<Partial<Chaku>>({
    nombre: chaku?.nombre || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Validar campos requeridos
      if (!formData.nombre?.trim()) {
        setError('El nombre es obligatorio')
        setLoading(false)
        return
      }

      if (chaku) {
        // Actualizar chaku existente
        const { error } = await supabase
          .from('chakus')
          .update({ nombre: formData.nombre.trim() })
          .eq('id', chaku.id)

        if (error) throw error
      } else {
        // Crear nuevo chaku
        const { error } = await supabase
          .from('chakus')
          .insert([{ nombre: formData.nombre.trim() }])

        if (error) throw error
      }

      onSuccess?.()
    } catch (error: any) {
      setError(error.message || 'Error al guardar el chaku')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {chaku ? 'Editar Chaku' : 'Registrar Nuevo Chaku'}
      </h2>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium form-label mb-1">
            Nombre del Chaku *
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingrese el nombre del chaku"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent form-input"
            required
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : (chaku ? 'Actualizar' : 'Registrar')}
          </button>
          
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}