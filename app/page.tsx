'use client'

import { useState } from 'react'
import ArtesanoForm from '@/components/ArtesanoForm'
import ArtesanosList from '@/components/ArtesanosList'
import CooperativaForm from '@/components/CooperativaForm'
import CooperativasList from '@/components/CooperativasList'
import ChakuForm from '@/components/ChakuForm'
import ChakusList from '@/components/ChakusList'
import COLTForm from '@/components/COLTForm'
import COLTList from '@/components/COLTList'
import CTPSFSForm from '@/components/CTPSFSForm'
import CTPSFSList from '@/components/CTPSFSList'
import ProductoForm from '@/components/ProductoForm'
import ProductosList from '@/components/ProductosList'
import ProductoDetalle from '@/components/ProductoDetalle'
import { type Artesano, type Cooperativa, type Chaku, type COLTWithRelations, type CTPSFSWithRelations, type ProductoWithRelations } from '@/lib/supabase'

type ViewType = 'artesanos-list' | 'artesanos-form' | 'cooperativas-list' | 'cooperativas-form' | 'chakus-list' | 'chakus-form' | 'colt-list' | 'colt-form' | 'ctpsfs-list' | 'ctpsfs-form' | 'productos-list' | 'productos-form' | 'productos-detalle'
type SectionType = 'artesanos' | 'cooperativas' | 'chakus' | 'colt' | 'ctpsfs' | 'productos'

export default function Home() {
  const [currentSection, setCurrentSection] = useState<SectionType>('artesanos')
  const [currentView, setCurrentView] = useState<ViewType>('artesanos-list')
  const [editingArtesano, setEditingArtesano] = useState<Artesano | undefined>(undefined)
  const [editingCooperativa, setEditingCooperativa] = useState<Cooperativa | undefined>(undefined)
  const [editingChaku, setEditingChaku] = useState<Chaku | undefined>(undefined)
  const [editingCOLT, setEditingCOLT] = useState<COLTWithRelations | undefined>(undefined)
  const [editingCTPSFS, setEditingCTPSFS] = useState<CTPSFSWithRelations | undefined>(undefined)
  const [editingProducto, setEditingProducto] = useState<ProductoWithRelations | undefined>(undefined)
  const [viewingProducto, setViewingProducto] = useState<ProductoWithRelations | undefined>(undefined)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [nftSearchValue, setNftSearchValue] = useState('')

  const handleViewNFTGallery = () => {
    // Navegar a la galería pública de NFTs
    window.open('/galeria', '_blank');
  };

  const handleSectionChange = (section: SectionType) => {
    setCurrentSection(section)
    if (section === 'artesanos') {
      setCurrentView('artesanos-list')
    } else if (section === 'cooperativas') {
      setCurrentView('cooperativas-list')
    } else if (section === 'chakus') {
      setCurrentView('chakus-list')
    } else if (section === 'colt') {
      setCurrentView('colt-list')
    } else if (section === 'productos') {
      setCurrentView('productos-list')
    } else {
      setCurrentView('ctpsfs-list')
    }
    setEditingArtesano(undefined)
    setEditingCooperativa(undefined)
    setEditingChaku(undefined)
    setEditingCOLT(undefined)
    setEditingCTPSFS(undefined)
    setEditingProducto(undefined)
    setViewingProducto(undefined)
  }

  const handleNewArtesano = () => {
    setEditingArtesano(undefined)
    setCurrentView('artesanos-form')
  }

  const handleEditArtesano = (artesano: Artesano) => {
    setEditingArtesano(artesano)
    setCurrentView('artesanos-form')
  }

  const handleNewCooperativa = () => {
    setEditingCooperativa(undefined)
    setCurrentView('cooperativas-form')
  }

  const handleEditCooperativa = (cooperativa: Cooperativa) => {
    setEditingCooperativa(cooperativa)
    setCurrentView('cooperativas-form')
  }

  const handleNewChaku = () => {
    setEditingChaku(undefined)
    setCurrentView('chakus-form')
  }

  const handleEditChaku = (chaku: Chaku) => {
    setEditingChaku(chaku)
    setCurrentView('chakus-form')
  }

  const handleNewCOLT = () => {
    setEditingCOLT(undefined)
    setCurrentView('colt-form')
  }

  const handleEditCOLT = (colt: COLTWithRelations) => {
    setEditingCOLT(colt)
    setCurrentView('colt-form')
  }

  const handleNewCTPSFS = () => {
    setEditingCTPSFS(undefined)
    setCurrentView('ctpsfs-form')
  }

  const handleEditCTPSFS = (ctpsfs: CTPSFSWithRelations) => {
    setEditingCTPSFS(ctpsfs)
    setCurrentView('ctpsfs-form')
  }

  const handleNewProducto = () => {
    setEditingProducto(undefined)
    setCurrentView('productos-form')
  }

  const handleEditProducto = (producto: ProductoWithRelations) => {
    setEditingProducto(producto)
    setCurrentView('productos-form')
  }

  const handleViewProducto = (producto: ProductoWithRelations) => {
    setViewingProducto(producto)
    setCurrentView('productos-detalle')
  }

  const handleBackToProductsList = () => {
    setViewingProducto(undefined)
    setCurrentView('productos-list')
  }

  const handleFormSuccess = () => {
    if (currentSection === 'artesanos') {
      setCurrentView('artesanos-list')
      setEditingArtesano(undefined)
    } else if (currentSection === 'cooperativas') {
      setCurrentView('cooperativas-list')
      setEditingCooperativa(undefined)
    } else if (currentSection === 'chakus') {
      setCurrentView('chakus-list')
      setEditingChaku(undefined)
    } else if (currentSection === 'colt') {
      setCurrentView('colt-list')
      setEditingCOLT(undefined)
    } else if (currentSection === 'productos') {
      setCurrentView('productos-list')
      setEditingProducto(undefined)
      setViewingProducto(undefined)
    } else {
      setCurrentView('ctpsfs-list')
      setEditingCTPSFS(undefined)
    }
    setRefreshTrigger(prev => prev + 1)
  }

  const handleFormCancel = () => {
    if (currentSection === 'artesanos') {
      setCurrentView('artesanos-list')
      setEditingArtesano(undefined)
    } else if (currentSection === 'cooperativas') {
      setCurrentView('cooperativas-list')
      setEditingCooperativa(undefined)
    } else if (currentSection === 'chakus') {
      setCurrentView('chakus-list')
      setEditingChaku(undefined)
    } else if (currentSection === 'colt') {
      setCurrentView('colt-list')
      setEditingCOLT(undefined)
    } else if (currentSection === 'productos') {
      setCurrentView('productos-list')
      setEditingProducto(undefined)
    } else {
      setCurrentView('ctpsfs-list')
      setEditingCTPSFS(undefined)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sistema de Gestión
              </h1>
              <p className="text-gray-600 mt-1">
                Administración de Artesanos, Cooperativas, Chakus, COLT, CTPSFS y Productos
              </p>
            </div>
            
            {/* NFT Links and Search */}
            <div className="flex flex-col gap-4">
              {/* NFT Gallery Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleViewNFTGallery}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🖼️ Ver Galería NFT
                </button>
              </div>
              
              {/* NFT Links */}
              <div className="flex gap-3">
                <a
                  href="/mint"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🧶 Mintear NFT
                </a>
                <a
                  href="/mis-nfts"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  🏛️ Mis NFTs
                </a>
              </div>
            </div>
            
            {/* Navigation Tabs */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => handleSectionChange('artesanos')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentSection === 'artesanos'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Artesanos
              </button>
              
              <button
                onClick={() => handleSectionChange('cooperativas')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentSection === 'cooperativas'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cooperativas
              </button>
              
              <button
                onClick={() => handleSectionChange('chakus')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentSection === 'chakus'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Chakus
              </button>

              <button
                onClick={() => handleSectionChange('colt')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentSection === 'colt'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                COLT
              </button>

              <button
                onClick={() => handleSectionChange('ctpsfs')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentSection === 'ctpsfs'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                CTPSFS
              </button>

              <button
                onClick={() => handleSectionChange('productos')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentSection === 'productos'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Productos
              </button>
            </div>
          </div>

          {/* Section Controls */}
          <div className="flex justify-between items-center pb-4 border-t pt-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {currentSection === 'artesanos' 
                ? 'Gestión de Artesanos' 
                : currentSection === 'cooperativas'
                  ? 'Gestión de Cooperativas'
                  : currentSection === 'chakus' 
                    ? 'Gestión de Chakus'
                    : currentSection === 'colt'
                      ? 'Gestión de COLT'
                      : currentSection === 'productos'
                        ? 'Gestión de Productos'
                        : 'Gestión de CTPSFS'
              }
            </h2>
            
            <div className="flex gap-4">
              <button
                onClick={() => {
                  if (currentSection === 'artesanos') {
                    setCurrentView('artesanos-list')
                  } else if (currentSection === 'cooperativas') {
                    setCurrentView('cooperativas-list')
                  } else if (currentSection === 'chakus') {
                    setCurrentView('chakus-list')
                  } else if (currentSection === 'colt') {
                    setCurrentView('colt-list')
                  } else if (currentSection === 'productos') {
                    setCurrentView('productos-list')
                    setViewingProducto(undefined)
                  } else {
                    setCurrentView('ctpsfs-list')
                  }
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  (currentView === 'artesanos-list' || currentView === 'cooperativas-list' || currentView === 'chakus-list' || currentView === 'colt-list' || currentView === 'ctpsfs-list' || currentView === 'productos-list')
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Ver Lista
              </button>
              
              <button
                onClick={() => {
                  if (currentSection === 'artesanos') {
                    handleNewArtesano()
                  } else if (currentSection === 'cooperativas') {
                    handleNewCooperativa()
                  } else if (currentSection === 'chakus') {
                    handleNewChaku()
                  } else if (currentSection === 'colt') {
                    handleNewCOLT()
                  } else if (currentSection === 'productos') {
                    handleNewProducto()
                  } else {
                    handleNewCTPSFS()
                  }
                }}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  (currentView === 'artesanos-form' || currentView === 'cooperativas-form' || currentView === 'chakus-form' || currentView === 'colt-form' || currentView === 'ctpsfs-form' || currentView === 'productos-form')
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                + Nuevo {currentSection === 'artesanos' ? 'Artesano' : currentSection === 'cooperativas' ? 'Cooperativa' : currentSection === 'chakus' ? 'Chaku' : currentSection === 'colt' ? 'COLT' : currentSection === 'productos' ? 'Producto' : 'CTPSFS'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'artesanos-list' && (
          <ArtesanosList 
            onEdit={handleEditArtesano}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {currentView === 'artesanos-form' && (
          <ArtesanoForm
            artesano={editingArtesano}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'cooperativas-list' && (
          <CooperativasList 
            onEdit={handleEditCooperativa}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {currentView === 'cooperativas-form' && (
          <CooperativaForm
            cooperativa={editingCooperativa}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'chakus-list' && (
          <ChakusList 
            onEdit={handleEditChaku}
          />
        )}
        
        {currentView === 'chakus-form' && (
          <ChakuForm
            chaku={editingChaku}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'colt-list' && (
          <COLTList 
            onEdit={handleEditCOLT}
            onNew={handleNewCOLT}
          />
        )}
        
        {currentView === 'colt-form' && (
          <COLTForm
            colt={editingCOLT}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'ctpsfs-list' && (
          <CTPSFSList 
            onEdit={handleEditCTPSFS}
            onNew={handleNewCTPSFS}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {currentView === 'ctpsfs-form' && (
          <CTPSFSForm
            ctpsfs={editingCTPSFS}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'productos-list' && (
          <ProductosList 
            onEdit={handleEditProducto}
            onNew={handleNewProducto}
            onView={handleViewProducto}
            refreshTrigger={refreshTrigger}
          />
        )}
        
        {currentView === 'productos-form' && (
          <ProductoForm
            producto={editingProducto}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        )}

        {currentView === 'productos-detalle' && viewingProducto && (
          <ProductoDetalle
            producto={viewingProducto}
            onBack={handleBackToProductsList}
            onEdit={handleEditProducto}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-500 text-sm">
            <p>Sistema de Gestión de Artesanos, Chakus, COLT, CTPSFS y Productos</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
