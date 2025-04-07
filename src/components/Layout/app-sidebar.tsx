import {
  Home,
  Ticket,
  CreditCard,
  ChevronDown,
  UserPlus,
  Waypoints,
  Cpu,
  Wifi,
  Tags,
  MonitorSmartphone,
  MapIcon,
  MapPinned,
  MapPin,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { Users, Building } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { useMemo } from "react";
import { useStoreCrm } from "@/Crm/ZustandCrm/ZustandCrmContext";

//RUTAS CRM
const routesCrm_Admin = [
  { icon: Home, label: "Inicio", href: "/crm" },

  {
    icon: Users,
    label: "Clientes",
    submenu: [
      {
        icon: Users,
        label: "Listado de Clientes",
        href: "/crm-clientes",
      },
      {
        icon: UserPlus,
        label: "Nuevo Cliente",
        href: "/crm/crear-cliente-crm",
      },
    ],
  },

  { icon: CreditCard, label: "Facturación", href: "/crm/facturacion" },

  {
    icon: MonitorSmartphone,
    label: "Soporte",
    submenu: [
      { icon: Ticket, label: "Tickets de Soporte", href: "/crm/tickets" },
      {
        icon: Tags,
        label: "Categorías de Soporte",
        href: "/crm/tags",
      },
    ],
  },

  {
    icon: Waypoints,
    label: "Servicios",
    submenu: [
      {
        icon: Cpu,
        label: "Gestión de Servicios",
        href: "/crm-servicios",
      },
      {
        icon: Wifi,
        label: "Servicios de Internet",
        href: "/crm-servicios-internet",
      },
    ],
  },

  {
    icon: MapPinned,
    label: "Facturación por Zona",
    href: "/crm-facturacion-zona",
  },

  {
    icon: MapIcon,
    label: "Rutas Cobro",
    submenu: [
      {
        icon: MapPin,
        label: "Rutas Manage",
        href: "/crm/ruta",
      },
    ],
  },
  { icon: Building, label: "Empresa", href: "/crm/empresa" },
];
//rutas para tecnicos
const routesCrm_Tecnico = [
  { icon: Home, label: "Inicio", href: "/crm" },

  {
    icon: Users,
    label: "Clientes",
    submenu: [
      {
        icon: Users,
        label: "Listado de Clientes",
        href: "/crm-clientes",
      },
    ],
  },

  {
    icon: MonitorSmartphone,
    label: "Soporte",
    submenu: [
      { icon: Ticket, label: "Tickets de Soporte", href: "/crm/tickets" },
    ],
  },
];

const routesCrm_Cobrador = [
  { icon: Home, label: "Inicio", href: "/crm" },

  {
    icon: Users,
    label: "Clientes",
    submenu: [
      {
        icon: Users,
        label: "Listado de Clientes",
        href: "/crm-clientes",
      },
    ],
  },

  { icon: CreditCard, label: "Facturación", href: "/crm/facturacion" },

  {
    icon: MonitorSmartphone,
    label: "Soporte",
    submenu: [
      { icon: Ticket, label: "Tickets de Soporte", href: "/crm/tickets" },
    ],
  },

  // SERVICIOS Y GESTIÓN DE SERVICIOS
  {
    icon: MapIcon,
    label: "Rutas Cobro",
    submenu: [
      {
        icon: MapPin,
        label: "Rutas Manage",
        href: "/crm/ruta",
      },
    ],
  },
];

export function AppSidebar() {
  const location = useLocation();
  const rolUser = useStoreCrm((state) => state.rol);
  console.log("El rol de mi usuario en el crm ui es: ", rolUser);

  // Memoriza las rutas CRM según el rol del usuario
  const crmRoutes = useMemo(() => {
    if (!rolUser) {
      return []; // Retorna un arreglo vacío o una ruta predeterminada si rolUser es null
    }

    if (rolUser === "ADMIN") {
      return routesCrm_Admin;
    } else if (rolUser === "TECNICO") {
      return routesCrm_Tecnico;
    } else if (rolUser === "COBRADOR") {
      return routesCrm_Cobrador;
    }

    return []; // Retorna un arreglo vacío o una ruta predeterminada si el rol no coincide con los establecidos
  }, [rolUser]);

  // Extrae los href de todas las rutas CRM (para ocultarlas cuando se esté en CRM)
  const hidenRoutes = useMemo(
    () =>
      routesCrm_Admin.flatMap((ruta) =>
        ruta.href ? [ruta.href] : ruta.submenu?.map((sub) => sub.href) || []
      ),
    []
  );

  // Si la ruta actual es una de las rutas CRM, mostramos solo CRM
  const displayedRoutes = useMemo(() => {
    if (
      hidenRoutes.some((ruta) => ruta && location.pathname.startsWith(ruta))
    ) {
      return crmRoutes;
    }
    return crmRoutes;
  }, [location.pathname, crmRoutes, hidenRoutes]);

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarContent>
        <div className="overflow-y-auto">
          <SidebarGroup>
            <SidebarGroupLabel>Secciones</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {displayedRoutes.map((item) => {
                  // Si el item tiene submenú, lo mostramos como un SidebarMenuSub dentro de un Collapsible
                  if (item.submenu) {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <Collapsible defaultOpen className="group/collapsible">
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton>
                              <item.icon className="h-4 w-4 shrink-0" />
                              <span>{item.label}</span>
                              <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180" />
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.label}>
                                  <SidebarMenuSubButton className="py-5">
                                    <Link
                                      to={subItem.href}
                                      className="flex items-center gap-2"
                                    >
                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <subItem.icon className="h-4 w-4 shrink-0" />
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>{subItem.label}</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </Collapsible>
                      </SidebarMenuItem>
                    );
                  } else {
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild>
                          <Link
                            to={item.href}
                            className="flex items-center gap-2"
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <item.icon className="h-4 w-4 shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{item.label}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <span>{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  }
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
