"use client";

import type React from "react";

import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AtSign, Lock, User } from "lucide-react";
import { toast } from "sonner";
const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;
console.log("El api crm es: ", VITE_CRM_API_URL);

enum RolUsuario {
  TECNICO = "TECNICO",
  OFICINA = "OFICINA",
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  COBRADOR = "COBRADOR",
}

export default function CrmRegist() {
  const [formData, setFormData] = useState({
    nombre: "",
    correo: "",
    contrasena: "",
    rol: RolUsuario.TECNICO,
    empresaId: 1,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRolChange = (value: string) => {
    setFormData((prev) => ({ ...prev, rol: value as RolUsuario }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Replace with your actual API endpoint
      const response = await axios.post(
        `${VITE_CRM_API_URL}/auth/regist-user`,
        formData
      );
      console.log("Login successful:", response.data);
      if (response.status === 201 || response.status === 200) {
        toast.success("Usuario Registrado");
        localStorage.setItem("tokenAuthCRM", response.data.access_token);
        window.location.href = "/crm";
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };
  console.log("El error es: ", error);

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Acceso al CRM
          </CardTitle>
          <CardDescription className="text-center">
            Ingrese sus credenciales para acceder al sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre completo"
                  className="pl-10"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo">Correo electrónico</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="correo"
                  name="correo"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  className="pl-10"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contrasena">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="contrasena"
                  name="contrasena"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol</Label>
              <Select value={formData.rol} onValueChange={handleRolChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RolUsuario.TECNICO}>Técnico</SelectItem>

                  <SelectItem value={RolUsuario.OFICINA}>Oficina</SelectItem>
                  <SelectItem value={RolUsuario.COBRADOR}>Cobrador</SelectItem>

                  <SelectItem value={RolUsuario.ADMIN}>
                    Administrador
                  </SelectItem>
                  <SelectItem value={RolUsuario.SUPER_ADMIN}>
                    Super Administrador
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Sistema de gestión CRM © {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
