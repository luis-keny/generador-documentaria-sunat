// import type { ConductorConfig, GuiaRowFlat, ItemConfig } from "@/types/GRTE-data";
// import type { GRTEDocumentBody } from "@/types/GRTE-document-body";

/**
 * Transforma los datos de una Guía de Remisión simple al formato UBL requerido.
 * @param data - El objeto con los datos simplificados de la guía.
 * @returns El objeto `DocumentBody` listo para ser procesado.
 */
// export const transformToGRTEDocumentBody = (data: GuiaRowFlat): GRTEDocumentBody => {
//   const vehiculoPrincipal = data.vehiculos[0];
  
//   return {
//     // 1. Información General del Documento
//     "cbc:UBLVersionID": { "_text": "2.1" },
//     "cbc:CustomizationID": { "_text": "2.0" },
//     "cbc:ID": { "_text": `${data.documento.serie}-${data.documento.correlativo}` },
//     "cbc:IssueDate": { "_text": data.documento.fechaEmision },
//     "cbc:IssueTime": { "_text": new Date().toLocaleTimeString('en-GB') }, // Formato HH:mm:ss
//     "cbc:DespatchAdviceTypeCode": { "_text": data.documento.tipoDocumento },

//     // 2. Remitente (Quien envía)
//     "cac:DespatchSupplierParty": {
//       "cac:Party": {
//         "cac:PartyIdentification": {
//           "cbc:ID": {
//             "_attributes": { "schemeID": data.remitente.tipoDocumento },
//             "_text": data.remitente.numeroDocumento,
//           },
//         },
//         "cac:PartyLegalEntity": {
//           "cbc:RegistrationName": { "_text": data.remitente.razonSocial },
//           "cac:RegistrationAddress": {
//             "cac:AddressLine": {
//               "cbc:Line": { "_text": data.remitente.direccion },
//             },
//           },
//         },
//       },
//     },

//     // 3. Destinatario (Quien recibe)
//     "cac:DeliveryCustomerParty": {
//       "cac:Party": {
//         "cac:PartyIdentification": {
//           "cbc:ID": {
//             "_attributes": { "schemeID": data.destinatario.tipoDocumento },
//             "_text": data.destinatario.numeroDocumento,
//           },
//         },
//         "cac:PartyLegalEntity": {
//           "cbc:RegistrationName": { "_text": data.destinatario.razonSocial },
//         },
//       },
//     },

//     // 4. Detalles del Envío y Transporte
//     "cac:Shipment": {
//       "cbc:ID": { "_text": "SUNAT_Envio" },
//       "cbc:GrossWeightMeasure": {
//         "_attributes": { "unitCode": data.transporte.unidadPeso },
//         "_text": data.transporte.pesoTotal,
//       },
//       "cac:ShipmentStage": {
//         "cac:TransitPeriod": {
//           "cbc:StartDate": { "_text": data.documento.fechaInicioTraslado },
//         },
//         // Mapeo de la lista de conductores
//         "cac:DriverPerson": data.conductores.map((conductor: ConductorConfig) => ({
//           "cbc:ID": {
//             "_attributes": { "schemeID": conductor.tipoDocumento },
//             "_text": conductor.nroDocumento,
//           },
//           "cbc:FirstName": { "_text": conductor.nombreCompleto },
//           "cbc:FamilyName": { "_text": conductor.nombreCompleto },
//           "cbc:JobTitle": { "_text": "Principal" }, // Valor fijo o desde data
//           "cac:IdentityDocumentReference": {
//             "cbc:ID": { "_text": conductor.licencia },
//           },
//         })),
//       },
//       "cac:Delivery": {
//         "cac:DeliveryAddress": { // Punto de Llegada
//           "cbc:ID": { "_text": data.ubicaciones.puntoLlegada.codigoUbigeo },
//           "cac:AddressLine": { "cbc:Line": { "_text": data.ubicaciones.puntoLlegada.direccion } },
//         },
//         "cac:Despatch": { // Punto de Partida
//           "cac:DespatchAddress": {
//             "cbc:ID": { "_text": data.ubicaciones.puntoPartida.codigoUbigeo },
//             "cac:AddressLine": { "cbc:Line": { "_text": data.ubicaciones.puntoPartida.direccion } },
//           },
//         },
//       },
//       "cac:TransportHandlingUnit": {
//         "cac:TransportEquipment": { // Mapeo del vehículo principal
//           "cbc:ID": { "_text": vehiculoPrincipal.placa },
//           "cac:ApplicableTransportMeans": {
//             "cbc:RegistrationNationalityID": { "_text": vehiculoPrincipal.certificadoHabilitacion },
//           },
//         },
//       },
//     },

//     // 5. Líneas de Ítems
//     "cac:DespatchLine": data.items.map((item: ItemConfig) => ({
//       "cbc:ID": { "_text": item.unidad },
//       "cbc:DeliveredQuantity": {
//         "_attributes": { "unitCode": item.unidad },
//         "_text": item.cantidad,
//       },
//       "cac:OrderLineReference": {
//         "cbc:LineID": { "_text": item.cantidad },
//       },
//       "cac:Item": {
//         "cbc:Description": { "_text": item.descripcion },
//       },
//     })),
//   };
// } 