
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
import PromoBar from "@/components/PromoBar";
import Navbar from "@/components/Navbar";

interface ButtonStats {
  button_name: string;
  page_name: string;
  clicks_count: number;
  click_date: string;
}

const ButtonStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["button-stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("button_stats")
        .select("*")
        .order("click_date", { ascending: false });

      if (error) throw error;

      return data.map((stat) => ({
        button_name: stat.button_name,
        page_name: stat.page_name,
        clicks_count: stat.clicks_count,
        click_date: new Date(stat.click_date).toLocaleDateString(),
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
          <h1 className="text-2xl font-bold">Statistiques des Boutons</h1>
        </div>
        <div className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Bouton</TableHead>
                <TableHead>Page</TableHead>
                <TableHead className="text-right">Clics</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.map((stat, index) => (
                <TableRow key={index}>
                  <TableCell>{stat.click_date}</TableCell>
                  <TableCell>{stat.button_name}</TableCell>
                  <TableCell>{stat.page_name}</TableCell>
                  <TableCell className="text-right">{stat.clicks_count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>
  );
};

export default ButtonStats;
