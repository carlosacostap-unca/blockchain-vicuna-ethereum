'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ArtesanoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Búsqueda:', searchTerm)
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

  const handleAccessOption = (option: string) => {
    switch (option) {
      case 'Administrador':
        router.push('/admin')
        break
      case 'Artesano':
        router.push('/artesano')
        break
      case 'Cooperativa':
        console.log('Navegando a Cooperativa')
        router.push('/cooperativa')
        break
      default:
        console.log(`Acceso ${option}`)
    }
    setIsMenuOpen(false)
  }

  const handleArtesanoAction = (actionId: string) => {
    switch (actionId) {
      case 'mis-datos':
        console.log('Navegando a Administrar Mis Datos')
        break
      case 'mis-prendas':
        console.log('Navegando a Administrar Mis Prendas')
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
        console.log(`Acción no reconocida: ${actionId}`)
    }
  }

  const artesanoCards = [
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
      id: 'mis-prendas',
      title: 'Administrar Mis Prendas',
      description: 'Gestionar el inventario personal de prendas textiles',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 4V2C7 1.44772 7.44772 1 8 1H16C16.5523 1 17 1.44772 17 2V4H20C20.5523 4 21 4.44772 21 5C21 5.55228 20.5523 6 20 6H19V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6H4C3.44772 6 3 5.55228 3 5C3 4.44772 3.44772 4 4 4H7Z" fill="#ecd2b4"/>
          <path d="M9 3V4H15V3H9Z" fill="#0f324b"/>
          <path d="M8 8H16V10H8V8Z" fill="#0f324b"/>
          <path d="M8 12H16V14H8V12Z" fill="#0f324b"/>
        </svg>
      )
    },
    {
      id: 'prendas-certificadas',
      title: 'Visualizar Mis Prendas Certificadas',
      description: 'Ver el estado y certificaciones de mis prendas registradas',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L15.09 8.26L22 9L16 14.74L17.18 21.02L12 18.77L6.82 21.02L8 14.74L2 9L8.91 8.26L12 2Z" fill="#ecd2b4"/>
          <circle cx="12" cy="12" r="4" fill="#0f324b"/>
          <path d="M10 12L11 13L14 10" stroke="#ecd2b4" strokeWidth="2" fill="none"/>
        </svg>
      )
    },
    {
      id: 'transferir-prendas',
      title: 'Transferir Prendas Que Actualmente Poseo',
      description: 'Realizar transferencias de prendas a otros usuarios del sistema',
      icon: (
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12L7 8V11H17V13H7V16L3 12Z" fill="#ecd2b4"/>
          <path d="M21 12L17 16V13H7V11H17V8L21 12Z" fill="#ecd2b4"/>
          <circle cx="12" cy="6" r="2" fill="#0f324b"/>
          <circle cx="12" cy="18" r="2" fill="#0f324b"/>
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
          <path d="M7 7H17V9H7V7Z" fill="#0f324b"/>
          <path d="M7 11H17V13H7V11Z" fill="#0f324b"/>
          <path d="M7 15H13V17H7V15Z" fill="#0f324b"/>
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
          <path d="M14 2V8H20" fill="#0f324b"/>
          <path d="M7 12H17V14H7V12Z" fill="#0f324b"/>
          <path d="M7 16H17V18H7V16Z" fill="#0f324b"/>
        </svg>
      )
    }
  ]

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header */}
      <header style={{ backgroundColor: '#0f324b' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            {/* Logo */}
            <div className="flex justify-start lg:w-0 lg:flex-1">
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
            Bienvenido, Artesano
          </h1>
          <p className="text-lg" style={{ color: '#0f324b' }}>
            Selecciona una opción para gestionar tus actividades
          </p>
        </div>

        {/* Grid de Tarjetas del Artesano */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artesanoCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleArtesanoAction(card.id)}
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