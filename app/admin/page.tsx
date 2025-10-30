'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

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

  const handleAdminAction = (action: string) => {
    console.log(`Acción de administrador: ${action}`)
    // Aquí se implementará la navegación a cada sección administrativa
    switch (action) {
      case 'mis-datos':
        // router.push('/admin/mis-datos')
        console.log('Navegando a Administrar Mis Datos')
        break
      case 'artesanos':
        // router.push('/admin/artesanos')
        console.log('Navegando a Administrar Artesanos')
        break
      case 'cooperativas':
        // router.push('/admin/cooperativas')
        console.log('Navegando a Administrar Cooperativas')
        break
      case 'chakus':
        // router.push('/admin/chakus')
        console.log('Navegando a Administrar Chakus')
        break
      case 'colt':
        // router.push('/admin/colt')
        console.log('Navegando a Administrar C.O.L.T.')
        break
      case 'ctpsfs':
        // router.push('/admin/ctpsfs')
        console.log('Navegando a Administrar C.T.P.S.F.S.')
        break
      case 'prendas':
        // router.push('/admin/prendas')
        console.log('Navegando a Administrar Prendas')
        break
      case 'nft':
        // router.push('/admin/nft')
        console.log('Navegando a Generar NFT de Prendas')
        break
      case 'estadisticas':
        // router.push('/admin/estadisticas')
        console.log('Navegando a Ver Estadísticas Globales')
        break
      default:
        console.log(`Acción no reconocida: ${action}`)
    }
  }

  const adminCards = [
    {
      id: 'mis-datos',
      title: 'Administrar Mis Datos',
      description: 'Gestionar información personal y configuración de la cuenta',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="#ecd2b4"/>
          <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="#ecd2b4"/>
        </svg>
      )
    },
    {
      id: 'artesanos',
      title: 'Administrar Artesanos',
      description: 'Gestionar información de artesanos registrados en el sistema',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4C18.2091 4 20 5.79086 20 8C20 10.2091 18.2091 12 16 12C13.7909 12 12 10.2091 12 8C12 5.79086 13.7909 4 16 4Z" fill="#ecd2b4"/>
          <path d="M8 6C9.65685 6 11 7.34315 11 9C11 10.6569 9.65685 12 8 12C6.34315 12 5 10.6569 5 9C5 7.34315 6.34315 6 8 6Z" fill="#ecd2b4"/>
          <path d="M16 14C19.3137 14 22 16.6863 22 20V22H10V20C10 16.6863 12.6863 14 16 14Z" fill="#ecd2b4"/>
          <path d="M8 14C10.2091 14 12 15.7909 12 18V22H2V18C2 15.7909 3.79086 14 6 14H8Z" fill="#ecd2b4"/>
        </svg>
      )
    },
    {
      id: 'cooperativas',
      title: 'Administrar Cooperativas',
      description: 'Gestionar cooperativas y sus miembros',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 21V19C3 16.7909 4.79086 15 7 15H17C19.2091 15 21 16.7909 21 19V21H3Z" fill="#ecd2b4"/>
          <path d="M5 7H19C20.1046 7 21 7.89543 21 9V13H3V9C3 7.89543 3.89543 7 5 7Z" fill="#ecd2b4"/>
          <path d="M9 3H15C16.1046 3 17 3.89543 17 5V7H7V5C7 3.89543 7.89543 3 9 3Z" fill="#ecd2b4"/>
        </svg>
      )
    },
    {
      id: 'chakus',
      title: 'Administrar Chakus',
      description: 'Gestionar información y registro de chakus tradicionales',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" fill="#ecd2b4"/>
          <circle cx="12" cy="12" r="3" fill="#1e3a5f"/>
          <path d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9Z" fill="#ecd2b4"/>
        </svg>
      )
    },
    {
      id: 'colt',
      title: 'Administrar C.O.L.T.',
      description: 'Certificados de Origen y Legítima Tenencia',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z" fill="#ecd2b4"/>
          <path d="M7 7H17V9H7V7Z" fill="#1e3a5f"/>
          <path d="M7 11H17V13H7V11Z" fill="#1e3a5f"/>
          <path d="M7 15H13V17H7V15Z" fill="#1e3a5f"/>
        </svg>
      )
    },
    {
      id: 'ctpsfs',
      title: 'Administrar C.T.P.S.F.S.',
      description: 'Certificados de Transformación de Productos y Subproductos de Fauna Silvestre',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" fill="#ecd2b4"/>
          <path d="M14 2V8H20" fill="#1e3a5f"/>
          <path d="M7 12H17V14H7V12Z" fill="#1e3a5f"/>
          <path d="M7 16H17V18H7V16Z" fill="#1e3a5f"/>
        </svg>
      )
    },
    {
      id: 'prendas',
      title: 'Administrar Prendas',
      description: 'Gestionar información y tipos de prendas textiles del sistema',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H20C20.5523 4 21 4.44772 21 5C21 5.55228 20.5523 6 20 6H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H4C3.44772 6 3 5.55228 3 5C3 4.44772 3.44772 4 4 4H7Z" fill="#ecd2b4"/>
          <path d="M9 3V4H15V3H9Z" fill="#1e3a5f"/>
        </svg>
      )
    },
    {
      id: 'nft',
      title: 'Generar NFT de Prendas',
      description: 'Crear y gestionar NFTs para las prendas textiles',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6C2 4.89543 2.89543 4 4 4Z" fill="#ecd2b4"/>
          <path d="M8 8L12 12L16 8V16H8V8Z" fill="#1e3a5f"/>
          <circle cx="9" cy="9" r="1" fill="#ecd2b4"/>
        </svg>
      )
    },
    {
      id: 'estadisticas',
      title: 'Ver Estadísticas Globales',
      description: 'Visualizar métricas y estadísticas del sistema',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 3V21H21" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
          <path d="M7 14L11 10L15 14L19 8" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
          <rect x="6" y="14" width="2" height="6" fill="#ecd2b4"/>
          <rect x="10" y="10" width="2" height="10" fill="#ecd2b4"/>
          <rect x="14" y="14" width="2" height="6" fill="#ecd2b4"/>
          <rect x="18" y="8" width="2" height="12" fill="#ecd2b4"/>
        </svg>
      )
    }
  ]

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
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Título de Bienvenida */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 font-maria-david" style={{ color: '#0f324b' }}>
            Bienvenido, Administrador
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Selecciona una opción para gestionar el sistema
          </p>
        </div>

        {/* Grid de Tarjetas Administrativas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleAdminAction(card.id)}
              className="p-6 rounded-lg shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: '#0f324b' }}
            >
              <div className="text-center">
                <div className="flex justify-center mb-4">{card.icon}</div>
                <h3 className="text-xl font-bold mb-3 font-maria-david" style={{ color: '#ecd2b4' }}>
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#ecd2b4' }}>
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}