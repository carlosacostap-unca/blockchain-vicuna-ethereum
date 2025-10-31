'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRequireAuth, useAuth } from '@/lib/auth-context'
import { supabase } from '@/lib/supabase'
import { ethers } from 'ethers'

// ABI del contrato PrendaNFT (solo las funciones que necesitamos)
const PRENDA_NFT_ABI = [
  {
    "inputs": [
      {"internalType": "address", "name": "to", "type": "address"},
      {"internalType": "string", "name": "nombreProducto", "type": "string"},
      {"internalType": "string", "name": "nombreArtesano", "type": "string"},
      {"internalType": "string", "name": "numeroCTPSFS", "type": "string"},
      {"internalType": "uint256", "name": "pesoFibra", "type": "uint256"}
    ],
    "name": "mintPrenda",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalSupply",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
]

// Dirección del contrato desplegado
const CONTRACT_ADDRESS = "0x142bBdf196e0c5f1a72A345731b04f153721A1c5"

interface FormData {
  productoId: string
  nombreProducto: string
  nombreArtesano: string
  numeroCTPSFS: string
  pesoFibra: string
  walletAddress: string
}

interface Artesano {
  id: number
  nombres: string
  apellidos: string
}

interface CTPSFS {
  id: number
  numero: string
}

interface CTPSFSProcesoTransformacion {
  id: number
  ctpsfs_id: number
  descripcion_producto: string
  cantidad: number
  unidad: string
  documentacion_tenencia: string
  fecha_certificacion: string
  artesano_id: number
  created_at: string
  updated_at: string
}

interface ProductoCompleto {
  id: number
  nombre_prenda: string
  tipo_prenda_id?: number
  artesano_id: number
  ctpsfs_id?: number
  localidad_origen: string
  tecnicas_utilizadas: string
  ancho_metros: number
  alto_metros: number
  tiempo_elaboracion_meses: number
  peso_fibra_gramos?: number
  fotografias?: string[]
  nft_creado?: boolean
  nft_transaction_hash?: string
  nft_token_id?: number
  created_at: string
  updated_at: string
  artesano?: Artesano
  ctpsfs?: CTPSFS & {
    procesos_transformacion?: CTPSFSProcesoTransformacion[]
  }
}

export default function GenerarNFTPage() {
  // Proteger la ruta - requiere autenticación y rol de administrador
  const { user, profile, loading } = useRequireAuth('administrador')
  const { signOut } = useAuth()
  const router = useRouter()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState<FormData>({
    productoId: '',
    nombreProducto: '',
    nombreArtesano: '',
    numeroCTPSFS: '',
    pesoFibra: '',
    walletAddress: ''
  })
  
  const [isLoading, setIsLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string>('')
  const [txHash, setTxHash] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  // Estados para los datos de la base de datos
  const [productos, setProductos] = useState<ProductoCompleto[]>([])
  const [loadingData, setLoadingData] = useState(true)

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

  // Cargar datos de productos con sus relaciones
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingData(true)
        
        // Cargar productos con artesanos, CTPSFS y procesos de transformación
        // Solo productos que NO tienen NFT creado
        const { data: productosData, error: productosError } = await supabase
          .from('productos')
          .select(`
            *,
            artesano:artesanos(id, nombres, apellidos),
            ctpsfs:ctpsfs(
              id, 
              numero,
              procesos_transformacion:ctpsfs_procesos_transformacion(
                id,
                ctpsfs_id,
                descripcion_producto,
                cantidad,
                unidad,
                documentacion_tenencia,
                fecha_certificacion,
                artesano_id,
                created_at,
                updated_at
              )
            )
          `)
          .or('nft_creado.is.null,nft_creado.eq.false')
          .order('created_at', { ascending: false })

        if (productosError) throw productosError
        setProductos(productosData || [])

      } catch (error: any) {
        console.error('Error cargando datos:', error)
        const errorMessage = error?.message || 'Error desconocido al cargar los datos'
        setError(`Error cargando datos: ${errorMessage}`)
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [])

  const handleNavigation = (section: string) => {
    switch (section) {
      case 'inicio':
        router.push('/')
        break
      case 'admin':
        router.push('/admin')
        break
      case 'catalogo':
        router.push('/catalogo')
        break
      case 'productos':
        router.push('/productos')
        break
      default:
        console.log(`Navegando a ${section}`)
    }
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAccessOption = (accessType: string) => {
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

  // Función para calcular el peso en gramos del último proceso de transformación
  const calcularPesoFibra = (producto: ProductoCompleto): string => {
    if (!producto.ctpsfs?.procesos_transformacion || producto.ctpsfs.procesos_transformacion.length === 0) {
      return producto.peso_fibra_gramos?.toString() || '0'
    }

    // Obtener el último proceso de transformación (más reciente por fecha)
    const ultimoProceso = producto.ctpsfs.procesos_transformacion
      .sort((a, b) => new Date(b.fecha_certificacion).getTime() - new Date(a.fecha_certificacion).getTime())[0]

    // Convertir de kilogramos a gramos
    const pesoEnGramos = ultimoProceso.cantidad * 1000
    return pesoEnGramos.toString()
  }

  // Función para manejar la selección de producto
  const handleProductoSelection = (productoId: string) => {
    const producto = productos.find(p => p.id.toString() === productoId)
    
    if (producto) {
      const nombreArtesano = producto.artesano 
        ? `${producto.artesano.nombres} ${producto.artesano.apellidos}`
        : ''
      
      const numeroCTPSFS = producto.ctpsfs?.numero || ''
      const pesoFibra = calcularPesoFibra(producto)

      setFormData(prev => ({
        ...prev,
        productoId: productoId,
        nombreProducto: producto.nombre_prenda,
        nombreArtesano: nombreArtesano,
        numeroCTPSFS: numeroCTPSFS,
        pesoFibra: pesoFibra
      }))
    } else {
      // Limpiar campos si no se selecciona producto
      setFormData(prev => ({
        ...prev,
        productoId: '',
        nombreProducto: '',
        nombreArtesano: '',
        numeroCTPSFS: '',
        pesoFibra: ''
      }))
    }
  }

  // Conectar MetaMask
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        
        setAccount(accounts[0])
        setIsConnected(true)
        setFormData(prev => ({ ...prev, walletAddress: accounts[0] }))
        setError('')
        setSuccess('Wallet conectado exitosamente')
      } else {
        setError('MetaMask no está instalado. Por favor, instala MetaMask.')
      }
    } catch (error) {
      console.error('Error conectando wallet:', error)
      setError('Error al conectar con MetaMask')
    }
  }

  // Manejar cambios en el formulario (solo para wallet address)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Por ahora, la búsqueda no tiene funcionalidad específica en esta página
    // Se mantiene para consistencia con el header de admin
    console.log('Búsqueda:', searchTerm)
  }

  // Mintear NFT
  const mintNFT = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!isConnected) {
      setError('Por favor, conecta tu wallet primero')
      return
    }

    // Validar que se haya seleccionado un producto
    if (!formData.productoId) {
      setError('Por favor, selecciona un producto')
      return
    }

    // Validar que todos los campos estén completos
    if (!formData.walletAddress || !formData.nombreProducto || !formData.nombreArtesano || !formData.numeroCTPSFS || !formData.pesoFibra) {
      setError('Por favor, completa todos los campos')
      return
    }

    setIsLoading(true)
    setError('')
    setSuccess('')
    setTxHash('')

    try {
      if (!window.ethereum) {
        setError('MetaMask no está instalado')
        return
      }
      
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PRENDA_NFT_ABI, signer)

      // Verificar que estamos en Sepolia
      const network = await provider.getNetwork()
      const sepoliaChainId = 11155111
      const currentChainId = Number(network.chainId)
      
      if (currentChainId !== sepoliaChainId) {
        setError(`Red incorrecta detectada: ${network.name || 'Desconocida'} (ID: ${currentChainId}). Por favor, cambia a Sepolia (ID: ${sepoliaChainId}) en MetaMask`)
        setIsLoading(false)
        return
      }

      // Llamar a la función mintPrenda
      const tx = await contract.mintPrenda(
        formData.walletAddress,
        formData.nombreProducto,
        formData.nombreArtesano,
        formData.numeroCTPSFS,
        ethers.parseUnits(formData.pesoFibra, 0) // Convertir a uint256
      )

      setTxHash(tx.hash)
      setSuccess('Transacción enviada. Esperando confirmación...')
      
      // Esperar confirmación
      const receipt = await tx.wait()
      
      // Obtener el token ID del evento emitido
      let tokenId = null
      if (receipt && receipt.logs) {
        // Buscar el evento Transfer para obtener el token ID
        for (const log of receipt.logs) {
          try {
            const parsedLog = contract.interface.parseLog(log)
            if (parsedLog && parsedLog.name === 'Transfer') {
              tokenId = parsedLog.args[2] // El token ID es el tercer argumento del evento Transfer
              break
            }
          } catch (e) {
            // Ignorar logs que no son del contrato
          }
        }
      }

      // Actualizar la base de datos para marcar que se ha creado el NFT
      try {
        const { error: updateError } = await supabase
          .from('productos')
          .update({
            nft_creado: true,
            nft_transaction_hash: tx.hash,
            nft_token_id: tokenId ? Number(tokenId) : null
          })
          .eq('id', parseInt(formData.productoId))

        if (updateError) {
          console.error('Error actualizando producto:', updateError)
          setError('NFT creado exitosamente, pero hubo un error actualizando la base de datos')
          return
        }
      } catch (dbError) {
        console.error('Error de base de datos:', dbError)
        setError('NFT creado exitosamente, pero hubo un error actualizando la base de datos')
        return
      }
      
      setSuccess('¡NFT generado exitosamente y base de datos actualizada!')
      
      // Limpiar formulario
      setFormData({
        productoId: '',
        nombreProducto: '',
        nombreArtesano: '',
        numeroCTPSFS: '',
        pesoFibra: '',
        walletAddress: account || ''
      })

    } catch (error: any) {
      console.error('Error generando NFT:', error)
      setError(`Error: ${error.message || 'Error desconocido'}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Igual al de la página admin */}
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
                          {profile?.full_name || 'Administrador'}
                        </p>
                        <p className="text-xs opacity-75" style={{ color: '#ecd2b4' }}>
                          {profile?.email}
                        </p>
                        <p className="text-xs opacity-60 capitalize" style={{ color: '#ecd2b4' }}>
                          {profile?.role?.name}
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación */}
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
        </div>

        {/* Título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Generar NFT de Prendas
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Crea NFTs únicos para prendas artesanales con trazabilidad blockchain
          </p>
        </div>

        {/* Formulario Principal */}
        <div className="rounded-lg shadow-lg p-8" style={{ backgroundColor: '#0f324b' }}>
          
          {/* Conexión de Wallet */}
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4 font-maria-david" style={{ color: '#ecd2b4' }}>
              Conexión de Wallet
            </h3>
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="w-full py-3 px-6 rounded-lg font-bold transition-all duration-200 hover:opacity-80"
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                🦊 Conectar MetaMask
              </button>
            ) : (
              <div className="p-4 rounded-lg border-2" style={{ borderColor: '#ecd2b4', backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                  <span style={{ color: '#ecd2b4' }}>
                    Conectado: {account.slice(0, 6)}...{account.slice(-4)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Formulario de NFT */}
          {loadingData ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: '#ecd2b4' }}></div>
              <p style={{ color: '#ecd2b4' }}>Cargando datos...</p>
            </div>
          ) : (
            <form onSubmit={mintNFT} className="space-y-6">
              <h3 className="text-xl font-bold mb-6 font-maria-david" style={{ color: '#ecd2b4' }}>
                Información del NFT
              </h3>

              {/* Selección de Producto */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Seleccionar Producto *
                </label>
                <select
                  value={formData.productoId}
                  onChange={(e) => handleProductoSelection(e.target.value)}
                  required
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white"
                  style={{ borderColor: '#ecd2b4' }}
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map((producto) => (
                    <option 
                      key={producto.id} 
                      value={producto.id}
                    >
                      {producto.nombre_prenda} - {producto.artesano ? `${producto.artesano.nombres} ${producto.artesano.apellidos}` : 'Sin artesano'}
                      {producto.ctpsfs ? ` - CTPSFS ${producto.ctpsfs.numero}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Nombre del Producto (Solo lectura) */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Nombre del Producto
                </label>
                <input
                  type="text"
                  value={formData.nombreProducto}
                  readOnly
                  placeholder="Se completará automáticamente al seleccionar un producto"
                  className="w-full px-4 py-3 rounded-lg border-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  style={{ borderColor: '#ecd2b4' }}
                />
              </div>

              {/* Artesano (Solo lectura) */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Artesano
                </label>
                <input
                  type="text"
                  value={formData.nombreArtesano}
                  readOnly
                  placeholder="Se completará automáticamente al seleccionar un producto"
                  className="w-full px-4 py-3 rounded-lg border-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  style={{ borderColor: '#ecd2b4' }}
                />
              </div>

              {/* CTPSFS (Solo lectura) */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Certificado CTPSFS
                </label>
                <input
                  type="text"
                  value={formData.numeroCTPSFS}
                  readOnly
                  placeholder="Se completará automáticamente al seleccionar un producto"
                  className="w-full px-4 py-3 rounded-lg border-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  style={{ borderColor: '#ecd2b4' }}
                />
              </div>

              {/* Peso de Fibra (Solo lectura) */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Peso de Fibra (gramos)
                </label>
                <input
                  type="text"
                  value={formData.pesoFibra}
                  readOnly
                  placeholder="Se calculará automáticamente al seleccionar un producto"
                  className="w-full px-4 py-3 rounded-lg border-2 text-gray-900 bg-gray-100 cursor-not-allowed"
                  style={{ borderColor: '#ecd2b4' }}
                />
              </div>

              {/* Dirección del Wallet */}
              <div>
                <label className="block text-sm font-bold mb-2" style={{ color: '#ecd2b4' }}>
                  Dirección del Wallet *
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  required
                  placeholder="0x..."
                  className="w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-opacity-50 text-gray-900 bg-white placeholder-gray-500"
                  style={{ borderColor: '#ecd2b4' }}
                />
              </div>

              {/* Botón de Generar NFT */}
              <button
                type="submit"
                disabled={!isConnected || isLoading || !formData.productoId || !formData.walletAddress}
                className={`w-full font-bold py-4 px-6 rounded-lg transition-all duration-200 ${
                  !isConnected || isLoading || !formData.productoId || !formData.walletAddress
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:opacity-80'
                }`}
                style={{ backgroundColor: '#ecd2b4', color: '#0f324b' }}
              >
                {isLoading ? '⏳ Generando NFT...' : '🚀 Generar NFT'}
              </button>
            </form>
          )}

          {/* Mensajes de estado */}
          {error && (
            <div className="mt-6 p-4 rounded-lg border-2 border-red-400" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <p className="text-red-400">❌ {error}</p>
            </div>
          )}

          {success && (
            <div className="mt-6 p-4 rounded-lg border-2" style={{ borderColor: '#ecd2b4', backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
              <p style={{ color: '#ecd2b4' }}>✅ {success}</p>
            </div>
          )}

          {txHash && (
            <div className="mt-6 p-4 rounded-lg border-2" style={{ borderColor: '#ecd2b4', backgroundColor: 'rgba(236, 210, 180, 0.1)' }}>
              <p style={{ color: '#ecd2b4' }}>
                🔗 Transacción: 
                <a 
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline ml-1 hover:opacity-80"
                >
                  Ver en Etherscan
                </a>
              </p>
            </div>
          )}

          {/* Instrucciones */}
          <div className="mt-8 p-6 rounded-lg border-2" style={{ borderColor: '#ecd2b4', backgroundColor: 'rgba(236, 210, 180, 0.05)' }}>
            <h3 className="font-bold mb-4 font-maria-david" style={{ color: '#ecd2b4' }}>
              📋 Instrucciones:
            </h3>
            <ol className="list-decimal list-inside text-sm space-y-2" style={{ color: '#ecd2b4' }}>
              <li>Asegúrate de tener MetaMask instalado y conectado a Sepolia</li>
              <li>Ten suficiente SepoliaETH para las tarifas de gas</li>
              <li>Selecciona el artesano y certificado CTPSFS correspondientes</li>
              <li>Completa todos los campos del formulario</li>
              <li>Haz clic en "Generar NFT" y confirma la transacción en MetaMask</li>
            </ol>
          </div>
        </div>
      </main>
    </div>
  )
}