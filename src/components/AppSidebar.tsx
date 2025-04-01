
import { Home, PlusCircle, Mail, BarChart, Settings, LayoutDashboard } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
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

  return (
    <>
      <Sidebar className={isMobile ? "bg-white text-black" : "bg-white"}>
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
                      className={isMobile ? "text-black hover:text-black hover:bg-gray-100" : ""}
                    >
                      <Link to={item.url} className={isMobile ? "text-black" : ""}>
                        <item.icon className={isMobile ? "text-black" : ""} />
                        <span>{item.title}</span>
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
