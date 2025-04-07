import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { toast } from "sonner";
import { CalendarIcon, FileText, X } from "lucide-react";
const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;

interface DataGenerateFactura {
  mes: number | null;
  anio: number | null;
  clienteId: number | null;
}

interface DialogProps {
  openGenerarFactura: false | true;
  setOpenGenerarFactura: (value: boolean) => void;
  // handleGenerateFactura: () => void;
  clienteId: number | null;
  getClienteDetails: () => void;
}

function FacturaGenerateDialog({
  openGenerarFactura,
  setOpenGenerarFactura,
  clienteId,
  getClienteDetails,
}: DialogProps) {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date | null>(null);

  const [dataGenerarFactura, setDataGenerarFactura] =
    useState<DataGenerateFactura>({
      anio: null,
      clienteId: clienteId,
      mes: null,
    });

  console.log("El objeto es: ", dataGenerarFactura);
  console.log("El clienteId es: ", clienteId);

  const handleDateChange = (date: Date | null) => {
    setFechaSeleccionada(date); // Actualizamos el estado correctamente cuando se limpia el campo
    if (date) {
      const mes = date.getMonth() + 1;
      const anio = date.getFullYear();
      setDataGenerarFactura((previaData) => ({
        ...previaData,
        anio: anio,
        mes: mes,
      }));
    } else {
      // Si se limpia la fecha, actualizamos mes y año a null
      setDataGenerarFactura((previaData) => ({
        ...previaData,
        anio: null,
        mes: null,
      }));
    }
  };

  const handleSubmit = async () => {
    if (!clienteId || clienteId === 0) {
      toast.error("No se ha proporcionado un cliente válido.");
      return;
    }

    if (!fechaSeleccionada) return;

    const mes = fechaSeleccionada.getMonth() + 1; // getMonth() devuelve 0 para enero, por eso sumamos 1
    const anio = fechaSeleccionada.getFullYear();

    const data = {
      clienteId: clienteId,
      mes: mes,
      anio: anio,
    };

    try {
      const response = await axios.post(
        `${VITE_CRM_API_URL}/facturacion/generate-factura-internet`,
        data
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Factura Generada");
        setOpenGenerarFactura(false);
        setFechaSeleccionada(null);
        await getClienteDetails();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al generar factura");
    }
  };

  console.log("La fecha seleccionada: ", fechaSeleccionada);
  console.log("el objeto es: ", dataGenerarFactura);

  return (
    <Dialog open={openGenerarFactura} onOpenChange={setOpenGenerarFactura}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Generar factura de servicio de internet</span>
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Genere una factura pasada o futura
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-1.5">
          <Label htmlFor="fecha" className="text-sm font-medium">
            Mes de pago
          </Label>
          <div className="relative">
            <DatePicker
              id="fecha"
              locale={es}
              selected={fechaSeleccionada || null}
              onChange={handleDateChange}
              selectsStart
              placeholderText="Seleccione mes y año"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-10"
              dateFormat="MM/yyyy"
              isClearable={true}
              showMonthYearPicker
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setOpenGenerarFactura(false)}
          >
            <X className="h-4 w-4" />
            <span>Cerrar</span>
          </Button>

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSubmit}
          >
            <FileText className="h-4 w-4" />
            <span>Generar Factura</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default FacturaGenerateDialog;
