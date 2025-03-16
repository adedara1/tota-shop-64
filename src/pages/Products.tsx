import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import { Input } from "@/components/ui/input";
import { Search, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const productsPerPage = 9;

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select("*")
        .eq('is_visible', true)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    },
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
    return (
      <div className="min-h-screen bg-white">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-white">
      <PromoBar />
      <Navbar />
      
      {/* Hero Banner */}
      <div className="bg-black text-white mb-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between p-4 mx-200px" style={{ marginLeft: '200px', marginRight: '200px' }}>
          <div className="md:w-1/2 p-4">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">FASHION NOVA</h1>
            <p className="text-sm mb-4">25% de réduction | Expédition gratuite</p>
            <div className="flex gap-2 mb-4">
              <button className="bg-white text-black px-4 py-2 text-sm font-medium rounded">ACHETER</button>
              <button className="border border-white px-4 py-2 text-sm font-medium rounded">EN SAVOIR PLUS</button>
            </div>
          </div>
          <div className="md:w-1/2">
            <img 
              src="/lovable-uploads/3a9e5685-5758-4692-91ea-a09ab069cbde.png" 
              alt="Fashion Banner" 
              className="w-full h-auto object-cover rounded-md"
            />
          </div>
        </div>
      </div>
      
      {/* Category Banners */}
      <div className="container mx-auto mb-8 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-200 rounded-md p-4 h-24 flex items-center justify-center">
            <p className="text-sm font-medium">50% DE RÉDUCTION</p>
          </div>
          <div className="bg-gray-200 rounded-md p-4 h-24 flex items-center justify-center">
            <p className="text-sm font-medium">Nouveautés</p>
          </div>
          <div className="bg-gray-200 rounded-md p-4 h-24 flex items-center justify-center">
            <p className="text-sm font-medium">Tendances</p>
          </div>
          <div className="bg-gray-200 rounded-md p-4 h-24 flex items-center justify-center">
            <p className="text-sm font-medium">Voir toutes les collections</p>
          </div>
        </div>
      </div>
      
      <main className="container mx-auto py-6 px-4">
        <h2 className="text-xl font-bold mb-4">Produits</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
          <div className="relative w-full md:w-64">
            <Input
              type="text"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          
          <Tabs defaultValue="Tout" className="w-full md:w-auto">
            <TabsList className="bg-transparent border border-gray-200 rounded-md overflow-x-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  onClick={() => handleCategoryChange(category.toLowerCase())}
                  className="text-xs md:text-sm"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8">
          {currentProducts.length > 0 ? (
            currentProducts.map((product) => (
              <Link 
                key={product.id} 
                to={`/product/${product.id}`}
                className="group"
              >
                <Card className="overflow-hidden border-none shadow-sm transition-all hover:shadow-md">
                  <div className="relative aspect-square">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded">
                      NOUVEAU
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="text-sm font-medium mb-1 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-3 w-3 fill-current text-yellow-400" />
                      ))}
                      <span className="text-xs text-gray-500">(5.0)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through text-xs">
                        {product.original_price} {product.currency}
                      </span>
                      <span className="font-medium">
                        {product.discounted_price} {product.currency}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p>Aucun produit trouvé.</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="mb-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {pageNumbers.map(number => (
                <PaginationItem key={number}>
                  <PaginationLink 
                    isActive={currentPage === number}
                    onClick={() => handlePageChange(number)}
                  >
                    {number}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Products;
