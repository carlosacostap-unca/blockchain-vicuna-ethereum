'use client'

import { useState, useEffect } from 'react'
import { supabase, type Chaku } from '@/lib/supabase'

interface ChakusListProps {
  onEdit?: (chaku: Chaku) => void
}

export default function ChakusList({ onEdit }: ChakusListProps) {
  const [chakus, setChakus] = useState<Chaku[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleting, setDeleting] = useState<number | null>(null)

  useEffect(() => {
    fetchChakus()
  }, [])

  const fetchChakus = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('chakus')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setChakus(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los chakus')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este chaku?')) {
      return
    }

    try {
      setDeleting(id)
      const { error } = await supabase
        .from('chakus')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setChakus(prev => prev.filter(chaku => chaku.id !== id))
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el chaku')
    } finally {
      setDeleting(null)
    }
  }

  const filteredChakus = chakus.filter(chaku =>
    chaku.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lista de Chakus</h2>
        
        {/* Estadísticas */}
        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <p className="text-blue-800">
            Total de chakus registrados: <span className="font-semibold">{chakus.length}</span>
          </p>
        </div>

        {/* Buscador */}
        <div className="mb-6">
          <label htmlFor="search" className="block text-sm font-medium form-label mb-1">
            Buscar
          </label>
          <input
            type="text"
            id="search"
            placeholder="Buscar por nombre del chaku..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {filteredChakus.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">
            {searchTerm ? 'No se encontraron chakus que coincidan con la búsqueda' : 'No hay chakus registrados'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChakus.map((chaku) => (
            <div key={chaku.id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {chaku.nombre}
                </h3>
                
                <div className="text-sm text-gray-500 space-y-1">
                  <p>
                    <span className="font-medium">Registrado:</span>{' '}
                    {chaku.created_at ? new Date(chaku.created_at).toLocaleDateString('es-ES') : 'N/A'}
                  </p>
                  {chaku.updated_at && chaku.updated_at !== chaku.created_at && (
                    <p>
                      <span className="font-medium">Actualizado:</span>{' '}
                      {new Date(chaku.updated_at).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(chaku)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Editar
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(chaku.id!)}
                  disabled={deleting === chaku.id}
                  className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting === chaku.id ? 'Eliminando...' : 'Eliminar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}