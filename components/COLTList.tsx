'use client'

import { useState, useEffect } from 'react'
import { supabase, COLTWithRelations } from '../lib/supabase'

interface COLTListProps {
  onEdit: (colt: COLTWithRelations) => void
  onNew: () => void
}

export default function COLTList({ onEdit, onNew }: COLTListProps) {
  const [colts, setColts] = useState<COLTWithRelations[]>([])
  const [filteredColts, setFilteredColts] = useState<COLTWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterYear, setFilterYear] = useState('')
  const [filterDestino, setFilterDestino] = useState('')

  useEffect(() => {
    loadColts()
  }, [])

  useEffect(() => {
    filterColts()
  }, [colts, searchTerm, filterYear, filterDestino])

  const loadColts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('colt')
        .select(`
          *,
          artesano:artesanos(*),
          chaku:chakus(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setColts(data || [])
    } catch (error) {
      console.error('Error al cargar COLTs:', error)
      alert('Error al cargar los certificados')
    } finally {
      setLoading(false)
    }
  }

  const filterColts = () => {
    let filtered = colts

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(colt =>
        colt.numero.toLowerCase().includes(term) ||
        colt.descripcion.toLowerCase().includes(term) ||
        colt.artesano?.nombres.toLowerCase().includes(term) ||
        colt.artesano?.apellidos.toLowerCase().includes(term) ||
        colt.artesano?.dni.includes(term) ||
        colt.chaku?.nombre.toLowerCase().includes(term) ||
        colt.documentacion_origen.toLowerCase().includes(term)
      )
    }

    if (filterYear) {
      filtered = filtered.filter(colt => colt.año.toString() === filterYear)
    }

    if (filterDestino) {
      filtered = filtered.filter(colt => colt.destino === filterDestino)
    }

    setFilteredColts(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este certificado COLT?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('colt')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadColts()
    } catch (error) {
      console.error('Error al eliminar COLT:', error)
      alert('Error al eliminar el certificado')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getUniqueYears = () => {
    const years = [...new Set(colts.map(colt => colt.año.toString()))]
    return years.sort((a, b) => parseInt(b) - parseInt(a))
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Certificados COLT</h2>
          <p className="text-gray-600 mt-1">
            Total: {filteredColts.length} certificado{filteredColts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={onNew}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Nuevo COLT
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium form-label mb-1">
              Buscar
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por número, artesano, DNI, chaku o descripción..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            />
          </div>
          <div>
            <label htmlFor="filterYear" className="block text-sm font-medium form-label mb-1">
              Filtrar por Año
            </label>
            <select
              id="filterYear"
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              <option value="">Todos los años</option>
              {getUniqueYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="filterDestino" className="block text-sm font-medium form-label mb-1">
              Filtrar por Destino
            </label>
            <select
              id="filterDestino"
              value={filterDestino}
              onChange={(e) => setFilterDestino(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 form-input"
            >
              <option value="">Todos los destinos</option>
              <option value="Transformación">Transformación</option>
              <option value="Comercialización">Comercialización</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de COLTs */}
      {filteredColts.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {colts.length === 0 ? 'No hay certificados registrados' : 'No se encontraron certificados'}
          </h3>
          <p className="text-gray-500 mb-4">
            {colts.length === 0 
              ? 'Comience registrando su primer certificado COLT'
              : 'Intente ajustar los filtros de búsqueda'
            }
          </p>
          {colts.length === 0 && (
            <button
              onClick={onNew}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Registrar Primer COLT
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredColts.map((colt) => (
            <div key={colt.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      COLT N° {colt.numero}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      colt.destino === 'Transformación' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {colt.destino}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-2">{colt.descripcion}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => onEdit(colt)}
                    className="text-blue-600 hover:text-blue-800 p-2"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(colt.id!)}
                    className="text-red-600 hover:text-red-800 p-2"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Artesano:</span>
                  <p className="text-gray-900">
                    {colt.artesano?.apellidos}, {colt.artesano?.nombres}
                  </p>
                  <p className="text-gray-600">DNI: {colt.artesano?.dni}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Cantidad:</span>
                  <p className="text-gray-900">{colt.cantidad} {colt.unidad}</p>
                  <span className="font-medium text-gray-700">Materia Prima:</span>
                  <p className="text-gray-900">{colt.materia_prima}</p>
                </div>

                <div>
                  <span className="font-medium text-gray-700">Procedencia:</span>
                  <p className="text-gray-900">{colt.lugar_procedencia}</p>
                  {colt.chaku && (
                    <>
                      <span className="font-medium text-gray-700">Chaku:</span>
                      <p className="text-gray-900">{colt.chaku.nombre}</p>
                    </>
                  )}
                </div>

                <div>
                  <span className="font-medium text-gray-700">Año:</span>
                  <p className="text-gray-900">{colt.año}</p>
                  <span className="font-medium text-gray-700">Fecha Expedición:</span>
                  <p className="text-gray-900">{formatDate(colt.fecha_expedicion)}</p>
                </div>

                <div className="md:col-span-2">
                  <span className="font-medium text-gray-700">Documentación de Origen:</span>
                  <p className="text-gray-900">{colt.documentacion_origen}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                Registrado: {formatDate(colt.created_at!)}
                {colt.updated_at !== colt.created_at && (
                  <span> • Actualizado: {formatDate(colt.updated_at!)}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Estadísticas */}
      {colts.length > 0 && (
        <div className="mt-8 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Estadísticas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{colts.length}</div>
              <div className="text-gray-600">Total COLTs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {colts.filter(c => c.destino === 'Transformación').length}
              </div>
              <div className="text-gray-600">Transformación</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {colts.filter(c => c.destino === 'Comercialización').length}
              </div>
              <div className="text-gray-600">Comercialización</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {colts.reduce((sum, c) => sum + c.cantidad, 0).toFixed(2)}
              </div>
              <div className="text-gray-600">Total Kg</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}