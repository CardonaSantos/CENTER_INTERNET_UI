"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  Ticket,
  User,
  AlertCircle,
  Calendar,
  Tag,
  MessageSquare,
  Save,
  // Search,
  Clock,
  Flag,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
// import { cn } from "@/lib/utils";
import SelectComponent, { MultiValue } from "react-select";
import axios from "axios";
import { toast } from "sonner";
import { useStoreCrm } from "@/Crm/ZustandCrm/ZustandCrmContext";
const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;
// Tipos
interface CreateTicketProps {
  openCreatT: boolean;
  setOpenCreateT: (open: boolean) => void;
  getTickets: () => void;
}

interface Cliente {
  id: number;
  nombre: string;
}

interface Empresa {
  id: number;
  nombre: string;
}

interface Usuario {
  id: number;
  nombre: string;
}

// interface Etiqueta {
//   id: number;
//   nombre: string;
//   color: string;
// }

function CrmCreateTicket({
  openCreatT,
  setOpenCreateT,
  getTickets,
}: CreateTicketProps) {
  const userId = useStoreCrm((state) => state.userIdCRM) ?? 0;
  const empresaId = useStoreCrm((state) => state.empresaId) ?? 0;

  const [labelsSelecteds, setLabelsSelecteds] = useState<number[]>([]);
  interface FormData {
    clienteId: number | null;
    tecnicoId: number | null;
    titulo: "";
    descripcion: "";
    estado: "NUEVO";
    prioridad: "MEDIA";
    etiquetas: number[];
    userId: number;
    empresaId: number;
  }

  // Estados para los campos del formulario
  const [formData, setFormData] = useState<FormData>({
    clienteId: 0,
    tecnicoId: 0,
    titulo: "",
    descripcion: "",
    estado: "NUEVO",
    prioridad: "MEDIA",
    etiquetas: [] as number[],
    userId: userId,
    empresaId: empresaId,
  });

  // Datos simulados
  const [clientes, setClientes] = useState<Cliente[]>([]);

  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [tecnicos, setTecnicos] = useState<Usuario[]>([]);

  const [etiquetas, setEtiquetas] = useState<Etiqueta[]>([]);

  const getClientes = async () => {
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/internet-customer/get-customers-to-ticket`
      );
      if (response.status === 200) {
        setClientes(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("No se pudieron conseguir los clientes");
    }
  };

  console.log("El form data es: ", formData);

  const getTecs = async () => {
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/user/get-users-to-create-tickets`
      );
      if (response.status === 200) {
        setTecnicos(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("No se pudieron conseguir los clientes");
    }
  };

  const getEtiquetas = async () => {
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/tags-ticket/get-tags-to-ticket`
      );
      if (response.status === 200) {
        setEtiquetas(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("No se pudieron conseguir tags");
    }
  };

  useEffect(() => {
    getClientes();
    getTecs();
    getEtiquetas();
  }, []);

  console.log(empresas, setEmpresas, setClientes, setTecnicos, setEtiquetas);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  console.log("El form data es: ", formData);

  const handleSubmit = async () => {
    console.log("Datos del ticket:", formData);

    try {
      const response = await axios.post(
        `${VITE_CRM_API_URL}/tickets-soporte`,
        formData
      );

      if (response.status === 201) {
        toast.success("Ticket Creado");
      }
    } catch (error) {
      console.log(error);
      toast.info("Error al crear ticket");
    }

    getTickets();
    setOpenCreateT(false);
  };

  interface OptionSelectedReactComponent {
    value: string;
    label: string;
  }

  interface Etiqueta {
    id: number;
    nombre: string;
  }

  const handleChangeCustomerSelect = (
    selectedOption: OptionSelectedReactComponent | null
  ) => {
    const newCustomerId = selectedOption
      ? parseInt(selectedOption.value, 10)
      : null;
    setFormData((prev) => ({ ...prev, clienteId: newCustomerId }));
  };

  const handleChangeTecSelect = (
    optionSelected: OptionSelectedReactComponent | null
  ) => {
    const newTecId = optionSelected ? parseInt(optionSelected.value, 10) : null;
    setFormData((prevData) => ({
      ...prevData,
      tecnicoId: newTecId,
    }));
  };

  const handleChangeLabels = (
    selectedOptions: MultiValue<{ value: string; label: string }>
  ) => {
    const selectedIds = selectedOptions.map((option) => parseInt(option.value));
    setLabelsSelecteds(selectedIds);
    setFormData((prev) => ({
      ...prev,
      etiquetas: selectedIds,
    }));
  };

  const optionsCustomers = clientes.map((cliente) => ({
    value: cliente.id.toString(),
    label: cliente.nombre,
  }));

  const optionsTecs = tecnicos.map((tec) => ({
    value: tec.id.toString(),
    label: tec.nombre,
  }));

  const optionsLabels = etiquetas.map((label) => ({
    value: label.id.toString(),
    label: label.nombre,
  }));

  return (
    <Dialog open={openCreatT} onOpenChange={setOpenCreateT}>
      <DialogContent className="sm:max-w-[700px] max-h-[100vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Ticket className="h-5 w-5 text-primary" />
            Crear Nuevo Ticket de Soporte
          </DialogTitle>
          <DialogDescription>
            Complete la información para crear un nuevo ticket de soporte
            técnico.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="info"
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="info" className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Información Básica
            </TabsTrigger>
            <TabsTrigger value="details" className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Detalles
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 ">
            <TabsContent value="info" className="mt-0 space-y-10">
              {/* Cliente */}
              <div className="space-y-2">
                <Label htmlFor="cliente" className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Cliente <span className="text-destructive">*</span>
                </Label>
                <SelectComponent
                  placeholder="Seleccione un cliente"
                  isClearable
                  className="text-black text-sm"
                  options={optionsCustomers}
                  value={
                    optionsCustomers.find(
                      (option) =>
                        option.value === formData.clienteId?.toString()
                    ) || null
                  }
                  onChange={handleChangeCustomerSelect}
                />
              </div>

              {/* Técnico */}
              <div className="space-y-2">
                <Label htmlFor="tecnicoId" className="flex items-center gap-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Técnico Asignado
                </Label>
                <SelectComponent
                  placeholder="Seleccione un técnico"
                  isClearable
                  className="text-black text-sm"
                  options={optionsTecs}
                  value={
                    optionsTecs.find(
                      (tec) => tec.value === formData.tecnicoId?.toString()
                    ) || null
                  }
                  onChange={handleChangeTecSelect}
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado" className="flex items-center gap-1">
                  <Clock className="h-4 w-4  text-blue-500" />
                  Estado
                </Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleSelectChange("estado", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NUEVO">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-blue-600"></span>
                        <span>Nuevo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ABIERTA">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-600"></span>
                        <span>Abierta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="EN_PROCESO">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-600"></span>
                        <span>En Proceso</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDIENTE">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-600"></span>
                        <span>Pendiente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDIENTE_CLIENTE">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-pink-600"></span>
                        <span>Pendiente Cliente</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PENDIENTE_TECNICO">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-teal-600"></span>
                        <span>Pendiente Técnico</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridad */}
              <div className="space-y-2">
                <Label htmlFor="prioridad" className="flex items-center gap-1">
                  <Flag className="h-4 w-4 text-red-500" />
                  Prioridad
                </Label>
                <Select
                  value={formData.prioridad}
                  onValueChange={(value) =>
                    handleSelectChange("prioridad", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BAJA" className="flex items-center">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                        <span>Baja</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="MEDIA">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span>Media</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ALTA">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                        <span>Alta</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="URGENTE">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-500"></span>
                        <span>Urgente</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-0 space-y-10">
              {/* Título */}
              <div className="space-y-2 px-4">
                <Label htmlFor="titulo" className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  Título <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Título descriptivo del problema"
                  required
                />
              </div>

              {/* Descripción */}
              <div className="space-y-1 px-4">
                <Label
                  htmlFor="descripcion"
                  className="flex items-center gap-1"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  Descripción
                </Label>
                <Textarea
                  id="descripcion"
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleChange}
                  placeholder="Describa detalladamente el problema o solicitud"
                  className="min-h-[90px]"
                />
              </div>

              {/* Etiquetas */}
              <div className="space-y-1">
                <Label className="flex items-center gap-1">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Etiquetas
                </Label>
                <div className="relative z-30">
                  <SelectComponent
                    placeholder="Seleccione etiquetas (opcional)"
                    options={optionsLabels}
                    isMulti
                    className="text-black text-sm"
                    onChange={handleChangeLabels}
                    value={optionsLabels.filter((option) =>
                      labelsSelecteds.includes(Number.parseInt(option.value))
                    )}
                    menuPlacement="top" // Esta propiedad hace que las opciones se desplieguen hacia arriba
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <Separator className="my-4" />

        <DialogFooter className="flex sm:justify-between gap-2">
          <div className="hidden sm:flex items-center text-sm text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            Fecha de creación: {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => setOpenCreateT(false)}
              className="flex-1 sm:flex-initial"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 sm:flex-initial"
              disabled={
                !formData.clienteId || !formData.empresaId || !formData.titulo
              }
            >
              <Save className="mr-2 h-4 w-4" />
              Crear Ticket
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CrmCreateTicket;
