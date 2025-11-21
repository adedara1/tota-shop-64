import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, MapPin, Calendar, ShoppingCart, Plus, Minus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateCustomerLabel, generateCustomerColor } from "@/utils/customerUtils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";

// Schéma de validation pour le formulaire de commande
const formSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  phone: z.string().min(8, "Le téléphone est requis"),
  address: z.string().optional(), // Ville & quartier
  delivery_time: z.string().optional(), // Heure de livraison
});

type OrderFormValues = z.infer<typeof formSchema>;

interface DirectOrderFormProps {
  productId: string;
  productName: string;
  productPrice: number;
  initialQuantity: number;
  onQuantityChange: (quantity: number) => void;
  selectedOptions: Record<string, any>;
  productImage: string | null;
  buttonText: string;
  currency: string; // Ajout de la propriété manquante
}

const DirectOrderForm = ({
  productId,
  productName,
  productPrice,
  initialQuantity,
  onQuantityChange,
  selectedOptions,
  productImage,
  buttonText,
  currency,
}: DirectOrderFormProps) => {
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      address: "",
      delivery_time: "",
    },
  });
  
  const { items: cartItems, totalPrice: cartTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(initialQuantity);

  const { handleSubmit, formState: { isSubmitting } } = form;
  
  const currentProductTotal = productPrice * quantity;
  const grandTotal = cartTotalPrice + currentProductTotal;

  const increaseQuantity = () => {
    const newQuantity = quantity + 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const decreaseQuantity = () => {
    const newQuantity = quantity > 1 ? quantity - 1 : 1;
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  const onSubmit = async (values: OrderFormValues) => {
    try {
      // 1. Préparer les informations client
      const customerInfo = {
        name: values.name,
        phone: values.phone,
        address: values.address,
        delivery_time: values.delivery_time,
      };

      // 2. Générer le label et la couleur du client
      const customerLabel = generateCustomerLabel(customerInfo);
      const labelColor = generateCustomerColor(customerLabel);
      
      // 3. Créer un nouveau panier (en-tête de commande)
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .insert({
          customer_name: values.name,
          customer_phone: values.phone,
          customer_address: values.address,
          label: customerLabel,
          label_color: labelColor,
          total_amount: grandTotal,
        })
        .select('id')
        .single();
      
      if (cartError) throw cartError;
      const cartId = cartData.id;

      // 4. Enregistrer l'article actuel (ligne de commande)
      const currentItem = {
        product_id: productId,
        name: productName,
        price: productPrice,
        quantity: quantity,
        options: {
          ...selectedOptions,
          customer: customerInfo // Ajouter les détails client aux options
        },
        image: productImage,
        cart_id: cartId,
      };
      
      // 5. Enregistrer les articles du panier existant (s'il y en a)
      const existingCartItems = cartItems.map(item => ({
        product_id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        options: {
          ...item.options,
          customer: customerInfo
        },
        image: item.image,
        cart_id: cartId,
        is_shared_cart: true, // Marquer comme partagé si c'est un article du panier
      }));
      
      const itemsToInsert = [currentItem, ...existingCartItems];
      
      const { error: itemError } = await supabase.from('cart_items').insert(itemsToInsert);
      
      if (itemError) {
        console.error("Error saving order items:", itemError);
        throw itemError;
      }
      
      // 6. Vider le panier local
      clearCart();
      
      // 7. Rediriger vers la page de succès
      navigate('/succes');

    } catch (error) {
      console.error("Error processing direct order:", error);
      toast({
        title: "Erreur de commande",
        description: "Une erreur s'est produite lors de l'enregistrement de votre commande.",
        variant: "destructive"
      });
    }
  };

  // Composant d'entrée personnalisé pour l'interface du screenshot
  const FormInput = ({ name, icon: Icon, placeholder, type = "text" }: { name: keyof OrderFormValues, icon: React.ElementType, placeholder: string, type?: string }) => {
    const field = form.control.register(name);
    const error = form.formState.errors[name];

    return (
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-3 bg-gray-100 border-r border-gray-300">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <input
            {...field}
            type={type}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 text-base focus:outline-none text-black" // Ajout de text-black
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border border-black p-4 rounded-lg max-w-[60%] mx-auto md:mx-0">
      <FormInput name="name" icon={User} placeholder="Nom complet" />
      <FormInput name="phone" icon={Phone} placeholder="Téléphone" type="tel" />
      <FormInput name="address" icon={MapPin} placeholder="Ville & quartier" />
      <FormInput name="delivery_time" icon={Calendar} placeholder="Heure de livraison souhaitée" />

      {/* Sélecteur de quantité */}
      <div className="mb-6">
        <h3 className="text-sm font-medium mb-3 text-black">Quantité</h3>
        <div className="flex items-center">
          <button 
            type="button"
            onClick={decreaseQuantity}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-black"
          >
            <Minus size={16} />
          </button>
          <span className="mx-4 text-black">{quantity}</span>
          <button 
            type="button"
            onClick={increaseQuantity}
            className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 text-black"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
      
      {/* Récapitulatif du panier (Étape 2) */}
      <div className="border-t border-b py-3 space-y-2">
        <h4 className="font-semibold text-black">Récapitulatif de la commande</h4>
        
        {cartItems.length > 0 && (
          <div className="text-sm text-gray-700 space-y-1">
            <p className="font-medium">Articles déjà dans le panier ({cartItems.length}):</p>
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-xs">
                <span>{item.quantity}x {item.name}</span>
                <span>{item.price * item.quantity} {currency}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between font-medium text-black">
          <span>Produit actuel ({quantity}x)</span>
          <span>{currentProductTotal} {currency}</span>
        </div>
        
        <div className="flex justify-between font-bold text-lg text-black pt-2 border-t border-gray-200">
          <span>Total général:</span>
          <span>{grandTotal} {currency}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-gray-800 text-white py-3 px-6 rounded hover:bg-gray-900 transition-colors text-center flex items-center justify-center"
      >
        <ShoppingCart className="mr-2" size={18} />
        {isSubmitting ? "Enregistrement..." : buttonText}
      </Button>
    </form>
  );
};

export default DirectOrderForm;