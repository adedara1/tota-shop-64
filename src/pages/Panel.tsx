
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  options: Record<string, any>;
  image: string;
  created_at: string;
  updated_at: string;
}

interface Product {
  id: string;
  name: string;
  images: string[];
}

const Panel = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Record<string, CartItem[]>>({});
  const [selectedOrder, setSelectedOrder] = useState<CartItem | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, images")
          .eq("use_internal_cart", true);

        if (error) throw error;
        if (data) setProducts(data);

        // For each product, fetch its orders
        if (data && data.length > 0) {
          for (const product of data) {
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
                  : order.options || {}
              }));
              
              setOrders(prev => ({
                ...prev,
                [product.id]: processedOrders as CartItem[]
              }));
            }
          }
        }
      } catch (error) {
        console.error("Error fetching products or orders:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleOrderClick = (order: CartItem) => {
    setSelectedOrder({
      ...order,
      options: typeof order.options === 'string' 
        ? JSON.parse(order.options) 
        : order.options || {}
    });
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

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Tableau de bord des commandes</h1>
      
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
            {products.map((product) => (
              <TabsTrigger key={product.id} value={product.id} className="text-sm md:text-base">
                {product.name}
                {orders[product.id] && (
                  <Badge className="ml-2 bg-red-500">{orders[product.id].length}</Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {products.map((product) => (
            <TabsContent key={product.id} value={product.id} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/2 space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Commandes pour {product.name}</span>
                        <Badge>{orders[product.id]?.length || 0} commandes</Badge>
                      </CardTitle>
                      <CardDescription>
                        Cliquez sur une commande pour voir les détails
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="max-h-[500px] overflow-y-auto space-y-2">
                      {!orders[product.id] || orders[product.id].length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          Aucune commande pour ce produit
                        </div>
                      ) : (
                        orders[product.id].map((order) => (
                          <div 
                            key={order.id}
                            onClick={() => handleOrderClick(order)}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedOrder?.id === order.id 
                                ? 'bg-blue-50 border-blue-300' 
                                : 'hover:bg-gray-50'
                            }`}
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
                              <div className="font-semibold">
                                {order.price * order.quantity} CFA
                              </div>
                            </div>
                          </div>
                        ))
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
                        <CardContent className="space-y-4">
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

                          {Object.keys(selectedOrder.options).length > 0 && (
                            <div>
                              <h4 className="font-medium mb-2">Options sélectionnées:</h4>
                              <ul className="bg-gray-50 p-3 rounded-md">
                                {Object.entries(selectedOrder.options).map(([key, value]) => (
                                  <li key={key} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                                    <span className="font-medium">{key}:</span>
                                    <span>{typeof value === 'object' ? value.value : value}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                        <CardFooter>
                          <Button variant="outline" className="w-full">
                            Marquer comme traité
                          </Button>
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
