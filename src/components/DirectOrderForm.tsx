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
import CartItemCard from "./CartItemCard";

// Schéma de validation pour le formulaire de commande
const formSchema = z.object({
  name: z.string().min(2, "Le nom est requis"),
  phone: z.string().min(8, "Le téléphone est requis"),
  address: z.string().optional(),
  call_time: z.string().optional(), // Renommé de delivery_time à call_time
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
  currency: string;
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
      call_time: "", // Mis à jour ici
    },
  });
  
  const { items: cartItems, totalPrice: cartTotalPrice, clearCart, updateQuantity: updateCartItemQuantity } = useCart();
  const navigate = useNavigate();
  
  const [quantity, setQuantity] = useState(initialQuantity);

  const { handleSubmit, formState: { isSubmitting } } = form;
  
  const currentProductTotal = productPrice * quantity;
  const grandTotal = cartTotalPrice + currentProductTotal;
  
  // Vérifier s'il y a plus d'un article (article actuel + articles du panier)
  const hasMultipleItems = (quantity > 0 ? 1 : 0) + cartItems.length > 1;

  // Mise à jour de la quantité du produit actuel
  const handleCurrentProductQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

  // Mise à jour de la quantité d'un article du panier
  const handleCartItemQuantityChange = (id: string, newQuantity: number) => {
    updateCartItemQuantity(id, newQuantity);
  };

  const onSubmit = async (values: OrderFormValues) => {
    if (quantity === 0 && cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Veuillez ajouter au moins un article à votre commande.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 1. Préparer les informations client
      const customerInfo = {
        name: values.name,
        phone: values.phone,
        address: values.address,
        call_time: values.call_time, // Utilisation de call_time
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

      const itemsToInsert = [];
      
      // 4. Enregistrer l'article actuel (si quantité > 0)
      if (quantity > 0) {
        const currentItem = {
          product_id: productId,
          name: productName,
          price: productPrice,
          quantity: quantity,
          options: {
            ...selectedOptions,
            customer: customerInfo
          },
          image: productImage,
          cart_id: cartId,
        };
        itemsToInsert.push(currentItem);
      }
      
      // 5. Enregistrer les articles du panier existant
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
        is_shared_cart: true,
      }));
      
      itemsToInsert.push(...existingCartItems);
      
      const { error: itemError } = await supabase.from('cart_items').insert(itemsToInsert);
      
      if (itemError) {
        console.error("Error saving order items:", itemError);
        throw itemError;
      }
      
      // 6. Stocker les données de conversion pour le Meta Pixel
      const conversionData = {
        // Utiliser les IDs pour le suivi Meta Pixel
        productIds: itemsToInsert.map(item => item.product_id).filter(Boolean),
        value: grandTotal,
        currency: currency,
        // Si l'achat vient d'une seule page produit, on stocke son ID et son nom
        sourceProductId: (quantity > 0 && cartItems.length === 0) ? productId : null,
        sourceProductName: (quantity > 0 && cartItems.length === 0) ? productName : null,
      };
      
      localStorage.setItem('meta_conversion_data', JSON.stringify(conversionData));
      
      // 7. Vider le panier local
      clearCart();
      
      // 8. Rediriger vers la page de succès
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
            className="flex-1 px-4 py-3 text-base focus:outline-none text-black"
          />
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border border-black p-4 rounded-lg max-w-full md:max-w-[60%] mx-auto md:mx-0">
      <FormInput name="name" icon={User} placeholder="Nom complet" />
      <FormInput name="phone" icon={Phone} placeholder="Téléphone" type="tel" />
      <FormInput name="address" icon={MapPin} placeholder="Ville & quartier" />
      
      <FormInput name="call_time" icon={Calendar} placeholder="On vous appelle à quelle heure" />
      
      {/* H2 qui s'affiche uniquement s'il y a plus d'un article */}
      {hasMultipleItems && (
        <h2 className="text-lg font-bold text-black mt-4">
          Vous êtes sur le point de commander tous les produits listés ci-dessous. Cliquez sur 'Je ne veux pas' en rouge pour retirer ceux que vous ne désirez pas.
        </h2>
      )}

      {/* Liste des articles */}
      <div className="space-y-3 pt-2">
        {/* Article actuel */}
        {quantity > 0 && (
          <CartItemCard
            id={productId}
            name={productName}
            price={productPrice}
            quantity={quantity}
            image={productImage}
            currency={currency}
            isCurrentProduct={true}
            onQuantityChange={handleCurrentProductQuantityChange}
          />
        )}
        
        {/* Articles du panier */}
        {cartItems.map(item => (
          <CartItemCard
            key={item.id}
            id={item.id}
            name={item.name}
            price={item.price}
            quantity={item.quantity}
            image={item.image}
            currency={currency}
            isCurrentProduct={false}
            onQuantityChange={(newQuantity) => handleCartItemQuantityChange(item.id, newQuantity)}
          />
        ))}
        
        {/* Message panel */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">
            Svp , veuillez commander uniquement que si vous etes pret a recevoir le produit dès que l un de nos collaborateur va vous appeler . soyez responsables🙏✨
          </p>
        </div>
        
        {/* Total général */}
        <div className="flex justify-between font-bold text-lg text-black pt-2 border-t border-gray-200">
          <span>Total général:</span>
          <span>{grandTotal} {currency}</span>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isSubmitting || (quantity === 0 && cartItems.length === 0)}
        className="w-full bg-gray-800 text-white py-3 px-6 rounded hover:bg-gray-900 transition-colors text-center flex items-center justify-center"
      >
        <ShoppingCart className="mr-2" size={18} />
        {isSubmitting ? "Enregistrement..." : buttonText}
      </Button>
    </form>
  );
};

export default DirectOrderForm;