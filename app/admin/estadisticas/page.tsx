'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'

export default function EstadisticasGlobalesPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [loadingStats, setLoadingStats] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Estados para las estadísticas reales
  const [estadisticasData, setEstadisticasData] = useState({
    usuarios: {
      total: 0,
      administradores: 0,
      artesanos: 0,
      cooperativas: 0,
      nuevosEsteMes: 0
    },
    productos: {
      total: 0,
      prendas: 0,
      chakus: 0,
      conNFT: 0,
      sinNFT: 0
    },
    nfts: {
      total: 0,
      generadosEsteMes: 0,
      valorTotal: '0 ETH',
      transacciones: 0
    },
    cooperativas: {
      total: 0,
      activas: 0,
      miembrosPromedio: 0,
      produccionMensual: 0
    }
  })

  // Función para cargar estadísticas reales
  const cargarEstadisticas = async () => {
    try {
      setLoadingStats(true)
      setError(null)

      // Obtener estadísticas de artesanos
      const { data: artesanos, error: errorArtesanos } = await supabase
        .from('artesanos')
        .select('id, created_at')

      if (errorArtesanos) throw errorArtesanos

      // Obtener estadísticas de cooperativas
      const { data: cooperativas, error: errorCooperativas } = await supabase
        .from('cooperativas')
        .select('id, created_at')

      if (errorCooperativas) throw errorCooperativas

      // Obtener estadísticas de productos
      const { data: productos, error: errorProductos } = await supabase
        .from('productos')
        .select('id, created_at, nft_creado, nft_token_id')

      if (errorProductos) throw errorProductos

      // Obtener estadísticas de tipos de prendas
      const { data: tiposPrendas, error: errorTiposPrendas } = await supabase
        .from('tipos_prendas')
        .select('id')

      if (errorTiposPrendas) throw errorTiposPrendas

      // Obtener estadísticas de CTPSFS (chakus)
      const { data: ctpsfs, error: errorCtpsfs } = await supabase
        .from('ctpsfs')
        .select('id, created_at')

      if (errorCtpsfs) throw errorCtpsfs

      // Calcular fechas para "este mes"
      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)

      // Procesar datos
      const artesanosEsteMes = artesanos?.filter(a => new Date(a.created_at) >= inicioMes).length || 0
      const cooperativasEsteMes = cooperativas?.filter(c => new Date(c.created_at) >= inicioMes).length || 0
      const productosConNFT = productos?.filter(p => p.nft_creado === true || p.nft_token_id !== null).length || 0
      const productosSinNFT = (productos?.length || 0) - productosConNFT
      const nftsEsteMes = productos?.filter(p => 
        (p.nft_creado === true || p.nft_token_id !== null) && 
        new Date(p.created_at) >= inicioMes
      ).length || 0

      // Actualizar estado con datos reales
      setEstadisticasData({
        usuarios: {
          total: (artesanos?.length || 0) + (cooperativas?.length || 0) + 3, // +3 para administradores estimados
          administradores: 3, // Valor estimado
          artesanos: artesanos?.length || 0,
          cooperativas: cooperativas?.length || 0,
          nuevosEsteMes: artesanosEsteMes + cooperativasEsteMes
        },
        productos: {
          total: productos?.length || 0,
          prendas: productos?.length || 0, // Todos los productos son prendas
          chakus: ctpsfs?.length || 0,
          conNFT: productosConNFT,
          sinNFT: productosSinNFT
        },
        nfts: {
          total: productosConNFT,
          generadosEsteMes: nftsEsteMes,
          valorTotal: `${(productosConNFT * 0.001).toFixed(3)} ETH`, // Estimación de valor
          transacciones: productosConNFT // Cada NFT = 1 transacción
        },
        cooperativas: {
          total: cooperativas?.length || 0,
          activas: cooperativas?.length || 0, // Asumimos que todas están activas
          miembrosPromedio: cooperativas?.length ? Math.round((artesanos?.length || 0) / cooperativas.length * 10) / 10 : 0,
          produccionMensual: productos?.filter(p => new Date(p.created_at) >= inicioMes).length || 0
        }
      })

    } catch (error: any) {
      console.error('Error cargando estadísticas:', error)
      setError(error.message || 'Error al cargar las estadísticas')
    } finally {
      setLoadingStats(false)
    }
  }

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    if (user && profile) {
      cargarEstadisticas()
    }
  }, [user, profile])

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
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
      case 'admin':
        router.push('/admin')
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
    
    // Lógica de navegación específica para cada tipo de acceso
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



  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Mismo estilo que el panel de admin */}
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

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de la página */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#0f324b' }}>
            ESTADÍSTICAS GLOBALES
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Visualiza las métricas y estadísticas del sistema Ruta del Telar
          </p>
        </div>

        {/* Botón de regreso */}
        <div className="mb-6">
          <button
            onClick={() => handleNavigation('admin')}
            className="flex items-center px-4 py-2 rounded-lg transition-colors duration-200 hover:opacity-80"
            style={{ backgroundColor: '#0f324b', color: '#ecd2b4' }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al Panel de Administrador
          </button>
        </div>

        {/* Indicador de carga */}
        {loadingStats && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0f324b' }}></div>
            <span className="ml-3 text-lg" style={{ color: '#0f324b' }}>Cargando estadísticas...</span>
          </div>
        )}

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-100 border border-red-400">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span className="text-red-700">Error: {error}</span>
            </div>
            <button
              onClick={cargarEstadisticas}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Grid de estadísticas */}
        {!loadingStats && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Estadísticas de Usuarios */}
            <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#ecd2b4' }}>Usuarios</h3>
              <svg className="w-8 h-8" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Total:</span>
                <span className="font-bold" style={{ color: '#ecd2b4' }}>{estadisticasData.usuarios.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Artesanos:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.usuarios.artesanos}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Cooperativas:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.usuarios.cooperativas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Nuevos este mes:</span>
                <span className="font-bold text-green-400">{estadisticasData.usuarios.nuevosEsteMes}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas de Productos */}
          <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#ecd2b4' }}>Productos</h3>
              <svg className="w-8 h-8" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z"/>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Total:</span>
                <span className="font-bold" style={{ color: '#ecd2b4' }}>{estadisticasData.productos.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Prendas:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.productos.prendas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Chakus:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.productos.chakus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Con NFT:</span>
                <span className="font-bold text-blue-400">{estadisticasData.productos.conNFT}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas de NFTs */}
          <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#ecd2b4' }}>NFTs</h3>
              <svg className="w-8 h-8" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Total generados:</span>
                <span className="font-bold" style={{ color: '#ecd2b4' }}>{estadisticasData.nfts.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Este mes:</span>
                <span className="font-bold text-green-400">{estadisticasData.nfts.generadosEsteMes}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Valor total:</span>
                <span className="font-bold text-yellow-400">{estadisticasData.nfts.valorTotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Transacciones:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.nfts.transacciones}</span>
              </div>
            </div>
          </div>

          {/* Estadísticas de Cooperativas */}
          <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: '#ecd2b4' }}>Cooperativas</h3>
              <svg className="w-8 h-8" style={{ color: '#ecd2b4' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2 1l-3 4-3-4c-.46-.63-1.2-1-2-1H4.46c-.8 0-1.3.63-1.42 1.37L.5 16H3v6h18z"/>
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Total:</span>
                <span className="font-bold" style={{ color: '#ecd2b4' }}>{estadisticasData.cooperativas.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Activas:</span>
                <span className="font-bold text-green-400">{estadisticasData.cooperativas.activas}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Miembros prom.:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.cooperativas.miembrosPromedio}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm" style={{ color: '#ecd2b4' }}>Prod. mensual:</span>
                <span style={{ color: '#ecd2b4' }}>{estadisticasData.cooperativas.produccionMensual}</span>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Gráficos adicionales */}
        {!loadingStats && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de tendencias */}
            <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>
              Tendencias Mensuales
            </h3>
            <div className="h-64 flex items-end justify-between space-x-2">
              {[65, 78, 82, 95, 88, 92, 105, 98, 112, 125, 118, 134].map((height, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div 
                    className="w-8 rounded-t transition-all duration-300 hover:opacity-80"
                    style={{ 
                      height: `${(height / 134) * 200}px`, 
                      backgroundColor: '#ecd2b4' 
                    }}
                  ></div>
                  <span className="text-xs mt-2" style={{ color: '#ecd2b4' }}>
                    {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][index]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen de actividad reciente */}
          <div className="rounded-lg p-6 shadow-lg" style={{ backgroundColor: '#0f324b' }}>
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#ecd2b4' }}>
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span className="text-sm" style={{ color: '#ecd2b4' }}>
                  15 nuevos NFTs generados esta semana
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <span className="text-sm" style={{ color: '#ecd2b4' }}>
                  8 artesanos registrados este mes
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <span className="text-sm" style={{ color: '#ecd2b4' }}>
                  23 productos agregados al catálogo
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                <span className="text-sm" style={{ color: '#ecd2b4' }}>
                  2 nuevas cooperativas activas
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <span className="text-sm" style={{ color: '#ecd2b4' }}>
                  156 transacciones blockchain realizadas
                </span>
              </div>
            </div>
          </div>
          </div>
        )}
      </main>
    </div>
  )
}