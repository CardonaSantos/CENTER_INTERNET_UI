import { create } from "zustand";

export enum RolUsuario {
  TECNICO = "TECNICO",
  OFICINA = "OFICINA",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  COBRADOR = "COBRADOR",
}
interface CRM_PROPS {
  nombre: string | null;
  correo: string | null;
  rol: RolUsuario | null;
  empresaId: number | null;
  activo: boolean | null;
  authTokenCRM: string | null;
  userIdCRM: number | null;

  setNombre: (nombre: string) => void;
  setUserIdCrm: (nombre: number) => void;

  setCorreo: (nombre: string) => void;
  setRol: (nombre: RolUsuario) => void;

  setEmpresaId: (nombre: number) => void;
  setActivo: (nombre: boolean) => void;
  setTokenCRM: (token: string) => void;
  clearAuth: () => void;
}
export const useStoreCrm = create<CRM_PROPS>((set) => ({
  nombre: null,
  activo: null,
  correo: null,
  rol: null,
  empresaId: null,
  authTokenCRM: null,
  userIdCRM: null,

  setNombre: (userNombre) => set({ nombre: userNombre }),
  setActivo: (activo) => set({ activo: activo }),
  setCorreo: (setCorreo) => set({ correo: setCorreo }),
  setEmpresaId: (empresaId) => set({ empresaId: empresaId }),
  setRol: (rol) => set({ rol: rol }),
  setTokenCRM: (rol) => set({ authTokenCRM: rol }),
  setUserIdCrm: (userID) => set({ userIdCRM: userID }),
  //limpio el token
  clearAuth: () => set({ authTokenCRM: null }),
}));
