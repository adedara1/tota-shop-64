
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";
import ButtonStats from "./ButtonStats";

interface ProductStats {
  product_name: string;
  views_count: number;
  clicks_count: number;
  view_date: string;
}

const Stats = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'buttons'>('products');

  const { data: stats, isLoading } = useQuery({
    queryKey: ["product-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_stats")
        .select(`
          view_date,
          views_count,
          clicks_count,
          products (
            name
          )
        `)
        .order("view_date", { ascending: false });

      if (error) throw error;

      return data.map((stat) => ({
        product_name: stat.products.name,
        views_count: stat.views_count,
        clicks_count: stat.clicks_count,
        view_date: new Date(stat.view_date).toLocaleDateString(),
      }));
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
        <PromoBar />
        <Navbar />
        <div className="container mx-auto py-12 px-4">
          <div className="text-center">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f1eee9" }}>
      <PromoBar />
      <Navbar />
      <main className="container mx-auto py-12 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            <Button
              onClick={() => setActiveTab('products')}
              variant={activeTab === 'products' ? 'default' : 'outline'}
            >
              Statistiques des Produits
            </Button>
            <Button
              onClick={() => setActiveTab('buttons')}
              variant={activeTab === 'buttons' ? 'default' : 'outline'}
            >
              Statistiques des Boutons
            </Button>
          </div>
        </div>

        {activeTab === 'products' ? (
          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead className="text-right">Vues</TableHead>
                  <TableHead className="text-right">Clics</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.map((stat, index) => (
                  <TableRow key={index}>
                    <TableCell>{stat.view_date}</TableCell>
                    <TableCell>{stat.product_name}</TableCell>
                    <TableCell className="text-right">{stat.views_count}</TableCell>
                    <TableCell className="text-right">{stat.clicks_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ButtonStats />
        )}
      </main>
    </div>
  );
};

export default Stats;
