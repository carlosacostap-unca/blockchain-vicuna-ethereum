'use client'

import { useState } from 'react'
import { ProductoWithRelations } from '../lib/supabase'

interface ProductoDetalleProps {
  producto: ProductoWithRelations
  onBack: () => void
  onEdit: (producto: ProductoWithRelations) => void
}

export default function ProductoDetalle({ producto, onBack, onEdit }: ProductoDetalleProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showImageModal, setShowImageModal] = useState(false)

  const openImageModal = (imageIndex: number = 0) => {
    console.log('Opening modal with image index:', imageIndex);
    console.log('Available photos:', producto.fotografias);
    console.log('Selected photo URL:', producto.fotografias?.[imageIndex]);
    
    if (producto.fotografias && producto.fotografias.length > 0 && imageIndex < producto.fotografias.length) {
      setSelectedImageIndex(imageIndex)
      setShowImageModal(true)
    } else {
      console.error('Invalid image index or no photos available');
    }
  }

  const closeImageModal = () => {
    setShowImageModal(false)
  }

  const nextImage = () => {
    if (producto.fotografias) {
      setSelectedImageIndex((prev) => 
        prev < producto.fotografias!.length - 1 ? prev + 1 : 0
      )
    }
  }

  const prevImage = () => {
    if (producto.fotografias) {
      setSelectedImageIndex((prev) => 
        prev > 0 ? prev - 1 : producto.fotografias!.length - 1
      )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al listado
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-3xl font-bold text-gray-800">{producto.nombre_prenda}</h1>
        </div>
        <button
          onClick={() => onEdit(producto)}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          Editar Producto
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div className="space-y-6">
          {producto.fotografias && producto.fotografias.length > 0 ? (
            <>
              {/* Imagen principal */}
              <div className="relative group">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <img
                    src={producto.fotografias[selectedImageIndex]}
                    alt={`${producto.nombre_prenda} - Imagen principal`}
                    className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    onClick={() => openImageModal(selectedImageIndex)}
                  />
                </div>
                
                {/* Botón de zoom */}
                <button
                  onClick={() => openImageModal(selectedImageIndex)}
                  className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </button>

                {/* Indicador de múltiples imágenes */}
                {producto.fotografias.length > 1 && (
                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    {selectedImageIndex + 1} / {producto.fotografias.length}
                  </div>
                )}
              </div>

              {/* Miniaturas */}
              {producto.fotografias.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {producto.fotografias.map((foto, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`aspect-square rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 ${
                        selectedImageIndex === index
                          ? 'ring-3 ring-blue-500 shadow-lg'
                          : 'ring-1 ring-gray-200 hover:ring-gray-300 shadow-md hover:shadow-lg'
                      }`}
                    >
                      <img
                        src={foto}
                        alt={`${producto.nombre_prenda} - Miniatura ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-500 shadow-lg">
              <svg className="w-16 h-16 mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">Sin imágenes disponibles</p>
              <p className="text-sm text-center px-4">
                Este producto aún no tiene fotografías registradas en el sistema
              </p>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="space-y-6">
          {/* Información básica */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Información General</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Nombre:</span>
                <span className="text-gray-800">{producto.nombre_prenda}</span>
              </div>
              {producto.tipo_prenda && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Tipo de prenda:</span>
                  <span className="text-gray-800">{producto.tipo_prenda.nombre}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Localidad de origen:</span>
                <span className="text-gray-800">{producto.localidad_origen}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Dimensiones:</span>
                <span className="text-gray-800">{producto.ancho_metros}m × {producto.alto_metros}m</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Tiempo de elaboración:</span>
                <span className="text-gray-800">{producto.tiempo_elaboracion_meses} meses</span>
              </div>
              {producto.peso_fibra_gramos && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Peso de fibra:</span>
                  <span className="text-gray-800">{producto.peso_fibra_gramos} gramos</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Fecha de registro:</span>
                <span className="text-gray-800">{producto.created_at ? formatDate(producto.created_at) : 'N/A'}</span>
              </div>
              {producto.updated_at !== producto.created_at && (
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Última actualización:</span>
                  <span className="text-gray-800">{producto.updated_at ? formatDate(producto.updated_at) : 'N/A'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Información del artesano */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Artesano</h2>
            {producto.artesano ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Nombre completo:</span>
                  <span className="text-gray-800">{producto.artesano.apellidos}, {producto.artesano.nombres}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">DNI:</span>
                  <span className="text-gray-800">{producto.artesano.dni}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay artesano asignado</p>
            )}
          </div>

          {/* Información del CTPSFS */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">CTPSFS</h2>
            {producto.ctpsfs ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Número:</span>
                  <span className="text-gray-800">{producto.ctpsfs.numero}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600">Año:</span>
                  <span className="text-gray-800">{producto.ctpsfs.ano}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">No hay CTPSFS asociado</p>
            )}
          </div>

          {/* Técnicas utilizadas */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Técnicas Utilizadas</h2>
            <p className="text-gray-700 leading-relaxed">{producto.tecnicas_utilizadas}</p>
          </div>
        </div>
      </div>

      {/* Modal de imagen ampliada */}
      {showImageModal && producto.fotografias && producto.fotografias.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-6xl max-h-full w-full">
            {/* Botón cerrar */}
            <button
              onClick={closeImageModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-20 bg-black bg-opacity-60 rounded-full w-12 h-12 flex items-center justify-center transition-all hover:bg-opacity-80"
            >
              ✕
            </button>

            {/* Imagen */}
            <div className="flex items-center justify-center h-full">
              {producto.fotografias && producto.fotografias[selectedImageIndex] ? (
                <img
                  src={producto.fotografias[selectedImageIndex]}
                  alt={`${producto.nombre_prenda} - Imagen ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    console.error('Error loading image:', producto.fotografias?.[selectedImageIndex]);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="text-white text-center">
                  <p className="text-xl mb-2">Error al cargar la imagen</p>
                  <p className="text-sm opacity-75">La imagen no está disponible</p>
                </div>
              )}
            </div>

            {/* Navegación */}
            {producto.fotografias.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-60 rounded-full w-14 h-14 flex items-center justify-center transition-all hover:bg-opacity-80"
                >
                  ‹
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-3xl hover:text-gray-300 bg-black bg-opacity-60 rounded-full w-14 h-14 flex items-center justify-center transition-all hover:bg-opacity-80"
                >
                  ›
                </button>
              </>
            )}

            {/* Indicador de imagen */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-75 px-4 py-2 rounded-full">
              {selectedImageIndex + 1} de {producto.fotografias.length}
            </div>

            {/* Información del producto en el modal */}
            <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-80 p-4 rounded-lg max-w-sm backdrop-blur-sm">
              <h4 className="font-semibold text-lg mb-2">{producto.nombre_prenda}</h4>
              <p className="text-sm mb-1">
                <span className="font-medium">Artesano:</span>{' '}
                {producto.artesano 
                  ? `${producto.artesano.apellidos}, ${producto.artesano.nombres}`
                  : 'No asignado'
                }
              </p>
              <p className="text-sm mb-1">
                <span className="font-medium">Localidad:</span> {producto.localidad_origen}
              </p>
              <p className="text-sm">
                <span className="font-medium">Dimensiones:</span> {producto.ancho_metros}m × {producto.alto_metros}m
              </p>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}