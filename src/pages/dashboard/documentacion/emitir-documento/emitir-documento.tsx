import React, { useState } from "react"
import { RefreshCw, DownloadIcon, ChevronUp, ChevronDown, LucideSave } from "lucide-react"
import readXlsxFile from 'read-excel-file'
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
import { NavLink } from "react-router"
import { parseConfigSheet, parseDataSheet, parseUbigeoSheet } from "@/utils/recopilate-xlsx"
import type { ConfigGroupedRow, GuiaRowFlat, UbigeoRow } from "@/types/GRTE-data"
import { generarGRTEDocumentBody } from "@/utils/transform-grte-body"

interface FilterParams {
  personaId: string
  personaToken: string
  email?: string
}

export const EmitirDocumento = () => {
  const [guiaFlat, setGuiaFlat] = useState<GuiaRowFlat[]>([])
  const [dataConfig, setDataConfig] = useState<ConfigGroupedRow|null>(null)
  const [ubigeos, setUbigeos] = useState<UbigeoRow[]|null>(null)
  
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [loading] = useState(false)
  const [recopilating, isRecopilating] = useState(false)

  const [filters, setFilters] = useState<FilterParams>({
    personaId: localStorage.getItem("personaId") || "",
    personaToken: localStorage.getItem("personaToken") || "",
    email: "",
  })

  const handleFilterChange = (key: keyof FilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleRowClick = (index: number) => {
    setExpandedRow(expandedRow === index ? null : index); // Alterna la fila expandida
  };

  const readExcel = ($event: React.ChangeEvent<HTMLInputElement>) => {
    const file = $event.target.files?.[0]

    if (!file) return
    isRecopilating(true)
    
    readXlsxFile(file, { sheet: 'data' })
    .then((rows) => {
        setGuiaFlat(parseDataSheet(rows))
      })
      .catch((error) => {
        console.error('Error reading Excel file:', error)
      })
      .finally(() => {
        isRecopilating(false)
      })
    
    readXlsxFile(file, { sheet: 'Configuración' })
      .then((rows) => {
        setDataConfig(parseConfigSheet(rows))
      })
      .catch((error) => {
        console.error('Error reading Excel file:', error)
      })

    readXlsxFile(file, { sheet: 'UBIGEO' })
      .then((rows) => {
        setUbigeos(parseUbigeoSheet(rows))
      })
      .catch((error) => {
        console.error('Error reading Excel file:', error)
      })
  }

  const emitirGRE = () => {
    if (!dataConfig) return
    if (!ubigeos) return
    const bodyDocument = generarGRTEDocumentBody(
      guiaFlat[0],  // primer registro de tu array
      dataConfig,      // objeto con conductores, vehiculos, remitentes, tiendas
      ubigeos,           // array de ubigeos
      'T001',            // serie
      1                  // correlativo
    );
    console.log(bodyDocument)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emitir Guía de Remisión Transportista (GRTE)</h1>
          <p className="text-muted-foreground">Solo podrás emitir el documento GRTE si cuentas con un usuario afiliado a dicha empresa</p>
        </div>
        <div className="flex items-center space-x-2">
          <NavLink to="https://docs.google.com/spreadsheets/d/17pb8RG3vgYYwAylvtirZ-L71zNkdo_UBcvreZKmNyc0/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Plantilla
            </Button>
          </NavLink>
          <label className={buttonVariants({variant: "default",size: "default",})}>
            <svg  xmlns="http://www.w3.org/2000/svg"  width={24}  height={24}  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth={2}  strokeLinecap="round"  strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
              <path d="M10 12l4 5" />
              <path d="M10 17l4 -5" />
            </svg>
            {recopilating ? "Recopilando..." : "Recopilar"}
            <input type="file" className="hidden" accept=".xls,.xlsx" onChange={($event) => readExcel($event)} />
          </label>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Datos principales</CardTitle>
              <CardDescription>Configuración de credenciales de la empresa e ingreso opcional de email para el envió documentaría una vez aceptada</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="personaId">Persona ID *</Label>
              <Input
                id="personaId"
                placeholder="Identificador de empresa"
                value={filters.personaId}
                onChange={(e) => handleFilterChange("personaId", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="personaToken">Persona Token *</Label>
              <Input
                id="personaToken"
                type="password"
                placeholder="Token de acceso"
                value={filters.personaToken}
                onChange={(e) => handleFilterChange("personaToken", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={filters.email}
                onChange={(e) => handleFilterChange("email", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
  <CardHeader>
    <CardTitle>Datos Recopilados</CardTitle>
    <CardDescription>
      <div className="flex justify-between items-center relative w-full">
        <span>{guiaFlat.length} dato{guiaFlat.length !== 1 ? "s" : ""} recopilado</span>
        {
          guiaFlat.length > 0 && <Button disabled={loading} className="absolute bottom-0 right-0">
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <LucideSave className="mr-2 h-4 w-4" />}
            {loading ? "Emitiendo..." : "Emitir todos"}
          </Button>
        }
      </div>
    </CardDescription>
  </CardHeader>
  
  <CardContent>
    {recopilating ? (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-primary">Recopilando datos...</span>
      </div>
    ) : guiaFlat.length === 0 ? (
      <div className="text-center py-8 text-muted-foreground">
        No se encontraron datos
      </div>
    ) : (
      <div className="overflow-x-auto rounded-md border bg-white shadow-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead/>
              <TableHead>Fecha Traslado</TableHead>
              <TableHead>Remitente</TableHead>
              <TableHead>Destinatario</TableHead>
              <TableHead>Placa</TableHead>
              <TableHead>Conductor</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Unidad Medida</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {guiaFlat.map((guia, index) => (
              <React.Fragment key={index}>
                <TableRow className="hover:bg-gray-50">
                  <TableCell>
                    <Button 
                        variant="link" 
                        onClick={() => handleRowClick(index)} 
                        className="text-indigo-500">
                        {expandedRow === index ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                  </TableCell>
                  <TableCell>{guia.fechaTraslado?.toLocaleDateString()}</TableCell>
                  <TableCell>{guia.remitenteRazonSocial}</TableCell>
                  <TableCell>{guia.destinatarioRazonSocial}</TableCell>
                  <TableCell>{guia.placa}</TableCell>
                  <TableCell>{guia.conductor}</TableCell>
                  <TableCell>{guia.peso}</TableCell>
                  <TableCell>{guia.unidadMedida}</TableCell>
                  <TableCell>
                    <Button onClick={emitirGRE}>Emitir</Button>
                  </TableCell>
                </TableRow>
                {expandedRow === index && (
                <TableRow>
                    <TableCell colSpan={8}>
                      <div className="p-4 rounded-md">
                        <h3 className="font-semibold text-xl text-gray-800 mb-4">Detalles de los Items:</h3>
                        {guia.items.map((item, itemIndex) => (
                          <div key={itemIndex} className="flex flex-col space-y-2 p-4 border-b border-gray-300 last:border-none">
                            <div className="flex items-center space-x-4">
                              <div className="w-1/3">
                                <strong className="text-sm text-gray-600">Cantidad:</strong>
                                <div className="text-gray-800">{item.cantidad}</div>
                              </div>
                              <div className="w-1/3">
                                <strong className="text-sm text-gray-600">Unidad:</strong>
                                <div className="text-gray-800">{item.unidad}</div>
                              </div>
                              <div className="w-1/3">
                                <strong className="text-sm text-gray-600">Descripción:</strong>
                                <div className="text-gray-800">{item.descripcion}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    )}
  </CardContent>
</Card>

    </div>
  )
}