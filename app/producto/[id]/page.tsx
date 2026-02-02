'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'
import QRCode from 'react-qr-code'

interface Cooperativa {
  id: number
  nombre: string
  comunidad: string
}

interface Artesano {
  id: number
  nombres: string
  apellidos: string
  domicilio: string
  contacto: string
  fotografia_url?: string
  cooperativa?: Cooperativa
}

interface TipoPrenda {
  id: number
  nombre: string
  descripcion?: string
}

interface CTPSFS {
  id: number
  numero: string
  descripcion_producto: string
  chaku_id?: number
  ano: number
  documentacion_origen?: string
  created_at?: string
  updated_at?: string
}

interface COLT {
  id: number
  numero: string
  artesano_id: number
  unidad: 'Kg'
  cantidad: number
  materia_prima: 'Vicugna vicugna'
  descripcion: string
  lugar_procedencia: 'En silvestría' | 'Otro'
  chaku_id?: number
  ano: number
  documentacion_origen: string
  destino: 'Transformación' | 'Comercialización'
  fecha_expedicion: string
  created_at?: string
  updated_at?: string
  artesanos?: Artesano
  chakus?: { id: number; nombre: string }
}

interface Producto {
  id: number
  nombre_prenda: string
  tecnicas_utilizadas: string
  ancho_metros: number
  alto_metros: number
  tiempo_elaboracion_meses: number
  peso_fibra_gramos?: number
  localidad_origen: string
  fotografias: string[]
  created_at: string
  nft_creado: boolean
  nft_token_id?: number
  nft_transaction_hash?: string
  artesano: Artesano
  tipo_prenda?: TipoPrenda
  ctpsfs?: CTPSFS
  descripcion?: string
}

export default function ProductoDetalle() {
  const params = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [colt, setColt] = useState<COLT | null>(null)
  const [chakuNombre, setChakuNombre] = useState<string | null>(null)
  const formatDate = (s?: string) => (s ? new Date(s).toLocaleDateString('es-ES') : '')

  useEffect(() => {
    if (params.id) {
      fetchProducto()
    }
  }, [params.id])

  const fetchProducto = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          artesano:artesanos(
            id, 
            nombres, 
            apellidos, 
            domicilio, 
            contacto, 
            fotografia_url,
            cooperativa:cooperativas(id, nombre, comunidad)
          ),
          tipo_prenda:tipos_prendas(id, nombre, descripcion),
          ctpsfs:ctpsfs(id, numero, descripcion_producto, chaku_id, ano, documentacion_origen, created_at, updated_at)
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error

      setProducto(data)

      if (data?.ctpsfs?.chaku_id) {
        const { data: chakuData } = await supabase
          .from('chakus')
          .select('id,nombre')
          .eq('id', data.ctpsfs.chaku_id)
          .single()
        setChakuNombre(chakuData?.nombre || null)
      } else {
        setChakuNombre(null)
      }

      if (data?.artesano?.id) {
        let query = supabase
          .from('colt')
          .select(`
            *,
            artesanos!artesano_id(*),
            chakus!chaku_id(*)
          `)
          .eq('artesano_id', data.artesano.id)

        if (data?.ctpsfs?.chaku_id) {
          query = query.eq('chaku_id', data.ctpsfs.chaku_id)
        }
        if (data?.ctpsfs?.ano) {
          query = query.eq('ano', data.ctpsfs.ano)
        }

        const { data: coltData } = await query
          .order('fecha_expedicion', { ascending: false })
          .limit(1)
        setColt(coltData && coltData.length > 0 ? (coltData[0] as any) : null)
      } else {
        setColt(null)
      }
    } catch (error) {
      console.error('Error fetching producto:', error)
      setError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  // Navigation functions (copied from catalog page)
  const handleNavigation = (section: string) => {
    switch (section) {
      case 'inicio':
        router.push('/')
        break
      case 'catalogo':
        router.push('/catalogo')
        break
      case 'productos':
        router.push('/productos')
        break
      case 'enlaces':
        router.push('/enlaces')
        break
      default:
        break
    }
    setIsMenuOpen(false)
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAccessOption = (option: string) => {
    console.log(`Acceso seleccionado: ${option}`)
    setIsMenuOpen(false)
    
    switch (option) {
      case 'Administrador':
        router.push('/admin')
        break
      case 'Artesano':
        router.push('/artesano')
        break
      case 'Cooperativa':
        router.push('/cooperativa')
        break
      default:
        break
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/catalogo?search=${encodeURIComponent(searchTerm)}`)
    }
  }

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index)
    setShowImageModal(true)
  }

  const closeImageModal = () => {
    setShowImageModal(false)
  }

  const nextImage = () => {
    if (producto?.fotografias) {
      setSelectedImageIndex((prev) => 
        prev === producto.fotografias.length - 1 ? 0 : prev + 1
      )
    }
  }

  const prevImage = () => {
    if (producto?.fotografias) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? producto.fotografias.length - 1 : prev - 1
      )
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#ecd2b4' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
          <p className="text-lg" style={{ color: '#0f324b' }}>Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
        {/* Header - Same as catalog */}
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

        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-lg mb-4" style={{ color: '#0f324b' }}>
              {error || 'Producto no encontrado'}
            </p>
            <button
              onClick={() => router.push('/catalogo')}
              className="px-6 py-2 rounded-lg font-semibold transition-all duration-200 hover:opacity-80"
              style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
      {/* Header - Same as catalog */}
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Título de la página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0f324b' }}>
            DETALLE DEL PRODUCTO
          </h1>
          <button
            onClick={() => router.push('/catalogo')}
            className="inline-flex items-center space-x-2 text-lg font-semibold transition-colors duration-200 hover:opacity-80 mb-8"
            style={{ color: '#0f324b' }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            <span>Volver al Catálogo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Galería de Imágenes */}
          <div className="xl:col-span-2 space-y-4">
            {/* Imagen Principal */}
            <div className="relative rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: '#0f324b' }}>
              {producto.fotografias && producto.fotografias.length > 0 ? (
                <img
                  src={producto.fotografias[selectedImageIndex]}
                  alt={producto.nombre_prenda}
                  className="w-full h-96 xl:h-[500px] object-cover cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => openImageModal(selectedImageIndex)}
                />
              ) : (
                <div className="w-full h-96 xl:h-[500px] flex items-center justify-center">
                  <svg className="w-24 h-24" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {producto.fotografias && producto.fotografias.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {producto.fotografias.map((foto, index) => (
                  <div
                    key={index}
                    className={`relative rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                      selectedImageIndex === index ? 'ring-2 ring-[#ecd2b4]' : 'hover:opacity-80'
                    }`}
                    style={{ 
                      backgroundColor: '#0f324b'
                    }}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={foto}
                      alt={`${producto.nombre_prenda} ${index + 1}`}
                      className="w-full h-20 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Información del Producto */}
          <div className="xl:col-span-1 space-y-6">
            {/* Información Básica */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
              <h2 className="text-2xl xl:text-3xl font-bold mb-4 font-maria-david" style={{ color: '#ecd2b4' }}>
                {producto.nombre_prenda}
              </h2>

              <div className="space-y-4">
                {/* Tipo de Prenda */}
                {producto.tipo_prenda && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Tipo de Prenda</p>
                      <p className="font-semibold" style={{ color: '#ecd2b4' }}>
                        {producto.tipo_prenda.nombre}
                      </p>
                      {producto.tipo_prenda.descripcion && (
                        <p className="text-sm opacity-75 mt-1" style={{ color: '#ecd2b4' }}>
                          {producto.tipo_prenda.descripcion}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Localidad */}
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Origen</p>
                    <p className="font-semibold" style={{ color: '#ecd2b4' }}>
                      {producto.localidad_origen}
                    </p>
                  </div>
                </div>

                {/* Dimensiones y Tiempo en una fila */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Dimensiones</p>
                      <p className="font-semibold text-sm" style={{ color: '#ecd2b4' }}>
                        {producto.ancho_metros}m × {producto.alto_metros}m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Elaboración</p>
                      <p className="font-semibold text-sm" style={{ color: '#ecd2b4' }}>
                        {producto.tiempo_elaboracion_meses} {producto.tiempo_elaboracion_meses === 1 ? 'mes' : 'meses'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Peso de Fibra */}
                {producto.peso_fibra_gramos && (
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Peso de Fibra</p>
                      <p className="font-semibold" style={{ color: '#ecd2b4' }}>
                        {producto.peso_fibra_gramos} gramos
                      </p>
                    </div>
                  </div>
                )}

                {/* Técnicas */}
                <div>
                  <p className="text-sm opacity-75 mb-2" style={{ color: '#ecd2b4' }}>Técnicas Utilizadas</p>
                  <span className="inline-block px-4 py-2 rounded-full text-sm font-medium" style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}>
                    {producto.tecnicas_utilizadas}
                  </span>
                </div>

                {/* Estado NFT */}
                <div className="border-t pt-4 border-[#ecd2b4] border-opacity-20">
                  <h3 className="text-lg font-semibold mb-3" style={{ color: '#ecd2b4' }}>Estado Blockchain</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${producto.nft_creado ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <p className="text-sm" style={{ color: '#ecd2b4' }}>
                        NFT {producto.nft_creado ? 'Creado' : 'No Creado'}
                      </p>
                    </div>
                    {(producto.nft_token_id || producto.nft_transaction_hash) && (
                      <>
                        {producto.nft_token_id && (
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 8A8 8 0 11.001 8 8 8 0 0118 8zm-7-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 4a3 3 0 013 3 3 3 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm font-mono" style={{ color: '#ecd2b4' }}>
                              Token ID: {producto.nft_token_id}
                            </p>
                          </div>
                        )}
                        <div className="mt-3">
                          <button
                            onClick={() => {
                              const contractAddress = "0x142bBdf196e0c5f1a72A345731b04f153721A1c5";
                              let etherscanUrl;
                              
                              if (producto.nft_token_id) {
                                // Si tenemos token ID, ir directamente al NFT
                                etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${producto.nft_token_id}`;
                              } else if (producto.nft_transaction_hash) {
                                // Si solo tenemos transaction hash, ir a la transacción
                                etherscanUrl = `https://sepolia.etherscan.io/tx/${producto.nft_transaction_hash}`;
                              }
                              
                              if (etherscanUrl) {
                                window.open(etherscanUrl, '_blank');
                              }
                            }}
                            className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ecd2b4]"
                            style={{ 
                              backgroundColor: '#ecd2b4', 
                              color: '#0f324b'
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                            </svg>
                            Ver Trazabilidad
                          </button>
                        </div>
                      </>
                    )}
                    
                    {/* Código QR para acceso público */}
                    <div className="mt-4 pt-4 border-t border-[#ecd2b4] border-opacity-20">
                      <div className="flex flex-col items-center space-y-3">
                        <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                          Acceso Público al Producto
                        </p>
                        <div className="bg-white p-3 rounded-lg" id={`qr-code-${producto.id}`}>
                          <QRCode
                            size={120}
                            value={`https://rutadeltelar.catamarca.gob.ar/producto/${producto.id}`}
                            viewBox={`0 0 120 120`}
                          />
                        </div>
                        <p className="text-xs text-center opacity-75" style={{ color: '#ecd2b4' }}>
                          Escanea para ver los detalles públicos
                        </p>
                        
                        {/* Botones de copiar */}
                        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                          <button
                            onClick={async () => {
                              try {
                                const qrElement = document.getElementById(`qr-code-${producto.id}`);
                                if (qrElement) {
                                  const svg = qrElement.querySelector('svg');
                                  if (svg) {
                                    // Convertir SVG a canvas y luego a blob
                                    const canvas = document.createElement('canvas');
                                    const ctx = canvas.getContext('2d');
                                    const img = new Image();
                                    
                                    const svgData = new XMLSerializer().serializeToString(svg);
                                    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                                    const url = URL.createObjectURL(svgBlob);
                                    
                                    img.onload = async () => {
                                      canvas.width = 120;
                                      canvas.height = 120;
                                      ctx?.drawImage(img, 0, 0);
                                      
                                      canvas.toBlob(async (blob) => {
                                        if (blob) {
                                          try {
                                            await navigator.clipboard.write([
                                              new ClipboardItem({ 'image/png': blob })
                                            ]);
                                            alert('¡Imagen del QR copiada al portapapeles!');
                                          } catch (err) {
                                            console.error('Error al copiar imagen:', err);
                                            alert('Error al copiar la imagen');
                                          }
                                        }
                                      }, 'image/png');
                                      
                                      URL.revokeObjectURL(url);
                                    };
                                    
                                    img.src = url;
                                  }
                                }
                              } catch (err) {
                                console.error('Error al copiar imagen:', err);
                                alert('Error al copiar la imagen');
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ecd2b4]"
                            style={{ 
                              backgroundColor: '#ecd2b4', 
                              color: '#0f324b'
                            }}
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z"/>
                              <path d="M3 5a2 2 0 012-2 3 3 0 003 3h6a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11.586l-3-3a1 1 0 00-1.414 0l-3 3A1 1 0 008 13h2v3a1 1 0 102 0v-3h2a1 1 0 00.586-1.414z"/>
                            </svg>
                            Copiar Imagen
                          </button>
                          
                          <button
                            onClick={async () => {
                              try {
                                const url = `https://rutadeltelar.catamarca.gob.ar/producto/${producto.id}`;
                                await navigator.clipboard.writeText(url);
                                alert('¡URL copiada al portapapeles!');
                              } catch (err) {
                                console.error('Error al copiar texto:', err);
                                alert('Error al copiar la URL');
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ecd2b4]"
                            style={{ 
                              backgroundColor: '#ecd2b4', 
                              color: '#0f324b'
                            }}
                          >
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
                            </svg>
                            Copiar Texto
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>


              </div>
            </div>

            {/* Información del Artesano */}
            {producto.artesano && (
              <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>Información del Artesano</h3>
                
                <div className="flex items-start space-x-4">
                  {/* Foto del artesano */}
                  {producto.artesano.fotografia_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={producto.artesano.fotografia_url}
                        alt={`${producto.artesano.nombres} ${producto.artesano.apellidos}`}
                        className="w-16 h-16 rounded-full object-cover border-2"
                        style={{ borderColor: '#ecd2b4' }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <p className="font-semibold truncate" style={{ color: '#ecd2b4' }}>
                        {producto.artesano.nombres} {producto.artesano.apellidos}
                      </p>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm" style={{ color: '#ecd2b4' }}>
                        {producto.artesano.domicilio}
                      </p>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <p className="text-sm truncate" style={{ color: '#ecd2b4' }}>
                        {producto.artesano.contacto}
                      </p>
                    </div>
                    
                    {/* Cooperativa */}
                    {producto.artesano.cooperativa && (
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                            {producto.artesano.cooperativa.nombre}
                          </p>
                          <p className="text-xs opacity-75" style={{ color: '#ecd2b4' }}>
                            {producto.artesano.cooperativa.comunidad}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CTPSFS */}
            {producto.ctpsfs && (
              <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>Certificación CTPSFS</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold" style={{ color: '#ecd2b4' }}>
                      Número: {producto.ctpsfs.numero}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <p style={{ color: '#ecd2b4' }}>
                      Año: {producto.ctpsfs.ano}
                    </p>
                  </div>
                  <p className="text-sm" style={{ color: '#ecd2b4' }}>
                    {producto.ctpsfs.descripcion_producto}
                  </p>
                  {chakuNombre && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>
                        Chaku: {chakuNombre}
                      </p>
                    </div>
                  )}
                  {producto.ctpsfs.documentacion_origen && (
                    <div className="mt-2">
                      <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Documentación de Origen</p>
                      <p className="text-sm" style={{ color: '#ecd2b4' }}>{producto.ctpsfs.documentacion_origen}</p>
                    </div>
                  )}
                  {(producto.ctpsfs.created_at || producto.ctpsfs.updated_at) && (
                    <div className="mt-2 text-xs opacity-75" style={{ color: '#ecd2b4' }}>
                      {producto.ctpsfs.created_at && <span>Registrado: {formatDate(producto.ctpsfs.created_at)}</span>}
                      {producto.ctpsfs.updated_at && producto.ctpsfs.updated_at !== producto.ctpsfs.created_at && (
                        <span> • Actualizado: {formatDate(producto.ctpsfs.updated_at)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {colt && (
              <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>Certificado C.O.L.T.</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                    <p className="font-semibold" style={{ color: '#ecd2b4' }}>
                      Número: {colt.numero}
                    </p>
                  </div>
                  {colt.artesanos && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>
                        Artesano: {colt.artesanos.apellidos}, {colt.artesanos.nombres}
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM3 8a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Unidad: {colt.unidad}</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v9a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4z" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Cantidad: {colt.cantidad}</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5 8a3 3 0 016 0v6H5V8z" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Materia Prima: {colt.materia_prima}</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9z" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Procedencia: {colt.lugar_procedencia}</p>
                    </div>
                  </div>
                  {colt.chakus && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9z" clipRule="evenodd" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Chaku: {colt.chakus.nombre}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1z" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Año: {colt.ano}</p>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16z" />
                      </svg>
                      <p style={{ color: '#ecd2b4' }}>Fecha Expedición: {formatDate(colt.fecha_expedicion)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Destino</p>
                    <p className="text-sm" style={{ color: '#ecd2b4' }}>{colt.destino}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Descripción</p>
                    <p className="text-sm" style={{ color: '#ecd2b4' }}>{colt.descripcion}</p>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm opacity-75" style={{ color: '#ecd2b4' }}>Documentación de Origen</p>
                    <p className="text-sm" style={{ color: '#ecd2b4' }}>{colt.documentacion_origen}</p>
                  </div>
                  {(colt.created_at || colt.updated_at) && (
                    <div className="mt-2 text-xs opacity-75" style={{ color: '#ecd2b4' }}>
                      {colt.created_at && <span>Registrado: {formatDate(colt.created_at)}</span>}
                      {colt.updated_at && colt.updated_at !== colt.created_at && (
                        <span> • Actualizado: {formatDate(colt.updated_at)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Descripción */}
            {producto.descripcion && (
              <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>Descripción</h3>
                <p style={{ color: '#ecd2b4' }}>{producto.descripcion}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de imagen */}
      {showImageModal && producto.fotografias && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <img
              src={producto.fotografias[selectedImageIndex]}
              alt={producto.nombre_prenda}
              className="max-w-full max-h-full object-contain"
            />
            
            {/* Botón cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Navegación de imágenes */}
            {producto.fotografias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors duration-200"
                >
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Indicadores */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {producto.fotografias.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                        selectedImageIndex === index ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
