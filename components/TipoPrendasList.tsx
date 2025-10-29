'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import TipoPrendaForm from './TipoPrendaForm'

interface TipoPrenda {
  id: number
  nombre: string
  descripcion?: string
  created_at: string
  updated_at: string
}

export default function TipoPrendasList() {
  const [tiposPrendas, setTiposPrendas] = useState<TipoPrenda[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingTipoPrenda, setEditingTipoPrenda] = useState<TipoPrenda | undefined>()
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    fetchTiposPrendas()
  }, [])

  const fetchTiposPrendas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tipos_prendas')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setTiposPrendas(data || [])
    } catch (error: any) {
      console.error('Error al cargar tipos de prendas:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tipoPrenda: TipoPrenda) => {
    setEditingTipoPrenda(tipoPrenda)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    try {
      // Verificar si hay productos usando este tipo de prenda
      const { data: productos, error: checkError } = await supabase
        .from('productos')
        .select('id')
        .eq('tipo_prenda_id', id)
        .limit(1)

      if (checkError) throw checkError

      if (productos && productos.length > 0) {
        alert('No se puede eliminar este tipo de prenda porque está siendo utilizado por uno o más productos.')
        return
      }

      const { error } = await supabase
        .from('tipos_prendas')
        .delete()
        .eq('id', id)

      if (error) throw error

      setTiposPrendas(prev => prev.filter(tp => tp.id !== id))
      setDeleteConfirm(null)
    } catch (error: any) {
      console.error('Error al eliminar tipo de prenda:', error)
      alert('Error al eliminar el tipo de prenda: ' + error.message)
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingTipoPrenda(undefined)
    fetchTiposPrendas()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingTipoPrenda(undefined)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error al cargar tipos de prendas: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Tipos de Prendas</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Nuevo Tipo de Prenda
        </button>
      </div>

      {tiposPrendas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No hay tipos de prendas registrados</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Crear el primer tipo de prenda
          </button>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descripción
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tiposPrendas.map((tipoPrenda) => (
                <tr key={tipoPrenda.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {tipoPrenda.nombre}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {tipoPrenda.descripcion || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(tipoPrenda.created_at).toLocaleDateString('es-ES')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(tipoPrenda)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Editar
                    </button>
                    {deleteConfirm === tipoPrenda.id ? (
                      <div className="inline-flex space-x-2">
                        <button
                          onClick={() => handleDelete(tipoPrenda.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(tipoPrenda.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TipoPrendaForm
          tipoPrenda={editingTipoPrenda}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      )}
    </div>
  )
}