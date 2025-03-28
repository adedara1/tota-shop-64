
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import { Input } from "@/components/ui/input";
import { Search, Star } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { defaultSettings, ProductsPageSettings } from "@/models/products-page-settings";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [settings, setSettings] = useState<ProductsPageSettings>(defaultSettings);
  
  // Fetch page settings
  const { data: pageSettings } = useQuery({
    queryKey: ["products-page-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_page_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching page settings:", error);
        return null;
      }

      return data as ProductsPageSettings;
    },
  });

  useEffect(() => {
    if (pageSettings) {
      setSettings(pageSettings);
    }
  }, [pageSettings]);

  // Fetch products
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
      
      if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "Tout") {
        query = query.ilike("category", `%${selectedCategory}%`);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  // Filter products based on search and category
  const filteredProducts = products || [];

  // Pagination logic
  const productsPerPage = settings.items_per_page;
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Generate page numbers for pagination
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  // Function to render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={12} 
          className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
        />
      );
    }
    return stars;
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings.background_color || "#fdf7f7" }}>
      <PromoBar />
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img 
          src={settings.hero_banner_image} 
          alt={settings.hero_banner_title} 
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="container mx-auto py-8 px-4">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {settings.show_search && (
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-full border-gray-300 w-full md:w-[300px]"
              />
            </div>
          )}
          
          {settings.show_categories && (
            <Tabs defaultValue={settings.categories[0]} className="w-full md:w-auto">
              <TabsList className="bg-transparent border border-gray-200 rounded-full p-1">
                {settings.categories.map((category) => (
                  <TabsTrigger
                    key={category}
                    value={category}
                    onClick={() => handleCategoryChange(category)}
                    className="rounded-full px-4 py-1 data-[state=active]:bg-black data-[state=active]:text-white"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          )}
        </div>

        {/* New Arrivals Section */}
        <div className="mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fdf7f7] px-6 text-lg font-medium text-gray-900 flex items-center" style={{ backgroundColor: settings.background_color }}>
                <span className="text-2xl font-serif italic mr-2">A</span>
                {settings.section_titles.new_arrivals}
              </span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`}>
                <Card className="rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <div className="relative">
                    {product.discounted_price < product.original_price && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Sale
                      </div>
                    )}
                    <div className="h-48 overflow-hidden bg-gray-100">
                      <img
                        src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-serif text-sm uppercase tracking-wider text-center mb-2">{product.name}</h3>
                    {settings.show_ratings && (
                      <div className="flex justify-center mb-2">
                        {renderStars(4.5)}
                      </div>
                    )}
                    <div className="flex justify-center gap-2 items-center">
                      {product.discounted_price < product.original_price ? (
                        <>
                          <span className="text-gray-400 line-through text-sm">{product.original_price}</span>
                          <span className="font-medium text-red-600">{product.discounted_price} {product.currency}</span>
                        </>
                      ) : (
                        <span className="font-medium">{product.original_price} {product.currency}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Fall & Winter Fragrances Section */}
        {filteredProducts.length > productsPerPage && (
          <div className="mb-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#fdf7f7] px-6 text-lg font-medium text-gray-900 flex items-center" style={{ backgroundColor: settings.background_color }}>
                  <span className="text-2xl font-serif italic mr-2">A</span>
                  {settings.section_titles.seasonal}
                </span>
              </div>
            </div>
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination className="my-8">
            <PaginationContent>
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
              
              {pageNumbers.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    isActive={currentPage === page}
                    onClick={() => handlePageChange(page)}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    className="cursor-pointer"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Products;
