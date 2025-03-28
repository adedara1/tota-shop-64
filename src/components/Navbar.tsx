
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ShoppingBag, Search, Menu, User, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const location = useLocation();
  const isProductDetailPage = location.pathname.startsWith('/product/');
  const isProductsPage = location.pathname === '/products';
  const isMobile = useIsMobile();
  
  // Check if user is logged in
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    },
  });

  const isAdmin = !!session;

  // Hide navigation bar on the /products page on mobile
  if (isMobile && isProductsPage) {
    return null;
  }

  // Determine if settings icon should be hidden
  const shouldHideSettingsIcon = isProductsPage || isProductDetailPage;

  return (
    <div className={`bg-white ${isMobile ? 'py-2 px-4' : 'py-6 px-8'}`}>
      {/* Traditional navigation bar */}
      <div className="flex justify-between items-center mb-6">
        <div className="font-bold text-xl">Total-Service</div>
        <div className="flex space-x-8">
          {/* Hide most navigation links on mobile for product detail pages */}
          {(!isMobile || !isProductDetailPage) && (
            <>
              <Link to="/products" className="hover:text-gray-600">Accueil</Link>
              <Link to="/products" className="hover:text-gray-600">Nos Produits</Link>
              <Link to="/contact" className="hover:text-gray-600">Contact</Link>
            </>
          )}
          {/* Show only "Nos Produits" link on mobile product detail pages */}
          {(isMobile && isProductDetailPage) && (
            <Link to="/products" className="hover:text-gray-600">Nos Produits</Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {/* Hide settings icon based on page */}
          {isAdmin && !shouldHideSettingsIcon && (
            <Link to="/products-set" title="Paramètres de la page produits">
              <Settings className="h-5 w-5" />
            </Link>
          )}
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
    </div>
  );
};

export default Navbar;
