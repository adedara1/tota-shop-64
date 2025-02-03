const ProductDetails = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-medium">Mini Climatiseur Mural Portable</h1>
      
      <div className="flex items-center gap-4">
        <span className="text-gray-400 line-through">CFA45,900</span>
        <span className="text-2xl font-bold">CFA28,900</span>
      </div>
      
      <button className="w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors">
        Ajouter au panier
      </button>
      
      <div className="space-y-4 pt-6">
        <div className="flex items-center gap-2">
          <span>❄️</span>
          <p className="font-medium">
            Climatiseur mural portable : Votre fraîcheur alliée pour affronter la chaleur !
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span>🌡️</span>
          <p className="font-medium">
            Dites adieu aux journées étouffantes ! 🔥
          </p>
        </div>
        
        <div className="mt-6 text-gray-600">
          <p>
            Au Bénin, la chaleur peut devenir éprouvante. Vous cherchez une solution simple et efficace pour rester au frais ? Découvrez le climatiseur mural portable, conçu spécialement pour vous offrir une fraîcheur instantanée et durable, même pendant les journées les plus chaudes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;