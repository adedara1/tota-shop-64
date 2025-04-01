
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Menu, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { totalItems } = useCart();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="py-6 relative">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link to="/products" className="text-xl font-serif italic">
          Total-Service
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link
            to="/products"
            className={`font-medium ${
              location.pathname === "/" || location.pathname === "/products" ? "text-black" : "text-gray-600"
            }`}
          >
            Accueil
          </Link>
          <Link
            to="/products"
            className={`font-medium ${
              location.pathname === "/products" ? "text-black" : "text-gray-600"
            }`}
          >
            Boutique
          </Link>
          <Link
            to="/contact"
            className={`font-medium ${
              location.pathname === "/contact" ? "text-black" : "text-gray-600"
            }`}
          >
            Contact
          </Link>
          <Link
            to="/paiement"
            className="relative"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-4">
          <Link
            to="/paiement"
            className="relative"
          >
            <ShoppingBag size={20} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={toggleMobileMenu}>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white z-50 shadow-lg">
          <div className="container mx-auto py-4 space-y-4 px-4">
            <Link
              to="/products"
              className={`block font-medium ${
                location.pathname === "/" || location.pathname === "/products" ? "text-black" : "text-gray-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Accueil
            </Link>
            <Link
              to="/products"
              className={`block font-medium ${
                location.pathname === "/products" ? "text-black" : "text-gray-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Boutique
            </Link>
            <Link
              to="/contact"
              className={`block font-medium ${
                location.pathname === "/contact" ? "text-black" : "text-gray-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
