'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface TipoPrenda {
  id?: number
  nombre: string
  descripcion?: string
}

interface TipoPrendaFormProps {
  tipoPrenda?: TipoPrenda
  onSuccess: () => void
  onCancel: () => void
}

export default function TipoPrendaForm({ tipoPrenda, onSuccess, onCancel }: TipoPrendaFormProps) {
  const [formData, setFormData] = useState<TipoPrenda>({
    nombre: tipoPrenda?.nombre || '',
    descripcion: tipoPrenda?.descripcion || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (tipoPrenda?.id) {
        // Actualizar tipo de prenda existente
        const { error } = await supabase
          .from('tipos_prendas')
          .update({
            nombre: formData.nombre,
            descripcion: formData.descripcion
          })
          .eq('id', tipoPrenda.id)

        if (error) throw error
      } else {
        // Crear nuevo tipo de prenda
        const { error } = await supabase
          .from('tipos_prendas')
          .insert([{
            nombre: formData.nombre,
            descripcion: formData.descripcion
          }])

        if (error) throw error
      }

      onSuccess()
    } catch (error: unknown) {
      const e = error instanceof Error ? error : new Error(String(error))
      console.error('Error al guardar tipo de prenda:', e)
      setError(e.message || 'Error al guardar el tipo de prenda')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {tipoPrenda ? 'Editar Tipo de Prenda' : 'Nuevo Tipo de Prenda'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Poncho, Manta, Chalina..."
            />
          </div>

          <div>
            <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              id="descripcion"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descripción del tipo de prenda..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.nombre.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (tipoPrenda ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
