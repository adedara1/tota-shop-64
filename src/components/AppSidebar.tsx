
import { Home, PlusCircle, Mail, BarChart, Settings, LayoutDashboard } from "lucide-react"
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

const items = [
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
    title: "Contact",
    url: "/contact",
    icon: Mail,
  },
]

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [mobileClass, setMobileClass] = useState("");

  useEffect(() => {
    if (isMobile) {
      setMobileClass("bg-white text-black");
    } else {
      setMobileClass("bg-white");
    }
  }, [isMobile]);

  return (
    <>
      <Sidebar className={mobileClass}>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className={isMobile ? "text-black" : ""}>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={location.pathname === item.url}
                      tooltip={item.title}
                      className={isMobile ? "text-black hover:text-gray-700" : ""}
                    >
                      <Link to={item.url}>
                        <item.icon className={isMobile ? "text-black" : ""} />
                        <span className={isMobile ? "text-black" : ""}>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
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
