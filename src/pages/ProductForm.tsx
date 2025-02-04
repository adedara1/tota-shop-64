import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import { Slider } from "@/components/ui/slider";

const ProductForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const [hue, setHue] = useState([180]);
  const [saturation, setSaturation] = useState([50]);
  const [lightness, setLightness] = useState([50]);

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

  const getThemeColor = () => {
    return `hsl(${hue[0]}, ${saturation[0]}%, ${lightness[0]}%)`;
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
      const { data, error: insertError } = await supabase
        .from("products")
        .insert({
          name: formData.get("name") as string,
          original_price: parseInt(formData.get("original_price") as string),
          discounted_price: parseInt(formData.get("discounted_price") as string),
          description: description,
          cart_url: formData.get("cart_url") as string,
          images: imageUrls,
          theme_color: getThemeColor(),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

      navigate(`/product/${data.id}`);
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

            <div className="space-y-4">
              <Label>Couleur du thème</Label>
              <div className="space-y-6 p-4 border rounded-lg">
                <div className="space-y-2">
                  <Label className="text-sm">Teinte</Label>
                  <Slider
                    value={hue}
                    onValueChange={setHue}
                    max={360}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Saturation</Label>
                  <Slider
                    value={saturation}
                    onValueChange={setSaturation}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm">Luminosité</Label>
                  <Slider
                    value={lightness}
                    onValueChange={setLightness}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="h-24 w-full rounded-md transition-colors duration-200 shadow-inner"
                     style={{ backgroundColor: getThemeColor() }}
                />
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Valeur HSL : {getThemeColor()}</p>
                  <p>Cette couleur sera utilisée comme fond de la page produit</p>
                </div>
              </div>
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
