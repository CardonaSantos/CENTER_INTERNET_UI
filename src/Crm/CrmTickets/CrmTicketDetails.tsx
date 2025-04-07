"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  Ellipsis,
  Flag,
  RotateCcw,
  Send,
  Sticker,
  Tag,
  TicketSlash,
  UserIcon,
} from "lucide-react";
import type { Ticket } from "./ticketTypes";

import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useStoreCrm } from "../ZustandCrm/ZustandCrmContext";
import axios from "axios";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectComponent, { MultiValue, SingleValue } from "react-select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;
dayjs.extend(localizedFormat);
dayjs.extend(customParseFormat);
dayjs.locale("es");
const formatearFecha = (fecha: string) => {
  return dayjs(fecha).format("DD MMMM YYYY hh:mm A");
};

interface OptionSelectedReactComponent {
  value: string;
  label: string;
}

interface TicketDetailProps {
  ticket: Ticket;
  getTickets: () => void;
  setSelectedTicketId: (value: number | null) => void;

  //para volver a poder seleccionar las labels
  optionsLabels: OptionSelectedReactComponent[];
  optionsTecs: OptionSelectedReactComponent[];
}

interface SeguimientoData {
  ticketId: number | null;
  usuarioId: number | null;
  descripcion: string;
}

enum PrioridadTicketSoporte {
  BAJA = "BAJA",
  MEDIA = "MEDIA",
  ALTA = "ALTA",
  URGENTE = "URGENTE",
}

interface TagOption {
  value: string;
  label: string;
}

export default function TicketDetail({
  ticket,
  getTickets,
  //LAS ETIQUETAS CON EL FORMATO QUE REACT SELECT COMPONENT PUEDE SOPORTAR
  optionsLabels,
  optionsTecs,
  //setticket
  setSelectedTicketId,
}: TicketDetailProps) {
  const userId = useStoreCrm((state) => state.userIdCRM) ?? 0;
  const [openUpdateTicket, setOpenUpdateTicket] = useState(false);
  const [ticketToEdit, setTicketToEdit] = useState<Ticket>(ticket);
  const [formDataComent, setFormDataComent] = useState<SeguimientoData>({
    descripcion: "".trim(),
    ticketId: ticket.id,
    usuarioId: userId,
  });
  const [openCloseTicket, setOpenCloseTicket] = useState(false);

  console.log("El form para el seguimiento es: ", formDataComent);

  const [ticketDeleteId, setTicketDeleteId] = useState<number | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  console.log("el id del ticket seleccionado es: ", ticketDeleteId);

  const submitNewComentaryFollowUp = async (e: React.FormEvent) => {
    console.log("EJECUTANDO FUNCION");
    e.preventDefault();
    try {
      if (!formDataComent.descripcion) {
        toast.info("No se pueden enviar mensajes vacíos");
        return;
      }

      if (!formDataComent.ticketId) {
        toast.info("Imposible conseguir ticket id");
        return;
      }

      if (!formDataComent.usuarioId) {
        toast.info("No se encontró el user id");
        return;
      }

      const response = await axios.post(
        `${VITE_CRM_API_URL}/ticket-seguimiento`,
        formDataComent
      );

      if (response.status === 201) {
        toast.success("Comentario añadido");
        await getTickets();
        setFormDataComent((previaData) => ({
          ...previaData,
          descripcion: "",
        }));
      }
    } catch (error) {
      toast.info("Error al añadir seguimiento");
    }
  };

  useEffect(() => {
    setFormDataComent((previaData) => ({
      ...previaData,
      ticketId: ticket.id,
    }));
  }, [ticket]);

  const getBadgeProps = (priority: PrioridadTicketSoporte) => {
    switch (priority) {
      case PrioridadTicketSoporte.BAJA:
        return {
          text: "Baja prioridad",
          bgColor: "bg-gray-50", // Color de fondo gris claro
          textColor: "text-gray-600", // Color de texto gris oscuro
        };
      case PrioridadTicketSoporte.MEDIA:
        return {
          text: "Prioridad media",
          bgColor: "bg-green-50", // Color de fondo verde suave
          textColor: "text-green-600", // Color de texto verde
        };
      case PrioridadTicketSoporte.ALTA:
        return {
          text: "Alta prioridad",
          bgColor: "bg-yellow-50", // Color de fondo amarillo suave
          textColor: "text-yellow-600", // Color de amarillo verde
        };
      case PrioridadTicketSoporte.URGENTE:
        return {
          text: "Urgente",
          bgColor: "bg-red-50", // Color de fondo rojo suave
          textColor: "text-red-600", // Color de texto rojo
        };
      default:
        return {
          text: "Desconocido",
          bgColor: "bg-gray-100", // Color de fondo gris muy claro
          textColor: "text-gray-500", // Color de texto gris claro
        };
    }
  };
  const { bgColor, text, textColor } = getBadgeProps(ticket.priority);

  const handleChangePropsTicket = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTicketToEdit((previaData) => ({
      ...previaData,
      [name]: value,
    }));
  };

  console.log("El value del ticket editando es: ", ticketToEdit);

  const handleSelectChange = (name: string, value: string) => {
    setTicketToEdit((prev) => ({ ...prev, [name]: value }));
  };

  // Actualiza las etiquetas, transformando el array de opciones a array de strings
  const handleChangeLabels = (selectedOptions: MultiValue<TagOption>) => {
    setTicketToEdit((prev) => ({
      ...prev,
      tags: [...selectedOptions], // Convertimos a array mutable
    }));
  };

  useEffect(() => {
    setTicketToEdit(ticket);
  }, [ticket]);

  // Actualiza el técnico asignado a partir de la opción seleccionada
  const handleChangeTecSelect = (
    selectedOption: SingleValue<{ value: string; label: string }>
  ) => {
    if (selectedOption) {
      setTicketToEdit((prev) => ({
        ...prev,
        assignee: {
          id: Number(selectedOption.value),
          name: selectedOption.label,
          initials: selectedOption.label
            .split(" ")
            .map((word) => word[0])
            .join(""),
          avatar: prev.assignee?.avatar || "",
        },
      }));
    } else {
      // Si se deselecciona el técnico, se limpia el valor
      setTicketToEdit((prev) => ({
        ...prev,
        assignee: { id: 0, name: "", initials: "" },
      }));
    }
  };

  const handleSubmitTicketEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.patch(
        `${VITE_CRM_API_URL}/tickets-soporte/update-ticket-soporte/${ticketToEdit.id}`,
        ticketToEdit
      );
      if (response.status === 200 || response.status === 201) {
        toast.success("Ticket actualizado correctamente");
        getTickets();
        setOpenUpdateTicket(false);
      } else {
        toast.error("Error al actualizar el ticket");
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al actualizar el ticket");
    }
  };

  const handleDeleteTicket = async () => {
    try {
      const response = await axios.delete(
        `${VITE_CRM_API_URL}/tickets-soporte/delete-ticket/${ticketDeleteId}`
      );
      if (response.status === 200) {
        toast.success("Ticket eliminado");
        setOpenDelete(false);
        setSelectedTicketId(null);
        await getTickets();
        // set
      }
    } catch (error) {
      console.log(error);
      toast.error("Algo salió mal");
    }
  };

  const handleCloseTicket = async () => {
    try {
      const response = await axios.patch(
        `${VITE_CRM_API_URL}/tickets-soporte/close-ticket-soporte/${ticketToEdit.id}`,
        {
          comentario: formDataComent.descripcion,
          ticketId: formDataComent.ticketId,
          usuarioId: formDataComent.usuarioId,
          ...ticketToEdit,
        }
      );

      if (response.status === 200) {
        toast.success("Ticket cerrado correctamente");
        getTickets();
        setOpenCloseTicket(false);
        setSelectedTicketId(null);
      }
    } catch (error) {
      console.log(error);
      toast.error("No se pudo cerrar el ticket");
    }
  };

  return (
    <div className="h-[calc(100vh-220px)] flex flex-col">
      <div className="border-b px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {ticket.customer
                  ? ticket.customer.name.slice(0, 2).toUpperCase()
                  : "NA"}{" "}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-[12px]  text-blue-500">
                <Link to={`/crm/cliente/${ticket.customer.id}`}>
                  #{ticket.id} ·{" "}
                  {ticket.assignee ? ticket.customer.name : "No asignado"} ·{" "}
                  {formatearFecha(new Date(ticket.date).toISOString())}
                </Link>
              </div>
            </div>
            <div className="text-[11px] text-muted-foreground">
              {ticket.creator.name} para{" "}
              {ticket.assignee ? ticket.assignee.name : "No asignado"}{" "}
              {/* Si hay técnico, mostramos su nombre, sino "No asignado" */}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={`${bgColor} ${text} ${textColor}`}
            >
              {ticket.priority}
            </Badge>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Ellipsis />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {/* Grupo: Eliminar */}
                <DropdownMenuCheckboxItem
                  onClick={() => {
                    setTicketDeleteId(ticket.id);
                    setOpenDelete(true);
                  }}
                >
                  Eliminar Ticket <TicketSlash className="h-5 w-5 mx-2" />
                </DropdownMenuCheckboxItem>

                <DropdownMenuSeparator />

                {/* Grupo: Acciones de edición */}
                <DropdownMenuCheckboxItem
                  onClick={() => {
                    setOpenUpdateTicket(true);
                    setTicketToEdit(ticket);
                  }}
                >
                  Actualizar Ticket <RotateCcw className="h-5 w-5 mx-2" />
                </DropdownMenuCheckboxItem>

                <DropdownMenuCheckboxItem
                  onClick={() => {
                    setOpenCloseTicket(true);
                    setTicketToEdit(ticket);
                  }}
                >
                  Cerrar Ticket <Sticker className="h-5 w-5 mx-2" />
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <h2 className="text-base font-semibold mt-2">{ticket.title}</h2>
        <p className="text-sm font-thin mb-1">{ticket.description}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {ticket.comments &&
          ticket.comments.map((comment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-100 dark:bg-slate-900 rounded-lg py-2 px-3 mb-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-sm">{comment.user.name}</span>
                <span className="text-[11px] text-muted-foreground">
                  {formatearFecha(new Date(comment.date).toISOString())}
                </span>
              </div>
              <p className="text-[12px]">{comment.text}</p>
            </motion.div>
          ))}
      </div>

      <div className="border-t p-4">
        <form onSubmit={submitNewComentaryFollowUp}>
          <div className="relative flex items-center gap-3">
            <Textarea
              placeholder="Escriba un comentario"
              className="min-h-[50px] resize-none pr-12 flex-1"
              value={formDataComent.descripcion}
              onChange={(e) =>
                setFormDataComent((previaData) => ({
                  ...previaData,
                  descripcion: e.target.value,
                }))
              }
            />
            <button
              type="submit"
              className="bg-[#27bd65] hover:bg-[#3cc575] text-white flex items-center justify-center p-2 rounded-lg transition-colors duration-300"
            >
              <Send className="h-4 w-4 mr-2" />
              ENVIAR
            </button>
          </div>
        </form>
      </div>

      {/* DIALOG PARA LA EDICION DEL TICKET Y CIERRE POSTERIOR */}
      <Dialog open={openUpdateTicket} onOpenChange={setOpenUpdateTicket}>
        <DialogContent className="sm:max-w-[500px] md:max-w-[600px] p-0 overflow-hidden">
          <form onSubmit={handleSubmitTicketEdit} className="space-y-0">
            <DialogHeader className="px-6 pt-6 pb-2 bg-muted/30">
              <DialogTitle className="text-xl font-semibold">
                Editar Ticket
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Modifica los campos del ticket según sea necesario.
              </DialogDescription>
            </DialogHeader>

            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-5">
              {/* Título */}
              <div className="space-y-2">
                <Label
                  htmlFor="title"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                    <span className="text-primary text-xs font-bold">T</span>
                  </span>
                  Título
                </Label>
                <Input
                  name="title"
                  id="title"
                  value={ticketToEdit.title}
                  onChange={handleChangePropsTicket}
                  className="w-full"
                  placeholder="Título del ticket"
                />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10">
                    <span className="text-primary text-xs font-bold">D</span>
                  </span>
                  Descripción
                </Label>
                <Textarea
                  name="description"
                  id="description"
                  value={ticketToEdit.description}
                  onChange={handleChangePropsTicket}
                  className="w-full min-h-[100px] resize-y"
                  placeholder="Descripción detallada del problema"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Prioridad */}
                <div className="space-y-2">
                  <Label
                    htmlFor="priority"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Flag className="h-4 w-4 text-red-500" />
                    Prioridad
                  </Label>
                  <Select
                    value={ticketToEdit.priority}
                    onValueChange={(value) =>
                      handleSelectChange("priority", value)
                    }
                  >
                    <SelectTrigger className="w-full">
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

                {/* Estado */}
                <div className="space-y-2">
                  <Label
                    htmlFor="status"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Clock className="h-4 w-4 text-blue-500" />
                    Estado
                  </Label>
                  <Select
                    value={ticketToEdit.status}
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NUEVO">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                          <span>Nuevo</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="ABIERTA">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-yellow-500"></span>
                          <span>Abierta</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="EN_PROCESO">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500"></span>
                          <span>En Proceso</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PENDIENTE">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-gray-500"></span>
                          <span>Pendiente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PENDIENTE_CLIENTE">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-pink-500"></span>
                          <span>Pendiente Cliente</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PENDIENTE_TECNICO">
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-teal-500"></span>
                          <span>Pendiente Técnico</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Etiquetas */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium">
                  <Tag className="h-4 w-4 text-purple-500" />
                  Etiquetas
                </Label>
                <div className="relative z-30">
                  <SelectComponent
                    placeholder="Seleccione etiquetas (opcional)"
                    options={optionsLabels}
                    isMulti
                    value={ticketToEdit.tags}
                    onChange={handleChangeLabels}
                    menuPlacement="top"
                    className=" text-black text-[12px]"
                  />
                </div>
              </div>

              {/* Técnico Asignado */}
              <div className="space-y-2">
                <Label
                  htmlFor="assignee"
                  className="flex items-center gap-2 text-sm font-medium"
                >
                  <UserIcon className="h-4 w-4 text-teal-500" />
                  Técnico Asignado
                </Label>
                <SelectComponent
                  placeholder="Seleccione un técnico"
                  isClearable
                  options={optionsTecs}
                  value={
                    ticketToEdit.assignee
                      ? optionsTecs.find(
                          (tec) =>
                            tec.value === ticketToEdit.assignee.id.toString()
                        )
                      : null
                  }
                  onChange={handleChangeTecSelect}
                  className="text-black text-[13px]"
                  menuPlacement="top"
                />
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-muted/30 border-t flex flex-col sm:flex-row gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => setOpenUpdateTicket(false)}
                type="button"
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSubmitTicketEdit}
                type="submit"
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                Guardar Cambios
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE ELIMINACION */}
      <Dialog open={openDelete} onOpenChange={setOpenDelete}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-center">
              Confirmar Eliminación
            </DialogTitle>
            <DialogDescription className="text-center">
              ¿Está seguro que desea eliminar este servicio? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 flex justify-center items-center">
            <Alert className="" variant="destructive">
              <div className="flex justify-center items-center">
                <AlertCircle className="h-4 w-4" />
              </div>

              <AlertTitle className="text-center">Advertencia</AlertTitle>
              <AlertDescription className="text-center">
                Si hay clientes asociados a este servicio, se perderá la
                relación con ellos.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setOpenDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              className="w-full"
              variant="destructive"
              onClick={handleDeleteTicket}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE ABRIR CERRAR */}
      <Dialog open={openCloseTicket} onOpenChange={setOpenCloseTicket}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-center">Cerrar Ticket</DialogTitle>
            <DialogDescription className="text-center">
              Puedes añadir una nota antes de cerrar el ticket.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={ticketToEdit.title}
              onChange={(e) =>
                setTicketToEdit((prev) => ({
                  ...prev,
                  title: e.target.value,
                }))
              }
            />

            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={ticketToEdit.description}
              onChange={(e) =>
                setTicketToEdit((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />

            <Textarea
              placeholder="Escriba un comentario"
              className="min-h-[50px] resize-none pr-12 flex-1"
              value={formDataComent.descripcion}
              onChange={(e) =>
                setFormDataComent((previaData) => ({
                  ...previaData,
                  descripcion: e.target.value,
                }))
              }
            />
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setOpenCloseTicket(false)}
              type="button"
            >
              Cancelar
            </Button>
            <Button onClick={handleCloseTicket} type="submit" variant="default">
              Cerrar Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
