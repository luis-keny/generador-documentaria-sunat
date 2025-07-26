"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Plus, Trash2, Search, Save, Send } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { GRTEDocumentBody } from "@/types/GRTE-document-body"

interface Vehicle {
  placa: string
  tucChv: string
  autorizacion: string
  entidadEmisora: string
}

interface Driver {
  dni: string
  nombre: string
  apellido: string
  licencia: string
}

interface DespatchLine {
  id: number
  cantidad: number
  unitCode: string
  descripcion: string
}

interface FormData {
  // Datos básicos
  serie: string
  correlativo: string
  fechaEmision: Date | undefined
  inicioTraslado: Date | undefined

  // Remitente
  remitenteRuc: string
  remitenteRazonSocial: string
  remitenteDireccion: string

  // Destinatario
  destinatarioRuc: string
  destinatarioRazonSocial: string

  // Modalidad de transporte
  modalidad: string

  // Transportista
  registroMTC: string

  // Vehículos y conductores
  vehiculos: Vehicle[]
  conductores: Driver[]

  // Puntos
  puntoPartida: {
    departamento: string
    provincia: string
    distrito: string
    direccion: string
  }
  puntoLlegada: {
    departamento: string
    provincia: string
    distrito: string
    direccion: string
  }

  // Peso
  pesoBruto: number
  unidadPeso: string

  // Items
  items: DespatchLine[]
}

const modalidadOptions = [
  { value: "retorno_vehiculo_vacio", label: "Retorno de Vehículo Vacío" },
  { value: "retorno_envases_vacios", label: "Retorno con Envases Vacíos" },
  { value: "transbordo_programado", label: "Transbordo Programado" },
  { value: "traslado_total_bienes", label: "Traslado Total de Bienes" },
  { value: "transporte_subcontratado", label: "Transporte Subcontratado" },
]

const departamentos = [
  { value: "lima", label: "Lima" },
  { value: "arequipa", label: "Arequipa" },
  { value: "cusco", label: "Cusco" },
  { value: "piura", label: "Piura" },
  { value: "trujillo", label: "Trujillo" },
]

const unidadesPeso = [
  { value: "TNE", label: "Toneladas" },
  { value: "KGM", label: "Kilogramos" },
  { value: "GRM", label: "Gramos" },
]

const unidadesCantidad = [
  { value: "ZZ", label: "Unidad" },
  { value: "KGM", label: "Kilogramos" },
  { value: "MTR", label: "Metros" },
  { value: "LTR", label: "Litros" },
]

export default function GuiaRemisionForm() {

  const [formData, setFormData] = useState<FormData>({
    serie: "V001",
    correlativo: "",
    fechaEmision: undefined,
    inicioTraslado: undefined,
    remitenteRuc: "",
    remitenteRazonSocial: "",
    remitenteDireccion: "",
    destinatarioRuc: "",
    destinatarioRazonSocial: "",
    modalidad: "",
    registroMTC: "",
    vehiculos: [],
    conductores: [],
    puntoPartida: {
      departamento: "",
      provincia: "",
      distrito: "",
      direccion: "",
    },
    puntoLlegada: {
      departamento: "",
      provincia: "",
      distrito: "",
      direccion: "",
    },
    pesoBruto: 0,
    unidadPeso: "TNE",
    items: [],
  })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFormData = (path: string, value: any) => {
    setFormData((prev) => {
      const keys = path.split(".")
      const newData = { ...prev }
      let current = newData

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] as FormData
      }

      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  const addVehicle = () => {
    const newVehicle: Vehicle = {
      placa: "",
      tucChv: "",
      autorizacion: "",
      entidadEmisora: "",
    }
    setFormData((prev) => ({
      ...prev,
      vehiculos: [...prev.vehiculos, newVehicle],
    }))
  }

  const removeVehicle = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      vehiculos: prev.vehiculos.filter((_, i) => i !== index),
    }))
  }

  const updateVehicle = (index: number, field: keyof Vehicle, value: string) => {
    setFormData((prev) => ({
      ...prev,
      vehiculos: prev.vehiculos.map((vehicle, i) => (i === index ? { ...vehicle, [field]: value } : vehicle)),
    }))
  }

  const addConductor = () => {
    const newConductor: Driver = {
      dni: "",
      nombre: "",
      apellido: "",
      licencia: "",
    }
    setFormData((prev) => ({
      ...prev,
      conductores: [...prev.conductores, newConductor],
    }))
  }

  const removeConductor = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conductores: prev.conductores.filter((_, i) => i !== index),
    }))
  }

  const updateConductor = (index: number, field: keyof Driver, value: string) => {
    setFormData((prev) => ({
      ...prev,
      conductores: prev.conductores.map((conductor, i) => (i === index ? { ...conductor, [field]: value } : conductor)),
    }))
  }

  const addItem = () => {
    const newItem: DespatchLine = {
      id: formData.items.length + 1,
      cantidad: 1,
      unitCode: "ZZ",
      descripcion: "",
    }
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const removeItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const updateItem = (index: number, field: keyof DespatchLine, value: any) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
  }

  const generateJSON = () => {
    const documentBody: GRTEDocumentBody = {
      "cbc:UBLVersionID": { _text: "2.1" },
      "cbc:CustomizationID": { _text: "2.0" },
      "cbc:ID": { _text: `${formData.serie}-${formData.correlativo.padStart(8, "0")}` },
      "cbc:IssueDate": { _text: formData.fechaEmision ? format(formData.fechaEmision, "yyyy-MM-dd") : "" },
      "cbc:IssueTime": { _text: format(new Date(), "HH:mm:ss") },
      "cbc:DespatchAdviceTypeCode": { _text: "31" },
      "cac:DespatchSupplierParty": {
        "cac:Party": {
          "cac:PartyIdentification": {
            "cbc:ID": {
              _attributes: { schemeID: "6" },
              _text: formData.remitenteRuc,
            },
          },
          "cac:PartyLegalEntity": {
            "cbc:RegistrationName": { _text: formData.remitenteRazonSocial },
            "cac:RegistrationAddress": {
              "cac:AddressLine": {
                "cbc:Line": { _text: formData.remitenteDireccion },
              },
            },
          },
        },
      },
      "cac:DeliveryCustomerParty": {
        "cac:Party": {
          "cac:PartyIdentification": {
            "cbc:ID": {
              _attributes: { schemeID: "6" },
              _text: formData.destinatarioRuc,
            },
          },
          "cac:PartyLegalEntity": {
            "cbc:RegistrationName": { _text: formData.destinatarioRazonSocial },
          },
        },
      },
      "cac:Shipment": {
        "cbc:ID": { _text: "SUNAT_Envio" },
        "cbc:GrossWeightMeasure": {
          _attributes: { unitCode: formData.unidadPeso },
          _text: formData.pesoBruto,
        },
        "cac:ShipmentStage": {
          "cac:TransitPeriod": {
            "cbc:StartDate": { _text: formData.inicioTraslado ? format(formData.inicioTraslado, "yyyy-MM-dd") : "" },
          },
          "cac:DriverPerson": formData.conductores.map((conductor) => ({
            "cbc:ID": {
              _attributes: { schemeID: "1" },
              _text: conductor.dni,
            },
            "cbc:FirstName": { _text: conductor.nombre },
            "cbc:FamilyName": { _text: conductor.apellido },
            "cbc:JobTitle": { _text: "Principal" },
            "cac:IdentityDocumentReference": {
              "cbc:ID": { _text: conductor.licencia },
            },
          })),
        },
        "cac:Delivery": {
          "cac:DeliveryAddress": {
            "cbc:ID": { _text: "150103" },
            "cac:AddressLine": {
              "cbc:Line": { _text: formData.puntoLlegada.direccion },
            },
          },
          "cac:Despatch": {
            "cac:DespatchAddress": {
              "cbc:ID": { _text: "150137" },
              "cac:AddressLine": {
                "cbc:Line": { _text: formData.puntoPartida.direccion },
              },
            },
          },
        },
        "cac:TransportHandlingUnit": {
          "cac:TransportEquipment": formData.vehiculos.map((vehiculo) => ({
            "cbc:ID": { _text: vehiculo.placa },
            "cac:ApplicableTransportMeans": {
              "cbc:RegistrationNationalityID": { _text: vehiculo.tucChv },
            },
          })),
        },
      },
      "cac:DespatchLine": formData.items.map((item) => ({
        "cbc:ID": { _text: item.id },
        "cbc:DeliveredQuantity": {
          _attributes: { unitCode: item.unitCode },
          _text: item.cantidad,
        },
        "cac:OrderLineReference": {
          "cbc:LineID": { _text: item.id },
        },
        "cac:Item": {
          "cbc:Description": { _text: item.descripcion },
        },
      })),
    }

    return { documentBody }
  }

  const handleSubmit = () => {
    const jsonData = generateJSON()
    console.log("JSON generado:", jsonData)
    toast("Éxito", {
      description: "Guía de remisión generada correctamente",
    })
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center">
                <div className="text-2xl font-bold">📋</div>
              </div>
              <div>
                <CardTitle className="text-white text-xl">GUÍA DE REMISIÓN TRANSPORTISTA</CardTitle>
                <CardDescription className="text-gray-400">ELECTRÓNICA</CardDescription>
                <Badge variant="outline" className="mt-2">
                  R.U.C. N° 10719057093
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <Select value={formData.serie} onValueChange={(value) => updateFormData("serie", value)}>
                  <SelectTrigger className="w-20 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="V001">V001</SelectItem>
                    <SelectItem value="V002">V002</SelectItem>
                    <SelectItem value="V003">V003</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-gray-400">-</span>
                <Input
                  placeholder="00000001"
                  value={formData.correlativo}
                  onChange={(e) => updateFormData("correlativo", e.target.value)}
                  className="w-32 bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Datos del Remitente */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Datos del Remitente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">RUC</Label>
                <Input
                  placeholder="20266352337"
                  value={formData.remitenteRuc}
                  onChange={(e) => updateFormData("remitenteRuc", e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Razón Social</Label>
                <Input
                  placeholder="LUCERO BALVIN LUIS KENY"
                  value={formData.remitenteRazonSocial}
                  onChange={(e) => updateFormData("remitenteRazonSocial", e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Dirección</Label>
              <Input
                placeholder="ASOC. VIV. EL MIRADOR DE CARAPONGO MZ. C LOTE. 11 LURIGANCHO LIMA LIMA"
                value={formData.remitenteDireccion}
                onChange={(e) => updateFormData("remitenteDireccion", e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Destinatario */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Destinatario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">RUC</Label>
                <div className="flex space-x-2">
                  <Select defaultValue="RUC">
                    <SelectTrigger className="w-20 bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RUC">RUC</SelectItem>
                      <SelectItem value="DNI">DNI</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="20266352337"
                    value={formData.destinatarioRuc}
                    onChange={(e) => updateFormData("destinatarioRuc", e.target.value)}
                    className="flex-1 bg-gray-700 border-gray-600"
                  />
                  <Button variant="outline" size="sm" className="bg-gray-700 border-gray-600">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Razón Social</Label>
                <Input
                  placeholder="SOFTYS PERU S.A.C."
                  value={formData.destinatarioRazonSocial}
                  onChange={(e) => updateFormData("destinatarioRazonSocial", e.target.value)}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fechas y Modalidad */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-300">F. de Emisión</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-700 border-gray-600",
                          !formData.fechaEmision && "text-gray-400",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.fechaEmision ? format(formData.fechaEmision, "yyyy-MM-dd") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.fechaEmision}
                        onSelect={(date) => updateFormData("fechaEmision", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Inicio del Traslado</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-gray-700 border-gray-600",
                          !formData.inicioTraslado && "text-gray-400",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.inicioTraslado ? format(formData.inicioTraslado, "yyyy-MM-dd") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.inicioTraslado}
                        onSelect={(date) => updateFormData("inicioTraslado", date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-gray-300">Modalidad de Transporte</Label>
                <RadioGroup
                  value={formData.modalidad}
                  onValueChange={(value) => updateFormData("modalidad", value)}
                  className="grid grid-cols-1 gap-2"
                >
                  {modalidadOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <Label htmlFor={option.value} className="text-gray-300 text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Datos del Transportista */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Datos del Transportista</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-gray-300">Registro MTC</Label>
              <Input
                placeholder="XXXXXXXXXXXXXXXXXXX"
                value={formData.registroMTC}
                onChange={(e) => updateFormData("registroMTC", e.target.value)}
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </CardContent>
        </Card>

        {/* Vehículos */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Vehículos</CardTitle>
              <Button onClick={addVehicle} variant="outline" size="sm" className="bg-gray-700 border-gray-600">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Vehículo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.vehiculos.map((vehiculo, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-gray-300">Placa</Label>
                    <Input
                      placeholder="SSS555"
                      value={vehiculo.placa}
                      onChange={(e) => updateVehicle(index, "placa", e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">TUC / CHV</Label>
                    <Input
                      placeholder="45454545454"
                      value={vehiculo.tucChv}
                      onChange={(e) => updateVehicle(index, "tucChv", e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300"># Autorización</Label>
                    <Input
                      placeholder="Número de autorización especial"
                      value={vehiculo.autorizacion}
                      onChange={(e) => updateVehicle(index, "autorizacion", e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={() => removeVehicle(index)}
                      variant="outline"
                      size="sm"
                      className="bg-red-600 border-red-500 hover:bg-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conductores */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Conductores</CardTitle>
              <Button onClick={addConductor} variant="outline" size="sm" className="bg-gray-700 border-gray-600">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Conductor
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.conductores.map((conductor, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-700 rounded-lg">
                  <div className="space-y-2">
                    <Label className="text-gray-300">DNI</Label>
                    <Select defaultValue="DNI">
                      <SelectTrigger className="bg-gray-600 border-gray-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DNI">DNI</SelectItem>
                        <SelectItem value="CE">CE</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Número</Label>
                    <Input
                      placeholder="77777777"
                      value={conductor.dni}
                      onChange={(e) => updateConductor(index, "dni", e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Nombre</Label>
                    <Input
                      placeholder="nombre"
                      value={conductor.nombre}
                      onChange={(e) => updateConductor(index, "nombre", e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300">Apellido</Label>
                    <Input
                      placeholder="apellido"
                      value={conductor.apellido}
                      onChange={(e) => updateConductor(index, "apellido", e.target.value)}
                      className="bg-gray-600 border-gray-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-300"># Licencia</Label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="54545454545"
                        value={conductor.licencia}
                        onChange={(e) => updateConductor(index, "licencia", e.target.value)}
                        className="bg-gray-600 border-gray-500"
                      />
                      <Button
                        onClick={() => removeConductor(index)}
                        variant="outline"
                        size="sm"
                        className="bg-red-600 border-red-500 hover:bg-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Puntos de Partida y Llegada */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Puntos de Partida y Llegada</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-gray-300">Punto de Partida</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={formData.puntoPartida.departamento}
                    onValueChange={(value) => updateFormData("puntoPartida.departamento", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.puntoPartida.provincia}
                    onValueChange={(value) => updateFormData("puntoPartida.provincia", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.puntoPartida.distrito}
                    onValueChange={(value) => updateFormData("puntoPartida.distrito", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Partida</Label>
                  <Input
                    placeholder="direccion inicio"
                    value={formData.puntoPartida.direccion}
                    onChange={(e) => updateFormData("puntoPartida.direccion", e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <Label className="text-gray-300">Punto de Llegada</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Select
                    value={formData.puntoLlegada.departamento}
                    onValueChange={(value) => updateFormData("puntoLlegada.departamento", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.puntoLlegada.provincia}
                    onValueChange={(value) => updateFormData("puntoLlegada.provincia", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Provincia" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.puntoLlegada.distrito}
                    onValueChange={(value) => updateFormData("puntoLlegada.distrito", value)}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Distrito" />
                    </SelectTrigger>
                    <SelectContent>
                      {departamentos.map((dep) => (
                        <SelectItem key={dep.value} value={dep.value}>
                          {dep.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-300">Llegada</Label>
                  <Input
                    placeholder="direccion llegada"
                    value={formData.puntoLlegada.direccion}
                    onChange={(e) => updateFormData("puntoLlegada.direccion", e.target.value)}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Peso Bruto */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Peso Bruto Total</Label>
                <Input
                  type="number"
                  placeholder="7.000"
                  value={formData.pesoBruto}
                  onChange={(e) => updateFormData("pesoBruto", Number(e.target.value))}
                  className="bg-gray-700 border-gray-600"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Unidad</Label>
                <Select value={formData.unidadPeso} onValueChange={(value) => updateFormData("unidadPeso", value)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {unidadesPeso.map((unidad) => (
                      <SelectItem key={unidad.value} value={unidad.value}>
                        {unidad.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Items</CardTitle>
              <Button onClick={addItem} variant="outline" size="sm" className="bg-gray-700 border-gray-600">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-gray-700">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700">
                    <TableHead className="text-gray-300">CANT</TableHead>
                    <TableHead className="text-gray-300">CODIGO</TableHead>
                    <TableHead className="text-gray-300">DESCRIPCION</TableHead>
                    <TableHead className="text-gray-300">P. UNIT</TableHead>
                    <TableHead className="text-gray-300">TOTAL</TableHead>
                    <TableHead className="text-gray-300">ACCIONES</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={index} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => updateItem(index, "cantidad", Number(e.target.value))}
                            className="w-20 bg-gray-700 border-gray-600"
                          />
                          <Select value={item.unitCode} onValueChange={(value) => updateItem(index, "unitCode", value)}>
                            <SelectTrigger className="w-20 bg-gray-700 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {unidadesCantidad.map((unidad) => (
                                <SelectItem key={unidad.value} value={unidad.value}>
                                  {unidad.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Input placeholder="Código" className="bg-gray-700 border-gray-600" />
                      </TableCell>
                      <TableCell>
                        <Input
                          placeholder="transporte de mercaderia"
                          value={item.descripcion}
                          onChange={(e) => updateItem(index, "descripcion", e.target.value)}
                          className="bg-gray-700 border-gray-600"
                        />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" placeholder="0.00" className="bg-gray-700 border-gray-600" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" step="0.01" placeholder="0.00" className="bg-gray-700 border-gray-600" />
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => removeItem(index)}
                          variant="outline"
                          size="sm"
                          className="bg-red-600 border-red-500 hover:bg-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Botones de Acción */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-4">
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Generar Guía
              </Button>
              <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                <Send className="h-4 w-4 mr-2" />
                Enviar a SUNAT
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
