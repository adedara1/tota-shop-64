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
import { Customer, generateCustomerLabel, generateCustomerColor, generateCartLabel, fetchAllCartItems } from "@/utils/customerUtils";
interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  options: {
    customer?: Customer;
    [key: string]: any;
  };
  image: string;
  created_at: string;
  updated_at: string;
  processed: boolean | null;
  hidden: boolean;
  cart_id: string | null;
}
interface Product {
  id: string;
  name: string;
  images: string[];
}

// Interface pour représenter un panier groupé
interface GroupedCart {
  id: string;
  label?: string;
  labelColor?: string;
  customer?: Customer | null;
  orders: CartItem[];
  totalPrice: number;
}
const Panel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Record<string, CartItem[]>>({});
  const [selectedOrder, setSelectedOrder] = useState<CartItem | null>(null);
  const [selectedBasket, setSelectedBasket] = useState<string | null>(null);
  const [hiddenOrders, setHiddenOrders] = useState<string[]>([]);
  // State pour stocker les paniers groupés
  const [groupedCarts, setGroupedCarts] = useState<Record<string, Record<string, GroupedCart>>>({});
  // State to store all cart items across products
  const [allCartItems, setAllCartItems] = useState<Record<string, CartItem[]>>({});
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from("products").select("id, name, images").eq("use_internal_cart", true);
        if (error) throw error;
        if (data) setProducts(data);

        // Pour chaque produit, récupérer ses commandes
        if (data && data.length > 0) {
          for (const product of data) {
            const {
              data: orderData,
              error: orderError
            } = await supabase.from("cart_items").select("*").eq("product_id", product.id);
            if (orderError) throw orderError;
            if (orderData && orderData.length > 0) {
              // Traitement des commandes
              const processedOrders = orderData.map(order => ({
                ...order,
                options: typeof order.options === 'string' ? JSON.parse(order.options) : order.options || {}
              }));
              setOrders(prev => ({
                ...prev,
                [product.id]: processedOrders as CartItem[]
              }));
            }
          }

          // Also fetch all cart items
          const {
            data: allCartData,
            error: allCartError
          } = await supabase.from("cart_items").select("*").not("cart_id", "is", null).eq("hidden", false);
          if (!allCartError && allCartData) {
            // Group by cart_id
            const cartItemsByCartId: Record<string, CartItem[]> = {};
            allCartData.forEach(item => {
              if (item.cart_id) {
                if (!cartItemsByCartId[item.cart_id]) {
                  cartItemsByCartId[item.cart_id] = [];
                }
                cartItemsByCartId[item.cart_id].push({
                  ...item,
                  options: typeof item.options === 'string' ? JSON.parse(item.options) : item.options || {}
                });
              }
            });
            setAllCartItems(cartItemsByCartId);
          }
        }
      } catch (error) {
        console.error("Error fetching products or orders:", error);
      }
    };
    fetchProducts();
  }, []);

  // Effet pour grouper les commandes par panier lorsque orders change
  useEffect(() => {
    const newGroupedCarts: Record<string, Record<string, GroupedCart>> = {};

    // Pour chaque produit
    Object.entries(orders).forEach(([productId, productOrders]) => {
      newGroupedCarts[productId] = {};

      // Groupe pour les articles avec cart_id
      const cartGroups: Record<string, CartItem[]> = {};

      // Groupe pour les articles sans cart_id
      const noCartIdGroups: Record<string, CartItem[]> = {};

      // Première passe: collecter tous les items par cart_id
      productOrders.forEach(order => {
        if (order.hidden) return; // Ignorer les commandes cachées

        if (order.cart_id) {
          if (!cartGroups[order.cart_id]) {
            cartGroups[order.cart_id] = [];
          }
          cartGroups[order.cart_id].push(order);
        } else {
          // Pour les items sans cart_id, grouper par client
          const customer = getCustomerInfo(order);
          if (customer) {
            const customerKey = `${customer.name}-${customer.phone}`;
            if (!noCartIdGroups[customerKey]) {
              noCartIdGroups[customerKey] = [];
            }
            noCartIdGroups[customerKey].push(order);
          } else {
            // Items sans client et sans cart_id sont des groupes individuels
            const key = `unknown-${order.id}`;
            noCartIdGroups[key] = [order];
          }
        }
      });

      // Deuxième passe: créer des GroupedCart pour les cart_id
      Object.entries(cartGroups).forEach(([cartId, items]) => {
        // On prend le premier item pour obtenir des informations sur le client
        const firstOrder = items[0];
        const customer = getCustomerInfo(firstOrder);

        // Générer un label pour le panier basé sur le client
        let cartLabel = cartId.substring(0, 8);
        let labelColor = generateCustomerColor(cartLabel);

        // Si nous avons un client, utiliser ses infos pour le label
        if (customer) {
          cartLabel = generateCustomerLabel(customer);
          labelColor = generateCustomerColor(cartLabel);
        } else {
          // Si pas de client, utiliser BO + 3 derniers caractères du cartId
          cartLabel = `BO-${cartId.substring(cartId.length - 3)}`;
          labelColor = generateCustomerColor(cartLabel);
        }

        // Calculer le prix total
        const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Créer le panier groupé
        newGroupedCarts[productId][cartId] = {
          id: cartId,
          label: cartLabel,
          labelColor,
          customer,
          orders: items,
          totalPrice
        };
      });

      // Troisième passe: traiter les groupes sans cart_id
      Object.entries(noCartIdGroups).forEach(([groupKey, groupOrders]) => {
        // Créer un identifiant unique pour ce groupe
        const groupId = `legacy-${groupKey}`;

        // Obtenir les informations du client à partir du premier ordre
        const firstOrder = groupOrders[0];
        const customer = getCustomerInfo(firstOrder);
        const label = customer ? generateCustomerLabel(customer) : `Unknown-${groupId.substring(0, 5)}`;
        const labelColor = generateCustomerColor(label);

        // Calculer le prix total
        const totalPrice = groupOrders.reduce((total, order) => total + order.price * order.quantity, 0);

        // Ajouter le groupe
        newGroupedCarts[productId][groupId] = {
          id: groupId,
          label,
          labelColor,
          customer,
          orders: groupOrders,
          totalPrice
        };
      });
    });
    setGroupedCarts(newGroupedCarts);
  }, [orders]);
  const handleOrderClick = async (order: CartItem) => {
    setSelectedOrder({
      ...order,
      options: typeof order.options === 'string' ? JSON.parse(order.options) : order.options || {}
    });

    // If this order has a cart_id, refresh the all cart items for this cart
    if (order.cart_id) {
      const {
        data,
        error
      } = await fetchAllCartItems(order.cart_id);
      if (!error && data.length > 0) {
        setAllCartItems(prev => ({
          ...prev,
          [order.cart_id as string]: data
        }));
      }
    }
  };
  const handleBasketClick = async (basketId: string) => {
    const isCurrentlySelected = selectedBasket === basketId;
    setSelectedBasket(isCurrentlySelected ? null : basketId);
    if (!isCurrentlySelected && basketId && !basketId.startsWith('legacy-')) {
      // Fetch the latest cart items for this cart_id
      const {
        data,
        error
      } = await fetchAllCartItems(basketId);
      if (!error && data.length > 0) {
        setAllCartItems(prev => ({
          ...prev,
          [basketId]: data
        }));
      }
    }
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
  const markAsProcessed = async (orderId: string) => {
    try {
      const {
        error
      } = await supabase.from("cart_items").update({
        processed: true
      }).eq("id", orderId);
      if (error) throw error;

      // Mise à jour du state local
      setOrders(prev => {
        const updated = {
          ...prev
        };
        Object.keys(updated).forEach(productId => {
          updated[productId] = updated[productId].map(order => order.id === orderId ? {
            ...order,
            processed: true
          } : order);
        });
        return updated;
      });

      // Also update allCartItems if necessary
      setAllCartItems(prev => {
        const updated = {
          ...prev
        };
        Object.keys(updated).forEach(cartId => {
          updated[cartId] = updated[cartId].map(item => item.id === orderId ? {
            ...item,
            processed: true
          } : item);
        });
        return updated;
      });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          processed: true
        } : null);
      }

      // Afficher un message de succès
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
  const markBasketAsProcessed = async (basketId: string, productId: string) => {
    try {
      // Get all cart items for this basket
      let basketOrders: CartItem[] = [];
      if (basketId.startsWith('legacy-')) {
        // For legacy baskets (no cart_id)
        basketOrders = groupedCarts[productId]?.[basketId]?.orders || [];
      } else {
        // For regular baskets with cart_id
        basketOrders = allCartItems[basketId] || [];
        if (basketOrders.length === 0) {
          // Fallback to product-specific orders if global list is empty
          basketOrders = groupedCarts[productId]?.[basketId]?.orders || [];
        }
      }

      // Récupérer tous les IDs de commandes dans ce panier
      const orderIds = basketOrders.map(order => order.id);

      // Mettre à jour toutes les commandes du panier
      for (const orderId of orderIds) {
        await supabase.from("cart_items").update({
          processed: true
        }).eq("id", orderId);
      }

      // Mise à jour du state local
      setOrders(prev => {
        const updated = {
          ...prev
        };
        Object.keys(updated).forEach(pid => {
          updated[pid] = updated[pid].map(order => {
            if (orderIds.includes(order.id)) {
              return {
                ...order,
                processed: true
              };
            }
            return order;
          });
        });
        return updated;
      });

      // Update allCartItems
      setAllCartItems(prev => {
        const updated = {
          ...prev
        };
        if (updated[basketId]) {
          updated[basketId] = updated[basketId].map(item => ({
            ...item,
            processed: true
          }));
        }
        return updated;
      });

      // Afficher un message de succès
      toast({
        title: "Panier traité",
        description: "Toutes les commandes du panier ont été marquées comme traitées"
      });
    } catch (error) {
      console.error("Error marking basket as processed:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de marquer le panier comme traité"
      });
    }
  };
  const toggleHideOrder = async (orderId: string) => {
    try {
      // Trouver la commande à basculer
      let orderToToggle: CartItem | null = null;
      let productId: string | null = null;
      Object.entries(orders).forEach(([pid, productOrders]) => {
        const order = productOrders.find(o => o.id === orderId);
        if (order) {
          orderToToggle = order;
          productId = pid;
        }
      });
      if (!orderToToggle) return;

      // Basculer l'état caché dans la base de données
      const newHiddenState = !orderToToggle.hidden;
      const {
        error
      } = await supabase.from("cart_items").update({
        hidden: newHiddenState
      }).eq("id", orderId);
      if (error) throw error;

      // Mise à jour du state local
      setOrders(prev => {
        const updated = {
          ...prev
        };
        Object.keys(updated).forEach(pid => {
          updated[pid] = updated[pid].map(order => order.id === orderId ? {
            ...order,
            hidden: newHiddenState
          } : order);
        });
        return updated;
      });

      // Update allCartItems if necessary
      setAllCartItems(prev => {
        const updated = {
          ...prev
        };
        if (orderToToggle?.cart_id && updated[orderToToggle.cart_id]) {
          updated[orderToToggle.cart_id] = updated[orderToToggle.cart_id].map(item => item.id === orderId ? {
            ...item,
            hidden: newHiddenState
          } : item);
        }
        return updated;
      });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? {
          ...prev,
          hidden: newHiddenState
        } : null);
      }
    } catch (error) {
      console.error("Error toggling order visibility:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de modifier la visibilité de la commande"
      });
    }
  };

  // Fonction pour calculer le prix total d'un groupe de commandes
  const calculateGroupTotal = (orderGroup: CartItem[]) => {
    return orderGroup.reduce((total, order) => total + order.price * order.quantity, 0);
  };

  // Compter les commandes visibles (non cachées)
  const countVisibleOrders = (productId: string) => {
    return orders[productId]?.filter(order => !order.hidden)?.length || 0;
  };

  // Function to get all cart items for a cart_id
  const getAllCartItems = (cartId: string): CartItem[] => {
    if (!cartId) return [];

    // Use our cached allCartItems state first
    if (allCartItems[cartId] && allCartItems[cartId].length > 0) {
      return allCartItems[cartId];
    }

    // Fallback: collect from all products
    const allItems: CartItem[] = [];
    Object.values(orders).forEach(productOrders => {
      const matchingItems = productOrders.filter(order => order.cart_id === cartId && !order.hidden);
      allItems.push(...matchingItems);
    });
    return allItems;
  };

  // New function to get other products in the same cart
  const getOtherProductsInCart = (cartId: string, currentOrderId: string): CartItem[] => {
    if (!cartId) return [];

    // Get all items from the cart
    const allItems = getAllCartItems(cartId);

    // Filter out the current item
    return allItems.filter(item => item.id !== currentOrderId && !item.hidden);
  };
  return <div className="container mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center">Tableau de bord des commandes</h1>
        <Button variant="outline" asChild className="flex items-center gap-2">
          <Link to="/home">
            <Home size={16} />
            <span>Retour à l'accueil</span>
          </Link>
        </Button>
      </div>
      
      {products.length === 0 ? <div className="text-center py-12">
          <h2 className="text-xl mb-4">Aucun produit avec panier interne trouvé</h2>
          <p className="text-gray-500">
            Créez des produits avec l'option "panier interne" pour voir les commandes ici.
          </p>
        </div> : <Tabs defaultValue={products[0]?.id} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8">
            {products.map(product => {
          // Compter uniquement les commandes non cachées
          const orderCount = countVisibleOrders(product.id);
          return <TabsTrigger key={product.id} value={product.id} className="text-sm md:text-base">
                  {product.name}
                  {orderCount > 0 && <Badge className="ml-2 bg-red-500">{orderCount}</Badge>}
                </TabsTrigger>;
        })}
          </TabsList>
          
          {products.map(product => <TabsContent key={product.id} value={product.id} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Commandes pour {product.name}</span>
                        <Badge>{countVisibleOrders(product.id)} commandes</Badge>
                      </CardTitle>
                      <CardDescription>
                        Cliquez sur une étiquette pour voir les détails du panier
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
                      {!orders[product.id] || countVisibleOrders(product.id) === 0 ? <div className="text-center py-8 text-gray-500">
                          Aucune commande pour ce produit
                        </div> :
                // Utiliser les paniers groupés pour afficher les commandes
                Object.entries(groupedCarts[product.id] || {}).map(([basketId, basket]) => {
                  const isSelected = selectedBasket === basketId;
                  return <div key={basketId} className={`mb-4 border rounded-lg overflow-hidden ${isSelected ? 'border-blue-500 shadow-md' : ''}`}>
                              <div className={`${isSelected ? 'bg-blue-50' : 'bg-gray-100'} p-2 flex justify-between items-center cursor-pointer`} onClick={() => handleBasketClick(basketId)}>
                                <div className="flex items-center">
                                  <Badge className={`${basket.labelColor} text-white cursor-pointer`}>
                                    {basket.label}
                                  </Badge>
                                  {basket.customer && <>
                                      <span className="ml-2 font-medium">{basket.customer.name}</span>
                                      <span className="ml-2 text-sm text-gray-500">{basket.customer.phone}</span>
                                    </>}
                                </div>
                                <div className="font-semibold">
                                  Total: {basket.totalPrice} CFA
                                </div>
                              </div>
                              
                              {isSelected && basket.orders.map(order => <div key={order.id} onClick={() => handleOrderClick(order)} className={`p-4 cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-blue-50 border-blue-300' : 'hover:bg-gray-50'} ${order.processed ? 'opacity-60' : ''}`}>
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                      {order.image && <Avatar className="h-10 w-10 mr-3">
                                          <img src={order.image} alt={order.name} />
                                        </Avatar>}
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
                                      {order.processed}
                                    </div>
                                  </div>
                                </div>)}
                              
                              {isSelected && <CardFooter className="bg-gray-50 p-2 flex justify-end">
                                  <Button variant="default" size="sm" className="bg-blue-500 hover:bg-blue-600" onClick={() => markBasketAsProcessed(basketId, product.id)}>
                                    Marquer panier comme traité
                                  </Button>
                                </CardFooter>}
                            </div>;
                })}
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
                    
                    {selectedOrder ? <>
                        <CardContent className="space-y-6">
                          <div className="flex items-center space-x-4">
                            {selectedOrder.image && <Avatar className="h-20 w-20">
                                <img src={selectedOrder.image} alt={selectedOrder.name} />
                              </Avatar>}
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

                          {/* Section d'information client */}
                          {getCustomerInfo(selectedOrder) && <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                              <h4 className="font-semibold text-lg mb-3">Informations Client</h4>
                              <Table>
                                <TableBody>
                                  <TableRow>
                                    <TableCell className="font-medium">Nom</TableCell>
                                    <TableCell>{getCustomerInfo(selectedOrder)?.name}</TableCell>
                                  </TableRow>
                                  {getCustomerInfo(selectedOrder)?.email && <TableRow>
                                      <TableCell className="font-medium">Email</TableCell>
                                      <TableCell>{getCustomerInfo(selectedOrder)?.email}</TableCell>
                                    </TableRow>}
                                  <TableRow>
                                    <TableCell className="font-medium">Téléphone</TableCell>
                                    <TableCell>{getCustomerInfo(selectedOrder)?.phone}</TableCell>
                                  </TableRow>
                                  {getCustomerInfo(selectedOrder)?.address && <TableRow>
                                      <TableCell className="font-medium">Adresse</TableCell>
                                      <TableCell>{getCustomerInfo(selectedOrder)?.address}</TableCell>
                                    </TableRow>}
                                </TableBody>
                              </Table>
                            </div>}

                          {/* Section des options du produit */}
                          {Object.keys(selectedOrder.options).length > 0 && Object.keys(selectedOrder.options).filter(key => key !== 'customer').length > 0 && <div>
                              <h4 className="font-medium mb-2">Options sélectionnées:</h4>
                              <ul className="bg-gray-50 p-3 rounded-md">
                                {Object.entries(selectedOrder.options).filter(([key]) => key !== 'customer').map(([key, value]) => <li key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                      <span className="font-medium">{key}:</span>
                                      <span>{typeof value === 'object' ? value.value : value}</span>
                                    </li>)}
                              </ul>
                            </div>}

                          {/* Si cette commande fait partie d'un panier, afficher le récapitulatif du panier */}
                          {selectedOrder?.cart_id && <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                              <h4 className="font-semibold text-lg mb-3">Récapitulatif du panier</h4>
                              <div className="space-y-2">
                                {(() => {
                        // Récupérer tous les éléments du panier
                        const cartItems = getAllCartItems(selectedOrder.cart_id as string);
                        const totalBasketPrice = calculateGroupTotal(cartItems);
                        return <>
                                      <p className="mb-2">
                                        Ce produit fait partie d'un panier contenant {cartItems.length} article{cartItems.length > 1 ? 's' : ''}:
                                      </p>
                                      <ul className="mb-4 space-y-1">
                                        {cartItems.map(item => <li key={item.id} className="flex justify-between items-center">
                                            <span>
                                              {item.quantity}× {item.name}
                                              {item.id === selectedOrder.id && <Badge variant="outline" className="ml-2 text-xs">actuel</Badge>}
                                            </span>
                                            <span className="font-medium">{item.price * item.quantity} CFA</span>
                                          </li>)}
                                      </ul>
                                      <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                                        <span>Total du panier:</span>
                                        <span>{totalBasketPrice} CFA</span>
                                      </div>
                                      
                                      {/* Afficher les autres produits dans le même panier */}
                                      {selectedOrder.cart_id && <div className="mt-4">
                                          <h4 className="font-medium mb-2">Autres produits dans ce panier:</h4>
                                          <div className="space-y-2 mb-4">
                                            {getOtherProductsInCart(selectedOrder.cart_id, selectedOrder.id).length > 0 ? getOtherProductsInCart(selectedOrder.cart_id, selectedOrder.id).map(item => <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center" onClick={() => handleOrderClick(item)}>
                                                  <div className="flex items-center">
                                                    {item.image && <Avatar className="h-10 w-10 mr-3">
                                                        <img src={item.image} alt={item.name} />
                                                      </Avatar>}
                                                    <div>
                                                      <div className="font-medium">{item.quantity}× {item.name}</div>
                                                      <div className="text-sm text-gray-500">
                                                        {formatDate(item.created_at)}
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex flex-col items-end">
                                                    <div>{item.price * item.quantity} CFA</div>
                                                    {item.processed && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                        Traitée
                                                      </Badge>}
                                                  </div>
                                                </div>) : <p className="text-gray-500 text-center">Aucun autre produit dans ce panier</p>}
                                          </div>
                                      </div>}
                                      
                                      <Button variant="default" className="w-full mt-2" onClick={() => {
                            if (selectedOrder.cart_id) {
                              // Marquer tous les articles de ce panier comme traités
                              markBasketAsProcessed(selectedOrder.cart_id, product.id);
                            }
                          }}>
                                        Marquer panier comme traité
                                      </Button>
                                    </>;
                      })()}
                              </div>
                            </div>}
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-2">
                          <Button variant={selectedOrder.processed ? "outline" : "default"} className="w-full" onClick={() => markAsProcessed(selectedOrder.id)} disabled={selectedOrder.processed}>
                            {selectedOrder.processed ? "Déjà traitée" : "Marquer comme traitée"}
                          </Button>
                          
                          {selectedOrder.processed && <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => toggleHideOrder(selectedOrder.id)}>
                              {selectedOrder.hidden ? <Eye size={16} /> : <EyeOff size={16} />}
                              {selectedOrder.hidden ? "Afficher la commande" : "Masquer la commande"}
                            </Button>}
                        </CardFooter>
                      </> : <CardContent>
                        <div className="text-center py-12 text-gray-500">
                          Sélectionnez une commande pour voir les détails
                        </div>
                      </CardContent>}
                  </Card>
                </div>
              </div>
            </TabsContent>)}
        </Tabs>}
    </div>;
};
export default Panel;