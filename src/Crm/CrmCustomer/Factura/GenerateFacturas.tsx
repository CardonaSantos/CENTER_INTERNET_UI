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
  mesInicio: number | null;
  mesFin: number | null;
  anio: number | null;
  clienteId: number | null;
}

interface DialogProps {
  openGenerateFacturas: false | true;
  setOpenGenerateFacturas: (value: boolean) => void;
  clienteId: number | null;
  getClienteDetails: () => void;
}

function GenerateFacturas({
  openGenerateFacturas,
  setOpenGenerateFacturas,
  clienteId,
  getClienteDetails,
}: DialogProps) {
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);

  const [dataGenerarFactura, setDataGenerarFactura] =
    useState<DataGenerateFactura>({
      anio: null,
      clienteId: clienteId,
      mesInicio: null,
      mesFin: null,
    });

  const handleDateChange = (type: "inicio" | "fin", date: Date | null) => {
    if (type === "inicio") {
      setFechaInicio(date);
      if (date) {
        setDataGenerarFactura((previaData) => ({
          ...previaData,
          anio: date.getFullYear(),
          mesInicio: date.getMonth() + 1, // Ajustar mes
        }));
      }
    } else if (type === "fin") {
      setFechaFin(date);
      if (date) {
        setDataGenerarFactura((previaData) => ({
          ...previaData,
          mesFin: date.getMonth() + 1, // Ajustar mes
        }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!clienteId || clienteId === 0) {
      toast.error("No se ha proporcionado un cliente válido.");
      return;
    }

    if (!fechaInicio || !fechaFin) {
      toast.error("Por favor, seleccione el rango de meses.");
      return;
    }

    const data = {
      clienteId: clienteId,
      mesInicio: dataGenerarFactura.mesInicio,
      mesFin: dataGenerarFactura.mesFin,
      anio: dataGenerarFactura.anio,
    };

    console.log("La data generada es: ", data);

    try {
      const response = await axios.post(
        `${VITE_CRM_API_URL}/facturacion/generate-factura-internet-multiple`,
        data
      );

      if (response.status === 200 || response.status === 201) {
        toast.success("Facturas Generadas");
        setOpenGenerateFacturas(false);
        setFechaInicio(null);
        setFechaFin(null);
        await getClienteDetails();
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al generar facturas");
    }
  };

  return (
    <Dialog open={openGenerateFacturas} onOpenChange={setOpenGenerateFacturas}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-center flex items-center justify-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>Generar facturas por adelantado</span>
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Genere múltiples facturas para los meses seleccionados
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-1.5">
          <Label htmlFor="fechaInicio" className="text-sm font-medium">
            Mes de inicio
          </Label>
          <div className="relative">
            <DatePicker
              id="fechaInicio"
              locale={es}
              selected={fechaInicio || null}
              onChange={(date) => handleDateChange("inicio", date)}
              selectsStart
              placeholderText="Seleccione mes de inicio"
              className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring pr-10"
              dateFormat="MM/yyyy"
              isClearable={true}
              showMonthYearPicker
            />
            <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div className="py-4 space-y-1.5">
          <Label htmlFor="fechaFin" className="text-sm font-medium">
            Mes de fin
          </Label>
          <div className="relative">
            <DatePicker
              id="fechaFin"
              locale={es}
              selected={fechaFin || null}
              onChange={(date) => handleDateChange("fin", date)}
              selectsEnd
              placeholderText="Seleccione mes de fin"
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
            onClick={() => setOpenGenerateFacturas(false)}
          >
            <X className="h-4 w-4" />
            <span>Cerrar</span>
          </Button>

          <Button
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSubmit}
          >
            <FileText className="h-4 w-4" />
            <span>Generar Facturas</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default GenerateFacturas;
