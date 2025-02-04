import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const ProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);

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
      const { error: insertError } = await supabase.from("products").insert({
        name: formData.get("name") as string,
        original_price: parseInt(formData.get("original_price") as string),
        discounted_price: parseInt(formData.get("discounted_price") as string),
        description: formData.get("description") as string,
        cart_url: formData.get("cart_url") as string,
        images: imageUrls,
      });

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

      navigate("/");
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
              <Textarea id="description" name="description" required />
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