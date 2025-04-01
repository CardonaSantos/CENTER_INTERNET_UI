export interface ClienteDto {
  id: number;
  nombreCompleto: string;
  // nombreCompleto: string;

  telefono: string;
  dpi: string;
  direccion: string;
  creadoEn: string;
  actualizadoEn: Date;
  departamento: string;
  municipio: string;
  direccionIp: string;
  servicios: ServicioInternetDto[];
  facturacionZona: string;
  facturacionZonaId: number;
}

export interface ServicioInternetDto {
  id: number;
  nombreServicio: string;
  velocidad: string;
  precio: number;
  estado: string;
  creadoEn: Date;
  actualizadoEn: Date;
}
