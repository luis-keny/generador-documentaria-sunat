import type { ConfigGroupedRow, GuiaRowFlat, UbigeoRow } from '@/types/GRTE-data';
import type { GRTEDocumentBody } from '@/types/GRTE-document-body'; // Ajusta la ruta según tu proyecto

// Diccionario de tipo de documento según tu especificación
const TIPO_DOC_EMPRESA: Record<string, string> = {
  'RUC': '6',
  'DNI': '1'
};

const TIPO_DOC_PERSONA: Record<string, string> = {
  'DNI': '7',
  'Pasaporte': '8',
  'Carnet extrangeria': '4'
};

// Diccionario de unidades de medida (catálogo estándar SUNAT)
const UNIDADES_MEDIDA: Record<string, string> = {
  'Kilogramos': 'KGM',
  'Toneladas': 'TNE',
  'Gramos': 'GRM',
  'Unidades': 'NIU',
  'Servicios': 'ZZ'
};

/**
 * Convierte ubigeo en formato texto a código de 6 dígitos
 */
function buscarCodigoUbigeo(ubigeoTexto: string | null, ubigeos: UbigeoRow[]): string {
  if (!ubigeoTexto) return '150101'; // Default: Lima, Lima, Lima
  
  const ubigeoNormalizado = ubigeoTexto.toLowerCase().trim();
  const ubigeoEncontrado = ubigeos.find(u => {
    if(!u.ubicacionCompleta) return false;
    return u.ubicacionCompleta.toLowerCase() === ubigeoNormalizado
  });
  
  return ubigeoEncontrado?.ubigeoId || '150101';
}

/**
 * Extrae el primer nombre y apellido del nombre completo
 */
function parsearNombreConductor(nombreCompleto: string): { nombres: string; apellidos: string } {
  const partes = nombreCompleto.split(',').map(p => p.trim());
  if (partes.length === 2) {
    return {
      apellidos: partes[0],
      nombres: partes[1]
    };
  }
  
  // Fallback: asumir que todo es apellido
  return {
    apellidos: nombreCompleto,
    nombres: ''
  };
}

/**
 * Genera el GRTEDocumentBody a partir de los datos recopilados
 */
export function generarGRTEDocumentBody(
  datosTraspaso: GuiaRowFlat,
  ConfigGroupedRow: ConfigGroupedRow,
  ubigeos: UbigeoRow[],
  serie: string = 'T001',
  correlativo: number = 1
): GRTEDocumentBody {
  
  // Validar datos mínimos requeridos
  if (!datosTraspaso.fechaTraslado) {
    throw new Error('La fecha de traslado es obligatoria');
  }
  
  // Buscar remitente
  const remitente = ConfigGroupedRow.remitentes.find(r => 
    r.razonSocial === datosTraspaso.remitenteRazonSocial
  );
  if (!remitente || !remitente.numeroDocumento) {
    throw new Error('No se encontró información del remitente');
  }
  
  // Buscar destinatario
  const destinatario = ConfigGroupedRow.tiendas.find(t => 
    t.razonSocial === datosTraspaso.destinatarioRazonSocial
  );
  if (!destinatario || !destinatario.numeroDocumento) {
    throw new Error('No se encontró información del destinatario');
  }
  
  // Buscar conductor
  const conductor = ConfigGroupedRow.conductores.find(c => 
    c.nombreCompleto === datosTraspaso.conductor
  );
  if (!conductor) {
    throw new Error('No se encontró información del conductor');
  }

  if (!conductor.nombreCompleto || !conductor.nombreCompleto.includes(',')) {
    throw new Error('El nombre del conductor no es válido')
  }

  if (!conductor.tipoDocumento || !TIPO_DOC_PERSONA[conductor.tipoDocumento]) {
    throw new Error('El tipo de documento del conductor no es válido')
  }

  if (!conductor.nroDocumento || !/^\d+$/.test(conductor.nroDocumento.toString())) {
    throw new Error('El número de documento del conductor no es válido')
  }

  if (!conductor.licencia) {
    throw new Error('La licencia del conductor es obligatoria')
  }
  
  // Buscar vehículo
  const vehiculo = ConfigGroupedRow.vehiculos.find(v => 
    v.placa === datosTraspaso.placa
  );
  if (!vehiculo || !vehiculo.tucChv) {
    throw new Error('No se encontró información del vehículo');
  }
  
  // Procesar fecha y hora
  const fechaTraslado = new Date(datosTraspaso.fechaTraslado);
  const fechaEmision = new Date();
  
  const conductorParseado = parsearNombreConductor(conductor.nombreCompleto);
  const ubigeoPartida = buscarCodigoUbigeo(datosTraspaso.remitenteUbigeo, ubigeos);
  const ubigeoLlegada = buscarCodigoUbigeo(datosTraspaso.destinatarioUbigeo, ubigeos);
  
  // Construir el documento
  const documentBody: GRTEDocumentBody = {
    "cbc:UBLVersionID": { _text: "2.1" },
    "cbc:CustomizationID": { _text: "2.0" },
    "cbc:ID": { _text: `${serie}-${correlativo.toString().padStart(8, '0')}` },
    "cbc:IssueDate": { _text: fechaEmision.toISOString().split('T')[0] },
    "cbc:IssueTime": { 
      _text: fechaEmision.toISOString().split('T')[1].substring(0, 8) 
    },
    "cbc:DespatchAdviceTypeCode": { _text: "09" }, // 09: Traslado por emisor
    
    // Remitente
    "cac:DespatchSupplierParty": {
      "cac:Party": {
        "cac:PartyIdentification": {
          "cbc:ID": {
            _attributes: { 
              schemeID: TIPO_DOC_EMPRESA[remitente.tipoDocumento || 'RUC'] || '6' 
            },
            _text: remitente.numeroDocumento.toString()
          }
        },
        "cac:PartyLegalEntity": {
          "cbc:RegistrationName": { _text: remitente.razonSocial || '' },
          "cac:RegistrationAddress": {
            "cac:AddressLine": {
              "cbc:Line": { _text: datosTraspaso.remitenteDireccion || '' }
            }
          }
        }
      }
    },
    
    // Destinatario
    "cac:DeliveryCustomerParty": {
      "cac:Party": {
        "cac:PartyIdentification": {
          "cbc:ID": {
            _attributes: { 
              schemeID: TIPO_DOC_EMPRESA[destinatario.tipoDocumento || 'RUC'] || '6' 
            },
            _text: destinatario.numeroDocumento.toString()
          }
        },
        "cac:PartyLegalEntity": {
          "cbc:RegistrationName": { _text: destinatario.razonSocial || '' },
          "cac:RegistrationAddress": {
            "cac:AddressLine": {
              "cbc:Line": { _text: datosTraspaso.destinatarioDireccion || '' }
            }
          }
        }
      }
    },
    
    // Envío
    "cac:Shipment": {
      "cbc:ID": { _text: "1" },
      "cbc:GrossWeightMeasure": {
        _attributes: { 
          unitCode: UNIDADES_MEDIDA[datosTraspaso.unidadMedida || 'Kilogramos'] || 'KGM' 
        },
        _text: datosTraspaso.peso || 0
      },
      "cac:ShipmentStage": {
        "cac:TransitPeriod": {
          "cbc:StartDate": { _text: fechaTraslado.toISOString().split('T')[0] }
        },
        "cac:DriverPerson": [{
          "cbc:ID": {
            _attributes: { 
              schemeID: TIPO_DOC_PERSONA[conductor.tipoDocumento] || '7' 
            },
            _text: conductor.nroDocumento.toString()
          },
          "cbc:FirstName": { _text: conductorParseado.nombres },
          "cbc:FamilyName": { _text: conductorParseado.apellidos },
          "cbc:JobTitle": { _text: "Conductor" },
          "cac:IdentityDocumentReference": {
            "cbc:ID": { _text: conductor.licencia }
          }
        }]
      },
      "cac:Delivery": {
        "cac:DeliveryAddress": {
          "cbc:ID": { _text: ubigeoLlegada },
          "cac:AddressLine": { 
            "cbc:Line": { _text: datosTraspaso.destinatarioDireccion || '' } 
          }
        },
        "cac:Despatch": {
          "cac:DespatchAddress": {
            "cbc:ID": { _text: ubigeoPartida },
            "cac:AddressLine": { 
              "cbc:Line": { _text: datosTraspaso.remitenteDireccion || '' } 
            }
          }
        }
      },
      "cac:TransportHandlingUnit": {
        "cac:TransportEquipment": {
          "cbc:ID": { _text: vehiculo.placa || '' },
          "cac:ApplicableTransportMeans": {
            "cbc:RegistrationNationalityID": { _text: vehiculo.tucChv }
          }
        }
      }
    },
    
    // Detalle de items
    "cac:DespatchLine": datosTraspaso.items
      .filter(item => item.cantidad && item.descripcion)
      .map((item, index) => ({
        "cbc:ID": { _text: index + 1 },
        "cbc:DeliveredQuantity": {
          _attributes: { 
            unitCode: UNIDADES_MEDIDA[item.unidad || 'Servicios'] || 'ZZ' 
          },
          _text: item.cantidad || 0
        },
        "cac:OrderLineReference": {
          "cbc:LineID": { _text: index + 1 }
        },
        "cac:Item": {
          "cbc:Description": { _text: item.descripcion || '' }
        }
      }))
  };
  
  return documentBody;
}

// Ejemplo de uso:
/*
const resultado = generarGRTEDocumentBody(
  datosTraspaso[0],  // primer registro de tu array
  ConfigGroupedRow,      // objeto con conductores, vehiculos, remitentes, tiendas
  ubigeos,           // array de ubigeos
  'T001',            // serie
  1                  // correlativo
);
*/