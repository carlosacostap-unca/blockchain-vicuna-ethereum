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
    if (section === 'productos') {
      router.push('/productos')
    } else if (section === 'catalogo') {
      router.push('/catalogo')
    } else if (onNavigate) {
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

      {/* Locations Section */}
      <section 
        className="py-20"
        style={{
          background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('/images/section-vicuna2-background.webp'), linear-gradient(135deg, #10b981 0%, #059669 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-4" style={{ position: 'relative', zIndex: 20 }}>
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            UBICACIONES
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Antofagasta de la Sierra */}
            <div 
              className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ 
                minHeight: '300px',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/antofagasta-de-la-sierra-card.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 10
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-2" style={{ zIndex: 15, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}>
                  ANTOFAGASTA DE LA SIERRA
                </h3>
                <p className="text-white text-sm opacity-90" style={{ zIndex: 15, filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
                  Descubre la belleza de esta región única
                </p>
              </div>
            </div>

            {/* Belén */}
            <div 
              className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ 
                minHeight: '300px',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/belen-card.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 10
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-2" style={{ zIndex: 15, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}>
                  BELÉN
                </h3>
                <p className="text-white text-sm opacity-90" style={{ zIndex: 15, filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
                  Explora la tradición artesanal de Belén
                </p>
              </div>
            </div>

            {/* Santa María */}
            <div 
              className="relative overflow-hidden rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer"
              style={{ 
                minHeight: '300px',
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('/images/santa-maria-card.webp')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                zIndex: 10
              }}
            >
              <div className="absolute inset-0 flex flex-col justify-end p-6">
                <h3 className="text-xl font-bold text-white mb-2" style={{ zIndex: 15, filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.8))' }}>
                  SANTA MARÍA
                </h3>
                <p className="text-white text-sm opacity-90" style={{ zIndex: 15, filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.8))' }}>
                  Conoce la cultura ancestral de Santa María
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nueva sección "Programa de Formación Profesional y Cultural" */}
      <section 
        className="min-h-screen flex items-center justify-center py-20"
        style={{
          background: `
            linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)),
            url("/images/blockchain-section-background.webp"),
            linear-gradient(135deg, #8B4513 0%, #654321 50%, #3E2723 100%)
          `,
          backgroundSize: 'cover, cover, cover',
          backgroundPosition: 'center, center, center',
          backgroundRepeat: 'no-repeat, no-repeat, no-repeat',
          position: 'relative'
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <div className="w-16 h-16 rounded-full border-2 border-amber-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        </div>

        {/* Decorative lines */}
        <div className="absolute top-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-50"></div>
        <div className="absolute bottom-12 left-0 w-full h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-50"></div>

        {/* Corner decorations */}
        <div className="absolute bottom-8 left-8">
          <svg className="w-16 h-16 text-amber-200 opacity-30" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute bottom-8 right-8">
          <svg className="w-16 h-16 text-amber-200 opacity-30" fill="currentColor" viewBox="0 0 24 24" style={{ transform: 'scaleX(-1)' }}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>

        {/* Contenido principal */}
        <div 
          className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 text-white"
          style={{ position: 'relative', zIndex: 10 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8" style={{ 
              color: '#ecd2b4',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              letterSpacing: '0.05em'
            }}>
              PROGRAMA DE FORMACIÓN PROFESIONAL Y CULTURAL EN LA RUTA DEL TELAR
            </h2>
          </div>

          <div className="space-y-8 text-lg md:text-xl leading-relaxed">
            <p className="text-center" style={{ 
              color: '#f5f5f5',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              lineHeight: '1.8'
            }}>
              Desarrollado por el Ministerio de Trabajo, Planificación y Recursos Humanos de Catamarca junto a la UNESCO, Alwaleed 
              Philanthropies y el Consejo Federal de Inversiones (CFI), se creó la misión de poner en valor los saberes ancestrales 
              de artesanos textiles de Catamarca y garantizar su transmisión intergeneracional.
            </p>

            <p className="text-center" style={{ 
              color: '#f5f5f5',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              lineHeight: '1.8'
            }}>
              En este marco, se desarrolló un sistema de trazabilidad basado en tecnología blockchain para fortalecer la cadena de 
              valor y promover el comercio justo de las prendas de vicuña, con la posibilidad de incorporar otros productos artesanales 
              y productivos en un mediano plazo.
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Logos de Organizaciones */}
      <section 
        className="py-12"
        style={{ backgroundColor: '#ecd2b4' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            {/* Logo Gobierno de Catamarca - Ministerio */}
            <div className="flex-shrink-0">
              <Image
                src="/images/logo-ministerio.webp"
                alt="Gobierno de Catamarca - Ministerio de Trabajo, Planificación y Recursos Humanos"
                width={200}
                height={80}
                className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </div>

            {/* Logo CFI */}
            <div className="flex-shrink-0">
              <Image
                src="/images/logo-cfi.webp"
                alt="Consejo Federal de Inversiones"
                width={120}
                height={80}
                className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </div>

            {/* Logo Alwaleed Philanthropies */}
            <div className="flex-shrink-0">
              <Image
                src="/images/logo-alwaleed-philanthropies.webp"
                alt="Alwaleed Philanthropies"
                width={120}
                height={80}
                className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </div>

            {/* Logo UNESCO */}
            <div className="flex-shrink-0">
              <Image
                src="/images/logo-unesco.webp"
                alt="UNESCO"
                width={120}
                height={80}
                className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </div>

            {/* Logo Ruta del Telar */}
            <div className="flex-shrink-0">
              <Image
                src="/images/logo-ruta-del-telar.webp"
                alt="Ruta del Telar"
                width={120}
                height={80}
                className="h-12 md:h-16 lg:h-20 w-auto object-contain"
              />
            </div>
          </div>
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

      {/* Footer Section */}
      <footer 
        className="py-16"
        style={{
          backgroundColor: '#0f324b'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            
            {/* Logo de Vicuña */}
            <div className="flex justify-center md:justify-start">
              <div className="text-white">
                <svg 
                  className="w-20 h-20 md:w-24 md:h-24" 
                  fill="currentColor" 
                  viewBox="0 0 100 100"
                  style={{ color: '#ecd2b4' }}
                >
                  <path d="M20 80 Q20 70 25 65 L30 60 Q35 55 40 60 L45 65 Q50 70 50 80 L50 85 Q45 90 40 85 L35 80 Q30 75 25 80 L20 80 Z M40 45 Q45 40 50 45 L55 50 Q60 55 55 60 L50 65 Q45 70 40 65 L35 60 Q30 55 35 50 L40 45 Z M25 30 Q30 25 35 30 L40 35 Q45 40 40 45 L35 50 Q30 55 25 50 L20 45 Q15 40 20 35 L25 30 Z"/>
                </svg>
              </div>
            </div>

            {/* Información de Dirección */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#ecd2b4' }}>
                DIRECCIÓN
              </h3>
              <div className="text-white space-y-1">
                <p className="text-sm">Ministerio de Trabajo, Planificación y Recursos Humanos</p>
                <p className="text-sm">Pabellón 3, C.A.P.E. Av. Venezuela S/N</p>
                <p className="text-sm">Catamarca, Argentina</p>
              </div>
            </div>

            {/* QR Code y Redes Sociales */}
            <div className="flex flex-col items-center md:items-end space-y-6">
              
              {/* Código QR */}
              <div className="bg-white p-3 rounded-lg">
                <div className="w-16 h-16 bg-black relative">
                  <svg className="w-full h-full" viewBox="0 0 100 100" fill="currentColor">
                    {/* QR Code pattern simulation */}
                    <rect x="0" y="0" width="20" height="20"/>
                    <rect x="25" y="0" width="5" height="5"/>
                    <rect x="35" y="0" width="5" height="5"/>
                    <rect x="45" y="0" width="5" height="5"/>
                    <rect x="55" y="0" width="5" height="5"/>
                    <rect x="65" y="0" width="5" height="5"/>
                    <rect x="75" y="0" width="20" height="20"/>
                    
                    <rect x="0" y="25" width="5" height="5"/>
                    <rect x="10" y="25" width="5" height="5"/>
                    <rect x="20" y="25" width="5" height="5"/>
                    <rect x="30" y="25" width="5" height="5"/>
                    <rect x="40" y="25" width="5" height="5"/>
                    <rect x="50" y="25" width="5" height="5"/>
                    <rect x="60" y="25" width="5" height="5"/>
                    <rect x="70" y="25" width="5" height="5"/>
                    <rect x="80" y="25" width="5" height="5"/>
                    <rect x="90" y="25" width="5" height="5"/>
                    
                    <rect x="0" y="75" width="20" height="20"/>
                    <rect x="25" y="75" width="5" height="5"/>
                    <rect x="35" y="75" width="5" height="5"/>
                    <rect x="45" y="75" width="5" height="5"/>
                    <rect x="55" y="75" width="5" height="5"/>
                    <rect x="65" y="75" width="5" height="5"/>
                    <rect x="75" y="75" width="20" height="20"/>
                  </svg>
                </div>
              </div>

              {/* Título y Redes Sociales */}
              <div className="text-center md:text-right">
                <h3 className="text-xl font-bold mb-4" style={{ color: '#ecd2b4' }}>
                  Ruta del Telar
                </h3>
                
                {/* Iconos de Redes Sociales */}
                <div className="flex space-x-4 justify-center md:justify-end">
                  {/* Facebook */}
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4' }}
                  >
                    <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4' }}
                  >
                    <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323C5.902 8.198 7.053 7.708 8.35 7.708s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387zm7.718 0c-1.297 0-2.448-.49-3.323-1.297-.897-.875-1.387-2.026-1.387-3.323s.49-2.448 1.297-3.323c.875-.897 2.026-1.387 3.323-1.387s2.448.49 3.323 1.297c.897.875 1.387 2.026 1.387 3.323s-.49 2.448-1.297 3.323c-.875.897-2.026 1.387-3.323 1.387z"/>
                    </svg>
                  </a>

                  {/* YouTube */}
                  <a 
                    href="#" 
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 hover:opacity-80"
                    style={{ backgroundColor: '#ecd2b4' }}
                  >
                    <svg className="w-5 h-5 text-blue-900" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </div>
  )
}