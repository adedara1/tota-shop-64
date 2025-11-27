import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Phone, MapPin, Calendar, ShoppingCart, Plus, Minus, Info, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { generateCustomerLabel, generateCustomerColor } from "@/utils/customerUtils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useCart } from "@/hooks/use-cart";
import { useNavigate } from "react-router-dom";
import CartItemCard from "./CartItemCard";
import { useQuery } from "@tanstack/react-query";
import { getIconComponent } from "@/utils/iconMapping";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label"; // <-- Ajout de l'importation Label

// Définir un schéma de base pour la validation dynamique
const baseSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  call_time: z.string().optional(),
});

type OrderFormValues = z.infer<typeof baseSchema>;

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

interface FormField {
  id: string;
  field_key: string;
  label: string;
  placeholder: string | null;
  is_required: boolean;
  field_type: 'text' | 'tel' | 'email' | 'textarea' | 'select';
  options: any;
  icon_name: string | null;
  position: number;
  is_active: boolean;
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
  const navigate = useNavigate();
  const { items: cartItems, totalPrice: cartTotalPrice, clearCart, updateQuantity: updateCartItemQuantity } = useCart();
  const [quantity, setQuantity] = useState(initialQuantity);

  // 1. Récupération des champs de formulaire dynamiques
  const { data: formFields, isLoading: isLoadingFields } = useQuery<FormField[]>({
    queryKey: ["orderFormFields"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_form_settings')
        .select('*')
        .eq('is_active', true)
        .order('position', { ascending: true });
      
      if (error) {
        console.error("Error fetching form fields:", error);
        // Fallback aux champs par défaut si la requête échoue
        return [
          { id: '1', field_key: 'name', label: 'Nom complet', placeholder: 'Nom complet', is_required: true, field_type: 'text', options: null, icon_name: 'User', position: 1, is_active: true },
          { id: '2', field_key: 'phone', label: 'Téléphone', placeholder: 'Téléphone', is_required: true, field_type: 'tel', options: null, icon_name: 'Phone', position: 2, is_active: true },
          { id: '3', field_key: 'address', label: 'Ville & quartier', placeholder: 'Ville & quartier', is_required: false, field_type: 'textarea', options: null, icon_name: 'MapPin', position: 3, is_active: true },
          { id: '4', field_key: 'call_time', label: 'On vous appelle à quelle heure', placeholder: 'On vous appelle à quelle heure', is_required: false, field_type: 'text', options: null, icon_name: 'Calendar', position: 4, is_active: true },
        ] as FormField[];
      }
      return data as FormField[];
    },
    staleTime: 1000 * 60 * 5, // Cache 5 minutes
  });

  // 2. Construction du schéma de validation dynamique
  const dynamicSchema = formFields?.reduce((schema, field) => {
    let fieldSchema: z.ZodString = z.string().optional();
    
    if (field.is_required) {
      fieldSchema = z.string().min(1, `${field.label} est requis`);
    }
    
    if (field.field_type === 'email') {
      fieldSchema = fieldSchema.or(z.literal('')).pipe(z.string().email("Email invalide").optional());
    }
    
    return schema.extend({
      [field.field_key]: fieldSchema,
    });
  }, baseSchema) || baseSchema;

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(dynamicSchema),
    defaultValues: formFields?.reduce((acc, field) => {
      acc[field.field_key as keyof OrderFormValues] = '';
      return acc;
    }, {} as OrderFormValues) || {},
  });

  const { handleSubmit, formState: { isSubmitting } } = form;
  
  const currentProductTotal = productPrice * quantity;
  const grandTotal = cartTotalPrice + currentProductTotal;
  
  const hasMultipleItems = (quantity > 0 ? 1 : 0) + cartItems.length > 1;

  const handleCurrentProductQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity);
    onQuantityChange(newQuantity);
  };

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
      // 1. Préparer les informations client à partir des valeurs dynamiques
      const customerInfo: Record<string, any> = {};
      formFields?.forEach(field => {
        customerInfo[field.field_key] = values[field.field_key as keyof OrderFormValues];
      });

      // 2. Générer le label et la couleur du client (en utilisant au moins le nom et le téléphone si disponibles)
      const customerLabel = generateCustomerLabel({ name: customerInfo.name || 'Client', phone: customerInfo.phone || 'N/A' });
      const labelColor = generateCustomerColor(customerLabel);
      
      // 3. Créer un nouveau panier (en-tête de commande)
      const { data: cartData, error: cartError } = await supabase
        .from('carts')
        .insert({
          customer_name: customerInfo.name || null,
          customer_phone: customerInfo.phone || null,
          customer_address: customerInfo.address || null,
          customer_email: customerInfo.email || null,
          label: customerLabel,
          label_color: labelColor,
          processed: false,
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
        productIds: itemsToInsert.map(item => item.product_id).filter(Boolean),
        value: grandTotal,
        currency: currency,
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

  // Composant d'entrée dynamique
  const DynamicFormInput = ({ field }: { field: FormField }) => {
    const Icon = getIconComponent(field.icon_name);
    const fieldRegistration = form.register(field.field_key as keyof OrderFormValues);
    const error = form.formState.errors[field.field_key as keyof OrderFormValues];
    
    const inputProps = {
      ...fieldRegistration,
      placeholder: field.placeholder || field.label,
      required: field.is_required,
      className: "flex-1 px-4 py-3 text-base focus:outline-none text-black",
    };

    let InputComponent;
    
    switch (field.field_type) {
      case 'textarea':
        InputComponent = (
          <Textarea 
            {...fieldRegistration} 
            placeholder={field.placeholder || field.label}
            required={field.is_required}
            className="flex-1 px-4 py-3 text-base focus:outline-none text-black min-h-[100px]"
          />
        );
        break;
      case 'select':
        const options = field.options && typeof field.options === 'object' ? Object.entries(field.options) : [];
        InputComponent = (
          <Select
            onValueChange={(value) => form.setValue(field.field_key as keyof OrderFormValues, value)}
            defaultValue={form.getValues(field.field_key as keyof OrderFormValues) || ''}
            required={field.is_required}
          >
            <SelectTrigger className="flex-1 px-4 py-3 text-base focus:outline-none text-black">
              <SelectValue placeholder={field.placeholder || field.label} />
            </SelectTrigger>
            <SelectContent>
              {options.map(([key, value]) => (
                <SelectItem key={key} value={value as string}>{key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
        break;
      default:
        InputComponent = (
          <input
            {...inputProps}
            type={field.field_type === 'tel' ? 'tel' : field.field_type === 'email' ? 'email' : 'text'}
          />
        );
    }

    return (
      <div className="relative">
        <Label className="sr-only">{field.label}</Label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
          <div className="p-3 bg-gray-100 border-r border-gray-300">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          {field.field_type === 'textarea' ? (
            <div className="flex-1 p-3">
              {InputComponent}
            </div>
          ) : (
            InputComponent
          )}
        </div>
        {error && <p className="text-xs text-red-500 mt-1">{error.message}</p>}
      </div>
    );
  };

  if (isLoadingFields) {
    return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className="space-y-4 border border-black p-4 rounded-lg w-full max-w-md"
    >
      {/* NOUVEAU BLOC: Paiement à la livraison */}
      <div className="bg-black text-white border-2 border-orange-500 p-3 rounded-lg text-center font-bold text-lg">
        PAIEMENT À LA LIVRAISON
      </div>
      
      {/* Champs de formulaire dynamiques */}
      {formFields?.map(field => (
        <DynamicFormInput key={field.id} field={field} />
      ))}
      
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
            options={selectedOptions}
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
            options={item.options}
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