import PublicNFTGallery from '@/components/PublicNFTGallery';

export default function GaleriaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            🖼️ Galería Pública de NFTs
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora todos los NFTs de prendas artesanales creados en la blockchain. 
            Cada token representa la autenticidad y trazabilidad de productos únicos de Catamarca.
          </p>
        </div>
        
        <PublicNFTGallery />
      </div>
    </div>
  );
}