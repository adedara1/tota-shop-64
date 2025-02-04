import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSelector from "@/components/ColorSelector";
import { Copy, Edit, Plus, Trash } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

// Organized color palettes
const COLOR_PALETTES = {
  blue: ['#0000FF', '#79F8F8', '#007FFF', '#1E7FCB', '#74D0F1', '#A9EAFE', '#3A8EBA'],
  white: ['#FFFFFF', '#FEFEFE', '#EFEFEF', '#F0FFFF', '#F5F5DC', '#FEFEE2'],
  brown: ['#5B3C11', '#88421D', '#A76726', '#F0C300', '#9D3E0C', '#8B6C42', '#C8AD7F'],
  gray: ['#606060', '#5A5E6B', '#CECECE', '#EFEFEF', '#766F64', '#3D2B1F', '#856D4D'],
  yellow: ['#FFFF00', '#F0C300', '#FFCB60', '#F0E36B', '#FFF48D', '#E8D630', '#E2BC74'],
  black: ['#000000', '#2C030B', '#3A020D', '#0B1616', '#120D16', '#130E0A'],
  orange: ['#ED7F10', '#E67E30', '#FFCB60', '#F1E2BE', '#FFE4C4', '#F4661B', '#DF6D14'],
  pink: ['#FD6C9E', '#FFE4C4', '#DE3163', '#FEC3AC', '#FDE9E0', '#FEE7F0', '#C72C48'],
  red: ['#FF0000', '#91283B', '#6D071A', '#842E1B', '#BB0B0B', '#E73E01', '#ED0000'],
  green: ['#00FF00', '#79F8F8', '#7BA05B', '#008E8E', '#048B9A', '#83A697', '#80D0D0']
};

const ALL_COLORS = Object.values(COLOR_PALETTES).flat();

interface Product {
  id: string;
  name: string;
  original_price: number;
  discounted_price: number;
  description: string;
  cart_url: string;
  images: string[];
  theme_color: string;
  created_at: string;
}

const ProductForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [colorIndex, setColorIndex] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 4) {
      toast({
        title: "Erreur",
        description: "Vous ne pouvez télécharger que 4 images maximum",
        variant: "destructive",
      });
      return;
    }
    setImages(files);
  };

  const resetForm = () => {
    setImages([]);
    setDescription("");
    setColorIndex(0);
    setEditingProduct(null);
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) form.reset();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const imageUrls: string[] = [];

      // Upload images if new ones are selected
      if (images.length > 0) {
        for (const image of images) {
          const fileName = `${crypto.randomUUID()}-${image.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("products")
            .upload(fileName, image);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

          imageUrls.push(publicUrl);
        }
      }

      const productData = {
        name: formData.get("name") as string,
        original_price: parseInt(formData.get("original_price") as string),
        discounted_price: parseInt(formData.get("discounted_price") as string),
        description: description,
        cart_url: formData.get("cart_url") as string,
        theme_color: ALL_COLORS[colorIndex],
        images: imageUrls.length > 0 ? imageUrls : (editingProduct?.images || []),
      };

      if (editingProduct) {
        const { error: updateError } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "Produit mis à jour avec succès",
        });
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert(productData);

        if (insertError) throw insertError;

        toast({
          title: "Succès",
          description: "Produit créé avec succès",
        });
      }

      resetForm();
      setIsSheetOpen(false);
      fetchProducts();
    } catch (error) {
      console.error("Error creating/updating product:", error);
      toast({
        title: "Erreur",
        description: "Échec de l'opération",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDescription(product.description);
    setColorIndex(ALL_COLORS.indexOf(product.theme_color));
    setIsSheetOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit supprimé avec succès",
      });
      
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erreur",
        description: "Échec de la suppression",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/product/${id}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copié !",
      description: "L'URL du produit a été copiée dans le presse-papier",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12 px-4 overflow-auto">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-medium">Gestion des produits</h1>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un produit
                </Button>
              </SheetTrigger>
              <SheetContent className="overflow-y-auto w-full sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>
                    {editingProduct ? "Modifier le produit" : "Créer un nouveau produit"}
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="images">Images du produit (Max 4)</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </div>

                    <div>
                      <Label htmlFor="name">Nom du produit</Label>
                      <Input 
                        id="name" 
                        name="name" 
                        required 
                        defaultValue={editingProduct?.name}
                      />
                    </div>

                    <div>
                      <Label htmlFor="original_price">Prix original (CFA)</Label>
                      <Input
                        id="original_price"
                        name="original_price"
                        type="number"
                        required
                        defaultValue={editingProduct?.original_price}
                      />
                    </div>

                    <div>
                      <Label htmlFor="discounted_price">Prix réduit (CFA)</Label>
                      <Input
                        id="discounted_price"
                        name="discounted_price"
                        type="number"
                        required
                        defaultValue={editingProduct?.discounted_price}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <div className="prose max-w-none">
                        <RichTextEditor 
                          value={description} 
                          onChange={setDescription}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Couleur du thème</Label>
                      <ColorSelector
                        colors={ALL_COLORS}
                        selectedColor={ALL_COLORS[colorIndex]}
                        onColorSelect={(color) => setColorIndex(ALL_COLORS.indexOf(color))}
                      />
                    </div>

                    <div>
                      <Label htmlFor="cart_url">URL du panier</Label>
                      <Input 
                        id="cart_url" 
                        name="cart_url" 
                        type="url" 
                        required 
                        defaultValue={editingProduct?.cart_url}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={loading} className="flex-1">
                        {loading ? "En cours..." : (editingProduct ? "Modifier" : "Créer")}
                      </Button>
                      <SheetClose asChild>
                        <Button variant="outline" onClick={resetForm} className="flex-1">
                          Annuler
                        </Button>
                      </SheetClose>
                    </div>
                  </form>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="px-6 py-3 text-left">Nom</th>
                    <th className="px-6 py-3 text-left">Prix original</th>
                    <th className="px-6 py-3 text-left">Prix réduit</th>
                    <th className="px-6 py-3 text-left">Date de création</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4">{product.name}</td>
                      <td className="px-6 py-4">{product.original_price} CFA</td>
                      <td className="px-6 py-4">{product.discounted_price} CFA</td>
                      <td className="px-6 py-4">
                        {format(new Date(product.created_at), "d MMMM yyyy", { locale: fr })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(product.id)}
                            title="Copier l'URL"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(product)}
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                            title="Supprimer"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
