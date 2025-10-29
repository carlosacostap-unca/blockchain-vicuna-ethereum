'use client'

import { useState, useEffect } from 'react'
import { supabase, type Cooperativa } from '@/lib/supabase'

interface CooperativasListProps {
  onEdit?: (cooperativa: Cooperativa) => void
  refreshTrigger?: number
}

export default function CooperativasList({ onEdit, refreshTrigger }: CooperativasListProps) {
  const [cooperativas, setCooperativas] = useState<Cooperativa[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchCooperativas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('cooperativas')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCooperativas(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar las cooperativas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCooperativas()
  }, [refreshTrigger])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta cooperativa?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('cooperativas')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Actualizar la lista después de eliminar
      setCooperativas(prev => prev.filter(c => c.id !== id))
    } catch (error: any) {
      setError(error.message || 'Error al eliminar la cooperativa')
    }
  }

  const filteredCooperativas = cooperativas.filter(cooperativa =>
    cooperativa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cooperativa.comunidad.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Buscar por nombre o comunidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Lista de cooperativas */}
      {filteredCooperativas.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No se encontraron cooperativas que coincidan con la búsqueda' : 'No hay cooperativas registradas'}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCooperativas.map((cooperativa) => (
            <div key={cooperativa.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {cooperativa.nombre}
                  </h3>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Comunidad:</span> {cooperativa.comunidad}
                  </p>
                </div>

                {cooperativa.created_at && (
                  <div>
                    <p className="text-xs text-gray-500">
                      Registrada: {new Date(cooperativa.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-3">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(cooperativa)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Editar
                    </button>
                  )}
                  
                  <button
                    onClick={() => cooperativa.id && handleDelete(cooperativa.id)}
                    className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="text-sm text-gray-600 text-center">
        Total: {filteredCooperativas.length} cooperativa{filteredCooperativas.length !== 1 ? 's' : ''}
        {searchTerm && ` (filtrado de ${cooperativas.length})`}
      </div>
    </div>
  )
}