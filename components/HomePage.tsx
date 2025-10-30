'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface HomePageProps {
  onNavigate?: (section: string) => void
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const handleNavigation = (section: string) => {
    if (onNavigate) {
      onNavigate(section)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí se implementará la lógica de búsqueda
    console.log('Buscando:', searchTerm)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="shadow-lg" style={{ backgroundColor: '#0f324b' }}>
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
              <button
                className="flex flex-row justify-center items-center w-8 h-8 space-x-1 hover:opacity-80 transition-opacity duration-200"
                onClick={() => console.log('Menú hamburguesa clickeado')}
              >
                <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
                <div className="w-0.5 h-6" style={{ backgroundColor: '#ecd2b4' }}></div>
              </button>
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

      {/* Nueva sección "¿Qué es la Ruta del Telar?" - Solución definitiva */}
      <section 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `
            linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
            url("/images/section-vicuna-background.webp"),
            linear-gradient(135deg, #2c5530 0%, #1a3d1f 50%, #0f2912 100%)
          `,
          backgroundSize: 'cover, cover, cover',
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
          position: 'relative'
        }}
      >
        {/* Contenido */}
        <div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6" style={{ color: '#ecd2b4' }}>
            ¿Qué es la Ruta del Telar?
          </h2>
          <p className="text-lg">
            Un proyecto que impulsa el desarrollo local y fortalece a las comunidades de Catamarca.
          </p>
        </div>
      </section>

      {/* Nueva sección "Estaciones de la Ruta del Telar" */}
      <section 
        className="min-h-screen flex items-center justify-center"
        style={{
          background: `
            linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)),
            url("/images/section-stations-background.webp"),
            linear-gradient(135deg, #2c5530 0%, #1a3d1f 50%, #0f2912 100%)
          `,
          backgroundSize: 'cover, cover, cover',
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
          position: 'relative'
        }}
      >
        {/* Contenido */}
        <div 
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white text-center"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <p className="text-xl md:text-2xl lg:text-3xl font-light leading-relaxed" style={{ color: '#ecd2b4' }}>
            Con 14 estaciones distribuidas en 3 departamentos, conecta territorios y saberes, ofreciendo experiencias únicas a quienes la recorren.
          </p>
        </div>
      </section>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido a Ruta del Telar
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Descubre la autenticidad y tradición de nuestros productos artesanales
          </p>
          
          {/* Aquí se añadirá más contenido en las siguientes iteraciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            <div 
              onClick={() => handleNavigation('catalogo')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="text-slate-700 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Catálogo</h3>
              <p className="text-gray-600">Explora nuestra colección completa</p>
            </div>

            <div 
              onClick={() => handleNavigation('productos')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
            >
              <div className="text-slate-700 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Productos</h3>
              <p className="text-gray-600">Gestiona el inventario</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="text-slate-700 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Artesanos</h3>
              <p className="text-gray-600">Conoce a nuestros creadores</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer">
              <div className="text-slate-700 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enlaces</h3>
              <p className="text-gray-600">Recursos y conexiones</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}