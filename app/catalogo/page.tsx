'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, ProductoWithRelations } from '../../lib/supabase'

export default function CatalogoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [productos, setProductos] = useState<ProductoWithRelations[]>([])
  const [filteredProductos, setFilteredProductos] = useState<ProductoWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<ProductoWithRelations | null>(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleNavigation = (section: string) => {
    if (section === 'inicio') {
      router.push('/')
    } else if (section === 'productos') {
      router.push('/productos')
    } else if (section === 'catalogo') {
      // Ya estamos en catálogo, no hacer nada
      return
    } else {
      // Para otras secciones, navegar a la página principal
      router.push('/')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Buscando:', searchTerm)
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAccessOption = (accessType: string) => {
    console.log(`Acceso ${accessType} seleccionado`)
    setIsMenuOpen(false)
    
    // Lógica de navegación específica para cada tipo de acceso
    switch (accessType) {
      case 'Administrador':
        router.push('/admin')
        break
      case 'Artesano':
        router.push('/artesano')
        break
      case 'Cooperativa':
        console.log('Navegando a panel de Cooperativa')
        router.push('/cooperativa')
        break
      default:
        console.log(`Tipo de acceso no reconocido: ${accessType}`)
    }
  }

  useEffect(() => {
    loadProductos()
  }, [])

  useEffect(() => {
    // Filtrar productos basado en el término de búsqueda
    if (searchTerm.trim() === '') {
      setFilteredProductos(productos)
    } else {
      const filtered = productos.filter(producto =>
        producto.nombre_prenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.localidad_origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
        producto.tecnicas_utilizadas.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (producto.artesano && 
          `${producto.artesano.nombres} ${producto.artesano.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredProductos(filtered)
    }
  }, [productos, searchTerm])

  const loadProductos = async () => {
    setLoading(true)
    setError(null)
    try {
      // First check if we can connect to Supabase
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          artesano:artesanos!artesano_id(id, nombres, apellidos, dni),
          ctpsfs:ctpsfs!ctpsfs_id(id, numero, ano)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setError(`Error de base de datos: ${error.message}`)
        throw error
      }

      const productosWithRelations = data || []
      console.log('Productos loaded successfully:', productosWithRelations.length, 'items')
      setProductos(productosWithRelations)
      setFilteredProductos(productosWithRelations)

    } catch (error: any) {
      console.error('Error loading productos:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Set error message for user
      if (!error.message) {
        setError('Error de conexión: No se pudo conectar a la base de datos. Verifica que Supabase esté configurado correctamente.')
      } else {
        setError(`Error: ${error.message}`)
      }
      
      // Set empty arrays to prevent UI errors
      setProductos([])
      setFilteredProductos([])
    } finally {
      setLoading(false)
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
    if (selectedProduct?.fotografias && selectedImageIndex < selectedProduct.fotografias.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1)
    }
  }

  const prevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1)
    }
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Copiado de HomePage */}
      <header className="shadow-lg relative" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <div className="flex-shrink-0">
              <h1 className="text-xl tracking-wide font-maria-david" style={{ color: '#ecd2b4' }}>RUTA DEL TELAR</h1>
            </div>

            {/* Navegación */}
            <nav className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <button
                  onClick={() => handleNavigation('inicio')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  INICIO
                </button>
                <button
                  onClick={() => handleNavigation('catalogo')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  CATÁLOGO
                </button>
                <button
                  onClick={() => handleNavigation('productos')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  PRODUCTOS
                </button>
                <button
                  onClick={() => handleNavigation('enlaces')}
                  className="px-3 py-2 text-sm nav-menu-item transition-colors duration-200 hover:opacity-80"
                  style={{ color: '#ecd2b4' }}
                >
                  ENLACES
                </button>
              </div>
            </nav>

            {/* Barra de búsqueda y menú hamburguesa */}
            <div className="flex items-center space-x-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="BUSCAR..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input-custom"
                />
              </form>
              
              {/* Menú hamburguesa con tres líneas verticales */}
              <div className="relative">
                <button
                  className="flex flex-row justify-center items-center w-8 h-8 space-x-1 hover:opacity-80 transition-opacity duration-200"
                  onClick={handleMenuToggle}
                >
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                </button>

                {/* Menú desplegable */}
                {isMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg z-50" style={{ backgroundColor: '#0f324b' }}>
                    <div className="py-1">
                      <button
                        onClick={() => handleAccessOption('Administrador')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Administrador
                      </button>
                      <button
                        onClick={() => handleAccessOption('Artesano')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Artesano
                      </button>
                      <button
                        onClick={() => handleAccessOption('Cooperativa')}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Acceso Cooperativa
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Menú móvil (hamburguesa) */}
            <div className="md:hidden">
              <button className="hover:opacity-80" style={{ color: '#ecd2b4' }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay para cerrar el menú */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Título de la página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0f324b' }}>
            CATÁLOGO DE PRODUCTOS
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: '#0f324b' }}>
            Descubre nuestra colección de productos artesanales elaborados con fibra de vicuña, 
            cada uno con su historia y trazabilidad completa.
          </p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6 rounded-lg shadow-md" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#ecd2b4' }}>
              {filteredProductos.length}
            </div>
            <div className="text-sm" style={{ color: '#ecd2b4' }}>
              Productos Disponibles
            </div>
          </div>
          <div className="text-center p-6 rounded-lg shadow-md" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#ecd2b4' }}>
              {new Set(productos.map(p => p.artesano?.id)).size}
            </div>
            <div className="text-sm" style={{ color: '#ecd2b4' }}>
              Artesanos Participantes
            </div>
          </div>
          <div className="text-center p-6 rounded-lg shadow-md" style={{ backgroundColor: '#0f324b' }}>
            <div className="text-3xl font-bold mb-2" style={{ color: '#ecd2b4' }}>
              {new Set(productos.map(p => p.localidad_origen)).size}
            </div>
            <div className="text-sm" style={{ color: '#ecd2b4' }}>
              Localidades de Origen
            </div>
          </div>
        </div>

        {/* Lista de productos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-xl" style={{ color: '#0f324b' }}>Cargando productos...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-xl mb-4" style={{ color: '#d32f2f' }}>
              {error}
            </div>
            <button
              onClick={loadProductos}
              className="px-6 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
              style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
            >
              Reintentar
            </button>
          </div>
        ) : filteredProductos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-xl mb-4" style={{ color: '#0f324b' }}>
              {searchTerm ? 'No se encontraron productos que coincidan con tu búsqueda' : 'No hay productos disponibles en este momento'}
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-6 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
              >
                Limpiar búsqueda
              </button>
            )}
            </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProductos.map((producto) => (
              <div
                key={producto.id}
                className="rounded-lg shadow-lg overflow-hidden transition-transform duration-200 hover:scale-105"
                style={{ backgroundColor: 'white' }}
              >
                {/* Imagen del producto */}
                <div className="relative h-64 overflow-hidden">
                  {producto.fotografias && producto.fotografias.length > 0 ? (
                    <img
                      src={producto.fotografias[0]}
                      alt={producto.nombre_prenda}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => openImageModal(producto, 0)}
                    />
                  ) : (
                    <div 
                      className="w-full h-full flex items-center justify-center"
                      style={{ backgroundColor: '#f3f4f6' }}
                    >
                      <svg className="w-16 h-16" style={{ color: '#9ca3af' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {producto.fotografias && producto.fotografias.length > 1 && (
                    <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs" style={{ backgroundColor: 'rgba(15, 50, 75, 0.8)', color: '#ecd2b4' }}>
                      +{producto.fotografias.length - 1} fotos
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#0f324b' }}>
                    {producto.nombre_prenda}
                  </h3>
                  
                  {producto.artesano && (
                    <div className="text-sm mb-2" style={{ color: '#6b7280' }}>
                      Artesano: {producto.artesano.nombres} {producto.artesano.apellidos}
                    </div>
                  )}

                  <div className="text-sm mb-2" style={{ color: '#6b7280' }}>
                    Origen: {producto.localidad_origen}
                  </div>

                  <div className="text-sm mb-4" style={{ color: '#6b7280' }}>
                    Dimensiones: {producto.ancho_metros}m × {producto.alto_metros}m
                  </div>

                  <div className="text-sm mb-4" style={{ color: '#0f324b' }}>
                    Técnicas: {producto.tecnicas_utilizadas}
                  </div>

                  <button
                    onClick={() => openImageModal(producto, 0)}
                    className="w-full px-4 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
                  >
                    Ver Detalles
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de imagen */}
      {showImageModal && selectedProduct && selectedProduct.fotografias && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedProduct.fotografias[selectedImageIndex]}
              alt={selectedProduct.nombre_prenda}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Botón cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navegación de imágenes */}
            {selectedProduct.fotografias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={selectedImageIndex === 0}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextImage}
                  disabled={selectedImageIndex === selectedProduct.fotografias.length - 1}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                >
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Indicador de imagen */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm">
                  {selectedImageIndex + 1} / {selectedProduct.fotografias.length}
                </div>
              </>
            )}

            {/* Información del producto en el modal */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-xl font-bold mb-1">{selectedProduct.nombre_prenda}</h3>
              {selectedProduct.artesano && (
                <p className="text-sm opacity-90">
                  Por {selectedProduct.artesano.nombres} {selectedProduct.artesano.apellidos}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}