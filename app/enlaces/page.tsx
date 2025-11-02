'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function EnlacesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Funcionalidad de búsqueda deshabilitada en página en construcción
  }

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAccessOption = (option: string) => {
    console.log(`Acceso ${option} seleccionado`)
    setIsMenuOpen(false)
    // Funcionalidad de acceso deshabilitada en página en construcción
  }

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ecd2b4' }}
    >
      {/* Header - Copiado de ProductosPage */}
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
                  disabled
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

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Título de la página */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#0f324b' }}>
            ENLACES
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto" style={{ color: '#0f324b' }}>
            Descubre recursos y conexiones importantes relacionadas con la Ruta del Telar.
          </p>
        </div>

        {/* Contenido en construcción */}
        <div className="max-w-4xl mx-auto">
          <div 
            className="rounded-lg shadow-lg p-8 md:p-12 text-center"
            style={{ backgroundColor: '#0f324b' }}
          >
            {/* Icono de enlaces/conexiones */}
            <div className="mb-8">
              <svg 
                className="w-16 h-16 mx-auto animate-pulse" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: '#ecd2b4' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: '#ecd2b4' }}>
              Página en Construcción
            </h2>
            
            <p className="text-lg mb-6 leading-relaxed" style={{ color: '#ecd2b4' }}>
              Estamos trabajando en esta sección para ofrecerte los mejores enlaces y recursos.
              <br />
              Pronto podrás acceder a información valiosa sobre organizaciones, instituciones y proyectos relacionados con la Ruta del Telar.
            </p>

            {/* Indicador de progreso */}
            <div className="flex justify-center items-center space-x-2 mb-8">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ecd2b4' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ecd2b4', animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#ecd2b4', animationDelay: '0.4s' }}></div>
            </div>

            {/* Botón de navegación */}
             <div className="flex justify-center">
               <button
                 onClick={() => handleNavigation('inicio')}
                 className="px-6 py-3 rounded-lg font-medium border-2 transition-all duration-200 hover:opacity-80 hover:scale-105"
                 style={{ 
                   borderColor: '#ecd2b4', 
                   color: '#ecd2b4',
                   backgroundColor: 'transparent'
                 }}
               >
                 🏠 Volver al Inicio
               </button>
             </div>
          </div>
        </div>
      </main>
    </div>
  )
}