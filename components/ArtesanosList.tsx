'use client'

import { useState, useEffect } from 'react'
import { supabase, type Artesano, type ArtesanoWithRelations } from '@/lib/supabase'

interface ArtesanosListProps {
  onEdit?: (artesano: Artesano) => void
  refreshTrigger?: number
}

export default function ArtesanosList({ onEdit, refreshTrigger }: ArtesanosListProps) {
  const [artesanos, setArtesanos] = useState<ArtesanoWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchArtesanos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('artesanos')
        .select(`
          *,
          cooperativa:cooperativas(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setArtesanos(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los artesanos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArtesanos()
  }, [refreshTrigger])

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este artesano?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('artesanos')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      // Actualizar la lista local
      setArtesanos(prev => prev.filter(artesano => artesano.id !== id))
    } catch (error: any) {
      setError(error.message || 'Error al eliminar el artesano')
    }
  }

  const filteredArtesanos = artesanos.filter(artesano =>
    artesano.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artesano.apellidos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artesano.dni.includes(searchTerm)
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const calculateAge = (birthDate: string) => {
    const today = new Date()
    const birth = new Date(birthDate)
    let age = today.getFullYear() - birth.getFullYear()
    const monthDiff = today.getMonth() - birth.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    
    return age
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Cargando artesanos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Barra de búsqueda */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Lista de Artesanos</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
          />
          <button
            onClick={fetchArtesanos}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de artesanos */}
      {filteredArtesanos.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No se encontraron artesanos que coincidan con la búsqueda' : 'No hay artesanos registrados'}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtesanos.map((artesano) => (
            <div key={artesano.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Fotografía */}
              <div className="h-48 bg-gray-200 flex items-center justify-center">
                {artesano.fotografia_url ? (
                  <img
                    src={artesano.fotografia_url}
                    alt={`${artesano.nombres} ${artesano.apellidos}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm">Sin fotografía</p>
                  </div>
                )}
              </div>

              {/* Información */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {artesano.nombres} {artesano.apellidos}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="font-medium w-20">DNI:</span>
                    <span>{artesano.dni}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-20">Edad:</span>
                    <span>{calculateAge(artesano.fecha_nacimiento)} años</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="font-medium w-20">Domicilio:</span>
                    <span className="flex-1">{artesano.domicilio}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-20">Contacto:</span>
                    <span>{artesano.contacto}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-20">Cooperativa:</span>
                    <span>{artesano.cooperativa ? `${artesano.cooperativa.nombre} (${artesano.cooperativa.comunidad})` : 'Sin cooperativa'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="font-medium w-20">Registro:</span>
                    <span>{formatDate(artesano.created_at!)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2 mt-4">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(artesano)}
                      className="flex-1 bg-blue-600 text-white py-2 px-3 rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Editar
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(artesano.id!)}
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

      {/* Estadísticas */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Estadísticas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{artesanos.length}</div>
            <div className="text-sm text-gray-600">Total Artesanos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {artesanos.filter(a => a.fotografia_url).length}
            </div>
            <div className="text-sm text-gray-600">Con Fotografía</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {filteredArtesanos.length}
            </div>
            <div className="text-sm text-gray-600">Mostrados</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {artesanos.filter(a => calculateAge(a.fecha_nacimiento) >= 18).length}
            </div>
            <div className="text-sm text-gray-600">Mayores de edad</div>
          </div>
        </div>
      </div>
    </div>
  )
}