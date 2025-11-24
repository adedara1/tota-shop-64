import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/AppSidebar"
import Navbar from "@/components/Navbar"
import PromoBar from "@/components/PromoBar"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useAppBranding } from "@/components/AppSettingsForm"

const Home = () => {
  const { data: branding } = useAppBranding();
  const appName = branding?.appName || "Total-Service";
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full" style={{ backgroundColor: "#f1eee9" }}>
        <AppSidebar />
        <div className="flex-1">
          <PromoBar />
          <Navbar />
          <main className="container mx-auto py-12 px-4">
            <h1 className="text-4xl font-bold mb-6">Bienvenue sur {appName}</h1>
            <p className="text-lg text-gray-600 mb-12">
              Gérez vos produits et suivez vos ventes depuis votre tableau de bord.
            </p>
            
            {/* Simple dashboard access panel */}
            <div className="flex justify-center mb-8">
              <Link to="/dashboard" className="block">
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer text-center w-64">
                  <h3 className="text-xl font-medium text-gray-800 mb-2">Accéder au Dashboard</h3>
                  <Button className="mt-2" variant="outline">Ouvrir</Button>
                </div>
              </Link>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Home;