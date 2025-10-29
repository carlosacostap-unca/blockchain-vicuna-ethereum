import MyNFTs from '@/components/MyNFTs';

export default function MisNFTsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header de la página */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 shadow-lg mb-4">
            <span className="text-4xl">🏛️</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Mi Colección NFT
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora tu colección personal de NFTs de prendas artesanales de Catamarca. 
            Cada token representa la autenticidad y trazabilidad de productos únicos hechos a mano.
          </p>
        </div>

        {/* Componente principal */}
        <MyNFTs />

        {/* Footer informativo */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              🌟 Sobre los NFTs de Prendas Artesanales
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600">🔒 Autenticidad</h3>
                <p className="text-sm text-gray-600">
                  Cada NFT garantiza la autenticidad de la prenda artesanal, 
                  verificada mediante blockchain inmutable.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600">📍 Trazabilidad</h3>
                <p className="text-sm text-gray-600">
                  Conoce el origen exacto: artesano, materiales, 
                  certificaciones y proceso de creación.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-purple-600">🎨 Patrimonio</h3>
                <p className="text-sm text-gray-600">
                  Preserva y valora el patrimonio cultural de Catamarca 
                  a través de la tecnología blockchain.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}