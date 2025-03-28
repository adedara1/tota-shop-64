
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ColorSelector } from "@/components/ColorSelector";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Layout, 
  Type, 
  ImageIcon, 
  Paintbrush, 
  Sliders, 
  ShoppingBag, 
  Search, 
  SlidersHorizontal, 
  Info,
  Save
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Define type for the Products Page Settings
interface ProductsPageSettings {
  id?: string;
  hero_banner_image: string;
  hero_banner_title: string;
  hero_banner_description: string;
  section_titles: Record<string, string>;
  items_per_page: number;
  show_ratings: boolean;
  show_search: boolean;
  show_categories: boolean;
  show_filters: boolean;
  background_color: string;
  categories: string[];
  created_at?: string;
  updated_at?: string;
}

const defaultSettings: ProductsPageSettings = {
  hero_banner_image: "/lovable-uploads/88668931-9bc2-4d50-b115-231ec9516b1e.png",
  hero_banner_title: "Luxury Fragrance Collection",
  hero_banner_description: "Discover our exquisite collection of premium fragrances",
  section_titles: {
    new_arrivals: "New Arrivals",
    best_sellers: "Best Sellers",
    trending: "Trending Now",
    sales: "On Sale",
    seasonal: "Fall & Winter Fragrances"
  },
  items_per_page: 8,
  show_ratings: true,
  show_search: true,
  show_categories: true,
  show_filters: false,
  background_color: "#fdf7f7",
  categories: ["Tout", "Parfums", "Soins", "Accessoires", "Cadeaux"],
};

const ProductsSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [activeConfigItem, setActiveConfigItem] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [settings, setSettings] = useState<ProductsPageSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch settings from Supabase
  const { data: fetchedSettings, refetch } = useQuery({
    queryKey: ["products-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products_page_settings")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      return data as ProductsPageSettings;
    },
  });

  useEffect(() => {
    if (fetchedSettings) {
      setSettings(fetchedSettings);
    }
  }, [fetchedSettings]);

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      let response;
      if (settings.id) {
        // Update existing settings
        response = await supabase
          .from("products_page_settings")
          .update({
            ...settings,
            updated_at: new Date().toISOString(),
          })
          .eq("id", settings.id);
      } else {
        // Insert new settings
        response = await supabase
          .from("products_page_settings")
          .insert({
            ...settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
      }

      if (response.error) throw response.error;
      
      toast({
        title: "Configuration sauvegardée",
        description: "Les paramètres de la page produits ont été mis à jour avec succès.",
      });
      
      refetch();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde des paramètres.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleNestedInputChange = (parent: string, key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent as keyof ProductsPageSettings],
        [key]: value,
      },
    }));
  };

  const handleCategoriesChange = (categories: string) => {
    const categoriesArray = categories.split(',').map(cat => cat.trim());
    setSettings((prev) => ({
      ...prev,
      categories: categoriesArray,
    }));
  };

  const openConfigSheet = (item: any) => {
    setActiveConfigItem(item);
    setOpenDialog(true);
  };

  const configItems = [
    { id: "general", title: "Paramètres Généraux", icon: <Settings size={20} />, tab: "general" },
    { id: "hero", title: "Bannière Héro", icon: <ImageIcon size={20} />, tab: "appearance" },
    { id: "sections", title: "Sections", icon: <Layout size={20} />, tab: "appearance" },
    { id: "categories", title: "Catégories", icon: <Type size={20} />, tab: "appearance" },
    { id: "appearance", title: "Apparence", icon: <Paintbrush size={20} />, tab: "appearance" },
    { id: "filtering", title: "Filtres", icon: <Sliders size={20} />, tab: "filtering" },
    { id: "pagination", title: "Pagination", icon: <SlidersHorizontal size={20} />, tab: "pagination" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Configuration de la Page Produits</h1>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            Sauvegarder
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3">
            <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="general">Général</TabsTrigger>
                <TabsTrigger value="appearance">Apparence</TabsTrigger>
                <TabsTrigger value="filtering">Filtres</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-2">
              {configItems
                .filter(item => item.tab === activeTab)
                .map((item) => (
                  <Sheet key={item.id}>
                    <SheetTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-md transition-all">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center">
                            {item.icon}
                            <span className="ml-2">{item.title}</span>
                          </div>
                          <SlidersHorizontal size={16} />
                        </CardContent>
                      </Card>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
                      <SheetHeader>
                        <SheetTitle>{item.title}</SheetTitle>
                        <SheetDescription>
                          Configurez les paramètres pour {item.title.toLowerCase()}
                        </SheetDescription>
                      </SheetHeader>
                      
                      <div className="mt-6 space-y-6">
                        {item.id === "general" && (
                          <>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="show_search">Afficher la recherche</Label>
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      <Info size={14} className="text-gray-400" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      Active ou désactive la barre de recherche en haut de la page produits.
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                                <input
                                  type="checkbox"
                                  id="show_search"
                                  checked={settings.show_search}
                                  onChange={(e) => handleInputChange("show_search", e.target.checked)}
                                  className="toggle"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="show_categories">Afficher les catégories</Label>
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      <Info size={14} className="text-gray-400" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      Active ou désactive l'affichage des onglets de catégories en haut de la page.
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                                <input
                                  type="checkbox"
                                  id="show_categories"
                                  checked={settings.show_categories}
                                  onChange={(e) => handleInputChange("show_categories", e.target.checked)}
                                  className="toggle"
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="show_ratings">Afficher les évaluations</Label>
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      <Info size={14} className="text-gray-400" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      Active ou désactive l'affichage des étoiles d'évaluation sur les cartes produits.
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                                <input
                                  type="checkbox"
                                  id="show_ratings"
                                  checked={settings.show_ratings}
                                  onChange={(e) => handleInputChange("show_ratings", e.target.checked)}
                                  className="toggle"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        
                        {item.id === "hero" && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="hero_banner_image">Image de la bannière</Label>
                                <Input
                                  id="hero_banner_image"
                                  value={settings.hero_banner_image}
                                  onChange={(e) => handleInputChange("hero_banner_image", e.target.value)}
                                  placeholder="URL de l'image (ex: /lovable-uploads/image.png)"
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Utilisez une image de grande taille (1920x400px recommandé)
                                </p>
                              </div>
                              
                              <div>
                                <Label htmlFor="hero_banner_title">Titre de la bannière</Label>
                                <Input
                                  id="hero_banner_title"
                                  value={settings.hero_banner_title}
                                  onChange={(e) => handleInputChange("hero_banner_title", e.target.value)}
                                  placeholder="Titre principal"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="hero_banner_description">Description de la bannière</Label>
                                <Textarea
                                  id="hero_banner_description"
                                  value={settings.hero_banner_description}
                                  onChange={(e) => handleInputChange("hero_banner_description", e.target.value)}
                                  placeholder="Description courte"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        
                        {item.id === "sections" && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="section_title_new_arrivals">Titre section Nouveautés</Label>
                                <Input
                                  id="section_title_new_arrivals"
                                  value={settings.section_titles.new_arrivals}
                                  onChange={(e) => handleNestedInputChange("section_titles", "new_arrivals", e.target.value)}
                                  placeholder="Nouveautés"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="section_title_best_sellers">Titre section Meilleures ventes</Label>
                                <Input
                                  id="section_title_best_sellers"
                                  value={settings.section_titles.best_sellers}
                                  onChange={(e) => handleNestedInputChange("section_titles", "best_sellers", e.target.value)}
                                  placeholder="Meilleures ventes"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="section_title_trending">Titre section Tendances</Label>
                                <Input
                                  id="section_title_trending"
                                  value={settings.section_titles.trending}
                                  onChange={(e) => handleNestedInputChange("section_titles", "trending", e.target.value)}
                                  placeholder="Tendances"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="section_title_sales">Titre section Promotions</Label>
                                <Input
                                  id="section_title_sales"
                                  value={settings.section_titles.sales}
                                  onChange={(e) => handleNestedInputChange("section_titles", "sales", e.target.value)}
                                  placeholder="Promotions"
                                  className="mt-1"
                                />
                              </div>
                              
                              <div>
                                <Label htmlFor="section_title_seasonal">Titre section Saisonniers</Label>
                                <Input
                                  id="section_title_seasonal"
                                  value={settings.section_titles.seasonal}
                                  onChange={(e) => handleNestedInputChange("section_titles", "seasonal", e.target.value)}
                                  placeholder="Collection saisonnière"
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        
                        {item.id === "categories" && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="categories">Catégories (séparées par des virgules)</Label>
                                <Textarea
                                  id="categories"
                                  value={settings.categories.join(', ')}
                                  onChange={(e) => handleCategoriesChange(e.target.value)}
                                  placeholder="Tout, Parfums, Soins, Accessoires, Cadeaux"
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Ces catégories apparaîtront comme onglets de filtrage sur la page produits.
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {item.id === "appearance" && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="background_color">Couleur d'arrière-plan</Label>
                                <div className="flex items-center mt-2 gap-4">
                                  <div 
                                    className="w-10 h-10 rounded-full border"
                                    style={{ backgroundColor: settings.background_color }}
                                  />
                                  <Input
                                    id="background_color"
                                    type="text"
                                    value={settings.background_color}
                                    onChange={(e) => handleInputChange("background_color", e.target.value)}
                                    placeholder="#fdf7f7"
                                    className="flex-1"
                                  />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Code hexadécimal de la couleur d'arrière-plan
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                        
                        {item.id === "filtering" && (
                          <>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Label htmlFor="show_filters">Afficher des filtres avancés</Label>
                                  <HoverCard>
                                    <HoverCardTrigger>
                                      <Info size={14} className="text-gray-400" />
                                    </HoverCardTrigger>
                                    <HoverCardContent>
                                      Active ou désactive les options de filtrage avancées (prix, notes, etc.)
                                    </HoverCardContent>
                                  </HoverCard>
                                </div>
                                <input
                                  type="checkbox"
                                  id="show_filters"
                                  checked={settings.show_filters}
                                  onChange={(e) => handleInputChange("show_filters", e.target.checked)}
                                  className="toggle"
                                />
                              </div>
                            </div>
                          </>
                        )}
                        
                        {item.id === "pagination" && (
                          <>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="items_per_page">Produits par page</Label>
                                <Input
                                  id="items_per_page"
                                  type="number"
                                  min={4}
                                  max={24}
                                  value={settings.items_per_page}
                                  onChange={(e) => handleInputChange("items_per_page", parseInt(e.target.value) || 8)}
                                  className="mt-1"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Nombre de produits à afficher par page (recommandé: 8-12)
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </SheetContent>
                  </Sheet>
                ))}
            </div>
          </div>
          
          <div className="md:col-span-9">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
                <CardDescription>
                  Aperçu de la page produits avec vos configurations actuelles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg overflow-hidden" style={{ backgroundColor: settings.background_color }}>
                  <div className="relative w-full h-[200px] overflow-hidden">
                    <img 
                      src={settings.hero_banner_image} 
                      alt={settings.hero_banner_title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    {settings.show_search && (
                      <div className="relative w-full max-w-md mx-auto mb-4">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <div className="pl-10 pr-4 py-2 rounded-full border border-gray-300 w-full">
                          Rechercher...
                        </div>
                      </div>
                    )}
                    
                    {settings.show_categories && (
                      <div className="flex flex-wrap justify-center gap-2 mb-4">
                        {settings.categories.map((category, index) => (
                          <div 
                            key={index}
                            className={`px-4 py-1 rounded-full text-sm ${index === 0 ? 'bg-black text-white' : 'bg-white border'}`}
                          >
                            {category}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="relative mb-3">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="px-4 text-lg font-medium text-gray-900 flex items-center" style={{ backgroundColor: settings.background_color }}>
                            <span className="text-2xl font-serif italic mr-2">A</span>
                            {settings.section_titles.new_arrivals}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map((item) => (
                          <div key={item} className="rounded-lg overflow-hidden bg-white border shadow-sm">
                            <div className="h-32 bg-gray-100"></div>
                            <div className="p-2 text-center">
                              <div className="text-sm uppercase tracking-wider mb-1">Produit {item}</div>
                              {settings.show_ratings && (
                                <div className="flex justify-center mb-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star 
                                      key={star} 
                                      size={12} 
                                      className={star <= 4 ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                                    />
                                  ))}
                                </div>
                              )}
                              <div className="font-medium">€99.00</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline" onClick={() => window.open("/products", "_blank")}>
                  Voir la page en direct
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProductsSettings;
