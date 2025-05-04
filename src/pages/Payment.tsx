import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PromoBar from "@/components/PromoBar";
import Footer from "@/components/Footer";
import { Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";

// Function to generate a unique customer label
const generateCustomerLabel = (name: string, phone: string) => {
  if (!name || !phone) return "";
  
  const firstTwoLetters = name.substring(0, 2).toUpperCase();
  const lastThreeDigits = phone.replace(/\D/g, '').slice(-3);
  
  return `${firstTwoLetters}-${lastThreeDigits}`;
};

// Function to generate a consistent color for a customer
const generateCustomerColor = (label: string) => {
  const colors = [
    "bg-purple-500", "bg-blue-500", "bg-green-500", 
    "bg-yellow-500", "bg-orange-500", "bg-red-500", 
    "bg-pink-500", "bg-indigo-500", "bg-cyan-500"
  ];
  
  // Simple hash function to get a consistent color
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const Payment = () => {
  const { items: cartItems, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Panier vide",
        description: "Votre panier est vide. Ajoutez des produits avant de finaliser votre commande.",
        variant: "destructive"
      });
      return;
    }

    if (!name || !phone) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      // Create customer information
      const customerInfo = {
        name,
        email,
        phone,
        address
      };
      
      // Generate label for the cart
      const customerLabel = generateCustomerLabel(name, phone);
      const labelColor = generateCustomerColor(customerLabel);
      
      // First, create a cart in the database
      const { data: cartData, error: cartError } = await supabase.from('carts').insert({
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        customer_address: address,
        label: customerLabel,
        label_color: labelColor,
        total_amount: totalPrice
      }).select();
      
      if (cartError) throw cartError;
      
      const cartId = cartData?.[0]?.id;
      
      if (!cartId) throw new Error("Failed to create cart");
      
      // Save order items linked to the cart
      for (const item of cartItems) {
        const { error } = await supabase.from('cart_items').insert({
          product_id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          options: {
            ...item.options,
            customer: customerInfo
          },
          image: item.image,
          cart_id: cartId // Link to the cart
        });
        
        if (error) {
          console.error("Error saving order item:", error);
          throw error;
        }
      }
      
      toast({
        title: "Commande envoyée",
        description: "Votre commande a été enregistrée. Nous vous contacterons dès que possible."
      });
      
      // Clear cart and redirect
      clearCart();
      
      // Redirect to thank you page
      navigate('/products');

    } catch (error) {
      console.error("Error processing checkout:", error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement de votre commande.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8f9fa" }}>
      <PromoBar />
      <Navbar />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Votre Panier</h1>
        
        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="text-2xl font-medium mb-2">Votre panier est vide</h2>
            <p className="text-gray-600 mb-6">Ajoutez des produits à votre panier pour commencer vos achats</p>
            <Button onClick={handleContinueShopping}>
              Continuer mes achats
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-medium mb-4">Articles ({cartItems.length})</h2>
                  
                  <div className="divide-y">
                    {cartItems.map((item, index) => (
                      <div key={`${item.id}-${index}`} className="py-4 flex gap-4">
                        <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-medium">{item.name}</h3>
                          <div className="text-sm text-gray-600 mt-1">
                            {item.options && Object.entries(item.options).map(([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span> {typeof value === 'object' ? value.value : value}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center">
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 rounded-full border"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="mx-2">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 rounded-full border"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <div className="font-medium">{item.price * item.quantity} CFA</div>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-medium mb-4">Récapitulatif</h2>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span>Sous-total</span>
                    <span>{totalPrice} CFA</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between items-center font-medium">
                    <span>Total</span>
                    <span className="text-lg">{totalPrice} CFA</span>
                  </div>
                </div>
                
                <div className="space-y-4 mt-8">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Nom complet <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium">
                      Téléphone <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="phone" 
                      value={phone} 
                      onChange={(e) => setPhone(e.target.value)} 
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-sm font-medium">
                      Adresse de livraison
                    </Label>
                    <Textarea 
                      id="address" 
                      value={address} 
                      onChange={(e) => setAddress(e.target.value)} 
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Traitement en cours..." : "Commander"}
                  </Button>
                  
                  <button 
                    onClick={handleContinueShopping} 
                    className="text-center w-full text-sm text-gray-600 underline mt-2"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Payment;
