import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import RichTextEditor from "@/components/RichTextEditor";
import { Slider } from "@/components/ui/slider";

// Organized color palettes
const COLOR_PALETTES = {
  blue: ['#0000FF', '#79F8F8', '#007FFF', '#1E7FCB', '#74D0F1', '#A9EAFE', '#3A8EBA', '#686F8C', '#5472AE', '#5472AE', '#0095B6', '#26C4EC', '#0F9DE8', '#357AB7', '#8EA2C6', '#17657D', '#8EA2C6', '#77B5FE', '#22427C', '#24445C', '#318CE7', '#003366', '#24445C', '#1560BD', '#00CCCB', '#DFF2FF', '#1034A6', '#2C75FF', '#56739A', '#7F8FA6', '#6050DC', '#03224C', '#73C2FB', '#24445C', '#0F056B', '#1B019B', '#2B009A', '#067790', '#6600FF', '#1D4851', '#318CE7', '#0131B4', '#008080', '#003399', '#0ABAB5', '#425B8A', '#26C4EC', '#048B9A', '#74D0F1', '#00FFFF', '#2BFAFA', '#BBD2E1', '#80D0D0', '#791CF8', '#2E006C', '#4B0082', '#002FA7', '#21177D', '#26619C', '#9683EC', '#56739A', '#CCCCFF', '#25FDE9'],
  white: ['#FFFFFF', '#FEFEFE', '#EFEFEF', '#F0FFFF', '#F5F5DC', '#FEFEE2', '#FEFEFE', '#FDF1B8', '#FEFEFE', '#FBFCFA', '#FAF0E6', '#FAF0C5', '#FEFEFE', '#FEFEFE', '#FEFDF0', '#F6FEFE', '#FEFDF0', '#FFFFF4', '#FEFEE0', '#F4FEFE', '#FEFEFE', '#F2FFFF', '#FEFEFE', '#FDE9E0', '#FEE7F0'],
  brown: ['#5B3C11', '#88421D', '#A76726', '#F0C300', '#9D3E0C', '#8B6C42', '#C8AD7F', '#F5F5DC', '#AFA778', '#3D2B1F', '#856D4D', '#4E3D28', '#5B3C11', '#842E1B', '#614E1A', '#3F2204', '#6B5731', '#614B3A', '#2F1B0C', '#462E01', '#785E2F', '#7E5835', '#7E3300', '#806D5A', '#8B6C42', '#85530F', '#5A3A22', '#DF6D14', '#AD4F09', '#99512B', '#BBAE98', '#685E43', '#8F5922', '#582900', '#87591A', '#955628', '#CC5500', '#4E1609', '#A5260A', '#AE4A34', '#985717', '#730800', '#8D4024', '#A98C78', '#AE8964', '#9F551E', '#8E5434', '#625B48', '#926D27', '#E1CE9A'],
  gray: ['#606060', '#5A5E6B', '#CECECE', '#EFEFEF', '#766F64', '#3D2B1F', '#856D4D', '#4E3D28', '#83A697', '#806D5A', '#BABABA', '#EDEDED', '#BBD2E1', '#BBAE98', '#AFAFAF', '#303030', '#677179', '#848484', '#7F7F7F', '#CECECE', '#C7D0CC', '#9E9E9E', '#BBACAC', '#B3B191', '#CCCCCC', '#798081', '#997A8D', '#463F32', '#C1BFB1'],
  yellow: ['#FFFF00', '#F0C300', '#FFCB60', '#F0E36B', '#FFF48D', '#E8D630', '#E2BC74', '#FCDC12', '#EDD38C', '#CDCD0D', '#D0C07A', '#FBF2B7', '#EDFF0C', '#FFFF05', '#F7FF3C', '#AD4F09', '#E6E697', '#FFFF6B', '#EF9B0F', '#EFD242', '#D1B606', '#E7F00D', '#DFFF00', '#FDEE00', '#FFF0BC', '#EFD807', '#FFE436', '#FEF86C', '#C7CF00', '#F7E269', '#808000', '#FEE347', '#F7E35F', '#FFDE75', '#EED153', '#B3B191', '#DAB30A', '#DFAF2C', '#DD985C', '#FFD700', '#FCD21C', '#B67823', '#C3B470', '#A89874', '#E0CDA9', '#F4C430', '#FFFF6B', '#FAEA73', '#E1CE9A', '#E7A854'],
  black: ['#000000', '#000000', '#3F2204', '#2C030B', '#3A020D', '#0B1616', '#000000', '#000000', '#000000', '#120D16', '#130E0A', '#130E0A', '#000000', '#000000', '#000000', '#2F1E0E', '#2D241E'],
  orange: ['#ED7F10', '#E67E30', '#FFCB60', '#F1E2BE', '#FFE4C4', '#F4661B', '#DF6D14', '#E73E01', '#B36700', '#EF9B0F', '#FEA347', '#DE9816', '#FAA401', '#CC5500', '#AD4F09', '#F3D617', '#F88E55', '#FF7F00', '#A75502', '#E1CE9A', '#E9C9B1'],
  pink: ['#FD6C9E', '#FFE4C4', '#DE3163', '#FEC3AC', '#FDE9E0', '#FEE7F0', '#C72C48', '#FD3F92', '#DF73FF', '#FE96A0', '#FF00FF', '#800080', '#DB0073', '#D473D4', '#FDBFB7', '#C4698F', '#F9429E', '#FEBFD2', '#997A8D', '#FF866A', '#FF007F', '#F88E55'],
  red: ['#FF0000', '#91283B', '#6D071A', '#842E1B', '#BB0B0B', '#E73E01', '#ED0000', '#BF3030', '#A42424', '#C72C48', '#FD3F92', '#E9383F', '#6E0B14', '#FE96A0', '#FF6F7D', '#FF00FF', '#800080', '#DB0073', '#D473D4', '#FC5D5D', '#DD985C', '#91283B', '#9E0E40', '#811453', '#FF007F', '#D90115', '#F7230C', '#A5260A', '#6B0D0D', '#FF5E4D', '#B82010', '#960018', '#DB1702', '#FD4626', '#C60800', '#960018', '#DC143C', '#A91101', '#EB0000', '#801818', '#F7230C', '#BC2001', '#FE1B00', '#FF4901', '#EE1010', '#CF0A1D', '#C60800', '#E0115F', '#850606', '#DE2916', '#AE4A34', '#A91101', '#DB1702', '#FD4626', '#C71585', '#985717', '#730800', '#8D4024', '#CC4E5C', '#FF0921', '#6C0277'],
  green: ['#00FF00', '#79F8F8', '#7BA05B', '#008E8E', '#048B9A', '#83A697', '#80D0D0', '#649B88', '#1B4F08', '#87E990', '#94812B', '#16B84E', '#54F98D', '#149414', '#25FDE9', '#7FDD4C', '#82C46C', '#18391E', '#9FE855', '#568203', '#096A09', '#C2F732', '#00FF00', '#18391E', '#95A595', '#22780F', '#B0F2B6', '#01D758', '#00561B', '#175732', '#3A9D23', '#00561B', '#798933', '#85C17E', '#9EFD38', '#1FA055', '#386F48', '#596643', '#679F5A', '#708D23', '#97DFC6', '#3AF24B', '#01796F', '#BEF574', '#4CA66B', '#34C924']
};

// Flatten all colors into a single array
const ALL_COLORS = Object.values(COLOR_PALETTES).flat();

const ProductForm = () => {
  const navigate = useNavigate();
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
      const { data, error: insertError } = await supabase
        .from("products")
        .insert({
          name: formData.get("name") as string,
          original_price: parseInt(formData.get("original_price") as string),
          discounted_price: parseInt(formData.get("discounted_price") as string),
          description: description,
          cart_url: formData.get("cart_url") as string,
          images: imageUrls,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

      // Redirect to the new product page
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
