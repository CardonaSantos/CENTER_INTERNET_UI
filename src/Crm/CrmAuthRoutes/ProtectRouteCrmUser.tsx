import { Navigate } from "react-router-dom";

import gif from "@/assets/loading.gif";
import { useAuthStoreCRM } from "./AuthStateCRM";

interface ProtectedRouteProps {
  children: JSX.Element;
}

export function ProtectRouteCrmUser({ children }: ProtectedRouteProps) {
  const { userRol, isLoading } = useAuthStoreCRM();

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen gap-2">
        <img src={gif} alt="Cargando..." className="w-16 h-16 object-contain" />
        <p className="text-lg font-semibold text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!userRol) {
    return <Navigate to="/crm/login" />;
  }

  if (!["ADMIN", "TECNICO", "COBRADOR"].includes(userRol)) {
    return <Navigate to="/crm" />;
  }

  return children;
}
