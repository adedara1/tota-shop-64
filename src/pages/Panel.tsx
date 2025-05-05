
import React from "react";
import { useState, useEffect } from "react";
import { supabase, isSupabaseConnected } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CartType {
  id: string;
  created_at: string;
  total_amount: number;
  processed: boolean;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  label: string | null;
}

export default function Panel() {
  const [carts, setCarts] = useState<CartType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const connected = await isSupabaseConnected();
        console.log("État de la connexion Supabase (Panel):", connected);
        setIsConnected(connected);
        
        if (!connected) {
          toast.error("Impossible de se connecter à la base de données");
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de la connexion:", error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (isConnected) {
      fetchCarts();
    }
  }, [isConnected]);

  async function fetchCarts() {
    if (!isConnected) return;
    
    try {
      const { data, error } = await supabase
        .from("carts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching carts:", error);
        toast.error("Erreur lors du chargement des commandes");
      } else {
        setCarts(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Une erreur s'est produite");
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
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

  // Afficher un message si la base de données est déconnectée
  if (isConnected === false) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Gestion des commandes</h1>
        
        <div className="flex flex-col items-center justify-center space-y-6 py-20">
          <Database size={64} className="text-gray-400" />
          <h2 className="text-2xl font-bold">Base de données déconnectée</h2>
          <p className="text-gray-600 max-w-md text-center">
            La connexion à la base de données a été interrompue. Veuillez reconnecter votre projet à une base de données Supabase pour accéder aux commandes.
          </p>
          <Button variant="outline" asChild>
            <Link to="/" className="mt-4">Retour à l'accueil</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Gestion des commandes</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : carts.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : carts.filter(cart => !cart.processed).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Commandes traitées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Skeleton className="h-8 w-20" /> : carts.filter(cart => cart.processed).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes les commandes</TabsTrigger>
          <TabsTrigger value="pending">Commandes en attente</TabsTrigger>
          <TabsTrigger value="processed">Commandes traitées</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
              </div>
            ) : carts.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucune commande trouvée</h3>
                <p className="mt-1 text-gray-500">
                  Vous n'avez pas encore reçu de commandes.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carts.map((cart) => (
                    <TableRow key={cart.id}>
                      <TableCell className="font-medium">{formatDate(cart.created_at)}</TableCell>
                      <TableCell>{cart.customer_name || 'Non renseigné'}</TableCell>
                      <TableCell>
                        {cart.customer_email && <div>{cart.customer_email}</div>}
                        {cart.customer_phone && <div>{cart.customer_phone}</div>}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(cart.total_amount)}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cart.processed 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {cart.processed ? 'Traitée' : 'En attente'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            // Logique pour voir les détails à implémenter
                            toast.info("Affichage des détails de la commande à venir");
                          }}
                        >
                          Détails
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
              </div>
            ) : carts.filter(cart => !cart.processed).length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucune commande en attente</h3>
                <p className="mt-1 text-gray-500">
                  Toutes les commandes ont été traitées.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carts
                    .filter(cart => !cart.processed)
                    .map((cart) => (
                      <TableRow key={cart.id}>
                        <TableCell className="font-medium">{formatDate(cart.created_at)}</TableCell>
                        <TableCell>{cart.customer_name || 'Non renseigné'}</TableCell>
                        <TableCell>
                          {cart.customer_email && <div>{cart.customer_email}</div>}
                          {cart.customer_phone && <div>{cart.customer_phone}</div>}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(cart.total_amount)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                // Logique pour voir les détails à implémenter
                                toast.info("Affichage des détails de la commande à venir");
                              }}
                            >
                              Détails
                            </Button>
                            <Button 
                              variant="default"
                              size="sm"
                              onClick={async () => {
                                try {
                                  const { error } = await supabase
                                    .from('carts')
                                    .update({ processed: true })
                                    .eq('id', cart.id);
                                    
                                  if (error) throw error;
                                  
                                  toast.success("Commande marquée comme traitée");
                                  fetchCarts(); // Recharger les données
                                } catch (error) {
                                  console.error("Erreur lors de la mise à jour:", error);
                                  toast.error("Erreur lors de la mise à jour du statut");
                                }
                              }}
                            >
                              Marquer comme traitée
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="processed" className="mt-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {loading ? (
              <div className="p-6">
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-8 w-full mb-4" />
              </div>
            ) : carts.filter(cart => cart.processed).length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Aucune commande traitée</h3>
                <p className="mt-1 text-gray-500">
                  Vous n'avez pas encore traité de commandes.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {carts
                    .filter(cart => cart.processed)
                    .map((cart) => (
                      <TableRow key={cart.id}>
                        <TableCell className="font-medium">{formatDate(cart.created_at)}</TableCell>
                        <TableCell>{cart.customer_name || 'Non renseigné'}</TableCell>
                        <TableCell>
                          {cart.customer_email && <div>{cart.customer_email}</div>}
                          {cart.customer_phone && <div>{cart.customer_phone}</div>}
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(cart.total_amount)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              // Logique pour voir les détails à implémenter
                              toast.info("Affichage des détails de la commande à venir");
                            }}
                          >
                            Détails
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
