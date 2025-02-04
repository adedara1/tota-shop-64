import { ShoppingCart, User, Plus } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white py-4 px-6 flex items-center justify-between">
      <div className="text-xl font-bold">
        <Link to="/">CommerceAfrique</Link>
      </div>
      
      <div className="flex space-x-8">
        <Link to="/" className="hover:text-gray-600">Accueil</Link>
        <Link to="/products" className="hover:text-gray-600">Nos Produits</Link>
        <Link to="/product-form" className="hover:text-gray-600 flex items-center gap-2">
          <Plus size={16} />
          Ajouter un produit
        </Link>
        <Link to="/contact" className="hover:text-gray-600">Contact</Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="hover:text-gray-600">
          <User size={20} />
        </button>
        <button className="hover:text-gray-600">
          <ShoppingCart size={20} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;