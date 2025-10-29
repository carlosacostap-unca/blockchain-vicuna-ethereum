'use client'

import { useState, useEffect } from 'react'
import { supabase, CTPSFSWithRelations } from '../lib/supabase'

interface CTPSFSListProps {
  onEdit: (ctpsfs: CTPSFSWithRelations) => void
  onNew: () => void
  refreshTrigger?: number
}

export default function CTPSFSList({ onEdit, onNew, refreshTrigger }: CTPSFSListProps) {
  const [ctpsfs, setCTPSFS] = useState<CTPSFSWithRelations[]>([])
  const [filteredCTPSFS, setFilteredCTPSFS] = useState<CTPSFSWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [chakuFilter, setChakuFilter] = useState('')
  const [availableYears, setAvailableYears] = useState<number[]>([])
  const [availableChakus, setAvailableChakus] = useState<{id: number, nombre: string}[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null)

  useEffect(() => {
    loadCTPSFS()
  }, [refreshTrigger])

  useEffect(() => {
    filterCTPSFS()
  }, [ctpsfs, searchTerm, yearFilter, chakuFilter])

  const loadCTPSFS = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('ctpsfs')
        .select(`
          *,
          chaku:chakus(id, nombre),
          procesos_transformacion:ctpsfs_procesos_transformacion(
            *,
            artesano:artesanos(id, nombres, apellidos, dni)
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const ctpsfsData = data as CTPSFSWithRelations[]
      setCTPSFS(ctpsfsData)

      // Extraer años únicos para el filtro
      const years = [...new Set(ctpsfsData.map(c => c.año))].sort((a, b) => b - a)
      setAvailableYears(years)

      // Extraer chakus únicos para el filtro
      const chakus = ctpsfsData
        .filter(c => c.chaku)
        .map(c => c.chaku!)
        .filter((chaku, index, self) => 
          index === self.findIndex(c => c.id === chaku.id)
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre))
        .map(chaku => ({ id: chaku.id!, nombre: chaku.nombre }))
      setAvailableChakus(chakus)

    } catch (error) {
      console.error('Error al cargar CTPSFS:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterCTPSFS = () => {
    let filtered = ctpsfs

    // Filtrar por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(c => 
        c.numero.toLowerCase().includes(term) ||
        c.descripcion_producto.toLowerCase().includes(term) ||
        c.documentacion_origen.toLowerCase().includes(term) ||
        (c.chaku?.nombre.toLowerCase().includes(term)) ||
        c.procesos_transformacion?.some(p => 
          p.descripcion_producto.toLowerCase().includes(term) ||
          p.documentacion_tenencia.toLowerCase().includes(term) ||
          (p.artesano && (
            p.artesano.nombres.toLowerCase().includes(term) ||
            p.artesano.apellidos.toLowerCase().includes(term) ||
            p.artesano.dni.includes(term)
          ))
        )
      )
    }

    // Filtrar por año
    if (yearFilter) {
      filtered = filtered.filter(c => c.año.toString() === yearFilter)
    }

    // Filtrar por chaku
    if (chakuFilter) {
      filtered = filtered.filter(c => c.chaku?.id?.toString() === chakuFilter)
    }

    setFilteredCTPSFS(filtered)
  }

  const handleDelete = async (id: number) => {
    try {
      // Primero eliminar los procesos de transformación
      await supabase
        .from('ctpsfs_procesos_transformacion')
        .delete()
        .eq('ctpsfs_id', id)

      // Luego eliminar el CTPSFS
      const { error } = await supabase
        .from('ctpsfs')
        .delete()
        .eq('id', id)

      if (error) throw error

      // Recargar la lista
      loadCTPSFS()
      setDeleteConfirm(null)
    } catch (error) {
      console.error('Error al eliminar CTPSFS:', error)
      alert('Error al eliminar el certificado. Por favor, intente nuevamente.')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getTotalQuantity = (procesos: any[]) => {
    return procesos.reduce((total, proceso) => total + proceso.cantidad, 0).toFixed(3)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de nuevo */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          Certificados CTPSFS ({filteredCTPSFS.length})
        </h2>
        <button
          onClick={onNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Nuevo CTPSFS
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium form-label mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, descripción, chaku, artesano..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            />
          </div>

          {/* Filtro por año */}
          <div>
            <label htmlFor="year-filter" className="block text-sm font-medium form-label mb-1">
              Año
            </label>
            <select
              id="year-filter"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              <option value="">Todos los años</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {/* Filtro por chaku */}
          <div>
            <label htmlFor="chaku-filter" className="block text-sm font-medium form-label mb-1">
              Chaku
            </label>
            <select
              id="chaku-filter"
              value={chakuFilter}
              onChange={(e) => setChakuFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              <option value="">Todos los chakus</option>
              {availableChakus.map(chaku => (
                <option key={chaku.id} value={chaku.id}>{chaku.nombre}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Botón para limpiar filtros */}
        {(searchTerm || yearFilter || chakuFilter) && (
          <div className="mt-4">
            <button
              onClick={() => {
                setSearchTerm('')
                setYearFilter('')
                setChakuFilter('')
              }}
              className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Lista de CTPSFS */}
      {filteredCTPSFS.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 text-lg mb-2">
            {ctpsfs.length === 0 ? 'No hay certificados CTPSFS registrados' : 'No se encontraron certificados con los filtros aplicados'}
          </div>
          {ctpsfs.length === 0 && (
            <button
              onClick={onNew}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Crear el primer CTPSFS
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCTPSFS.map((ctpsfs) => (
            <div key={ctpsfs.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Header del certificado */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">
                        CTPSFS N° {ctpsfs.numero}
                      </h3>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {ctpsfs.año}
                      </span>
                      {ctpsfs.chaku && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                          {ctpsfs.chaku.nombre}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">
                      <strong>Producto:</strong> {ctpsfs.descripcion_producto}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      <strong>Procesos:</strong> {ctpsfs.procesos_transformacion?.length || 0} | 
                      <strong> Cantidad Total:</strong> {getTotalQuantity(ctpsfs.procesos_transformacion || [])} Kg
                    </p>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => onEdit(ctpsfs)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => ctpsfs.id && setDeleteConfirm(ctpsfs.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>

              {/* Detalles del certificado */}
              <div className="px-6 py-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información general */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Información General</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Documentación de Origen:</strong></p>
                      <p className="text-gray-600 pl-2">{ctpsfs.documentacion_origen}</p>
                      <p><strong>Fecha de Registro:</strong> {ctpsfs.created_at ? formatDate(ctpsfs.created_at) : 'N/A'}</p>
                      {ctpsfs.updated_at !== ctpsfs.created_at && (
                        <p><strong>Última Actualización:</strong> {ctpsfs.updated_at ? formatDate(ctpsfs.updated_at) : 'N/A'}</p>
                      )}
                    </div>
                  </div>

                  {/* Procesos de transformación */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Procesos de Transformación</h4>
                    {ctpsfs.procesos_transformacion && ctpsfs.procesos_transformacion.length > 0 ? (
                      <div className="space-y-3">
                        {ctpsfs.procesos_transformacion.map((proceso, index) => (
                          <div key={proceso.id} className="bg-blue-50 p-3 rounded border border-blue-200">
                            <div className="text-sm">
                              <p className="text-gray-800"><strong>Proceso {index + 1}:</strong> {proceso.descripcion_producto}</p>
                              <p className="text-gray-800"><strong>Cantidad:</strong> {proceso.cantidad} {proceso.unidad}</p>
                              <p className="text-gray-800"><strong>Fecha Certificación:</strong> {formatDate(proceso.fecha_certificacion)}</p>
                              {proceso.artesano && (
                                <p className="text-gray-800"><strong>Permisionario:</strong> {proceso.artesano.apellidos}, {proceso.artesano.nombres} (DNI: {proceso.artesano.dni})</p>
                              )}
                              <p className="text-gray-800"><strong>Documentación:</strong></p>
                              <p className="text-gray-700 text-sm pl-2 mt-1 leading-relaxed">{proceso.documentacion_tenencia}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No hay procesos de transformación registrados</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea eliminar este certificado CTPSFS? Esta acción no se puede deshacer y también eliminará todos los procesos de transformación asociados.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}