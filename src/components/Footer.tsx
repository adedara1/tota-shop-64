import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-[#1A1F2C] text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <nav className="flex space-x-6">
            <Link to="/products" className="hover:text-gray-300">Accueil</Link>
            <Link to="/contact" className="hover:text-gray-300">Contact</Link>
          </nav>
          <div className="text-sm text-gray-300">
            © 2025 Digit-sarl. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;