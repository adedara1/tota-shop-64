
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Menu, User } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  return (
    <div className="bg-white py-6 px-8">
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

      {/* Main black navbar with rounded corners - now showing on all pages */}
      <nav className="bg-black text-white py-6 px-8 rounded-[15px]">
        {/* Top section with logo and description */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold">
                <span className="font-light">TOTAL-</span>
                <span className="font-extrabold">SERVICE</span>
              </h1>
            </div>
            <p className="text-sm text-gray-300">4.3 ★ (348.3k)</p>
            <p className="text-sm mt-1">#1 Destination for Trends + Fast Shipping</p>
            
            <div className="flex gap-2 mt-3">
              <Button variant="outline" className="rounded-full bg-white text-black hover:bg-gray-100 text-sm h-9 px-6">
                Suivre
              </Button>
              <Button variant="outline" className="rounded-full bg-transparent border-white hover:bg-white/10 text-white text-sm h-9 px-4">
                <span className="mr-1">🌐</span> www.total-service.com
              </Button>
              <Button variant="outline" className="rounded-full h-9 w-9 p-0 bg-transparent border-white hover:bg-white/10">
                •••
              </Button>
            </div>
          </div>
          
          {/* Fashion Nova image */}
          <div className="hidden md:block">
            <img 
              src="/lovable-uploads/ad53b3cd-b780-4ad0-92f4-ac688b6f43f5.png" 
              alt="Total-Service" 
              className="w-96 h-auto rounded-lg object-cover"
            />
          </div>
        </div>
        
        {/* Navigation links are preserved but visually hidden in this design */}
        <div className="hidden">
          <Link to="/" className="mr-4">
            Home
          </Link>
          <Link to="/products" className="mr-4">
            Products
          </Link>
          <Link to="/contact" className="mr-4">
            Contact
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
