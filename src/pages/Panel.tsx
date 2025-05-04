
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, EyeOff, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  options: {
    customer?: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    [key: string]: any;
  };
  image: string;
  created_at: string;
  updated_at: string;
  processed: boolean | null;
  hidden: boolean | null;
  cart_id: string | null;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

interface Cart {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_address: string | null;
  label: string | null;
  label_color: string | null;
  total_amount: number;
  created_at: string;
  updated_at: string;
  processed: boolean | null;
}

interface Customer {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const Panel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Record<string, CartItem[]>>({});
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CartItem | null>(null);
  const [selectedCart, setSelectedCart] = useState<string | null>(null);
  const [hiddenOrders, setHiddenOrders] = useState<string[]>([]);

  const fetchData = async () => {
    try {
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("id, name, images")
        .eq("use_internal_cart", true);

      if (productsError) throw productsError;
      if (productsData) setProducts(productsData);

      // Fetch carts
      const { data: cartsData, error: cartsError } = await supabase
        .from("carts")
        .select("*")
        .order("created_at", { ascending: false });

      if (cartsError) throw cartsError;
      if (cartsData) setCarts(cartsData);

      // For each product, fetch its orders
      if (productsData && productsData.length > 0) {
        const ordersMap: Record<string, CartItem[]> = {};

        for (const product of productsData) {
          const { data: orderData, error: orderError } = await supabase
            .from("cart_items")
            .select("*")
            .eq("product_id", product.id);

          if (orderError) throw orderError;
          
          if (orderData && orderData.length > 0) {
            // Parse options if stored as string
            const processedOrders = orderData.map(order => ({
              ...order,
              options: typeof order.options === 'string' 
                ? JSON.parse(order.options) 
                : order.options || {},
              hidden: order.hidden || false
            }));
            
            ordersMap[product.id] = processedOrders as CartItem[];
          }
        }
        
        setOrders(ordersMap);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger les données."
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOrderClick = (order: CartItem) => {
    setSelectedOrder({
      ...order,
      options: typeof order.options === 'string' 
        ? JSON.parse(order.options) 
        : order.options || {}
    });
  };

  const handleCartClick = (cartId: string) => {
    setSelectedCart(cartId === selectedCart ? null : cartId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getCustomerInfo = (order: CartItem): Customer | null => {
    if (order?.options?.customer) {
      return order.options.customer;
    }
    return null;
  };

  // Process an order as complete
  const markAsProcessed = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ processed: true })
        .eq("id", orderId);

      if (error) throw error;

      // Update local state
      setOrders(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(productId => {
          updated[productId] = updated[productId].map(order => 
            order.id === orderId ? { ...order, processed: true } : order
          );
        });
        return updated;
      });

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, processed: true } : null);
      }

      toast({
        title: "Commande traitée",
        description: "La commande a été marquée comme traitée"
      });
    } catch (error) {
      console.error("Error marking order as processed:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer la commande comme traitée"
      });
    }
  };

  // Mark a whole cart as processed
  const markCartAsProcessed = async (cartId: string) => {
    try {
      // First update the cart itself
      const { error: cartError } = await supabase
        .from("carts")
        .update({ processed: true })
        .eq("id", cartId);
      
      if (cartError) throw cartError;

      // Then update all cart items
      const { error: itemsError } = await supabase
        .from("cart_items")
        .update({ processed: true })
        .eq("cart_id", cartId);

      if (itemsError) throw itemsError;
      
      // Update local states
      setCarts(prev => prev.map(cart => 
        cart.id === cartId ? { ...cart, processed: true } : cart
      ));

      setOrders(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(productId => {
          updated[productId] = updated[productId].map(order => 
            order.cart_id === cartId ? { ...order, processed: true } : order
          );
        });
        return updated;
      });

      if (selectedOrder?.cart_id === cartId) {
        setSelectedOrder(prev => prev ? { ...prev, processed: true } : null);
      }

      toast({
        title: "Panier traité",
        description: "Toutes les commandes du panier ont été marquées comme traitées"
      });
    } catch (error) {
      console.error("Error marking cart as processed:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le panier comme traité"
      });
    }
  };

  // Toggle order visibility
  const toggleHideOrder = async (orderId: string) => {
    // Find the order to toggle
    let orderToToggle: CartItem | null = null;
    let currentHiddenState = false;

    // Find the order in the orders object
    Object.keys(orders).forEach(productId => {
      const order = orders[productId].find(o => o.id === orderId);
      if (order) {
        orderToToggle = order;
        currentHiddenState = Boolean(order.hidden);
      }
    });

    if (!orderToToggle) return;

    try {
      // Update the hidden state in the database
      const { error } = await supabase
        .from("cart_items")
        .update({ hidden: !currentHiddenState })
        .eq("id", orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(productId => {
          updated[productId] = updated[productId].map(order => 
            order.id === orderId ? { ...order, hidden: !order.hidden } : order
          );
        });
        return updated;
      });

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, hidden: !prev.hidden } : null);
      }

      toast({
        title: currentHiddenState ? "Commande visible" : "Commande masquée",
        description: currentHiddenState 
          ? "La commande est maintenant visible dans la liste" 
          : "La commande est maintenant masquée de la liste"
      });
    } catch (error) {
      console.error("Error toggling order visibility:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier la visibilité de la commande"
      });
    }
  };

  // Get all orders for a specific cart
  const getCartOrders = (cartId: string): CartItem[] => {
    const cartOrders: CartItem[] = [];
    
    Object.keys(orders).forEach(productId => {
      orders[productId].forEach(order => {
        if (order.cart_id === cartId && !order.hidden) {
          cartOrders.push(order);
        }
      });
    });

    return cartOrders;
  };

  // Calculate total for a cart
  const calculateCartTotal = (cartId: string): number => {
    const cartOrders = getCartOrders(cartId);
    return cartOrders.reduce((total, order) => total + (order.price * order.quantity), 0);
  };

  // Get distinct product orders grouped by cart
  const getProductOrdersByCart = (productId: string): Record<string, CartItem[]> => {
    const productOrders = orders[productId] || [];
    const cartMap: Record<string, CartItem[]> = {};
    
    productOrders.forEach(order => {
      if (order.hidden) return; // Skip hidden orders
      if (!order.cart_id) return; // Skip orders without cart ID
      
      if (!cartMap[order.cart_id]) {
        cartMap[order.cart_id] = [];
      }
      
      cartMap[order.cart_id].push(order);
    });
    
    return cartMap;
  };

  // Get cart details from a cart ID
  const getCartDetails = (cartId: string | null): Cart | null => {
    if (!cartId) return null;
    return carts.find(cart => cart.id === cartId) || null;
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">Tableau de bord des commandes</h1>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link to="/home">
            <Home size={16} />
            <span>Retour à l'accueil</span>
          </Link>
        </Button>
      </div>
      
      {products.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl mb-4">Aucun produit avec panier interne trouvé</h2>
          <p className="text-gray-500">
            Créez des produits avec l'option "panier interne" pour voir les commandes ici.
          </p>
        </div>
      ) : (
        <Tabs defaultValue={products[0]?.id} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {products.map((product) => {
              // Count only non-hidden orders for this product
              const orderCount = orders[product.id]?.filter(order => !order.hidden)?.length || 0;
              return (
                <TabsTrigger key={product.id} value={product.id} className="text-sm md:text-base">
                  {product.name}
                  {orderCount > 0 && (
                    <Badge className="ml-2 bg-red-500">{orderCount}</Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
          
          {products.map((product) => (
            <TabsContent key={product.id} value={product.id} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Commandes pour {product.name}</span>
                        <Badge>{orders[product.id]?.filter(order => !order.hidden)?.length || 0} commandes</Badge>
                      </CardTitle>
                      <CardDescription>
                        Cliquez sur une étiquette pour voir les détails du panier
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
                      {!orders[product.id] || orders[product.id].filter(order => !order.hidden).length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucune commande pour ce produit
                        </div>
                      ) : (
                        Object.entries(getProductOrdersByCart(product.id)).map(([cartId, cartOrders]) => {
                          const cart = getCartDetails(cartId);
                          if (!cart) return null;
                          
                          const isSelected = selectedCart === cartId;
                          const labelColor = cart.label_color || "bg-blue-500";
                          const totalPrice = calculateCartTotal(cartId);
                          
                          return (
                            <div key={cartId} className={`mb-4 border rounded-lg overflow-hidden ${isSelected ? 'border-blue-500 shadow-md' : ''}`}>
                              <div 
                                className={`${isSelected ? 'bg-blue-50' : 'bg-gray-100'} p-2 flex justify-between items-center cursor-pointer`}
                                onClick={() => handleCartClick(cartId)}
                              >
                                <div className="flex items-center">
                                  <Badge className={`${labelColor} text-white cursor-pointer`}>
                                    {cart.label || 'Panier'}
                                  </Badge>
                                  <span className="ml-2 font-medium">{cart.customer_name}</span>
                                  <span className="ml-2 text-sm text-gray-500">{cart.customer_phone}</span>
                                </div>
                                <div className="font-semibold">
                                  Total: {cart.total_amount} CFA
                                </div>
                              </div>
                              
                              {isSelected && cartOrders.map((order) => (
                                <div 
                                  key={order.id}
                                  onClick={() => handleOrderClick(order)}
                                  className={`p-4 cursor-pointer transition-colors ${
                                    selectedOrder?.id === order.id 
                                      ? 'bg-blue-50 border-blue-300' 
                                      : 'hover:bg-gray-50'
                                  } ${order.processed ? 'opacity-60' : ''}`}
                                >
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      {order.image && (
                                        <Avatar className="h-10 w-10 mr-3">
                                          <img src={order.image} alt={order.name} />
                                        </Avatar>
                                      )}
                                      <div>
                                        <div className="font-medium">{order.quantity}× {order.name}</div>
                                        <div className="text-sm text-gray-500">
                                          {formatDate(order.created_at)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <div className="font-semibold">
                                        {order.price * order.quantity} CFA
                                      </div>
                                      {order.processed && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                          Traitée
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                              
                              {isSelected && (
                                <CardFooter className="bg-gray-50 p-2 flex justify-end">
                                  <Button 
                                    variant="default"
                                    size="sm"
                                    className="bg-blue-500 hover:bg-blue-600"
                                    onClick={() => markCartAsProcessed(cartId)}
                                    disabled={cart.processed}
                                  >
                                    {cart.processed ? "Panier déjà traité" : "Marquer panier comme traité"}
                                  </Button>
                                </CardFooter>
                              )}
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full md:w-1/2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Détails de la commande</CardTitle>
                      <CardDescription>
                        {selectedOrder ? formatDate(selectedOrder.created_at) : "Sélectionnez une commande"}
                      </CardDescription>
                    </CardHeader>
                    
                    {selectedOrder ? (
                      <>
                        <CardContent className="space-y-6">
                          <div className="flex items-center space-x-4">
                            {selectedOrder.image && (
                              <Avatar className="h-20 w-20">
                                <img src={selectedOrder.image} alt={selectedOrder.name} />
                              </Avatar>
                            )}
                            <div>
                              <h3 className="text-xl font-semibold">{selectedOrder.name}</h3>
                              <p className="text-gray-500">ID: {selectedOrder.id.substring(0, 8)}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Quantité</p>
                              <p className="font-medium">{selectedOrder.quantity}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Prix unitaire</p>
                              <p className="font-medium">{selectedOrder.price} CFA</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="font-medium">{selectedOrder.price * selectedOrder.quantity} CFA</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                            </div>
                          </div>

                          {/* Customer Information Section */}
                          {getCustomerInfo(selectedOrder) && (
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <h4 className="font-semibold text-lg mb-3">Informations Client</h4>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">Nom</TableCell>
                                    <TableCell>{getCustomerInfo(selectedOrder)?.name}</TableCell>
                                  </TableRow>
                                  {getCustomerInfo(selectedOrder)?.email && (
                                    <TableRow>
                                      <TableCell className="font-medium">Email</TableCell>
                                      <TableCell>{getCustomerInfo(selectedOrder)?.email}</TableCell>
                                    </TableRow>
                                  )}
                                  <TableRow>
                                    <TableCell className="font-medium">Téléphone</TableCell>
                                    <TableCell>{getCustomerInfo(selectedOrder)?.phone}</TableCell>
                                  </TableRow>
                                  {getCustomerInfo(selectedOrder)?.address && (
                                    <TableRow>
                                      <TableCell className="font-medium">Adresse</TableCell>
                                      <TableCell>{getCustomerInfo(selectedOrder)?.address}</TableCell>
                                    </TableRow>
                                  )}
                                </TableBody>
                              </Table>
                            </div>
                          )}

                          {/* Product Options Section */}
                          {Object.keys(selectedOrder.options).length > 0 && 
                           Object.keys(selectedOrder.options).filter(key => key !== 'customer').length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Options sélectionnées:</h4>
                              <ul className="bg-gray-50 p-3 rounded-md">
                                {Object.entries(selectedOrder.options)
                                  .filter(([key]) => key !== 'customer')
                                  .map(([key, value]) => (
                                    <li key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                      <span className="font-medium">{key}:</span>
                                      <span>{typeof value === 'object' ? value.value : value}</span>
                                    </li>
                                  ))
                                }
                              </ul>
                            </div>
                          )}

                          {/* Cart Summary Section - Show details of all items in the same cart */}
                          {selectedOrder.cart_id && (
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                              <h4 className="font-semibold text-lg mb-3">Récapitulatif du panier</h4>
                              <div className="space-y-2">
                                {(() => {
                                  const cartId = selectedOrder.cart_id;
                                  if (!cartId) return null;
                                  
                                  const cartOrders = getCartOrders(cartId);
                                  const cart = getCartDetails(cartId);
                                  const totalCartPrice = cart ? cart.total_amount : calculateCartTotal(cartId);
                                  
                                  return (
                                    <>
                                      <p className="mb-2">Ce produit fait partie d'un panier contenant {cartOrders.length} article{cartOrders.length > 1 ? 's' : ''}:</p>
                                      <ul className="mb-4 space-y-1">
                                        {cartOrders.map((order) => (
                                          <li key={order.id} className="flex justify-between items-center">
                                            <div className="flex items-center">
                                              <span>
                                                {order.quantity}× {order.name}
                                                {order.id === selectedOrder.id && 
                                                  <Badge variant="outline" className="ml-2 text-xs">actuel</Badge>
                                                }
                                              </span>
                                            </div>
                                            <span className="font-medium">{order.price * order.quantity} CFA</span>
                                          </li>
                                        ))}
                                      </ul>
                                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                        <span>Total du panier:</span>
                                        <span>{totalCartPrice} CFA</span>
                                      </div>
                                      <Button 
                                        variant="default" 
                                        className="w-full mt-2"
                                        onClick={() => cartId && markCartAsProcessed(cartId)}
                                        disabled={cart?.processed}
                                      >
                                        {cart?.processed ? "Panier déjà traité" : "Marquer panier comme traité"}
                                      </Button>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                          <Button 
                            variant={selectedOrder.processed ? "outline" : "default"} 
                            className="w-full"
                            onClick={() => markAsProcessed(selectedOrder.id)}
                            disabled={selectedOrder.processed}
                          >
                            {selectedOrder.processed ? "Déjà traitée" : "Marquer comme traitée"}
                          </Button>
                          
                          {selectedOrder.processed && (
                            <Button 
                              variant="outline" 
                              className="w-full flex items-center gap-2"
                              onClick={() => toggleHideOrder(selectedOrder.id)}
                            >
                              {selectedOrder.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                              {selectedOrder.hidden ? "Afficher la commande" : "Masquer la commande"}
                            </Button>
                          )}
                        </CardFooter>
                      </>
                    ) : (
                      <CardContent>
                        <div className="text-center py-12 text-gray-500">
                          Sélectionnez une commande pour voir les détails
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
};

export default Panel;
