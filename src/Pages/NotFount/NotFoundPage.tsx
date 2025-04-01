"use client";

import { AlertCircle, ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-12 sm:px-6 lg:px-8">
      <Card className="w-full max-w-lg mx-auto text-center bg-white shadow-lg rounded-lg">
        <CardHeader>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <CardTitle className="mt-4 font-bold text-red-500">
            <h2 className="text-6xl">404</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-6 py-4">
          <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
          <p className="text-gray-600 mb-8">
            Lo sentimos, la página que está buscando no existe o ha sido movida.
            Por favor, verifique la URL o regrese a la página de inicio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="default"
              className="flex items-center gap-2"
              asChild
            >
              <Link to="/">
                <Home className="h-4 w-4" />
                <span>Ir a Inicio</span>
              </Link>
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Volver atrás</span>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="text-gray-500 text-center border-t pt-4">
          © {new Date().getFullYear()} Nova Sistemas
        </CardFooter>
      </Card>
    </div>
  );
}
