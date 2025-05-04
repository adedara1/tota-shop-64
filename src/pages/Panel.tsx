
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ChevronRight, Package2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface CartItem {
  id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, any>;
  image?: string;
  created_at: string;
}

interface GroupedOrders {
  [date: string]: CartItem[];
}

const Panel = () => {
  const [orders, setOrders] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<CartItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [groupedOrders, setGroupedOrders] = useState<GroupedOrders>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("cart_items")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          setOrders(data);

          // Group orders by date
          const grouped = data.reduce((acc: GroupedOrders, order) => {
            const date = new Date(order.created_at).toISOString().split('T')[0];
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(order);
            return acc;
          }, {});

          setGroupedOrders(grouped);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleOrderClick = (order: CartItem) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy", { locale: fr });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "HH:mm", { locale: fr });
  };

  const getTotalPrice = (order: CartItem) => {
    return order.price * order.quantity;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Tableau de bord des commandes</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-400" />
            <h2 className="text-2xl font-medium mb-2">Aucune commande</h2>
            <p className="text-gray-600 mb-6">Il n'y a pas encore de commandes dans votre boutique</p>
            <Button onClick={() => navigate('/products')}>
              Voir les produits
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedOrders).map(([date, dateOrders]) => (
              <div key={date} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-gray-50 flex items-center">
                  <Calendar className="mr-2 text-gray-500" size={18} />
                  <h2 className="font-medium">{formatDate(date)}</h2>
                  <Badge className="ml-2 bg-blue-500">{dateOrders.length} commande(s)</Badge>
                </div>
                
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">Heure</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Quantité</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dateOrders.map((order) => (
                        <TableRow 
                          key={order.id} 
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() => handleOrderClick(order)}
                        >
                          <TableCell className="font-medium">
                            {formatTime(order.created_at)}
                          </TableCell>
                          <TableCell className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden mr-3 flex-shrink-0">
                              {order.image ? (
                                <img src={order.image} alt={order.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Package2 size={20} />
                                </div>
                              )}
                            </div>
                            <span className="line-clamp-1">{order.name}</span>
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{getTotalPrice(order)} CFA</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <ChevronRight size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>
              {selectedOrder && formatDate(selectedOrder.created_at)} à {selectedOrder && formatTime(selectedOrder.created_at)}
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 py-2">
                <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                  {selectedOrder.image ? (
                    <img src={selectedOrder.image} alt={selectedOrder.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Package2 size={24} />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{selectedOrder.name}</h3>
                  <p className="text-sm text-gray-500">Produit #{selectedOrder.product_id.slice(0, 8)}</p>
                </div>
              </div>
              
              <div className="border rounded-md divide-y">
                <div className="flex justify-between p-3">
                  <span className="text-gray-600">Prix unitaire:</span>
                  <span className="font-medium">{selectedOrder.price} CFA</span>
                </div>
                <div className="flex justify-between p-3">
                  <span className="text-gray-600">Quantité:</span>
                  <span className="font-medium">{selectedOrder.quantity}</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold">{getTotalPrice(selectedOrder)} CFA</span>
                </div>
              </div>
              
              {selectedOrder.options && Object.keys(selectedOrder.options).length > 0 && (
                <div className="border rounded-md p-3">
                  <h3 className="font-medium mb-2">Options sélectionnées:</h3>
                  <ul className="space-y-2">
                    {Object.entries(selectedOrder.options).map(([key, value]) => (
                      <li key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600">{key}:</span>
                        <span className="font-medium">
                          {typeof value === 'object' ? value.value : value}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default Panel;
