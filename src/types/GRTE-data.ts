export type ExcelCell = string | number | Date | null;

export interface GuiaRowFlat {
  fechaTraslado: Date | null;
  remitenteRazonSocial: string | null;
  remitenteUbigeo: string | null;
  remitenteDireccion: string | null;
  destinatarioRazonSocial: string | null;
  destinatarioUbigeo: string | null;
  destinatarioDireccion: string | null;
  placa: string | null;
  conductor: string | null;
  peso: number | null;
  unidadMedida: string | null;
  items: ItemConfig[];
}

export interface ItemConfig {
  cantidad: number | null;
  unidad: string | null;
  descripcion: string | null;
}

export interface ConductorConfig {
  nombreCompleto: string | null;
  tipoDocumento: string | null;
  nroDocumento: string | number | null;
  licencia: string | null;
}

export interface VehiculoConfig {
  placa: string | null;
  tucChv: string | null;
}

export interface RemitenteConfig {
  razonSocial: string | null;
  tipoDocumento: string | null;
  numeroDocumento: string | number | null;
}

export interface TiendaConfig {
  razonSocial: string | null;
  tipoDocumento: string | null;
  numeroDocumento: string | number | null;
}

export interface ConfigRow {
  conductor: ConductorConfig;
  vehiculo: VehiculoConfig;
  remitente: RemitenteConfig;
  tienda: TiendaConfig;
}