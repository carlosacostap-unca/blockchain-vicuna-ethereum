'use client'

import { useState, useEffect } from 'react'
import { supabase, ProductoWithRelations } from '../lib/supabase'
import { deleteAllProductPhotos } from '../lib/storage'

interface ProductosListProps {
  onEdit: (producto: ProductoWithRelations) => void
  onNew: () => void
  onView: (producto: ProductoWithRelations) => void
  refreshTrigger?: number
}

export default function ProductosList({ onEdit, onNew, onView, refreshTrigger }: ProductosListProps) {
  const [productos, setProductos] = useState<ProductoWithRelations[]>([])
  const [filteredProductos, setFilteredProductos] = useState<ProductoWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedArtesano, setSelectedArtesano] = useState('')
  const [selectedCTPSFS, setSelectedCTPSFS] = useState('')
  const [selectedLocalidad, setSelectedLocalidad] = useState('')
  const [sortBy, setSortBy] = useState<'nombre' | 'artesano' | 'fecha' | 'tiempo'>('fecha')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedProduct, setSelectedProduct] = useState<ProductoWithRelations | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)

  // Opciones únicas para filtros
  const [artesanos, setArtesanos] = useState<string[]>([])
  const [ctpsfsOptions, setCTPSFSOptions] = useState<string[]>([])
  const [localidades, setLocalidades] = useState<string[]>([])

  useEffect(() => {
    loadProductos()
  }, [refreshTrigger])

  useEffect(() => {
    applyFilters()
  }, [productos, searchTerm, selectedArtesano, selectedCTPSFS, selectedLocalidad, sortBy, sortOrder])

  const loadProductos = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          artesano:artesanos(id, nombres, apellidos, dni),
          ctpsfs:ctpsfs(id, numero, año)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      const productosWithRelations = data?.map(producto => ({
        ...producto,
        artesano: producto.artesano,
        ctpsfs: producto.ctpsfs
      })) || []

      setProductos(productosWithRelations)

      // Extraer opciones únicas para filtros
      const uniqueArtesanos = [...new Set(productosWithRelations.map(p => 
        p.artesano ? `${p.artesano.apellidos}, ${p.artesano.nombres}` : ''
      ))].filter(Boolean)
      
      const uniqueCTPSFS = [...new Set(productosWithRelations.map(p => 
        p.ctpsfs ? `CTPSFS N° ${p.ctpsfs.numero} (${p.ctpsfs.año})` : ''
      ))].filter(Boolean)
      
      const uniqueLocalidades = [...new Set(productosWithRelations.map(p => p.localidad_origen))]

      setArtesanos(uniqueArtesanos)
      setCTPSFSOptions(uniqueCTPSFS)
      setLocalidades(uniqueLocalidades)

    } catch (error) {
      console.error('Error loading productos:', error)
      alert('Error al cargar los productos')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...productos]

    // Filtro por término de búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(producto =>
        producto.nombre_prenda.toLowerCase().includes(term) ||
        producto.localidad_origen.toLowerCase().includes(term) ||
        producto.tecnicas_utilizadas.toLowerCase().includes(term) ||
        (producto.artesano && 
          (`${producto.artesano.nombres} ${producto.artesano.apellidos}`.toLowerCase().includes(term) ||
           producto.artesano.dni.includes(term)))
      )
    }

    // Filtro por artesano
    if (selectedArtesano) {
      filtered = filtered.filter(producto =>
        producto.artesano && 
        `${producto.artesano.apellidos}, ${producto.artesano.nombres}` === selectedArtesano
      )
    }

    // Filtro por CTPSFS
    if (selectedCTPSFS) {
      filtered = filtered.filter(producto =>
        producto.ctpsfs && 
        `CTPSFS N° ${producto.ctpsfs.numero} (${producto.ctpsfs.año})` === selectedCTPSFS
      )
    }

    // Filtro por localidad
    if (selectedLocalidad) {
      filtered = filtered.filter(producto => producto.localidad_origen === selectedLocalidad)
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'nombre':
          comparison = a.nombre_prenda.localeCompare(b.nombre_prenda)
          break
        case 'artesano':
          const artesanoA = a.artesano ? `${a.artesano.apellidos}, ${a.artesano.nombres}` : ''
          const artesanoB = b.artesano ? `${b.artesano.apellidos}, ${b.artesano.nombres}` : ''
          comparison = artesanoA.localeCompare(artesanoB)
          break
        case 'fecha':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'tiempo':
          comparison = a.tiempo_elaboracion_meses - b.tiempo_elaboracion_meses
          break
      }

      return sortOrder === 'asc' ? comparison : -comparison
    })

    setFilteredProductos(filtered)
  }

  const handleDelete = async (producto: ProductoWithRelations) => {
    if (!confirm(`¿Está seguro de que desea eliminar el producto "${producto.nombre_prenda}"?`)) {
      return
    }

    try {
      // Eliminar fotografías del storage
      if (producto.fotografias && producto.fotografias.length > 0) {
        await deleteAllProductPhotos(producto.id!)
      }

      // Eliminar producto de la base de datos
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', producto.id)

      if (error) throw error

      // Recargar lista
      loadProductos()
      alert('Producto eliminado exitosamente')
    } catch (error) {
      console.error('Error deleting producto:', error)
      alert('Error al eliminar el producto')
    }
  }

  const openImageModal = (producto: ProductoWithRelations, imageIndex: number = 0) => {
    setSelectedProduct(producto)
    setSelectedImageIndex(imageIndex)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
    setSelectedProduct(null)
    setSelectedImageIndex(0)
  }

  const nextImage = () => {
    if (selectedProduct && selectedProduct.fotografias) {
      setSelectedImageIndex((prev) => 
        prev < selectedProduct.fotografias!.length - 1 ? prev + 1 : 0
      )
    }
  }

  const prevImage = () => {
    if (selectedProduct && selectedProduct.fotografias) {
      setSelectedImageIndex((prev) => 
        prev > 0 ? prev - 1 : selectedProduct.fotografias!.length - 1
      )
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedArtesano('')
    setSelectedCTPSFS('')
    setSelectedLocalidad('')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando productos...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Productos</h2>
          <p className="text-gray-600 mt-1">
            {filteredProductos.length} de {productos.length} productos
          </p>
        </div>
        <button
          onClick={onNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Nombre, artesano, localidad..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filtro por artesano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Artesano
            </label>
            <select
              value={selectedArtesano}
              onChange={(e) => setSelectedArtesano(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los artesanos</option>
              {artesanos.map(artesano => (
                <option key={artesano} value={artesano}>{artesano}</option>
              ))}
            </select>
          </div>

          {/* Filtro por CTPSFS */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CTPSFS
            </label>
            <select
              value={selectedCTPSFS}
              onChange={(e) => setSelectedCTPSFS(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los CTPSFS</option>
              {ctpsfsOptions.map(ctpsfs => (
                <option key={ctpsfs} value={ctpsfs}>{ctpsfs}</option>
              ))}
            </select>
          </div>

          {/* Filtro por localidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localidad
            </label>
            <select
              value={selectedLocalidad}
              onChange={(e) => setSelectedLocalidad(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todas las localidades</option>
              {localidades.map(localidad => (
                <option key={localidad} value={localidad}>{localidad}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Controles de ordenamiento y vista */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            {/* Ordenamiento */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Ordenar por:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="fecha">Fecha</option>
                <option value="nombre">Nombre</option>
                <option value="artesano">Artesano</option>
                <option value="tiempo">Tiempo de elaboración</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>

            {/* Limpiar filtros */}
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Limpiar filtros
            </button>
          </div>

          {/* Modo de vista */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Vista:</label>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Cuadrícula
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Lista
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de productos */}
      {filteredProductos.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
          <p className="text-gray-500 text-lg">No se encontraron productos</p>
          <p className="text-gray-400 mt-2">
            {productos.length === 0 
              ? 'Comience creando su primer producto' 
              : 'Intente ajustar los filtros de búsqueda'
            }
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {filteredProductos.map(producto => (
            <div
              key={producto.id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              {/* Imagen principal */}
              {producto.fotografias && producto.fotografias.length > 0 && (
                <div 
                  className={`cursor-pointer ${
                    viewMode === 'list' ? 'w-32 h-32 flex-shrink-0' : 'h-48'
                  }`}
                  onClick={() => openImageModal(producto, 0)}
                >
                  <img
                    src={producto.fotografias[0]}
                    alt={producto.nombre_prenda}
                    className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                  />
                  {producto.fotografias.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      +{producto.fotografias.length - 1}
                    </div>
                  )}
                </div>
              )}

              {/* Contenido */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={viewMode === 'list' ? 'flex justify-between items-start' : ''}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="font-semibold text-lg text-gray-800 mb-2">
                      {producto.nombre_prenda}
                    </h3>
                    
                    <div className="space-y-1 text-sm text-gray-600 mb-3">
                      <p>
                        <span className="font-medium">Artesano:</span>{' '}
                        {producto.artesano 
                          ? `${producto.artesano.apellidos}, ${producto.artesano.nombres}`
                          : 'No asignado'
                        }
                      </p>
                      {producto.tipo_prenda && (
                        <p>
                          <span className="font-medium">Tipo:</span> {producto.tipo_prenda.nombre}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Localidad:</span> {producto.localidad_origen}
                      </p>
                      <p>
                        <span className="font-medium">Dimensiones:</span>{' '}
                        {producto.ancho_metros}m × {producto.alto_metros}m
                      </p>
                      <p>
                        <span className="font-medium">Tiempo:</span> {producto.tiempo_elaboracion_meses} meses
                      </p>
                      {producto.peso_fibra_gramos && (
                        <p>
                          <span className="font-medium">Peso fibra:</span> {producto.peso_fibra_gramos}g
                        </p>
                      )}
                      {producto.ctpsfs && (
                        <p>
                          <span className="font-medium">CTPSFS:</span>{' '}
                          N° {producto.ctpsfs.numero} ({producto.ctpsfs.año})
                        </p>
                      )}
                    </div>

                    {viewMode === 'grid' && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        <span className="font-medium">Técnicas:</span> {producto.tecnicas_utilizadas}
                      </p>
                    )}
                  </div>

                  {/* Botones de acción */}
                  <div className={`flex gap-2 ${viewMode === 'list' ? 'flex-col' : 'justify-end'}`}>
                    <button
                      onClick={() => onView(producto)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      Ver Detalle
                    </button>
                    <button
                      onClick={() => onEdit(producto)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(producto)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de imágenes */}
      {showImageModal && selectedProduct && selectedProduct.fotografias && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            {/* Botón cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ×
            </button>

            {/* Imagen */}
            <img
              src={selectedProduct.fotografias[selectedImageIndex]}
              alt={`${selectedProduct.nombre_prenda} - Imagen ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navegación */}
            {selectedProduct.fotografias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300"
                >
                  ›
                </button>
              </>
            )}

            {/* Indicador de imagen */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded">
              {selectedImageIndex + 1} de {selectedProduct.fotografias.length}
            </div>

            {/* Información del producto */}
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-3 rounded max-w-xs">
              <h4 className="font-semibold">{selectedProduct.nombre_prenda}</h4>
              <p className="text-sm">
                {selectedProduct.artesano 
                  ? `${selectedProduct.artesano.apellidos}, ${selectedProduct.artesano.nombres}`
                  : 'Artesano no asignado'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}