import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const productsPerPage = 9;
  const {
    data: products,
    isLoading
  } = useQuery({
    queryKey: ["products", searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase.from("products").select("*").eq('is_visible', true).order("created_at", {
        ascending: false
      });
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }
      const {
        data,
        error
      } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Filter products based on search and category
  const filteredProducts = products || [];

  // Pagination logic
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Categories for tabs
  const categories = ["Tout", "Vêtements", "Chaussures", "Accessoires", "Sacs"];
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };
  if (isLoading) {
    return <div className="min-h-screen bg-white">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>;
  }

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  return;
};
export default Products;