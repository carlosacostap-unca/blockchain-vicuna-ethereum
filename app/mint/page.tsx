import MintNFT from '@/components/MintNFT';

export default function MintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🏔️ Blockchain Vicuña
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Crea NFTs únicos para prendas artesanales de Catamarca. 
            Cada token representa la autenticidad y trazabilidad de productos hechos a mano.
          </p>
        </div>
        
        <MintNFT />
        
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              ¿Qué es un NFT de Prenda Artesanal?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">🔒 Autenticidad</h3>
                <p className="text-gray-600">
                  Cada NFT certifica la autenticidad de la prenda, 
                  incluyendo información del artesano y proceso de creación.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-green-600 mb-2">📍 Trazabilidad</h3>
                <p className="text-gray-600">
                  Rastrea el origen de la fibra, el artesano responsable 
                  y todos los detalles del proceso productivo.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-purple-600 mb-2">🌐 Blockchain</h3>
                <p className="text-gray-600">
                  Almacenado de forma inmutable en la blockchain de Ethereum, 
                  garantizando transparencia y permanencia.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-orange-600 mb-2">🎨 Patrimonio</h3>
                <p className="text-gray-600">
                  Preserva y valoriza el patrimonio cultural de Catamarca 
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