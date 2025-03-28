
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import PromoBar from "@/components/PromoBar"

const Home = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: "#f1eee9" }}>
        <AppSidebar />
        <div className="flex-1">
          <PromoBar />
          <Navbar />
          <main className="container mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-6">Bienvenue sur Total-Service</h1>
            <p className="text-lg text-gray-600">
              Gérez vos produits et suivez vos ventes depuis votre tableau de bord.
            </p>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Home;
