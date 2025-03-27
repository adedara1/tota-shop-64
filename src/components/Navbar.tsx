import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Menu, User } from "lucide-react";
const Navbar = () => {
  const location = useLocation();
  const isProductDetailPage = location.pathname.startsWith('/product/');
  return <div className="bg-white py-6 px-8">
      {/* Traditional navigation bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="font-bold text-xl">Total-Service</div>
        <div className="flex space-x-8">
          <Link to="/products" className="hover:text-gray-600">Accueil</Link>
          <Link to="/products" className="hover:text-gray-600">Nos Produits</Link>
          <Link to="/contact" className="hover:text-gray-600">Contact</Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/account">
            <User className="h-5 w-5" />
          </Link>
          <Link to="/cart">
            <ShoppingBag className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Main black navbar with rounded corners - hidden on product detail pages */}
      {!isProductDetailPage}
    </div>;
};
export default Navbar;