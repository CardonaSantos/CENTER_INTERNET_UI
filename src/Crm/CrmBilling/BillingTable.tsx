"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
// import { Edit } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { CreditCard, File, FileCheck } from "lucide-react";
import { FacturacionZona } from "../CrmFacturacion/FacturacionZonaTypes";
import ReactSelectComponent from "react-select";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";

dayjs.extend(utc);
dayjs.extend(localizedFormat);
dayjs.locale("es");

const formatearFecha = (fecha: string) => {
  // Formateo en UTC sin conversión a local
  return dayjs(fecha).format("DD/MM/YYYY");
};

type Factura = {
  id: number;
  metodo: string;
  estado: EstadoFactura;
  cliente: string;
  clienteId: number;
  direccionIp: string;
  cantidad: number;
  fechaCreado: string;
  fechaPago: string;
  por: string;
  telefono: number;
  facturacionZonaId?: number;
};

enum EstadoFactura {
  PENDIENTE = "PENDIENTE",
  PAGADA = "PAGADA",
  VENCIDA = "VENCIDA",
  ANULADA = "ANULADA",
  PARCIAL = "PARCIAL",
}

interface FacturacionData {
  cobrados: number | null;
  facturados: number | null;
  porCobrar: number | null;
}

// **Definir columnas de la tabla**
const columns: ColumnDef<Factura>[] = [
  { accessorKey: "id", header: "ID" },
  // { accessorKey: "metodo", header: "Metódo" },
  { accessorKey: "cliente", header: "Cliente" },
  { accessorKey: "cantidad", header: "Cantidad" },
  { accessorKey: "fechaCreado", header: "Fecha Creado" },
  { accessorKey: "fechaPago", header: "Fecha de Pago" },
  { accessorKey: "telefono", header: "Tel." },

  { accessorKey: "estado", header: "Estado" },
];
const VITE_CRM_API_URL = import.meta.env.VITE_CRM_API_URL;
interface OptionSelected {
  value: string;
  label: string;
}

export default function BilingTable() {
  const [filter, setFilter] = useState("");
  const [facturas, setFactuas] = useState<Factura[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 }); // 🔥 FIX: Agregamos pageIndex

  const [facutracionData, setFacturacionData] = useState<FacturacionData>({
    cobrados: null,
    facturados: null,
    porCobrar: null,
  });

  const [zonasFacturacion, setZonasFacturacion] = useState<FacturacionZona[]>(
    []
  );

  const [zonasFacturacionSelected, setZonasFacturacionSelected] = useState<
    string | null
  >(null);

  const optionsZonasFacturacion: OptionSelected[] = zonasFacturacion
    .sort((a, b) => {
      const numA = parseInt(a.nombre.match(/\d+/)?.[0] || "0");
      const numB = parseInt(b.nombre.match(/\d+/)?.[0] || "0");
      return numA - numB;
    })
    .map((zona) => ({
      value: zona.id.toString(),
      label: `${zona.nombre} Clientes: (${zona.clientesCount}) Facturas: (${zona.facturasCount})`,
    }));

  const handleSelectZonaFacturacion = (
    selectedOption: OptionSelected | null
  ) => {
    setZonasFacturacionSelected(selectedOption ? selectedOption.value : null);
  };

  console.log("Las facturas son: ", facturas);

  const getFacturas = async () => {
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/facturacion/facturacion-to-table`
      );

      if (response.status === 200) {
        setFactuas(response.data.facturasMapeadas);
        setFacturacionData({
          cobrados: response.data.cobrados,
          facturados: response.data.facturados,
          porCobrar: response.data.porCobrar,
        });
      }
    } catch (error) {
      console.log(error);
      toast.error("Error al conseguir facturación");
    }
  };

  const getFacturacionZona = async () => {
    try {
      const response = await axios.get(
        `${VITE_CRM_API_URL}/facturacion-zona/get-zonas-facturacion-to-customer`
      );

      if (response.status === 200) {
        setZonasFacturacion(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.info("Error al conseguir servicios wifi");
    }
  };

  useEffect(() => {
    getFacturas();
    getFacturacionZona();
  }, []);

  const opcionesEstadoFactura = [
    "TODOS",
    "PENDIENTE",
    "PAGADA",
    "VENCIDA",
    "ANULADA",
    "PARCIAL",
  ];

  // Tipos para las fechas
  type DateRange = {
    startDate: Date | undefined;
    endDate: Date | undefined;
  };

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: undefined,
    endDate: undefined,
  });

  const [estadoFactura, setEstadoFactura] = useState<string>("");
  const handleSelectEstadoFactura = (estado: EstadoFactura) => {
    setEstadoFactura(estado);
  };
  console.log("El estado de la factura es: ", estadoFactura);

  const filteredFacturas = useMemo(() => {
    return facturas.filter((factura) => {
      // Filtros existentes
      const matchesZona = zonasFacturacionSelected
        ? factura?.facturacionZonaId === Number(zonasFacturacionSelected)
        : true;

      const matchesEstado =
        estadoFactura === "TODOS" || estadoFactura === ""
          ? true
          : factura?.estado === estadoFactura;

      // Nuevo filtro de fechas
      const matchesDate = () => {
        if (!dateRange.startDate && !dateRange.endDate) return true;

        const invoiceDate = new Date(factura.fechaPago); // Asegúrate que factura.fecha sea un Date válido
        const start = dateRange.startDate ?? new Date(0);
        const end = dateRange.endDate ?? new Date();

        return invoiceDate >= start && invoiceDate <= end;
      };

      return matchesZona && matchesEstado && matchesDate();
    });
  }, [facturas, zonasFacturacionSelected, estadoFactura, dateRange]); // Añadir dateRange como dependencia
  // **Configuración de la tabla**
  const table = useReactTable({
    data: filteredFacturas,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter: filter,
      pagination,
    },
    onGlobalFilterChange: setFilter,
    onPaginationChange: setPagination,
    globalFilterFn: (row, columnId, value) => {
      console.log(columnId);
      //tomar el row, la columnaId y el valor del input de la tabla
      const search = value.toLowerCase().trim(); //input
      const cliente = row.original as Factura; //tomamos de donde vamos a filtrar

      return (
        (cliente.telefono || "")
          .toString()
          .toLocaleLowerCase()
          .includes(search) ||
        (cliente.id || "").toString().toLocaleLowerCase().includes(search) ||
        (cliente.cliente || "")
          .toString()
          .toLocaleLowerCase()
          .includes(search) ||
        (cliente.metodo || "")
          .toString()
          .toLocaleLowerCase()
          .includes(search) ||
        (cliente.direccionIp || "")
          .toString()
          .toLocaleLowerCase()
          .includes(search) ||
        (cliente.por || "").toString().toLocaleLowerCase().includes(search)
      );
    },
  });

  const cobrados = facturas.filter((fac) => {
    return !["PENDIENTE", "PARCIAL", "VENCIDA", "ANULADA"].includes(fac.estado);
  });

  const facturados = facturas.filter((fac) => fac.estado !== "PAGADA");
  console.log("Los facturados sin aun pagar son: ", facturados);

  console.log("Los facturados son: ", cobrados);

  return (
    <Card className="max-w-full shadow-lg border border-gray-300 text-xs">
      <CardContent>
        <div className="flex justify-between items-center mb-4"></div>
        {/* **Campo de Búsqueda** */}
        <Input
          style={{ boxShadow: "none" }}
          type="text"
          placeholder="Buscar por nombre, telefono o ip"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="mb-3 text-xs px-2 py-1 border-2"
        />

        {/* **Selector de Cantidad de Filas** */}
        <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
          {/* Left icons */}
          <div className="flex flex-wrap items-center font-semibold gap-x-4 gap-y-2">
            <div className="flex items-center">
              <File className="h-5 w-5 mr-2 dark:text-white" />
              <span>Facturados: {facutracionData.facturados}</span>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 dark:text-white" />
              <span>Cobrados: {facutracionData.cobrados}</span>
            </div>
            <div className="flex items-center">
              <FileCheck className="h-5 w-5 mr-2 dark:text-white" />
              <span>Por Cobrar: {facutracionData.porCobrar}</span>
            </div>
          </div>

          {/* Right selects */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Left column - Date filters */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Rango de fechas</label>
              <div className="flex flex-wrap gap-2">
                <DatePicker
                  locale={es}
                  selected={dateRange.startDate || null}
                  onChange={(date: Date | null) =>
                    setDateRange((prev) => ({
                      ...prev,
                      startDate: date || undefined,
                    }))
                  }
                  selectsStart
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  placeholderText="Fecha inicial"
                  className="h-9 w-full min-w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />

                <DatePicker
                  selected={dateRange.endDate || null}
                  onChange={(date: Date | null) =>
                    setDateRange((prev) => ({
                      ...prev,
                      endDate: date || undefined,
                    }))
                  }
                  selectsEnd
                  startDate={dateRange.startDate}
                  endDate={dateRange.endDate}
                  minDate={dateRange.startDate}
                  placeholderText="Fecha final"
                  className="h-9 w-full min-w-[140px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  dateFormat="dd/MM/yyyy"
                  isClearable
                />
              </div>
            </div>

            {/* Select de zonas (React Select) */}
            <ReactSelectComponent
              isClearable
              placeholder="Ordenar por facturación zona"
              className="w-72 text-black text-sm"
              options={optionsZonasFacturacion}
              onChange={handleSelectZonaFacturacion}
              value={
                zonasFacturacionSelected
                  ? {
                      value: zonasFacturacionSelected,
                      label:
                        zonasFacturacion.find(
                          (s) => s.id.toString() === zonasFacturacionSelected
                        )?.nombre || "",
                    }
                  : null
              }
            />
            {/* Select de ShadCN (Nuevo filtro) */}
            <Select onValueChange={handleSelectEstadoFactura}>
              <SelectTrigger className="w-48 text-xs">
                <SelectValue placeholder="Estado Factura" />
              </SelectTrigger>
              <SelectContent>
                {opcionesEstadoFactura.map((state) => (
                  <SelectGroup>
                    <SelectItem value={state}>{state}</SelectItem>
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>

            {/* Select de tamaño de página */}
            <Select
              onValueChange={(value) =>
                setPagination({ ...pagination, pageSize: Number(value) })
              }
              defaultValue={String(pagination.pageSize)}
            >
              <SelectTrigger className="w-32 text-xs">
                <SelectValue placeholder="Items por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* **Tabla** */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-xs">
            <thead className="bg-gray-100 dark:bg-gray-800">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-2 py-1 border font-semibold"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <motion.tr
                  key={row.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ type: "spring", stiffness: 120, damping: 22 }}
                  className="hover:bg-gray-200 dark:hover:bg-gray-700 border-b border-gray-300"
                >
                  <td className="px-2 py-1 text-center">{row.original.id}</td>
                  {/* <td className="px-2 py-1 truncate max-w-[120px] whitespace-nowrap">
                    {row.original.metodo}
                  </td> */}
                  <Link
                    to={`/crm/cliente/${row.original.clienteId}`}
                    className="contents"
                  >
                    <td className="px-2 py-1 truncate max-w-[100px] hover:underline">
                      {row.original.cliente}
                    </td>
                  </Link>
                  <td className="px-2 py-1 truncate max-w-[150px] whitespace-nowrap">
                    {row.original.cantidad}
                  </td>
                  <td className="px-2 py-1 truncate max-w-[120px] whitespace-nowrap">
                    {formatearFecha(row.original.fechaCreado)}
                  </td>

                  <Link to={`/crm/facturacion/pago-factura/${row.original.id}`}>
                    <td className="px-2 py-1 truncate max-w-[120px] whitespace-nowrap hover:underline">
                      {formatearFecha(row.original.fechaPago)}
                    </td>
                  </Link>

                  <td className="px-2 py-1 truncate max-w-[100px] whitespace-nowrap">
                    {row.original.telefono ? row.original.telefono : "Sin tel."}
                  </td>

                  <td className="px-2 py-1 truncate max-w-[100px] whitespace-nowrap">
                    {row.original.por ? row.original.estado : "Sin cobrar"}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* **Controles de Paginación** */}
        <div className="flex justify-between items-center mt-3 text-xs">
          <Button
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1"
          >
            Anterior
          </Button>

          <span>
            Página {pagination.pageIndex + 1} de {table.getPageCount()}
          </span>

          <Button
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1"
          >
            Siguiente
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
