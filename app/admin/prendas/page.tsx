'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase, type TipoPrenda, type ProductoWithRelations } from '@/lib/supabase'

export default function AdminPrendasPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'tipos' | 'productos' | 'productos-con-nft' | 'productos-sin-nft'>('tipos')
  const [tiposPrendas, setTiposPrendas] = useState<TipoPrenda[]>([])
  const [productos, setProductos] = useState<ProductoWithRelations[]>([])
  const [productosConNft, setProductosConNft] = useState<ProductoWithRelations[]>([])
  const [productosSinNft, setProductosSinNft] = useState<ProductoWithRelations[]>([])
  const [loadingTipos, setLoadingTipos] = useState(true)
  const [loadingProductos, setLoadingProductos] = useState(true)
  const [loadingProductosConNft, setLoadingProductosConNft] = useState(true)
  const [loadingProductosSinNft, setLoadingProductosSinNft] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<TipoPrenda | null>(null)
  const [selectedItem, setSelectedItem] = useState<TipoPrenda | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const router = useRouter()

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

  const fetchTiposPrendas = async () => {
    try {
      setLoadingTipos(true)
      const { data, error } = await supabase
        .from('tipos_prendas')
        .select('*')
        .order('nombre', { ascending: true })

      if (error) throw error
      setTiposPrendas(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los tipos de prendas')
    } finally {
      setLoadingTipos(false)
    }
  }

  const fetchProductos = async () => {
    try {
      setLoadingProductos(true)
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          artesano:artesanos(*),
          ctpsfs(*),
          tipo_prenda:tipos_prendas(*)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProductos(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los productos')
    } finally {
      setLoadingProductos(false)
    }
  }

  const fetchProductosConNft = async () => {
    try {
      setLoadingProductosConNft(true)
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          artesano:artesanos(*),
          ctpsfs(*),
          tipo_prenda:tipos_prendas(*)
        `)
        .eq('nft_creado', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setProductosConNft(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los productos con NFT')
    } finally {
      setLoadingProductosConNft(false)
    }
  }

  const fetchProductosSinNft = async () => {
    try {
      setLoadingProductosSinNft(true)
      const { data, error } = await supabase
        .from('productos')
        .select(`
          *,
          artesano:artesanos(*),
          ctpsfs(*),
          tipo_prenda:tipos_prendas(*)
        `)
        .or('nft_creado.is.null,nft_creado.eq.false')
        .order('created_at', { ascending: false })

      if (error) throw error

      setProductosSinNft(data || [])
    } catch (error: any) {
      setError(error.message || 'Error al cargar los productos sin NFT')
    } finally {
      setLoadingProductosSinNft(false)
    }
  }

  useEffect(() => {
    fetchTiposPrendas()
    fetchProductos()
    fetchProductosConNft()
    fetchProductosSinNft()
  }, [])

  const handleDeleteTipo = async (id: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de prenda?')) {
      return
    }

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

      setTiposPrendas(prev => prev.filter(tipo => tipo.id !== id))
      setSelectedItem(null)
      setShowDetails(false)
    } catch (error) {
      console.error('Error deleting tipo prenda:', error)
      alert('Error al eliminar el tipo de prenda')
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

  const handleAccessOption = (option: string) => {
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
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const filteredTipos = tiposPrendas.filter(tipo =>
    tipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tipo.descripcion && tipo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredProductos = productos.filter(producto =>
    producto.nombre_prenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.artesano && `${producto.artesano.nombres} ${producto.artesano.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredProductosConNft = productosConNft.filter(producto =>
    producto.nombre_prenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.artesano && `${producto.artesano.nombres} ${producto.artesano.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const filteredProductosSinNft = productosSinNft.filter(producto =>
    producto.nombre_prenda.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (producto.artesano && `${producto.artesano.nombres} ${producto.artesano.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Igual al de la página artesanos */}
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
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                  <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                </button>

                {/* Dropdown del menú */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-md shadow-lg z-50"
                    style={{ backgroundColor: '#0f324b' }}
                  >
                    <div className="py-2">
                      {/* Información del usuario */}
                      <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm font-medium" style={{ color: '#ecd2b4' }}>
                          {profile.full_name || user.email}
                        </p>
                        <p className="text-xs opacity-75" style={{ color: '#ecd2b4' }}>
                          {user.email}
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
                        className="block w-full text-left px-4 py-2 text-sm hover:opacity-80 transition-opacity duration-200 text-red-400"
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
        {/* Título y navegación */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center text-sm hover:opacity-80 transition-opacity duration-200 mr-4"
              style={{ color: '#0f324b' }}
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Panel de Administración
            </button>
          </div>
          
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Administrar Prendas
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Gestiona los tipos de prendas y visualiza los productos registrados en el sistema
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8 p-6 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 mb-6">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('tipos')}
                className={`text-xl font-bold font-maria-david transition-colors duration-200 ${
                  activeTab === 'tipos' ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                style={{ color: '#ecd2b4' }}
              >
                Tipos de Prendas ({filteredTipos.length})
              </button>
              <button
                onClick={() => setActiveTab('productos')}
                className={`text-xl font-bold font-maria-david transition-colors duration-200 ${
                  activeTab === 'productos' ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                style={{ color: '#ecd2b4' }}
              >
                Productos ({filteredProductos.length})
              </button>
              <button
                onClick={() => setActiveTab('productos-con-nft')}
                className={`text-xl font-bold font-maria-david transition-colors duration-200 ${
                  activeTab === 'productos-con-nft' ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                style={{ color: '#ecd2b4' }}
              >
                Productos con NFT ({filteredProductosConNft.length})
              </button>
              <button
                onClick={() => setActiveTab('productos-sin-nft')}
                className={`text-xl font-bold font-maria-david transition-colors duration-200 ${
                  activeTab === 'productos-sin-nft' ? 'opacity-100' : 'opacity-60 hover:opacity-80'
                }`}
                style={{ color: '#ecd2b4' }}
              >
                Productos sin NFT ({filteredProductosSinNft.length})
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <input
                type="text"
                placeholder={
                  activeTab === 'tipos' 
                    ? "Buscar tipos de prendas..." 
                    : activeTab === 'productos'
                    ? "Buscar productos..."
                    : activeTab === 'productos-con-nft'
                    ? "Buscar productos con NFT..."
                    : "Buscar productos sin NFT..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
              />

              {activeTab === 'tipos' && (
                <button
                  onClick={() => {
                    setEditingItem(null)
                    setShowForm(true)
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  Nuevo Tipo
                </button>
              )}
              {(activeTab === 'productos' || activeTab === 'productos-con-nft' || activeTab === 'productos-sin-nft') && (
                <button
                  onClick={() => {
                    window.location.href = '/admin/prendas/new'
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                  style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                >
                  Añadir Prenda
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Contenido de las tabs */}
        {activeTab === 'tipos' && (
          <>
            {/* Lista de tipos de prendas */}
            {loadingTipos ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
                  <p style={{ color: '#0f324b' }}>Cargando tipos de prendas...</p>
                </div>
              </div>
            ) : filteredTipos.length === 0 ? (
              <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
                <div className="text-6xl mb-4">👕</div>
                <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                  {searchTerm ? 'No se encontraron tipos de prendas' : 'No hay tipos de prendas registrados'}
                </h3>
                <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los tipos de prendas aparecerán aquí cuando se registren'}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => {
                      setEditingItem(null)
                      setShowForm(true)
                    }}
                    className="mt-4 px-6 py-2 rounded-lg font-medium transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
                  >
                    Crear el primer tipo de prenda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredTipos.map((tipo) => (
                  <div 
                    key={tipo.id} 
                    className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: '#0f324b' }}
                    onClick={() => {
                      setSelectedItem(tipo)
                      setShowDetails(true)
                    }}
                  >
                    {/* Icono */}
                    <div className="h-48 flex items-center justify-center" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                      <div className="text-center" style={{ color: '#ecd2b4' }}>
                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm opacity-60">Tipo de Prenda</p>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                        {tipo.nombre}
                      </h3>
                      
                      <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                        <p><span className="font-medium">Descripción:</span> {tipo.descripcion || 'Sin descripción'}</p>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'productos' && (
          <>
            {/* Lista de productos */}
            {loadingProductos ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
                  <p style={{ color: '#0f324b' }}>Cargando productos...</p>
                </div>
              </div>
            ) : filteredProductos.length === 0 ? (
              <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
                <div className="text-6xl mb-4">🧶</div>
                <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                  {searchTerm ? 'No se encontraron productos' : 'No hay productos registrados'}
                </h3>
                <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los productos aparecerán aquí cuando se registren'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProductos.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: '#0f324b' }}
                    onClick={() => {
                      router.push(`/admin/prendas/${producto.id}`)
                    }}
                  >
                    {/* Imagen del producto */}
                    <div className="h-48 flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                      {producto.fotografias && producto.fotografias.length > 0 ? (
                        <>
                          <img
                            src={producto.fotografias[0]}
                            alt={producto.nombre_prenda}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Si la imagen falla al cargar, mostrar el ícono de respaldo
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          {/* Indicador de múltiples fotos */}
                          {producto.fotografias.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                              +{producto.fotografias.length - 1}
                            </div>
                          )}
                        </>
                      ) : null}
                      <div 
                        className="text-center" 
                        style={{ 
                          color: '#ecd2b4',
                          display: producto.fotografias && producto.fotografias.length > 0 ? 'none' : 'block'
                        }}
                      >
                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm opacity-60">Producto</p>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold font-maria-david" style={{ color: '#ecd2b4' }}>
                          {producto.nombre_prenda}
                        </h3>
                        {producto.nft_token_id && (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                            Tokenizado
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                        <p><span className="font-medium">Tipo:</span> {producto.tipo_prenda?.nombre || 'No especificado'}</p>
                        <p><span className="font-medium">Artesano:</span> {producto.artesano ? `${producto.artesano.nombres} ${producto.artesano.apellidos}` : 'No especificado'}</p>
                        <p><span className="font-medium">Origen:</span> {producto.localidad_origen}</p>
                        <p><span className="font-medium">Dimensiones:</span> {producto.ancho_metros}m × {producto.alto_metros}m</p>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'productos-con-nft' && (
          <>
            {/* Lista de productos con NFT */}
            {loadingProductosConNft ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
                  <p style={{ color: '#0f324b' }}>Cargando productos con NFT...</p>
                </div>
              </div>
            ) : filteredProductosConNft.length === 0 ? (
              <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                  {searchTerm ? 'No se encontraron productos con NFT' : 'No hay productos con NFT registrados'}
                </h3>
                <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los productos con NFT aparecerán aquí cuando se generen'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProductosConNft.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: '#0f324b' }}
                    onClick={() => {
                      router.push(`/admin/prendas/${producto.id}`)
                    }}
                  >
                    {/* Imagen del producto */}
                    <div className="h-48 flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                      {producto.fotografias && producto.fotografias.length > 0 ? (
                        <>
                          <img
                            src={producto.fotografias[0]}
                            alt={producto.nombre_prenda}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          {producto.fotografias.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                              +{producto.fotografias.length - 1}
                            </div>
                          )}
                        </>
                      ) : null}
                      <div 
                        className="text-center" 
                        style={{ 
                          color: '#ecd2b4',
                          display: producto.fotografias && producto.fotografias.length > 0 ? 'none' : 'block'
                        }}
                      >
                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm opacity-60">Producto NFT</p>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold font-maria-david" style={{ color: '#ecd2b4' }}>
                          {producto.nombre_prenda}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-green-500 text-white">
                          Tokenizado
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                        <p><span className="font-medium">Tipo:</span> {producto.tipo_prenda?.nombre || 'No especificado'}</p>
                        <p><span className="font-medium">Artesano:</span> {producto.artesano ? `${producto.artesano.nombres} ${producto.artesano.apellidos}` : 'No especificado'}</p>
                        <p><span className="font-medium">Origen:</span> {producto.localidad_origen}</p>
                        <p><span className="font-medium">Técnicas:</span> {producto.tecnicas_utilizadas}</p>
                        <p><span className="font-medium">Dimensiones:</span> {producto.ancho_metros}m × {producto.alto_metros}m</p>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'productos-sin-nft' && (
          <>
            {/* Lista de productos sin NFT */}
            {loadingProductosSinNft ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#0f324b' }}></div>
                  <p style={{ color: '#0f324b' }}>Cargando productos sin NFT...</p>
                </div>
              </div>
            ) : filteredProductosSinNft.length === 0 ? (
              <div className="text-center py-12 rounded-lg shadow-lg" style={{ backgroundColor: '#0f324b' }}>
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                  {searchTerm ? 'No se encontraron productos sin NFT' : 'No hay productos sin NFT registrados'}
                </h3>
                <p style={{ color: '#ecd2b4', opacity: 0.8 }}>
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Los productos sin NFT aparecerán aquí cuando se registren'}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProductosSinNft.map((producto) => (
                  <div 
                    key={producto.id} 
                    className="rounded-lg shadow-lg overflow-hidden cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
                    style={{ backgroundColor: '#0f324b' }}
                    onClick={() => {
                      router.push(`/admin/prendas/${producto.id}`)
                    }}
                  >
                    {/* Imagen del producto */}
                    <div className="h-48 flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                      {producto.fotografias && producto.fotografias.length > 0 ? (
                        <>
                          <img
                            src={producto.fotografias[0]}
                            alt={producto.nombre_prenda}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              const fallback = target.nextElementSibling as HTMLElement;
                              if (fallback) fallback.style.display = 'block';
                            }}
                          />
                          {producto.fotografias.length > 1 && (
                            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded-full">
                              +{producto.fotografias.length - 1}
                            </div>
                          )}
                        </>
                      ) : null}
                      <div 
                        className="text-center" 
                        style={{ 
                          color: '#ecd2b4',
                          display: producto.fotografias && producto.fotografias.length > 0 ? 'none' : 'block'
                        }}
                      >
                        <svg className="w-16 h-16 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-sm opacity-60">Producto sin NFT</p>
                      </div>
                    </div>

                    {/* Información */}
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold font-maria-david" style={{ color: '#ecd2b4' }}>
                          {producto.nombre_prenda}
                        </h3>
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-500 text-white">
                          Sin NFT
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm" style={{ color: '#ecd2b4', opacity: 0.8 }}>
                        <p><span className="font-medium">Tipo:</span> {producto.tipo_prenda?.nombre || 'No especificado'}</p>
                        <p><span className="font-medium">Artesano:</span> {producto.artesano ? `${producto.artesano.nombres} ${producto.artesano.apellidos}` : 'No especificado'}</p>
                        <p><span className="font-medium">Origen:</span> {producto.localidad_origen}</p>
                        <p><span className="font-medium">Técnicas:</span> {producto.tecnicas_utilizadas}</p>
                        <p><span className="font-medium">Dimensiones:</span> {producto.ancho_metros}m × {producto.alto_metros}m</p>
                      </div>


                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>



      {/* Modal de formulario para tipos de prendas */}
      {showForm && (
        <TipoPrendaFormModal
          tipoPrenda={editingItem}
          onSuccess={() => {
            setShowForm(false)
            setEditingItem(null)
            fetchTiposPrendas()
          }}
          onCancel={() => {
            setShowForm(false)
            setEditingItem(null)
          }}
        />
      )}
    </div>
  )
}

// Componente del formulario modal
function TipoPrendaFormModal({ 
  tipoPrenda, 
  onSuccess, 
  onCancel 
}: { 
  tipoPrenda?: TipoPrenda | null
  onSuccess: () => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState<TipoPrenda>({
    nombre: tipoPrenda?.nombre || '',
    descripcion: tipoPrenda?.descripcion || ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (tipoPrenda?.id) {
        // Actualizar tipo de prenda existente
        const { error } = await supabase
          .from('tipos_prendas')
          .update({
            nombre: formData.nombre,
            descripcion: formData.descripcion
          })
          .eq('id', tipoPrenda.id)

        if (error) throw error
      } else {
        // Crear nuevo tipo de prenda
        const { error } = await supabase
          .from('tipos_prendas')
          .insert([{
            nombre: formData.nombre,
            descripcion: formData.descripcion
          }])

        if (error) throw error
      }

      onSuccess()
    } catch (error: any) {
      console.error('Error al guardar tipo de prenda:', error)
      setError(error.message || 'Error al guardar el tipo de prenda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full rounded-lg shadow-xl" style={{ backgroundColor: '#0f324b' }}>
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 font-maria-david" style={{ color: '#ecd2b4' }}>
            {tipoPrenda ? 'Editar Tipo de Prenda' : 'Nuevo Tipo de Prenda'}
          </h2>

          {error && (
            <div className="mb-4 p-3 rounded border-2" style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
                placeholder="Nombre del tipo de prenda"
                required
              />
            </div>

            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium mb-1" style={{ color: '#ecd2b4' }}>
                Descripción
              </label>
              <textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: '#ecd2b4', 
                  color: '#0f324b',
                  borderColor: '#ecd2b4'
                }}
                placeholder="Descripción del tipo de prenda..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-lg border hover:opacity-80 disabled:opacity-50"
                style={{ borderColor: '#ecd2b4', color: '#ecd2b4' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !formData.nombre.trim()}
                className="px-4 py-2 rounded-lg font-medium hover:opacity-80 disabled:opacity-50"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                {loading ? 'Guardando...' : (tipoPrenda ? 'Actualizar' : 'Crear')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}