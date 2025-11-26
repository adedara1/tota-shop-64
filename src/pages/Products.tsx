import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isSupabaseConnected } from "@/integrations/supabase/utils";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import { Input } from "@/components/ui/input";
import { Search, Star, Database, ShoppingBag, ShoppingCart } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Footer from "@/components/Footer";
import { defaultSettings, ProductsPageSettings } from "@/models/products-page-settings";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/hooks/use-cart";

// Reste de l'interface inchangée
interface RawSettingsResponse {
  id?: string;
  hero_banner_image?: string;
  hero_banner_title?: string;
  hero_banner_description?: string;
  section_titles?: Record<string, string>;
  items_per_page?: number;
  show_ratings?: boolean;
  show_search?: boolean;
  show_categories?: boolean;
  show_filters?: boolean;
  background_color?: string;
  categories?: string[];
  created_at?: string;
  updated_at?: string;
}

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  currency: string;
  images: string[];
  use_internal_cart: boolean;
  slug: string; // Ajout du slug
}

const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [settings, setSettings] = useState<ProductsPageSettings>(defaultSettings);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isCheckingConnection, setIsCheckingConnection] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Vérifier si la connexion à Supabase est active
  useEffect(() => {
    const checkConnection = async () => {
      setIsCheckingConnection(true);
      try {
        const connected = await isSupabaseConnected();
        console.log("État de la connexion Supabase:", connected);
        setIsConnected(connected);
        if (!connected) {
          toast.error("Impossible de se connecter à la base de données");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion:", error);
        setIsConnected(false);
        toast.error("Erreur lors de la vérification de la connexion à la base de données");
      } finally {
        setIsCheckingConnection(false);
      }
    };
    checkConnection();
  }, []);

  // Fetch page settings - use a fetch function that doesn't rely on the database schema
  const {
    data: pageSettings,
    isLoading: isLoadingSettings
  } = useQuery({
    queryKey: ["products-page-settings"],
    queryFn: async () => {
      console.log("Tentative de récupération des paramètres de page, état de connexion:", isConnected);
      if (!isConnected) return defaultSettings;
      try {
        // Use raw query without type checking
        const {
          data,
          error
        } = await supabase.from('products_page_settings').select('*').order('created_at', {
          ascending: false
        }).limit(1).single();
        if (error) {
          console.error("Erreur lors de la récupération des paramètres de page:", error);
          return defaultSettings;
        }
        console.log("Paramètres de page récupérés:", data);

        // Map raw response to our type
        const rawData = data as RawSettingsResponse;
        const mappedData: ProductsPageSettings = {
          id: rawData.id,
          hero_banner_image: rawData.hero_banner_image || defaultSettings.hero_banner_image,
          hero_banner_title: rawData.hero_banner_title || defaultSettings.hero_banner_title,
          hero_banner_description: rawData.hero_banner_description || defaultSettings.hero_banner_description,
          section_titles: rawData.section_titles || defaultSettings.section_titles,
          items_per_page: rawData.items_per_page || defaultSettings.items_per_page,
          show_ratings: rawData.show_ratings !== undefined ? rawData.show_ratings : defaultSettings.show_ratings,
          show_search: rawData.show_search !== undefined ? rawData.show_search : defaultSettings.show_search,
          show_categories: rawData.show_categories !== undefined ? rawData.show_categories : defaultSettings.show_categories,
          show_filters: rawData.show_filters !== undefined ? rawData.show_filters : defaultSettings.show_filters,
          background_color: rawData.background_color || defaultSettings.background_color,
          categories: rawData.categories || defaultSettings.categories,
          created_at: rawData.created_at,
          updated_at: rawData.updated_at
        };
        return mappedData;
      } catch (error) {
        console.error("Erreur lors de la récupération des paramètres:", error);
        return defaultSettings;
      }
    },
    enabled: isConnected === true
  });
  useEffect(() => {
    if (pageSettings) {
      console.log("Mise à jour des paramètres de page:", pageSettings);
      setSettings(pageSettings);
    }
  }, [pageSettings]);

  // Fetch products
  const {
    data: products,
    isLoading: isLoadingProducts
  } = useQuery({
    queryKey: ["products", searchQuery, selectedCategory],
    queryFn: async () => {
      console.log("Tentative de récupération des produits, état de connexion:", isConnected);
      if (!isConnected) return [];
      try {
        let query = supabase.from("products").select("id, name, original_price, discounted_price, currency, images, use_internal_cart, slug");
        if (query.eq) {
          query = query.eq('is_visible', true);
        }
        query = query.order("created_at", {
          ascending: false
        });
        if (searchQuery) {
          query = query.ilike("name", `%${searchQuery}%`);
        }
        if (selectedCategory && selectedCategory !== "all" && selectedCategory !== "Tout") {
          query = query.ilike("category", `%${selectedCategory}%`);
        }
        const {
          data,
          error
        } = await query;
        if (error) {
          console.error("Erreur lors de la récupération des produits:", error);
          throw error;
        }
        console.log("Produits récupérés:", data?.length || 0, "produits");
        return data as Product[] || [];
      } catch (error) {
        console.error("Erreur:", error);
        return [];
      }
    },
    enabled: isConnected === true
  });

  // Filter products based on search and category
  const filteredProducts = products || [];
  console.log("Produits filtrés:", filteredProducts.length);

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
      stars.push(<Star key={i} size={12} className={i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />);
    }
    return stars;
  };
  
  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.discounted_price,
      quantity: 1,
      options: {},
      image: product.images && product.images.length > 0 ? product.images[0] : null
    });
  };

  // Afficher un message si la vérification de connexion est en cours
  if (isCheckingConnection) {
    return <div className="min-h-screen" style={{
      backgroundColor: "#f1eee9"
    }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            <h2 className="text-2xl font-bold">Vérification de la connexion...</h2>
            <p className="text-gray-600 max-w-md">
              Nous vérifions la connexion à la base de données. Veuillez patienter...
            </p>
          </div>
        </div>
        <Footer />
      </div>;
  }

  // Afficher un message si la base de données est déconnectée
  if (isConnected === false) {
    return <div className="min-h-screen" style={{
      backgroundColor: "#f1eee9"
    }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4 text-center">
          <div className="flex flex-col items-center justify-center space-y-6 py-20">
            <Database size={64} className="text-gray-400" />
            <h2 className="text-3xl font-bold">Base de données déconnectée</h2>
            <p className="text-gray-600 max-w-md">
              La connexion à la base de données a été interrompue. Veuillez vérifier votre connexion à Supabase ou contacter l'administrateur.
            </p>
            <Button variant="outline" asChild>
              <a href="/" className="mt-4">Retour à l'accueil</a>
            </Button>
            <Button onClick={() => window.location.reload()} className="mt-2">
              Réessayer
            </Button>
          </div>
        </div>
        <Footer />
      </div>;
  }
  if (isLoadingSettings || isLoadingProducts) {
    return <div className="min-h-screen bg-white">
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>Chargement des produits...</p>
          </div>
        </div>
      </div>;
  }
  return <div className="min-h-screen" style={{
    backgroundColor: settings.background_color || "#fdf7f7"
  }}>
      <PromoBar />
      <Navbar />
      
      {/* Hero Banner */}
      <div className="relative w-full h-[400px] overflow-hidden">
        <img src={settings.hero_banner_image} alt={settings.hero_banner_title} className="w-full h-full object-cover" />
      </div>
      
      <div className="container mx-auto py-8 px-4">
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          {settings.show_search && <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input type="text" placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 rounded-full border-gray-300 w-full md:w-[300px]" />
            </div>}
          
          {settings.show_categories && <Tabs defaultValue={settings.categories[0]} className="w-full md:w-auto">
              <TabsList className="bg-transparent border border-gray-200 rounded-full p-1">
                {settings.categories.map(category => <TabsTrigger key={category} value={category} onClick={() => handleCategoryChange(category)} className="rounded-full px-4 py-1 data-[state=active]:bg-black data-[state=active]:text-white">
                    {category}
                  </TabsTrigger>)}
              </TabsList>
            </Tabs>}
        </div>

        {/* New Arrivals Section */}
        <div className="mb-12">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#fdf7f7] px-6 text-lg font-medium text-gray-900 flex items-center" style={{
              backgroundColor: settings.background_color
            }}>
                
                {settings.section_titles?.new_arrivals || "Nouveautés"}
              </span>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {currentProducts.length > 0 ? currentProducts.map(product => <Card key={product.id} className="rounded-lg overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                  <Link to={`/product/${product.slug}`} className="block"> {/* CHANGÉ ICI */}
                    <div className="relative">
                      {product.discounted_price < product.original_price && <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          Promo
                        </div>}
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img src={product.images && product.images.length > 0 ? product.images[0] : "/placeholder.svg"} alt={product.name} className="w-full h-full object-contain transition-transform duration-300 hover:scale-105" />
                      </div>
                    </div>
                    <CardContent className="p-4 pb-2">
                      <h3 className="font-serif text-sm uppercase tracking-wider text-center mb-2">{product.name}</h3>
                      {settings.show_ratings && <div className="flex justify-center mb-2">
                          {renderStars(4.5)}
                        </div>}
                      <div className="flex justify-center gap-2 items-center">
                        {product.discounted_price < product.original_price ? <>
                            <span className="text-gray-400 line-through text-sm">{product.original_price}</span>
                            <span className="font-medium text-red-600">{product.discounted_price} {product.currency}</span>
                          </> : <span className="font-medium">{product.original_price} {product.currency}</span>}
                      </div>
                    </CardContent>
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-between p-4 pt-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => navigate(`/product/${product.slug}`)} {/* CHANGÉ ICI */}
                    >
                      <ShoppingBag className="h-4 w-4 mr-1" /> Payer
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1 text-xs"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" /> Ajouter
                    </Button>
                  </div>
                </Card>) : <div className="col-span-4 text-center py-12">
                <p className="text-gray-500">Aucun produit trouvé</p>
              </div>}
          </div>
        </div>

        {/* Fall & Winter Fragrances Section */}
        {filteredProducts.length > productsPerPage && <div className="mb-12">
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-[#fdf7f7] px-6 text-lg font-medium text-gray-900 flex items-center" style={{
              backgroundColor: settings.background_color
            }}>
                  <span className="text-2xl font-serif italic mr-2">A</span>
                  {settings.section_titles?.seasonal || "Collection saisonnière"}
                </span>
              </div>
            </div>
          </div>}
        
        {/* Pagination */}
        {totalPages > 1 && <Pagination className="my-8">
            <PaginationContent>
              {currentPage > 1 && <PaginationItem>
                  <PaginationPrevious onClick={() => handlePageChange(currentPage - 1)} className="cursor-pointer" />
                </PaginationItem>}
              
              {pageNumbers.map(page => <PaginationItem key={page}>
                  <PaginationLink isActive={currentPage === page} onClick={() => handlePageChange(page)} className="cursor-pointer">
                    {page}
                  </PaginationLink>
                </PaginationItem>)}
              
              {currentPage < totalPages && <PaginationItem>
                  <PaginationNext onClick={() => handlePageChange(currentPage + 1)} className="cursor-pointer" />
                </PaginationItem>}
            </PaginationContent>
          </Pagination>}
      </div>
      
      <Footer />
    </div>;
};
export default Products;