import { PDFViewer } from "@react-pdf/renderer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import ReparacionComprobante from "./ReparacionComprobante";
import { Reparacion } from "@/Pages/Reparaciones/RepairRegisType";
const API_URL = import.meta.env.VITE_API_URL;

function ReparacionPage1() {
  // Obtén el parámetro id de la URL
  const { id } = useParams();
  const [reparacion, setReparacioin] = useState<Reparacion>();

  useEffect(() => {
    const getTicketFormar = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/repair/repair-to-pdf/${id}`
        );
        if (response.status === 200) {
          setReparacioin(response.data);
        }
      } catch (error) {
        console.log(error);
        toast.error("Error al conseguir modelo de ticket");
      }
    };
    if (id) {
      getTicketFormar();
    }
  }, [id]);

  console.log("El registro de garantía es: ", reparacion);

  return (
    <div>
      {reparacion ? (
        <PDFViewer width="100%" height="600">
          <ReparacionComprobante reparacion={reparacion} />
        </PDFViewer>
      ) : (
        <p className="text-center font-extrabold text-xl">Cargando PDF</p>
      )}
    </div>
  );
}

export default ReparacionPage1;
