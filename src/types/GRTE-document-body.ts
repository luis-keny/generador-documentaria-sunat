// GRTE - GUÍA REMITENTE TRANSPORTISTA ELECTRÓNICO

// Helper types for common UBL-like structures
// --- Helper Types ---
// Nodos de texto simples y numéricos
type TextNode = { _text: string };
type NumericTextNode = { _text: number | string };

// Nodo de ID con atributos (ej. para RUC, DNI)
type AttributedID = {
  _attributes: { schemeID: string };
  _text: string;
};

// Nodo de cantidad con unidad de medida
type AttributedQuantity = {
  _attributes: { unitCode: string };
  _text: number | string;
};

// Nodo de medida con unidad de peso/volumen
type AttributedMeasure = {
  _attributes: { unitCode: string };
  _text: number | string;
};


// --- Component Interfaces ---
// Información de una de las partes (remitente, destinatario, etc.)
interface Party {
  "cac:PartyIdentification": {
    "cbc:ID": AttributedID;
  };
  "cac:PartyLegalEntity"?: { // Opcional, no siempre presente
    "cbc:RegistrationName": TextNode;
    "cac:RegistrationAddress"?: {
      "cac:AddressLine": {
        "cbc:Line": TextNode;
      };
    };
  };
}

// Información de un conductor
interface DriverPerson {
  "cbc:ID": AttributedID;
  "cbc:FirstName": TextNode;
  "cbc:FamilyName": TextNode;
  "cbc:JobTitle": TextNode;
  "cac:IdentityDocumentReference": {
    "cbc:ID": TextNode; // Número de licencia
  };
}

// Información del vehículo
interface TransportEquipment {
  "cbc:ID": TextNode; // Placa
  "cac:ApplicableTransportMeans": {
    "cbc:RegistrationNationalityID": TextNode; // Certificado de Habilitación
  };
}

// Detalle de un ítem en la guía
interface DespatchLine {
  "cbc:ID": NumericTextNode;
  "cbc:DeliveredQuantity": AttributedQuantity;
  "cac:OrderLineReference": {
    "cbc:LineID": NumericTextNode;
  };
  "cac:Item": {
    "cbc:Description": TextNode;
  };
}


// --- Main Interface ---
// Estructura principal del cuerpo del documento
export interface GRTEDocumentBody {
  "cbc:UBLVersionID": TextNode;
  "cbc:CustomizationID": TextNode;
  "cbc:ID": TextNode; // Serie y correlativo
  "cbc:IssueDate": TextNode;
  "cbc:IssueTime": TextNode;
  "cbc:DespatchAdviceTypeCode": TextNode;
  "cac:DespatchSupplierParty": { "cac:Party": Party };
  "cac:DeliveryCustomerParty": { "cac:Party": Party };
  "cac:Shipment": {
    "cbc:ID": TextNode;
    "cbc:GrossWeightMeasure": AttributedMeasure;
    "cac:ShipmentStage": {
      "cac:TransitPeriod": {
        "cbc:StartDate": TextNode;
      };
      "cac:CarrierParty"?: { // Transportista, opcional en transporte privado
        "cac:PartyIdentification": {
          "cbc:ID": AttributedID;
        };
      };
      "cac:DriverPerson": DriverPerson[];
    };
    "cac:Delivery": {
      "cac:DeliveryAddress": {
        "cbc:ID": TextNode; // Ubigeo de llegada
        "cac:AddressLine": { "cbc:Line": TextNode };
      };
      "cac:Despatch": {
        "cac:DespatchAddress": {
          "cbc:ID": TextNode; // Ubigeo de partida
          "cac:AddressLine": { "cbc:Line": TextNode };
        };
        "cac:DespatchParty"?: { // Opcional, pagador del flete u otro
            "cac:PartyIdentification": {
              "cbc:ID": AttributedID;
            };
            "cac:PartyLegalEntity": {
              "cbc:RegistrationName": TextNode;
            };
        };
      };
    };
    "cac:TransportHandlingUnit": {
      "cac:TransportEquipment": TransportEquipment;
    };
  };
  "cac:DespatchLine": DespatchLine[];
}

export interface GRTEDocument {
  personaId: string,
  personaToken: string,
  fileName: string;
  documentBody: GRTEDocumentBody;
  customerEmail?: string;
}