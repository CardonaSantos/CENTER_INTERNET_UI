import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
//================================================================>
import { useState, useEffect } from "react";
import { X, Bell, User, LogOut, AtSign } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link, Outlet, useLocation } from "react-router-dom";
import { ModeToggle } from "../mode-toggle";
import nv2 from "@/assets/LOGOPNG.png";
import nv3 from "@/assets/LogoCrmPng.png";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { UserToken } from "@/Types/UserToken/UserToken";
import { jwtDecode } from "jwt-decode";
import { useStore } from "../Context/ContextSucursal";
import axios from "axios";
import { Sucursal } from "@/Types/Sucursal/Sucursal_Info";
import { toast } from "sonner";
import { Card } from "../ui/card";
import { useSocket } from "../Context/SocketContext";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useStoreCrm } from "@/Crm/ZustandCrm/ZustandCrmContext";
import { UserCrmToken } from "@/Crm/CrmAuth/UserCRMToken";
import { Avatar, AvatarFallback } from "../ui/avatar";

dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");
const formatearFecha = (fecha: string) => {
  let nueva_fecha = dayjs(fecha).format("DD MMMM YYYY, hh:mm A");
  return nueva_fecha;
};

const API_URL = import.meta.env.VITE_API_URL;

interface LayoutProps {
  children?: React.ReactNode;
}

enum TipoNotificacion {
  SOLICITUD_PRECIO = "SOLICITUD_PRECIO",
  TRANSFERENCIA = "TRANSFERENCIA",
  VENCIMIENTO = "VENCIMIENTO",
  OTRO = "OTRO",
}

interface Notificacion {
  id: number;
  mensaje: string;
  remitenteId: number;
  tipoNotificacion: TipoNotificacion;
  referenciaId: number | null;
  fechaCreacion: string;
}

export default function Layout2({ children }: LayoutProps) {
  // const [tokenUser, setTokenUser] = useState<UserToken | null>(null);
  // const [tokenUserCrm, setTokenUserCrm] = useState<UserCrmToken | null>(null);
  const setUserNombre = useStore((state) => state.setUserNombre);
  const setUserCorreo = useStore((state) => state.setUserCorreo);
  const setUserId = useStore((state) => state.setUserId);

  //PARA EL SISTEMA POS
  const setActivo = useStore((state) => state.setActivo);
  const setRol = useStore((state) => state.setRol);
  const setSucursalId = useStore((state) => state.setSucursalId);
  const sucursalId = useStore((state) => state.sucursalId);
  const socket = useSocket();
  const userID = useStore((state) => state.userId);
  //PARA EL SISTEMA CRM

  const setNombreCrm = useStoreCrm((state) => state.setNombre);
  const setCorreoCrm = useStoreCrm((state) => state.setCorreo);
  const setActivoCrm = useStoreCrm((state) => state.setActivo);
  const setRolCrm = useStoreCrm((state) => state.setRol);
  const setUserIdCrm = useStoreCrm((state) => state.setUserIdCrm);
  const setEmpresaIdCrm = useStoreCrm((state) => state.setEmpresaId);

  //POS
  const nombrePos = useStore((state) => state.userNombre);
  const correoPos = useStore((state) => state.userCorreo);

  //CRM
  const nombreCrm = useStoreCrm((state) => state.nombre);
  const correoCrm = useStoreCrm((state) => state.correo);
  const rol = useStoreCrm((state) => state.rol);
  const empresaID = useStoreCrm((state) => state.empresaId);
  useEffect(() => {
    const storedToken = localStorage.getItem("authTokenPos");
    const storedTokenCRM = localStorage.getItem("tokenAuthCRM");

    if (storedToken) {
      try {
        const decodedToken = jwtDecode<UserToken>(storedToken);
        // setTokenUser(decodedToken);
        setUserNombre(decodedToken.nombre);
        setUserCorreo(decodedToken.correo);
        setActivo(decodedToken.activo);
        setRol(decodedToken.rol);
        setUserId(decodedToken.sub);
        setSucursalId(decodedToken.sucursalId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
    if (storedTokenCRM) {
      try {
        const decodedTokenCrm = jwtDecode<UserCrmToken>(storedTokenCRM);

        setNombreCrm(decodedTokenCrm.nombre);
        setActivoCrm(decodedTokenCrm.activo);
        setCorreoCrm(decodedTokenCrm.correo);
        setRolCrm(decodedTokenCrm.rol);
        setUserIdCrm(decodedTokenCrm.id);
        setEmpresaIdCrm(decodedTokenCrm.empresaId);
      } catch (error) {
        console.log("Error decodificando token: ", error);
      }
    }
  }, []);
  console.log("mi nombre crm es: ", nombreCrm);
  console.log("mi rol crm es: ", rol);
  console.log("mi empresa id es: ", empresaID);

  const storedTokenCRM = localStorage.getItem("tokenAuthCRM");

  console.log("mi token crm es: ", storedTokenCRM);
  const isCrmLocation = useLocation().pathname.startsWith("/crm");
  // Determinar qué datos usar según la URL
  const nombreUsuario = isCrmLocation ? nombreCrm : nombrePos;
  const correoUsuario = isCrmLocation ? correoCrm : correoPos;
  // const avatarUsuario = isCrmLocation ? avatarCrm : avatarPos;

  function handleDeletToken() {
    if (isCrmLocation) {
      localStorage.removeItem("tokenAuthCRM");
      toast.info("Sesión en CRM cerrada");
    } else {
      localStorage.removeItem("authTokenPos");
      toast.info("Sesión en POS cerrada");
    }
    window.location.reload();
  }
  const [sucursalInfo, setSucursalInfo] = useState<Sucursal>();

  useEffect(() => {
    const getInfoSucursal = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/sucursales/get-info-sucursal/${sucursalId}`
        );
        if (response.status === 200) {
          setSucursalInfo(response.data);
        }
      } catch (error) {
        console.error("Error fetching sucursal info:", error);
      }
    };

    // Solo hace la petición si sucursalId es válido
    if (sucursalId) {
      getInfoSucursal();
    }
  }, [sucursalId]); // Ahora depende de sucursalId

  console.log("La info de la sucursal actual es: ", sucursalInfo);

  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  const getNotificaciones = async () => {
    try {
      if (isCrmLocation) {
        const response = await axios.get(
          `${API_URL}/notification/get-my-notifications/${userID}`
        );
        if (response.status === 200) {
          setNotificaciones(response.data);
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al conseguir notificaciones");
    }
  };

  useEffect(() => {
    if (isCrmLocation) {
      console.log("Conseguir notificaciones del CRM");
    } else {
      if (userID) {
        getNotificaciones();
      }
    }
  }, [userID]);

  const deleteNoti = async (id: number) => {
    try {
      const response = await axios.delete(
        `${API_URL}/notification/delete-my-notification/${id}/${userID}`
      );
      if (response.status === 200) {
        toast.success("Notificación eliminada");
        getNotificaciones(); // Actualiza las notificaciones después de eliminar
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al eliminar notificación");
    }
  };

  // Escuchar el evento de nueva notificación entrante
  useEffect(() => {
    if (socket) {
      console.log("Escuchando evento para notificaciones");

      socket.on("recibirNotificacion", (nuevaNotificacion: Notificacion) => {
        setNotificaciones((prevNotificaciones) => [
          nuevaNotificacion,
          ...prevNotificaciones,
        ]);
      });

      // Limpieza del evento al desmontar el componente o desconectarse el socket
      return () => {
        socket.off("recibirNotificacion");
      };
    }
  }, [socket]);

  const classesCrmLogo = "h-14 w-14 md:h-24 md:w-24";
  const classesNova = "h-16 w-16 md:h-10 md:w-16";

  return (
    <div className="flex min-h-screen">
      <SidebarProvider>
        <AppSidebar />

        {/* Contenedor principal para el toolbar y el contenido */}
        <div className="flex flex-col w-full">
          {/* Toolbar */}
          <div className="sticky top-0 z-10 h-16 w-full bg-background border-b border-border shadow-sm flex items-center justify-between">
            <div className="mx-auto flex h-16 max-w-7xl w-full items-center px-4 sm:px-6 lg:px-8 justify-between">
              {/* Sección izquierda: Logo y nombre de la sucursal */}
              <div className="flex items-center space-x-2">
                <Link to={"/"}>
                  <img
                    className={`${
                      isCrmLocation ? classesCrmLogo : classesNova
                    }`} // Mobile: 12x12, Medium+: 16x28
                    src={isCrmLocation ? nv3 : nv2}
                    alt="Logo"
                  />
                </Link>
                <Link to={"/"}>
                  <p className="text-xs font-semibold text-foreground sm:text-sm md:text-base">
                    Center Internet
                  </p>
                </Link>
              </div>
              {/* vitaFertil-universal-forma:pachon, normal */}
              {/* Sección derecha: Toggle de modo, notificaciones y menú de usuario */}
              <div className="flex items-center space-x-2">
                <div className="">
                  <Link to={"/crm"}>
                    <Button
                      className="underline font-semibold dark:text-white "
                      size={"icon"}
                      variant={"link"}
                    >
                      CRM
                    </Button>
                  </Link>
                </div>

                <div className=" ">
                  <ModeToggle />
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="relative">
                      <Button variant="outline" size="icon" className="mr-4">
                        <Bell className="h-6 w-6" />
                      </Button>
                      {notificaciones.length > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center w-6 h-6 text-xs font-bold leading-none text-primary-foreground bg-rose-500 rounded-full">
                          {notificaciones.length}
                        </span>
                      )}
                    </div>
                  </DialogTrigger>

                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-center text-2xl font-bold">
                        Notificaciones
                      </DialogTitle>
                    </DialogHeader>
                    <div className="py-4 overflow-y-auto max-h-96">
                      {notificaciones && notificaciones.length > 0 ? (
                        notificaciones.map((not) => (
                          <Card className="m-2 p-4 shadow-md" key={not.id}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p
                                  style={{ fontSize: "9px" }}
                                  className={`font-semibold ${
                                    not.tipoNotificacion ===
                                    TipoNotificacion.SOLICITUD_PRECIO
                                      ? "text-green-600 dark:text-green-400"
                                      : not.tipoNotificacion ===
                                        TipoNotificacion.TRANSFERENCIA
                                      ? "text-blue-600 dark:text-blue-400"
                                      : not.tipoNotificacion ===
                                        TipoNotificacion.VENCIMIENTO
                                      ? "text-red-600 dark:text-red-400"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {TipoNotificacion[not.tipoNotificacion]}
                                </p>
                                <p className="text-sm mt-1 break-words text-foreground">
                                  {not.mensaje}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatearFecha(not.fechaCreacion)}
                                </p>
                              </div>
                              <Button
                                style={{ width: "25px", height: "25px" }}
                                size={"icon"}
                                type="button"
                                variant={"destructive"}
                                title="Eliminar Notificación"
                                className="rounded-full p-2 ml-2 flex-shrink-0"
                                onClick={() => deleteNoti(not.id)} // Pasa el id directamente
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </Card>
                        ))
                      ) : (
                        <p className="text-center text-muted-foreground">
                          No hay notificaciones.
                        </p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
                <div className="">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full"
                      >
                        <User className="h-5 w-5" />
                        <span className="sr-only">User menu</span>
                        <Avatar className="bg-[#29daa5] border-2 border-transparent dark:border-white dark:bg-transparent">
                          <AvatarFallback className="bg-[#2be6ae] text-white font-bold dark:bg-transparent dark:text-[#2be6ae]">
                            {nombreUsuario?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>{nombreUsuario}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <AtSign className="mr-2 h-4 w-4" />
                        <span>{correoUsuario}</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDeletToken}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Cerrar Sesión</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <main className="flex-1 overflow-y-auto p-1 lg:p-8">
            <SidebarTrigger />
            {children || <Outlet />}
          </main>

          {/* Footer */}
          <footer className="bg-background py-4 text-center text-sm text-muted-foreground border-t border-border">
            <p>&copy; 2024 Novas Sistemas. Todos los derechos reservados</p>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
}
