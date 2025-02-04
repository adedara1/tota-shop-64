import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSelector from "@/components/ColorSelector";

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

// Flatten all colors into a single array
const ALL_COLORS = Object.values(COLOR_PALETTES).flat();

const ProductForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [colorIndex, setColorIndex] = useState(0);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const imageUrls: string[] = [];

      // Upload images
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

      // Create product
      const { error: insertError } = await supabase
        .from("products")
        .insert({
          name: formData.get("name") as string,
          original_price: parseInt(formData.get("original_price") as string),
          discounted_price: parseInt(formData.get("discounted_price") as string),
          description: description,
          cart_url: formData.get("cart_url") as string,
          images: imageUrls,
          theme_color: ALL_COLORS[colorIndex],
        });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

    } catch (error) {
      console.error("Error creating product:", error);
      toast({
        title: "Erreur",
        description: "Échec de la création du produit",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="py-12 px-4">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-medium mb-8">Créer un nouveau produit</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="images">Images du produit (Max 4)</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="name">Nom du produit</Label>
              <Input id="name" name="name" required />
            </div>

            <div>
              <Label htmlFor="original_price">Prix original (CFA)</Label>
              <Input
                id="original_price"
                name="original_price"
                type="number"
                required
              />
            </div>

            <div>
              <Label htmlFor="discounted_price">Prix réduit (CFA)</Label>
              <Input
                id="discounted_price"
                name="discounted_price"
                type="number"
                required
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
              <Input id="cart_url" name="cart_url" type="url" required />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 px-6 rounded hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Créer le produit"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;