'use client'

import React, { useState, useEffect } from 'react'

// Componente de prueba para imágenes
const TestImageComponent = () => {
  const [imageStatus, setImageStatus] = useState<{[key: string]: string}>({})
  
  // URLs de prueba (las mismas que funcionan en el diagnóstico)
  const testImages = [
    'https://okpswnjzzilsfcihoqen.supabase.co/storage/v1/object/public/productos-fotos/1/producto_1_0_1761693017141.png',
    'https://okpswnjzzilsfcihoqen.supabase.co/storage/v1/object/public/productos-fotos/1/producto_1_1_1761693018454.jpg',
    'https://okpswnjzzilsfcihoqen.supabase.co/storage/v1/object/public/productos-fotos/1/producto_1_2_1761693019456.jpg'
  ]

  const handleImageLoad = (url: string) => {
    console.log('✅ Imagen cargada:', url)
    setImageStatus(prev => ({ ...prev, [url]: 'loaded' }))
  }

  const handleImageError = (url: string) => {
    console.error('❌ Error cargando imagen:', url)
    setImageStatus(prev => ({ ...prev, [url]: 'error' }))
  }

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Test de Imágenes de Supabase</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testImages.map((imageUrl, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-3">Imagen {index + 1}</h3>
            
            {/* Método 1: img tag simple */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Método 1: img tag simple</h4>
              <img
                src={imageUrl}
                alt={`Test imagen ${index + 1}`}
                className="w-full h-32 object-cover border rounded"
                onLoad={() => handleImageLoad(imageUrl)}
                onError={() => handleImageError(imageUrl)}
              />
              <p className="text-xs mt-1">
                Status: {imageStatus[imageUrl] || 'loading...'}
              </p>
            </div>

            {/* Método 2: con background-image */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Método 2: background-image</h4>
              <div
                className="w-full h-32 bg-cover bg-center border rounded"
                style={{ backgroundImage: `url(${imageUrl})` }}
              />
            </div>

            {/* Método 3: Next.js Image (si está disponible) */}
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Método 3: URL directa</h4>
              <a 
                href={imageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline text-sm"
              >
                Abrir en nueva pestaña
              </a>
            </div>

            <div className="text-xs text-gray-500 break-all">
              URL: {imageUrl}
            </div>
          </div>
        ))}
      </div>

      {/* Test adicional con diferentes estilos */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Test con diferentes estilos CSS</h2>
        <div className="grid grid-cols-2 gap-4">
          {testImages.slice(0, 1).map((imageUrl, index) => (
            <div key={index}>
              {/* Sin estilos especiales */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Sin estilos especiales</h4>
                <img src={imageUrl} alt="Test" />
              </div>

              {/* Con estilos básicos */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Con estilos básicos</h4>
                <img 
                  src={imageUrl} 
                  alt="Test" 
                  style={{ width: '200px', height: '150px', objectFit: 'cover' }}
                />
              </div>

              {/* Con clases Tailwind */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Con clases Tailwind</h4>
                <img 
                  src={imageUrl} 
                  alt="Test" 
                  className="w-48 h-36 object-cover rounded border"
                />
              </div>

              {/* Simulando el estilo del modal */}
              <div className="mb-4">
                <h4 className="text-sm font-medium mb-2">Estilo del modal</h4>
                <img
                  src={imageUrl}
                  alt="Test modal style"
                  className="w-full h-32 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 hover:opacity-80 bg-gray-200"
                  style={{ 
                    borderColor: '#ecd2b4',
                    minHeight: '128px',
                    backgroundColor: '#f3f4f6'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TestImageComponent