import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold">
            Lovable Store
          </Link>
          <div className="flex gap-4">
            <Link
              to="/product-form"
              className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
            >
              Ajouter un produit
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;