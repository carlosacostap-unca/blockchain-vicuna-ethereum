'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CooperativaPage() {
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
    console.log('Búsqueda:', searchTerm)
  }

  const handleAccessOption = (option: string) => {
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
        console.log(`Acceso ${option}`)
    }
    setIsMenuOpen(false)
  }

  const handleCooperativaAction = (action: string) => {
    console.log(`Acción de cooperativa: ${action}`)
    // Aquí se implementará la navegación a cada sección de la cooperativa
    switch (action) {
      case 'mis-datos':
        console.log('Navegando a Administrar Mis Datos')
        break
      case 'mis-prendas':
        console.log('Navegando a Administrar Mis Prendas')
        break
      case 'mis-artesanos':
        console.log('Navegando a Administrar Mis Artesanos')
        break
      case 'prendas-certificadas':
        console.log('Navegando a Visualizar Mis Prendas Certificadas')
        break
      case 'transferir-prendas':
        console.log('Navegando a Transferir Prendas Que Actualmente Poseo')
        break
      case 'colt':
        console.log('Navegando a Administrar C.O.L.T.')
        break
      case 'ctpsfs':
        console.log('Navegando a Administrar C.T.P.S.F.S.')
        break
      default:
        console.log(`Acción no reconocida: ${action}`)
    }
  }

  // Definición de las tarjetas de la cooperativa
  const cooperativaCards = [
    {
      id: 'mis-datos',
      title: 'Administrar Mis Datos',
      description: 'Gestionar información personal y configuración de la cooperativa',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="4" fill="#ecd2b4"/>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 'mis-prendas',
      title: 'Administrar Mis Prendas',
      description: 'Gestionar información y tipos de prendas textiles de la cooperativa',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L8 6v12l4-2 4 2V6l-4-4z" fill="#ecd2b4"/>
          <path d="M8 6h8M10 10h4M10 14h4" stroke="#0f324b" strokeWidth="1"/>
        </svg>
      )
    },
    {
      id: 'mis-artesanos',
      title: 'Administrar Mis Artesanos',
      description: 'Gestionar artesanos registrados en la cooperativa',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <circle cx="9" cy="7" r="3" fill="#ecd2b4"/>
          <circle cx="15" cy="7" r="3" fill="#ecd2b4"/>
          <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
          <path d="M13 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 'prendas-certificadas',
      title: 'Visualizar Mis Prendas Certificadas',
      description: 'Ver prendas certificadas y sus detalles de autenticidad',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#ecd2b4"/>
          <circle cx="12" cy="12" r="3" fill="#0f324b"/>
        </svg>
      )
    },
    {
      id: 'transferir-prendas',
      title: 'Transferir Prendas Que Actualmente Poseo',
      description: 'Transferir propiedad de prendas a otros usuarios',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <path d="M7 17l5-5 5 5M7 7l5 5 5-5" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
          <circle cx="7" cy="17" r="2" fill="#ecd2b4"/>
          <circle cx="17" cy="7" r="2" fill="#ecd2b4"/>
        </svg>
      )
    },
    {
      id: 'colt',
      title: 'Administrar C.O.L.T.',
      description: 'Certificados de Origen y Legítima Tenencia',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" fill="#ecd2b4"/>
          <path d="M7 8h10M7 12h6M7 16h8" stroke="#0f324b" strokeWidth="1"/>
        </svg>
      )
    },
    {
      id: 'ctpsfs',
      title: 'Administrar C.T.P.S.F.S.',
      description: 'Certificados de Transformación de Productos y Subproductos de Fauna Silvestre',
      icon: (
        <svg className="w-12 h-12 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
          <rect x="4" y="4" width="16" height="16" rx="2" fill="#ecd2b4"/>
          <path d="M8 8h8M8 12h8M8 16h6" stroke="#0f324b" strokeWidth="1"/>
          <circle cx="18" cy="6" r="2" fill="#0f324b"/>
        </svg>
      )
    }
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ecd2b4' }}>
      {/* Header */}
      <header className="shadow-lg relative" style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Título */}
            <div className="flex-shrink-0">
              <h1 className="text-xl tracking-wide font-maria-david" style={{ color: '#ecd2b4' }}>
                RUTA DEL TELAR
              </h1>
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
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md hover:opacity-80 transition-opacity duration-200"
                  style={{ color: '#ecd2b4' }}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dropdown del menú */}
                {isMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50"
                    style={{ backgroundColor: '#0f324b' }}
                  >
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
            Bienvenido, Cooperativa
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Selecciona una opción para gestionar tu cooperativa
          </p>
        </div>

        {/* Grid de Tarjetas de la Cooperativa */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cooperativaCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCooperativaAction(card.id)}
              className="p-6 rounded-lg shadow-lg cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-xl"
              style={{ backgroundColor: '#0f324b' }}
            >
              <div className="text-center">
                {card.icon}
                <h3 className="text-xl font-semibold mb-2 font-maria-david" style={{ color: '#ecd2b4' }}>
                  {card.title}
                </h3>
                <p className="text-sm opacity-90" style={{ color: '#ecd2b4' }}>
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