import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useIsAuthenticated } from "react-auth-kit";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import ProductFormClone from "@/components/ProductFormClone";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import EditProductDropdown from "@/components/EditProductDropdown";

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  description: string;
  cart_url: string;
  images: string[];
  theme_color: string;
  button_text: string;
  currency: Database['public']['Enums']['currency_code'];
  options?: Record<string, any> | null;
  use_internal_cart?: boolean;
  hide_promo_bar?: boolean;
}

interface ProductsPageSettings {
  id: string;
  background_color: string;
  hero_banner_image: string;
  hero_banner_title: string;
  hero_banner_description: string;
  section_titles: Record<string, string>;
  categories: string[];
  show_search: boolean;
  show_categories: boolean;
  show_ratings: boolean;
  show_filters: boolean;
  items_per_page: number;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<ProductsPageSettings | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("Tout");
  const [currentPage, setCurrentPage] = useState(1);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const isMobile = useIsMobile();
  const { toast } = useToast();

  const itemsPerPage = settings?.items_per_page || 8;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from("products").select("*").eq("is_visible", true);

        if (selectedCategory !== "Tout") {
          query = query.like("categories", `%${selectedCategory}%`);
        }

        const { data, error } = await query;

        if (error) throw error;

        setProducts(data as Product[]);
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement des produits",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("products_page_settings")
          .select("*")
          .eq("id", "default")
          .single();

        if (error) throw error;

        setSettings(data as ProductsPageSettings);
      } catch (error) {
        console.error("Error fetching products page settings:", error);
        toast({
          title: "Erreur",
          description: "Erreur lors du chargement des paramètres de la page produits",
          variant: "destructive",
        });
      }
    };

    fetchSettings();
  }, []);

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handleCreateSuccess = () => {
    setShowEdit(false);
    setSelectedProductId(null);
    // Refresh products after creating a new one
    window.location.reload();
  };

  const handleEdit = (id: string) => {
    setShowEdit(true);
    setSelectedProductId(id);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProducts = products.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen" style={{ backgroundColor: settings?.background_color || "#f1eee9" }}>
      <PromoBar />
      <Navbar />

      <main className="container mx-auto py-4 md:py-8 px-4">
        <section
          className="relative py-12 md:py-24 text-center text-white"
          style={{
            backgroundImage: `url(${settings?.hero_banner_image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black opacity-40"></div>
          <div className="relative z-10">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              {settings?.hero_banner_title}
            </h1>
            <p className="text-lg md:text-xl">{settings?.hero_banner_description}</p>
          </div>
        </section>

        {settings?.show_categories && (
          <div className="flex justify-center space-x-4 py-6">
            {settings?.categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
            >
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                originalPrice={product.original_price}
                discountedPrice={product.discounted_price}
                description={product.description}
                cartUrl={product.cart_url}
                images={product.images}
                themeColor={product.theme_color}
                buttonText={product.button_text}
                currency={product.currency}
                options={product.options || {}}
                useInternalCart={product.use_internal_cart}
                hidePromoBar={product.hide_promo_bar}
              />
              
              {isAuthenticated && (
                <div className="absolute top-2 right-2 z-10">
                  <EditProductDropdown 
                    productId={product.id} 
                    onEdit={() => handleEdit(product.id)} 
                  />
                </div>
              )}
              
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          {Array.from({ length: Math.ceil(products.length / itemsPerPage) }, (_, i) => i + 1).map(
            (page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>
      </main>
      
      <Sheet open={showEdit} onOpenChange={setShowEdit}>
        <SheetTrigger asChild>
          <Button variant="outline">Modifier</Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[600px]">
          <SheetHeader>
            <SheetTitle>Modifier le produit</SheetTitle>
            <SheetDescription>
              Effectuez les modifications ici. Cliquez sur Enregistrer lorsque vous
              avez terminé.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">
            <ProductFormClone
              productId={selectedProductId}
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowEdit(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      <Footer />
    </div>
  );
};

export default Products;
