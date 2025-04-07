import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { RutaCobroInterface } from "./RutaCobroInterface";
const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;
import MapsMapa from "./ClientesRutaMap";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  User,
  Phone,
  Calendar,
  CreditCard,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Coins,
  X,
  Loader2,
  Save,
  Building,
  Wallet,
  BadgeCheck,
  Download,
  Printer,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import currency from "currency.js";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useStoreCrm } from "@/Crm/ZustandCrm/ZustandCrmContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearMoneda = (monto: number) => {
  return currency(monto, {
    symbol: "Q",
    separator: ",",
    decimal: ".",
    precision: 2,
  }).format();
};

enum MetodoPagoFacturaInternet {
  EFECTIVO = "EFECTIVO",
  DEPOSITO = "DEPOSITO",
  TARJETA = "TARJETA",
  OTRO = "OTRO",
  PENDIENTE = "PENDIENTE",
  PAYPAL = "PAYPAL",
}

interface NuevoPago {
  facturaInternetId: number | null;
  clienteId: number | null;
  montoPagado: number;
  metodoPago: MetodoPagoFacturaInternet;
  cobradorId: number;
  numeroBoleta: string;
  rutaId: string | undefined;
}

function formatDate(date: string) {
  const formattedDate = dayjs(date);
  // Verifica si la fecha es válida
  if (!formattedDate.isValid()) {
    return "No registrado"; // O cualquier mensaje que quieras mostrar
  }

  return formattedDate.format("DD/MM/YYYY");
}

function RutaCobro() {
  const userId = useStoreCrm((state) => state.userIdCRM) ?? 0;
  const { rutaId } = useParams<{ rutaId: string }>();
  const [ruta, setRuta] = useState<RutaCobroInterface>();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [facturaSelected, setFacturaSelected] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openPayment, setOpenPayment] = useState(false);
  const [openPdfPago, setOpenPdfPago] = useState(false);

  const [nuevoPago, setNuevoPago] = useState<NuevoPago>({
    facturaInternetId: Number(facturaSelected) || 1,
    clienteId: Number(selectedClientId),
    montoPagado: 0,
    metodoPago: MetodoPagoFacturaInternet.EFECTIVO,
    cobradorId: userId,
    numeroBoleta: "",
    rutaId: rutaId,
  });

  const clientesToMap =
    ruta?.clientes?.map((c) => ({
      id: c.id,
      nombreCompleto: c.nombreCompleto,
      telefono: c.telefono,
      contactoReferencia: {
        nombre: c.contactoReferencia.nombre,
        telefono: c.contactoReferencia.telefono,
      },
      location: {
        lat: isNaN(c?.ubicacion?.latitud) ? 0 : c?.ubicacion?.latitud, // Verifica si la latitud es válida, si no, usa 0
        lng: isNaN(c?.ubicacion?.longitud) ? 0 : c?.ubicacion?.longitud, // Verifica si la longitud es válida, si no, usa 0
      },
      direccion: c.direccion,
      facturas: c.facturas.map((f) => ({
        id: f.id,
        montoPago: f.montoPago,
        estadoFactura: f.estadoFactura,
        saldoPendiente: f.saldoPendiente,
        creadoEn: f.creadoEn,
        detalleFactura: f.detalleFactura,
      })),
      imagenes:
        c.imagenes.length > 0
          ? c.imagenes
          : [
              "https://storeys.com/media-library/cheapest-house-canada.jpg?id=34014390&width=1245&height=700&quality=90&coordinates=0%2C31%2C0%2C31", // Imagen por defecto
              "https://ap.rdcpix.com/4796e084085ff4c8e1581d87cc4252b3l-m576673690rd-w480_h360.jpg", // Imagen por defecto
            ],
    })) || []; // Aquí se asegura de que siempre sea un arreglo vacío en caso de undefined

  const getRuta = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/ruta-cobro/get-one-ruta-cobro/${rutaId}`
      );

      if (response.status === 200) {
        setRuta(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("Error al conseguir datos");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getRuta();
  }, [rutaId]);

  const handleClientSelect = (clientId: number) => {
    setSelectedClientId(clientId);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">
            Cargando datos de la ruta...
          </p>
        </div>
      </div>
    );
  }

  if (!ruta) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Ruta no encontrada</CardTitle>
            <CardDescription>
              No se pudo encontrar la información de esta ruta de cobro.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => window.history.back()}>Volver</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "montoPagado") {
      setNuevoPago({
        ...nuevoPago,
        [name]: Number.parseFloat(value) || 0,
      });
    } else {
      setNuevoPago({
        ...nuevoPago,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setNuevoPago((prev) => ({
      ...prev,
      [name]: name === "cobradorId" ? Number.parseInt(value) : value,
    }));
  };

  const handleSubmitPago = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validaciones
      if (nuevoPago.montoPagado <= 0) {
        throw new Error("El monto pagado debe ser mayor a cero");
      }

      if (!nuevoPago.cobradorId) {
        throw new Error("Debe seleccionar un cobrador");
      }

      //   REVISAR EL MAPEO DE PAGOS, Y EL ESTADO DE LA FACTURA

      const dataToSend = {
        facturaInternetId: Number(facturaSelected),
        clienteId: Number(selectedClientId),
        montoPagado: nuevoPago.montoPagado,
        metodoPago: nuevoPago.metodoPago,
        cobradorId: Number(userId),
        numeroBoleta: nuevoPago.numeroBoleta,
        rutaId: Number(rutaId),
      };
      setOpenConfirm(true);

      console.log("La data enviada: ", dataToSend);
      // setTimeout(() => {

      // }, 1000);
      // En un entorno real, esto sería una llamada a la API
      const response = await axios.post(
        `${VITE_CRM_API_URL}/facturacion/create-new-payment-for-ruta`,
        dataToSend
      );

      if (response.status === 201) {
        toast.success("Pago registrado");
        setIsSubmitting(false);
        setOpenPayment(false);
        setNuevoPago({
          facturaInternetId: null,
          clienteId: null,
          montoPagado: 0,
          metodoPago: MetodoPagoFacturaInternet.EFECTIVO,
          cobradorId: userId,
          numeroBoleta: "",
          rutaId: rutaId,
        });
        setOpenConfirm(false);
        setSelectedClientId(null);
        // setFacturaSelected(null);
        getRuta();
        setOpenPdfPago(true);
      }
    } catch (err: any) {
      console.error("Error al registrar pago:", err);

      setIsSubmitting(false);
      toast.error("Porfavor verifique sus datos");
    }
  };

  return (
    <div className="container mx-auto py-4 space-y-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="flex flex-col space-y-4 lg:order-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">{ruta.nombreRuta}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center mt-1">
                      <User className="h-4 w-4 mr-1" />
                      <span>Cobrador: {ruta.cobrador.nombre}</span>
                    </div>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="ml-2">
                  {ruta.clientes.length} clientes
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>Creado: {formatDate(ruta.creadoEn)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Clientes en Ruta</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-350px)] px-4">
                <Accordion type="single" collapsible className="w-full">
                  {ruta.clientes.map((cliente) => (
                    <AccordionItem
                      key={cliente.id}
                      value={`cliente-${cliente.id}`}
                    >
                      <AccordionTrigger
                        className="py-3 px-2 hover:bg-accent rounded-md group"
                        onClick={() => handleClientSelect(cliente.id)}
                      >
                        <div className="flex flex-1 items-center justify-between pr-2">
                          <div className="flex items-center">
                            <div
                              className={cn(
                                "w-2 h-2 rounded-full mr-3",
                                cliente.saldo.saldoPendiente > 0
                                  ? "bg-destructive"
                                  : "bg-green-500"
                              )}
                            ></div>
                            <span>{cliente.nombreCompleto}</span>
                          </div>
                          <Badge
                            variant={
                              cliente.saldo.saldoPendiente > 0
                                ? "destructive"
                                : "outline"
                            }
                            className="ml-2"
                          >
                            {formatearMoneda(cliente.saldo.saldoPendiente)}
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2">
                        <div className="space-y-3 py-1">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            <div className="flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>{cliente.telefono}</span>
                            </div>
                            <div className="flex items-center text-sm">
                              <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>
                                Último pago:{" "}
                                {formatDate(cliente.saldo.ultimoPago)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center">
                              <Coins className="h-4 w-4 mr-2 text-green-500" />
                              <span>
                                Saldo a favor:{" "}
                                {formatearMoneda(cliente.saldo.saldoFavor)}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <CreditCard className="h-4 w-4 mr-2 text-destructive" />
                              <span>
                                Pendiente:{" "}
                                {formatearMoneda(cliente.saldo.saldoPendiente)}
                              </span>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Facturas pendientes
                            </h4>
                            {cliente.facturas.length > 0 ? (
                              <div className="space-y-2">
                                {cliente.facturas.map((factura) => (
                                  <div
                                    key={factura.id}
                                    className="bg-accent/50 p-2 rounded-md"
                                  >
                                    <div className="flex justify-between items-center">
                                      <div className="flex items-center">
                                        {factura.estadoFactura ===
                                        "pendiente" ? (
                                          <AlertCircle className="h-4 w-4 mr-2 text-amber-500" />
                                        ) : (
                                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                                        )}
                                        <span className="text-sm font-medium">
                                          Factura #{factura.id}
                                        </span>
                                      </div>
                                      <Badge
                                        className={`${
                                          factura.estadoFactura === "PENDIENTE"
                                            ? "bg-red-500"
                                            : factura.estadoFactura ===
                                              "PARCIAL"
                                            ? "bg-yellow-500"
                                            : "bg-green-500"
                                        }`}
                                      >
                                        {factura.estadoFactura}
                                      </Badge>
                                    </div>
                                    <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                      <div>
                                        Monto:{" "}
                                        {formatearMoneda(factura.montoPago)}
                                      </div>
                                      <div>
                                        Pendiente:{" "}
                                        {formatearMoneda(
                                          factura.saldoPendiente
                                        )}
                                      </div>
                                      <div>
                                        Fecha: {formatDate(factura.creadoEn)}
                                      </div>
                                    </div>
                                    <div className="mt-2 mb-6 flex">
                                      <Link
                                        to={`/crm/factura-pago/pago-servicio-pdf/${factura.id}`} // Aquí puedes poner la URL para imprimir la factura
                                        className="text-blue-600 hover:underline text-xs flex items-center gap-2 "
                                      >
                                        <Printer className="h-4 w-4" />
                                        Imprimir factura
                                      </Link>
                                    </div>
                                    <div className="mt-2">
                                      <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                          setOpenPayment(true);
                                          setSelectedClientId(cliente.id);
                                          setFacturaSelected(factura.id);
                                          setNuevoPago((previaData) => ({
                                            ...previaData,
                                            montoPagado: factura.saldoPendiente,
                                          }));
                                          setNuevoPago((previaData) => ({
                                            ...previaData,
                                            montoPagado: factura.saldoPendiente,
                                          }));
                                        }}
                                      >
                                        Registrar Pago
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">
                                No hay facturas pendientes
                              </div>
                            )}
                          </div>

                          <div className="pt-1">
                            {/* <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => handleClientSelect(cliente.id)}
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Ver en mapa
                            </Button> */}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sección del mapa - ahora siempre va después en móvil */}
        <div className="h-[400px] lg:h-full lg:order-2">
          {/* Altura fija para móvil, flexible en desktop */}
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Mapa de clientes en ruta
              </CardTitle>
              {/* <CardDescription>
                {selectedClientId ? (
                  <span>Mostrando ubicación del cliente seleccionado</span>
                ) : (
                  <span>Mostrando todos los clientes en la ruta</span>
                )}
              </CardDescription> */}
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <div className="h-full w-full">
                <MapsMapa clientes={clientesToMap} />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* DIALOG PARA EL COBRO Y OTROS */}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg border-0 shadow-lg">
          {/* Header with icon */}
          <DialogHeader className="pt-6 px-6 pb-2">
            <DialogTitle
              className="flex items-center gap-3 text-xl font-semibold
              justify-center 
              "
            >
              <div className="bg-amber-100 dark:bg-gray-900 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-rose-500" />
              </div>
              Confirmación de Pago
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 mb-5 bg-gray-50 dark:bg-gray-800 ">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100 text-center">
                ¿Estás seguro de que deseas registrar este pago con estos datos?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Por favor, revisa cuidadosamente los datos antes de proceder.
              </p>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 pb-2">
              <Button
                variant={"outline"}
                onClick={() => setOpenConfirm(false)}
                className="border w-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg py-2 hover:text-white "
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                variant={"outline"}
                onClick={handleSubmitPago}
                className="bg-teal-600 text-white w-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg py-2 hover:text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Registrar Pago
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG PARA HACER PAGO */}
      <Dialog open={openPayment} onOpenChange={setOpenPayment}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg border-0 shadow-lg">
          {/* Header with icon */}
          <DialogHeader className="pt-6 px-1 pb-2">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold justify-center">
              <div className="bg-amber-100 dark:bg-gray-900 p-2 rounded-full">
                <AlertCircle className="h-5 w-5 text-rose-500" />
              </div>
              Registro de Pago
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-1">
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 mb-5 bg-gray-50 dark:bg-gray-800">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100 text-center">
                Ingresa los datos del pago
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Por favor, completa todos los campos requeridos.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="montoPagado">Monto a Pagar</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    Q
                  </span>
                  <Input
                    id="montoPagado"
                    name="montoPagado"
                    type="number"
                    placeholder="0.00"
                    className="pl-8"
                    value={nuevoPago.montoPagado || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Método de Pago */}
              <div className="space-y-2">
                <Label htmlFor="metodoPago">Método de Pago</Label>
                <Select
                  onValueChange={(value) =>
                    handleSelectChange("metodoPago", value)
                  }
                  defaultValue={nuevoPago.metodoPago}
                >
                  <SelectTrigger id="metodoPago" className="w-full">
                    <SelectValue placeholder="Seleccione un método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={MetodoPagoFacturaInternet.EFECTIVO}>
                      <div className="flex items-center">
                        <Coins className="h-4 w-4 mr-2" />
                        Efectivo
                      </div>
                    </SelectItem>
                    <SelectItem value={MetodoPagoFacturaInternet.DEPOSITO}>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Depósito
                      </div>
                    </SelectItem>
                    <SelectItem value={MetodoPagoFacturaInternet.TARJETA}>
                      <div className="flex items-center">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Tarjeta
                      </div>
                    </SelectItem>
                    <SelectItem value={MetodoPagoFacturaInternet.PAYPAL}>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        PayPal
                      </div>
                    </SelectItem>
                    <SelectItem value={MetodoPagoFacturaInternet.OTRO}>
                      <div className="flex items-center">
                        <Wallet className="h-4 w-4 mr-2" />
                        Otro
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Número de Boleta - Solo si es DEPOSITO */}
              {nuevoPago.metodoPago === MetodoPagoFacturaInternet.DEPOSITO && (
                <div className="space-y-2">
                  <Label htmlFor="numeroBoleta">Número de Boleta</Label>
                  <Input
                    id="numeroBoleta"
                    name="numeroBoleta"
                    placeholder="Ingrese el número de boleta"
                    value={nuevoPago.numeroBoleta}
                    onChange={handleInputChange}
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 pb-2">
              <Button
                variant="outline"
                onClick={() => setOpenPayment(false)}
                className="border w-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg py-2 hover:text-white"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenConfirm(true);
                  setOpenPayment(false);
                }}
                className="bg-teal-600 text-white w-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg py-2 hover:text-white"
              >
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Registrar Pago
                </>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG DE PAGO HECHO */}
      <Dialog open={openPdfPago} onOpenChange={setOpenPdfPago}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-lg border-0 shadow-lg">
          {/* Header with icon */}
          <DialogHeader className="pt-6 px-6 pb-2">
            <DialogTitle
              className="flex items-center gap-3 text-xl font-semibold
                    justify-center 
                    "
            >
              <div className="bg-blue-100 dark:bg-gray-900 p-2 rounded-full">
                <BadgeCheck className="h-5 w-5 text-green-500" />
              </div>
              Pago registrado exitosamente
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4">
            <div className="border border-gray-200 dark:border-gray-800 rounded-md p-4 mb-5 bg-gray-50 dark:bg-gray-800 ">
              <h3 className="font-medium mb-2 text-gray-900 dark:text-gray-100 text-center">
                ¿Desea imprimir su comprobante?
              </h3>
            </div>

            <div className="h-px bg-gray-200 dark:bg-gray-800 my-4"></div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 pb-2">
              <Button
                variant={"outline"}
                onClick={() => setOpenPdfPago(false)}
                className="border w-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-600 rounded-lg py-2 hover:text-white "
              >
                <X className="mr-2 h-4 w-4" />
                Mantenerse
              </Button>
              <Link
                to={`/crm/factura-pago/pago-servicio-pdf/${facturaSelected}`}
              >
                <Button
                  onClick={() => setOpenPdfPago(false)}
                  variant={"outline"}
                  className="bg-teal-600 text-white w-full hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg py-2 hover:text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Conseguir comprobante
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RutaCobro;
