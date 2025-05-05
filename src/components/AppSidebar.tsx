
import { Home, PlusCircle, Mail, BarChart, Settings, LayoutDashboard, Layers, LogOut, LogIn } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useState } from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "@/hooks/use-toast"

const defaultItems = [
  {
    title: "Accueil",
    url: "/home",
    icon: Home,
  },
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Créer un produit",
    url: "/product-form",
    icon: PlusCircle,
  },
  {
    title: "Statistiques",
    url: "/stats",
    icon: BarChart,
  },
  {
    title: "Panel",
    url: "/panel",
    icon: Layers,
  },
  {
    title: "Contact",
    url: "/contact",
    icon: Mail,
  },
]

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileClass, setMobileClass] = useState("");
  const { user, signOut, loading } = useAuth();
  const [visibleItems, setVisibleItems] = useState(defaultItems);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isMobile) {
      setMobileClass("bg-white text-black");
    } else {
      setMobileClass("bg-white");
    }
  }, [isMobile]);

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) {
        setVisibleItems([]);
        setIsLoading(false);
        return;
      }
      
      try {
        // Fetch user preferences from Supabase
        const { data, error } = await supabase
          .from('ui_preferences')
          .select('hidden_menu_items')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error("Error fetching user preferences:", error);
          // If no preferences found, create default preferences
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('ui_preferences')
              .insert({
                user_id: user.id,
                hidden_menu_items: []
              });
            
            if (insertError) {
              console.error("Error creating user preferences:", insertError);
            } else {
              // Show all menus by default
              setVisibleItems(defaultItems);
            }
          }
        } else if (data) {
          // Filter out hidden menu items
          const hiddenMenus = Array.isArray(data.hidden_menu_items) ? data.hidden_menu_items : [];
          const filtered = defaultItems.filter(menuItem => !hiddenMenus.includes(menuItem.title));
          setVisibleItems(filtered);
        }
      } catch (err) {
        console.error("Failed to fetch user preferences:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPreferences();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès."
      });
    } catch (error) {
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <Sidebar className={mobileClass}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={isMobile ? "text-black" : ""}>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {!isLoading && visibleItems.map((menuItem) => (
                  <SidebarMenuItem key={menuItem.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === menuItem.url}
                      tooltip={menuItem.title}
                      className={isMobile ? "text-black hover:text-gray-700" : ""}
                    >
                      <Link to={menuItem.url}>
                        <menuItem.icon className={isMobile ? "text-black" : ""} />
                        <span className={isMobile ? "text-black" : ""}>{menuItem.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                
                {/* Authentication button */}
                <SidebarMenuItem>
                  {user ? (
                    <SidebarMenuButton 
                      tooltip="Déconnexion"
                      className={isMobile ? "text-black hover:text-gray-700" : ""}
                      onClick={handleLogout}
                    >
                      <LogOut className={isMobile ? "text-black" : ""} />
                      <span className={isMobile ? "text-black" : ""}>Déconnexion</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton 
                      asChild
                      tooltip="Connexion"
                      className={isMobile ? "text-black hover:text-gray-700" : ""}
                    >
                      <Link to="/auth">
                        <LogIn className={isMobile ? "text-black" : ""} />
                        <span className={isMobile ? "text-black" : ""}>Connexion</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <div className="fixed top-4 left-4 z-50">
        <SidebarTrigger className="text-[#0EA5E9] hover:text-[#0EA5E9]/80" />
      </div>
    </>
  );
}
