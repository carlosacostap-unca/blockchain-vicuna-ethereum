'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import QRCode from 'qrcode'

interface Artesano {
  id: string
  nombres: string
  apellidos: string
}

interface TipoPrenda {
  id: string
  nombre: string
}

interface Producto {
  id: string
  nombre_prenda: string
  descripcion: string
  fotografias: string[]
  localidad_origen: string
  departamento: string
  provincia: string
  pais: string
  tecnicas_utilizadas: string
  materiales_utilizados: string
  ancho_metros: number
  alto_metros: number
  peso_gramos: number
  created_at: string
  artesano: Artesano
  tipo_prenda: TipoPrenda
  nft_token_id?: number
  nft_creado?: boolean
}

export default function ProductoDetalle() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading: authLoading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const params = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateQRCode = async () => {
    try {
      // Obtener la URL actual y reemplazar localhost con el dominio de producción
      const currentUrl = window.location.href
      const productionUrl = currentUrl.replace('http://localhost:3000', 'https://rutadeltelar.catamarca.gob.ar')
      
      const qrDataUrl = await QRCode.toDataURL(productionUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generando código QR:', error)
    }
  }

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
        console.log('Navegando a Enlaces')
        break
      default:
        console.log(`Navegando a ${section}`)
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
    
    switch (accessType) {
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
        console.log(`Tipo de acceso no reconocido: ${accessType}`)
    }
  }

  useEffect(() => {
    const fetchProducto = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('productos')
          .select(`
            *,
            artesano:artesanos(*),
            ctpsfs(*)
          `)
          .eq('id', params.id)
          .single()

        if (error) throw error
        
        if (data) {
          // Manually fetch tipo_prenda data if it exists
          if (data.tipo_prenda_id) {
            const { data: tipoPrenda } = await supabase
              .from('tipos_prendas')
              .select('*')
              .eq('id', data.tipo_prenda_id)
              .single()
            
            setProducto({ ...data, tipo_prenda: tipoPrenda })
          } else {
            setProducto(data)
          }
        }
      } catch (error) {
        console.error('Error fetching producto:', error)
        setError('Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProducto()
    }
  }, [params.id])

  // Generar código QR cuando se carga la página
  useEffect(() => {
    generateQRCode()
  }, [])

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando acceso...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario o perfil, no mostrar nada (el hook se encarga de redirigir)
  if (!user || !profile) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
        <div className="flex justify-center items-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
            <p className="text-xl" style={{ color: '#0f324b' }}>Cargando producto...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !producto) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-4" style={{ color: '#0f324b' }}>
              {error || 'Producto no encontrado'}
            </h1>
            <button
              onClick={() => router.back()}
              className="px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
      {/* Header - Mismo diseño que /admin */}
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
              
              {/* Menú hamburguesa */}
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
                  <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50" style={{ backgroundColor: '#0f324b' }}>
                    <div className="py-1">
                      {/* Información del usuario */}
                      <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                          {profile.full_name || 'Administrador'}
                        </p>
                        <p className="text-xs opacity-75" style={{ color: '#ecd2b4' }}>
                          {profile.email}
                        </p>
                        <p className="text-xs opacity-60 capitalize" style={{ color: '#ecd2b4' }}>
                          {profile.role?.name}
                        </p>
                      </div>
                      
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
                      
                      {/* Separador */}
                      <div className="border-t border-gray-600 my-1"></div>
                      
                      {/* Botón de cerrar sesión */}
                      <button
                        onClick={() => {
                          setIsMenuOpen(false)
                          signOut()
                        }}
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200"
                        style={{ color: '#ecd2b4' }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb/Navigation */}
      <div className="border-b" style={{ backgroundColor: '#0f324b', borderColor: 'rgba(236, 210, 180, 0.2)' }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/admin/prendas')}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors hover:bg-opacity-80"
              style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)', color: '#ecd2b4' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Volver a Administrar Prendas</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {producto?.nft_token_id && (
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                  Tokenizado
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="rounded-lg overflow-hidden shadow-lg" style={{ backgroundColor: '#0f324b' }}>
              {producto.fotografias && producto.fotografias.length > 0 ? (
                <div className="relative">
                  <img
                    src={producto.fotografias[currentImageIndex]}
                    alt={producto.nombre_prenda}
                    className="w-full h-96 object-cover"
                  />
                  {producto.fotografias.length > 1 && (
                    <>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === 0 ? producto.fotografias.length - 1 : prev - 1
                        )}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setCurrentImageIndex(prev => 
                          prev === producto.fotografias.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {producto.fotografias.length}
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="h-96 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                  <div className="text-center" style={{ color: '#ecd2b4' }}>
                    <svg className="w-20 h-20 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                    <p className="text-lg opacity-60">Sin imagen disponible</p>
                  </div>
                </div>
              )}
            </div>

            {/* Miniaturas */}
            {producto.fotografias && producto.fotografias.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {producto.fotografias.map((foto, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      currentImageIndex === index 
                        ? 'border-blue-500 opacity-100' 
                        : 'border-gray-300 opacity-60 hover:opacity-80'
                    }`}
                  >
                    <img
                      src={foto}
                      alt={`${producto.nombre_prenda} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
              <h1 className="text-3xl font-bold mb-4 font-maria-david" style={{ color: '#ecd2b4' }}>
                {producto.nombre_prenda}
              </h1>
              
              {producto.descripcion && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#ecd2b4' }}>Descripción</h3>
                  <p className="leading-relaxed" style={{ color: '#ecd2b4', opacity: 0.9 }}>
                    {producto.descripcion}
                  </p>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Tipo:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.tipo_prenda?.nombre || 'No especificado'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Artesano:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.artesano ? `${producto.artesano.nombres} ${producto.artesano.apellidos}` : 'No especificado'}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Origen:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.localidad_origen}
                      {producto.departamento && `, ${producto.departamento}`}
                      {producto.provincia && `, ${producto.provincia}`}
                      {producto.pais && `, ${producto.pais}`}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Técnicas:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.tecnicas_utilizadas}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Materiales:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.materiales_utilizados}
                    </p>
                  </div>

                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Dimensiones:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.ancho_metros}m × {producto.alto_metros}m
                    </p>
                  </div>

                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Peso:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {producto.peso_gramos}g
                    </p>
                  </div>

                  <div>
                    <span className="font-medium" style={{ color: '#ecd2b4' }}>Registrado:</span>
                    <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                      {formatDate(producto.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ecd2b4' }}>Acciones</h3>
              <div className="flex flex-wrap gap-3">
                {producto.nft_creado ? (
                  // Si la prenda tiene NFT, solo mostrar "Ver Trazabilidad"
                  <button
                    onClick={() => {
                      const contractAddress = "0x142bBdf196e0c5f1a72A345731b04f153721A1c5";
                      const etherscanUrl = `https://sepolia.etherscan.io/token/${contractAddress}?a=${producto.nft_token_id}`;
                      window.open(etherscanUrl, '_blank');
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    Ver Trazabilidad
                  </button>
                ) : (
                  // Si la prenda no tiene NFT, solo mostrar "Crear NFT"
                  <button
                    onClick={() => router.push(`/admin/generar-nft?producto=${producto.id}`)}
                    className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    Crear NFT
                  </button>
                )}
              </div>
            </div>

            {/* Código QR */}
            <div className="rounded-lg shadow-lg p-6" style={{ backgroundColor: '#0f324b' }}>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ecd2b4' }}>Código QR</h3>
              <div className="text-center">
                <p className="text-sm mb-4" style={{ color: '#ecd2b4' }}>
                  Escanea este código para acceder directamente a esta prenda
                </p>
                {qrCodeUrl && (
                  <div className="flex flex-col items-center space-y-3">
                    <img 
                      src={qrCodeUrl} 
                      alt="Código QR de la prenda" 
                      className="border-2 border-white rounded-lg"
                    />
                    <button
                      onClick={() => {
                        const link = document.createElement('a')
                        link.download = `qr-prenda-${producto.id}.png`
                        link.href = qrCodeUrl
                        link.click()
                      }}
                      className="px-4 py-2 rounded-lg font-medium transition-colors hover:opacity-90 text-sm"
                      style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                    >
                      Descargar QR
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}