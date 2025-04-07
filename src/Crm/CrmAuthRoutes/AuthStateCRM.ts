import { jwtDecode } from "jwt-decode";
import { create } from "zustand";

enum RolUsuario {
  TECNICO = "TECNICO",
  OFICINA = "OFICINA",
  ADMIN = "ADMIN",
  COBRADOR = "COBRADOR",
  SUPER_ADMIN = "SUPER_ADMIN",
}

interface AuthState {
  userRol: RolUsuario | null;
  isLoading: boolean;
  checkAuthCRM: () => void;
  logout: () => void;
}

export const useAuthStoreCRM = create<AuthState>((set) => ({
  userRol: null,
  isLoading: true,
  checkAuthCRM: () => {
    const token = localStorage.getItem("tokenAuthCRM");
    if (token) {
      try {
        const decodedToken = jwtDecode<{ rol: RolUsuario }>(token);
        set({ userRol: decodedToken.rol, isLoading: false });
      } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("tokenAuthCRM");
        set({ userRol: null, isLoading: false });
      }
    } else {
      set({ userRol: null, isLoading: false });
    }
  },
  logout: () => {
    localStorage.removeItem("tokenAuthCRM");
    set({ userRol: null, isLoading: false });
    // window.location.reload();
    window.location.href = "/crm/login";
  },
}));
