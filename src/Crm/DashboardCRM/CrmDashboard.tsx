import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserMinus, UserX, Zap, ZapOff, WifiOff } from "lucide-react";
import DesvanecerHaciaArriba from "../Motion/DashboardAnimations";
import { motion } from "framer-motion";
import LightCardMotion from "../Motion/CardMotion";
import MyTickets from "./MyTickets";
import { RolUsuario, useStoreCrm } from "../ZustandCrm/ZustandCrmContext";
import axios from "axios";
import { useEffect, useState } from "react";
const tokencrm = localStorage.getItem("authTokenCRM");
const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;

// Definimos la interfaz de los datos que vamos a recibir desde el backend
interface DashboardData {
  activeClients: number;
  delinquentClients: number;
  suspendedClients: number;
  activeServices: number;
  suspendedServices: number;
  clientsAddedThisMonth: number;
}

export default function CrmDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );

  const userId = useStoreCrm((state) => state.userIdCRM) ?? 0;
  console.log(tokencrm);
  const nombre = useStoreCrm((state) => state.nombre);
  console.log("nombre crm", nombre);
  interface ticket {
    id: number;
    cliente: string;
    fechaTicket: string;
    ticketTexto: string;
  }
  const [tickets, setTickets] = useState<ticket[]>([]);
  const getTickets = async () => {
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/dashboard/get-dashboard-info/${userId}`
      );
      if (response.status === 200) {
        setTickets(response.data);
      }
    } catch (error) {}
  };

  useEffect(() => {
    getTickets();
    fetchDashboardData();
  }, []);

  // Función para obtener los datos del dashboard desde el backend
  const fetchDashboardData = async () => {
    try {
      // Hacemos la solicitud GET al servicio de NestJS
      const response = await axios.get(
        `${VITE_CRM_API_URL}/dashboard/get-dashboard-data`
      ); // Asegúrate de que esta URL esté correcta
      if (response.status === 200) {
        // Si la respuesta es exitosa, almacenamos los datos en el estado
        const data: DashboardData = await response.data;
        setDashboardData(data);
      }
    } catch (err) {
      // Manejo de errores si la solicitud falla
      console.error(err);
    }
  };

  const userRol = useStoreCrm((state) => state.rol);

  // Función reutilizable para comprobar el rol
  const hasAccessForRole = (userRol: RolUsuario | null) => {
    return userRol !== null && ["ADMIN", "SUPER_ADMIN"].includes(userRol);
  };

  return (
    <motion.div
      {...DesvanecerHaciaArriba}
      className="container mx-auto p-4 space-y-4"
    >
      <h1 className="text-lg font-bold md:text-3xl lg:text-4xl text-center underline">
        Dashboard
      </h1>

      {hasAccessForRole(userRol) && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <StatCard
            title="Clientes Activos"
            value={dashboardData?.activeClients.toString() ?? ""}
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Clientes Morosos"
            value={dashboardData?.delinquentClients.toString() ?? ""}
            icon={<UserMinus className="h-4 w-4 text-muted-foreground" />}
          />

          <StatCard
            title="Clientes Suspendidos"
            value={dashboardData?.suspendedClients.toString() ?? ""}
            icon={<WifiOff className="h-4 w-4 text-muted-foreground" />}
          />

          <StatCard
            title="Clientes Desconectados"
            value={dashboardData?.suspendedClients.toString() ?? ""}
            icon={<UserX className="h-4 w-4 text-muted-foreground" />}
          />

          <StatCard
            title="Servicios Activos"
            value={dashboardData?.activeServices.toString() ?? ""}
            icon={<Zap className="h-4 w-4 text-muted-foreground" />}
          />
          <StatCard
            title="Servicios Suspendidos"
            value={dashboardData?.suspendedServices.toString() ?? ""}
            icon={<ZapOff className="h-4 w-4 text-muted-foreground" />}
          />
        </div>
      )}

      <div className="container mx-auto space-y-4">
        <MyTickets tickets={tickets} />
      </div>

      <div className="container mx-auto space-y-4">
        {/* <MorososInvoices /> */}
      </div>
    </motion.div>
  );
}

function StatCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div {...LightCardMotion}>
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
