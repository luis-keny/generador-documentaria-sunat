import type { ConfigGroupedRow, ConfigRow, GuiaRowFlat, UbigeoRow } from "@/types/GRTE-data";
import type { Row } from "read-excel-file";

export function mapDataRowToGuia(row: Row): GuiaRowFlat {
  const getStr = (i: number) =>
    (row[i] === null || row[i] === undefined) ? null : String(row[i]).trim() || null;
  const getNum = (i: number) => {
    const v = row[i];
    if (v === null || v === undefined || v === '') return null;
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : null;
  };
  const getDate = (i: number): Date | null => {
    const v = row[i];
    if (v instanceof Date) return v;
    if (typeof v === 'string' && v) {
      const d = new Date(v);
      return isNaN(+d) ? null : d;
    }
    if (typeof v === 'number') {
      const d = new Date(Math.round((v - 25569) * 86400 * 1000)); // fecha Excel
      return isNaN(+d) ? null : d;
    }
    return null;
  };

  return {
    fechaTraslado: getDate(0),

    remitenteRazonSocial: getStr(1),
    remitenteUbigeo: getStr(2),
    remitenteDireccion: getStr(3),

    destinatarioRazonSocial: getStr(4),
    destinatarioUbigeo: getStr(5),
    destinatarioDireccion: getStr(6),

    placa: getStr(7),
    conductor: getStr(8),

    peso: getNum(9),
    unidadMedida: getStr(10),

    items: [
      {
        cantidad: getNum(11),
        unidad: getStr(12),
        descripcion: getStr(13),
      },
      {
        cantidad: getNum(14),
        unidad: getStr(15),
        descripcion: getStr(16),
      },
      {
        cantidad: getNum(17),
        unidad: getStr(18),
        descripcion: getStr(19),
      },
    ],
  };
}

export function mapConfigRow(row: Row): ConfigRow {
  const str = (i: number) =>
    (row[i] === null || row[i] === undefined) ? null : String(row[i]).trim() || null;
  const num = (i: number): string | number | null => {
    const v = row[i];
    if (v === null || v === undefined || v === '') return null;
    if (typeof v === 'number') return v;
    const n = Number(v);
    return Number.isFinite(n) ? n : String(v).trim();
  };

  return {
    conductor: {
      nombreCompleto: str(0),
      tipoDocumento: str(1),
      nroDocumento: num(2),
      licencia: str(3),
    },
    vehiculo: {
      placa: str(5),
      tucChv: str(6),
    },
    remitente: {
      razonSocial: str(8),
      tipoDocumento: str(9),
      numeroDocumento: num(10),
    },
    tienda: {
      razonSocial: str(12),
      tipoDocumento: str(13),
      numeroDocumento: num(14),
    },
  };
}

function mapUbigeoRow(row: Row): UbigeoRow {
  // Helper para convertir a string y limpiar
  const str = (i: number) =>
    (row[i] === null || row[i] === undefined) ? null : String(row[i]).trim() || null;

  const ubicacionCompleta = str(0); // "amazonas, chachapoyas, chachapoyas"
  const ubigeoId = str(1);          // "010101"

  // Separamos la ubicación en sus 3 componentes
  const parts = ubicacionCompleta 
    ? ubicacionCompleta.split(',').map(s => s.trim()) 
    : [];

  return {
    ubigeoId: ubigeoId,
    ubicacionCompleta: ubicacionCompleta,
    departamento: parts[0] || null,
    provincia: parts[1] || null,
    distrito: parts[2] || null,
  };
}

export function parseDataSheet(rows: Row[]): GuiaRowFlat[] {
  return rows.slice(2).map(mapDataRowToGuia);
}

export function parseConfigSheet(rows: Row[]): ConfigGroupedRow {
  const recopilated = rows.slice(1).map(mapConfigRow);
  return groupConfigData(recopilated);
}

export function parseUbigeoSheet(rows: Row[]): UbigeoRow[] {
  return rows.slice(1).map(mapUbigeoRow)
    .filter(item => item.ubigeoId && item.ubicacionCompleta);
}

export function groupConfigData(configRows: ConfigRow[]): ConfigGroupedRow {
  const groupedData: ConfigGroupedRow = {
    conductores: [],
    vehiculos: [],
    remitentes: [],
    tiendas: [],
  };

  return configRows.reduce((acc, currentRow) => {
    acc.conductores.push(currentRow.conductor);
    acc.vehiculos.push(currentRow.vehiculo);
    acc.remitentes.push(currentRow.remitente);
    acc.tiendas.push(currentRow.tienda);
    return acc;
  }, groupedData);
}
