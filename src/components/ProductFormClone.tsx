
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import RichTextEditor from "@/components/RichTextEditor";
import ColorSelector from "@/components/ColorSelector";
import { Database } from "@/integrations/supabase/types";

type CurrencyCode = Database['public']['Enums']['currency_code'];

const CURRENCIES = [
  { code: 'XOF' as CurrencyCode, label: 'Franc CFA (XOF) - UEMOA' },
  { code: 'XAF' as CurrencyCode, label: 'Franc CFA (XAF) - CEMAC' },
  { code: 'ZAR' as CurrencyCode, label: 'Rand sud-africain (ZAR)' },
  { code: 'MAD' as CurrencyCode, label: 'Dirham marocain (MAD)' },
  { code: 'EGP' as CurrencyCode, label: 'Livre égyptienne (EGP)' },
  { code: 'NGN' as CurrencyCode, label: 'Naira nigérian (NGN)' },
  { code: 'KES' as CurrencyCode, label: 'Shilling kényan (KES)' },
  { code: 'TND' as CurrencyCode, label: 'Dinar tunisien (TND)' },
  { code: 'UGX' as CurrencyCode, label: 'Shilling ougandais (UGX)' },
  { code: 'GHS' as CurrencyCode, label: 'Cedi ghanéen (GHS)' },
  { code: 'USD' as CurrencyCode, label: 'Dollar américain (USD)' },
  { code: 'EUR' as CurrencyCode, label: 'Euro (EUR)' }
];

interface ProductFormCloneProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const ProductFormClone = ({ onSuccess, onCancel }: ProductFormCloneProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [description, setDescription] = useState("");
  const defaultColor = "#f1eee9";
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");

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

      const cleanWhatsappNumber = whatsappNumber.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${cleanWhatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

      const productData = {
        name: formData.get("name") as string,
        original_price: parseInt(formData.get("original_price") as string),
        discounted_price: parseInt(formData.get("discounted_price") as string),
        description: description,
        cart_url: whatsappUrl,
        theme_color: selectedColor,
        images: imageUrls,
        is_visible: true,
        button_text: formData.get("button_text") as string || "Contactez-nous sur WhatsApp",
        currency: formData.get("currency") as CurrencyCode || "XOF",
      };

      const { error: insertError } = await supabase
        .from("products")
        .insert(productData);

      if (insertError) throw insertError;

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });

      onSuccess();
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="images-clone">Images du produit (Max 4)</Label>
        <Input
          id="images-clone"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageChange}
        />
      </div>

      <div>
        <Label htmlFor="name-clone">Nom du produit</Label>
        <Input id="name-clone" name="name" required />
      </div>

      <div>
        <Label htmlFor="currency-clone">Devise</Label>
        <select
          id="currency-clone"
          name="currency"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          defaultValue="XOF"
          required
        >
          {CURRENCIES.map(currency => (
            <option key={currency.code} value={currency.code}>
              {currency.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="original_price-clone">Prix original</Label>
        <Input
          id="original_price-clone"
          name="original_price"
          type="number"
          required
        />
      </div>

      <div>
        <Label htmlFor="discounted_price-clone">Prix réduit</Label>
        <Input
          id="discounted_price-clone"
          name="discounted_price"
          type="number"
          required
        />
      </div>

      <div>
        <Label htmlFor="whatsapp-number-clone">Numéro WhatsApp</Label>
        <Input
          id="whatsapp-number-clone"
          value={whatsappNumber}
          onChange={(e) => setWhatsappNumber(e.target.value)}
          placeholder="Ex: 51180895"
          required
        />
      </div>

      <div>
        <Label htmlFor="whatsapp-message-clone">Message WhatsApp par défaut</Label>
        <Input
          id="whatsapp-message-clone"
          value={whatsappMessage}
          onChange={(e) => setWhatsappMessage(e.target.value)}
          placeholder="Ex: Bonjour"
          required
        />
      </div>

      <div>
        <Label htmlFor="button_text-clone">Texte du bouton</Label>
        <Input
          id="button_text-clone"
          name="button_text"
          required
          defaultValue="Contactez-nous sur WhatsApp"
          placeholder="Contactez-nous sur WhatsApp"
        />
      </div>

      <div>
        <Label htmlFor="description-clone">Description</Label>
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
          selectedColor={selectedColor}
          onColorSelect={setSelectedColor}
        />
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "En cours..." : "Créer"}
        </Button>
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  );
};

export default ProductFormClone;
