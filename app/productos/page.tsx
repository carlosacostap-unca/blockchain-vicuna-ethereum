'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const productos = [
  {
    id: 1,
    nombre: 'Bufandas',
    descripcion: 'Bufandas tejidas a mano con fibra de vicuña, suaves y cálidas para el invierno.',
    icono: (
      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 100 100">
        <path d="M20 30 Q30 25 40 30 L60 35 Q70 40 60 50 L40 55 Q30 60 20 55 L20 30 Z M25 40 Q35 35 45 40 L55 45 Q65 50 55 60 L45 65 Q35 70 25 65 L25 40 Z"/>
      </svg>
    )
  },
  {
    id: 2,
    nombre: 'Chalinas',
    descripcion: 'Elegantes chalinas de vicuña con diseños tradicionales de la Ruta del Telar.',
    icono: (
      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 100 100">
        <path d="M15 25 Q25 20 35 25 L65 30 Q75 35 65 45 L35 50 Q25 55 15 50 L15 25 Z M20 35 Q30 30 40 35 L60 40 Q70 45 60 55 L40 60 Q30 65 20 60 L20 35 Z M25 45 Q35 40 45 45 L55 50 Q65 55 55 65 L45 70 Q35 75 25 70 L25 45 Z"/>
      </svg>
    )
  },
  {
    id: 3,
    nombre: 'Guantes',
    descripcion: 'Guantes artesanales de vicuña que combinan calidez y elegancia.',
    icono: (
      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 100 100">
        <path d="M30 20 Q40 15 50 20 L50 60 Q45 65 40 60 L40 25 Q35 20 30 25 L30 20 Z M50 20 Q60 15 70 20 L70 60 Q65 65 60 60 L60 25 Q55 20 50 25 L50 20 Z M25 30 Q30 25 35 30 L35 70 Q30 75 25 70 L25 30 Z M20 40 Q25 35 30 40 L30 80 Q25 85 20 80 L20 40 Z M15 50 Q20 45 25 50 L25 85 Q20 90 15 85 L15 50 Z"/>
      </svg>
    )
  },
  {
    id: 4,
    nombre: 'Mantas',
    descripcion: 'Mantas de vicuña tejidas con técnicas ancestrales, perfectas para el hogar.',
    icono: (
      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 100 100">
        <path d="M10 20 Q20 15 30 20 L70 25 Q80 30 70 40 L30 45 Q20 50 10 45 L10 20 Z M15 35 Q25 30 35 35 L65 40 Q75 45 65 55 L35 60 Q25 65 15 60 L15 35 Z M20 50 Q30 45 40 50 L60 55 Q70 60 60 70 L40 75 Q30 80 20 75 L20 50 Z M25 65 Q35 60 45 65 L55 70 Q65 75 55 85 L45 90 Q35 95 25 90 L25 65 Z"/>
      </svg>
    )
  },
  {
    id: 5,
    nombre: 'Ponchos',
    descripcion: 'Ponchos tradicionales de vicuña con patrones únicos de la cultura catamarqueña.',
    icono: (
      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 100 100">
        <path d="M25 15 Q35 10 45 15 L55 20 Q65 25 55 35 L45 40 Q35 45 25 40 L25 15 Z M20 30 Q30 25 40 30 L60 35 Q70 40 60 50 L40 55 Q30 60 20 55 L20 30 Z M15 45 Q25 40 35 45 L65 50 Q75 55 65 65 L35 70 Q25 75 15 70 L15 45 Z M10 60 Q20 55 30 60 L70 65 Q80 70 70 80 L30 85 Q20 90 10 85 L10 60 Z"/>
      </svg>
    )
  }
]

export default function ProductosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()

  const handleNavigation = (section: string) => {
    if (section === 'inicio') {
      router.push('/')
    } else if (section === 'productos') {
      // Ya estamos en productos, no hacer nada
      return
    } else if (section === 'catalogo') {
      router.push('/catalogo')
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
        router.push('/login')
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
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg z-50" style={{ backgroundColor: '#0f324b' }}>
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

       {/* Main Content */}
      <main className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Title Section */}
          <div className="text-center mb-16">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: '#0f324b' }}
            >
              NUESTROS PRODUCTOS
            </h1>
            <p 
              className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed"
              style={{ color: '#0f324b' }}
            >
              Descubre nuestra colección exclusiva de productos artesanales elaborados 
              con la más fina fibra de vicuña, siguiendo técnicas tradicionales 
              transmitidas de generación en generación.
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {productos.map((producto) => (
              <div
                key={producto.id}
                className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300"
              >
                <div style={{ color: '#0f324b' }}>
                  {producto.icono}
                </div>
                
                <h3 
                  className="text-2xl font-bold mb-4"
                  style={{ color: '#0f324b' }}
                >
                  {producto.nombre}
                </h3>
                
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: '#0f324b' }}
                >
                  {producto.descripcion}
                </p>
                
                <button
                  className="px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity duration-200"
                  style={{ backgroundColor: '#0f324b' }}
                >
                  Ver Detalles
                </button>
              </div>
            ))}
          </div>

          {/* Additional Info Section */}
          <div className="mt-20 text-center">
            <div 
              className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto"
            >
              <h2 
                className="text-3xl font-bold mb-6"
                style={{ color: '#0f324b' }}
              >
                Fibra de Vicuña Premium
              </h2>
              <p 
                className="text-lg leading-relaxed mb-6"
                style={{ color: '#0f324b' }}
              >
                Todos nuestros productos están elaborados con fibra de vicuña de la más alta calidad, 
                obtenida de manera sostenible y ética. Cada pieza es única y cuenta con certificación 
                de autenticidad y trazabilidad blockchain.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div 
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#0f324b' }}
                  >
                    100%
                  </div>
                  <p style={{ color: '#0f324b' }}>Fibra Natural</p>
                </div>
                <div className="text-center">
                  <div 
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#0f324b' }}
                  >
                    ✓
                  </div>
                  <p style={{ color: '#0f324b' }}>Certificado</p>
                </div>
                <div className="text-center">
                  <div 
                    className="text-4xl font-bold mb-2"
                    style={{ color: '#0f324b' }}
                  >
                    🔗
                  </div>
                  <p style={{ color: '#0f324b' }}>Blockchain</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}