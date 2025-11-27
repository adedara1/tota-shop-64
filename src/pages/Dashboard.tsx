import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Home, PlusCircle, Mail, BarChart, Layers, LayoutDashboard, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import AppSettingsForm from "@/components/AppSettingsForm";

const MenuPanel = ({ title, description, icon, url }: { title: string, description: string, icon: React.ReactNode, url: string }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">{title}</CardTitle>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link to={url}>
          <Button className="w-full">Accéder</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      toast({
        title: "Accès non autorisé",
        description: "Vous devez être connecté pour accéder à cette page.",
        variant: "destructive"
      });
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-primary rounded-full border-t-transparent"></div>
      </div>
    );
  }

  const menuItems = [
    { title: "Accueil", description: "Retourner à la page d'accueil", icon: <Home className="w-6 h-6" />, url: "/home" },
    { title: "Dashboard", description: "Vue d'ensemble de votre activité", icon: <LayoutDashboard className="w-6 h-6" />, url: "/dashboard" },
    { title: "Créer un produit", description: "Ajouter un nouveau produit", icon: <PlusCircle className="w-6 h-6" />, url: "/product-form" },
    { title: "Statistiques", description: "Consulter les statistiques des produits", icon: <BarChart className="w-6 h-6" />, url: "/stats" },
    { title: "Panel", description: "Gérer les paramètres avancés", icon: <Layers className="w-6 h-6" />, url: "/panel" },
    { title: "Contact", description: "Nous contacter pour toute demande", icon: <Mail className="w-6 h-6" />, url: "/contact" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto py-12 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <Link to="/home">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des produits</CardTitle>
              <CardDescription>Ajouter, modifier ou supprimer des produits</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/product-form">
                <Button className="w-full">Accéder</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration de la page produits</CardTitle>
              <CardDescription>Personnaliser l'apparence de la page produits</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/products-settings">
                <Button className="w-full">Accéder</Button>
              </Link>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Configuration du Formulaire</CardTitle>
              <CardDescription>Gérer les champs du formulaire de commande</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/order-form-settings">
                <Button className="w-full flex items-center gap-2">
                  <Settings2 className="w-4 h-4" /> Configurer
                </Button>
              </Link>
            </CardContent>
          </Card>
          
          {/* Configuration des paramètres globaux (Nom de l'app, Pixel ID) */}
          <AppSettingsForm />
        </div>
        
        <h2 className="text-2xl font-bold mb-6">Menu Principal</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <MenuPanel 
              key={item.title} 
              title={item.title} 
              description={item.description} 
              icon={item.icon} 
              url={item.url} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;