// Tipado para la información de un vehículo
interface Vehiculo {
  placa: string;
  certificadoHabilitacion: string;
  numeroAutorizacion: string;
  entidadAutorizacion: string;
}

// Tipado para la información de un conductor
interface Conductor {
  tipoDocumento: string; // e.g., "1" para DNI
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  numeroLicencia: string;
  categoria: string; // e.g., "Principal"
}

// Tipado para un punto geográfico (partida o llegada)
interface Ubicacion {
  codigoUbigeo: string;
  direccion: string;
  departamento: string;
  provincia: string;
  distrito: string;
}

// Tipado para cada ítem de la guía
interface Item {
  numero: number;
  cantidad: number;
  unidadMedida: string; // e.g., "ZZ" para servicio, "NIU" para unidad
  descripcion: string;
  codigoProducto: string;
  valorUnitario: number;
  valorTotal: number;
}

// Tipado principal para el objeto de la Guía de Remisión
export interface GRTESimpleDocumentBody {
  documento: {
    serie: string;
    correlativo: string;
    fechaEmision: string; // Formato "YYYY-MM-DD"
    fechaInicioTraslado: string; // Formato "YYYY-MM-DD"
    tipoDocumento: string; // e.g., "31" para Guía de Remisión
  };
  remitente: {
    tipoDocumento: string; // e.g., "6" para RUC
    numeroDocumento: string;
    razonSocial: string;
    direccion: string;
  };
  destinatario: {
    tipoDocumento: string; // e.g., "6" para RUC
    numeroDocumento: string;
    razonSocial: string;
  };
  transporte: {
    modalidad: string;
    registroMTC?: string; // Opcional
    pesoTotal: number;
    unidadPeso: string; // e.g., "TNE" para toneladas
  };
  vehiculos: Vehiculo[];
  conductores: Conductor[];
  ubicaciones: {
    puntoPartida: Ubicacion;
    puntoLlegada: Ubicacion;
  };
  items: Item[];
  observaciones?: string; // Opcional
  referencia?: string; // Opcional
}

export interface GRTESimpleDocument {
  personaId: string;
  personaToken: string;
  fileName: string;
  documentBody: GRTESimpleDocumentBody;
  customerEmail?: string;
}