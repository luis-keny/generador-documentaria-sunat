"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Download, Search, Filter, RefreshCw, PlusIcon, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { DocumentsService } from "@/services/documents"

interface Document {
  id: string
  production: boolean
  status: "PENDIENTE" | "EXCEPCION" | "ACEPTADO" | "RECHAZADO"
  type: string
  issueTime: number
  responseTime: number
  fileName: string
  xml: string
  cdr: string
  faults: string[]
  notes: string[]
  personaId: string
  reference: string
}

interface FilterParams {
  personaId: string
  personaToken: string
  limit?: number
  skip?: number
  from?: number
  to?: number
  status?: string
  type?: string
  order?: "ASC" | "DESC"
  serie?: string
  number?: string
}

export const Documentos = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [fromDate, setFromDate] = useState<Date>()
  const [toDate, setToDate] = useState<Date>()

  const [filters, setFilters] = useState<FilterParams>({
    personaId: "",
    personaToken: "",
    limit: 50,
    skip: 0,
    order: "DESC",
  })

  const documentsSrv = new DocumentsService()

  const statusColors = {
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
    EXCEPCION: "bg-red-100 text-red-800 border-red-200",
    ACEPTADO: "bg-green-100 text-green-800 border-green-200",
    RECHAZADO: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const documentTypes = [
    { value: "01", label: "Factura" },
    { value: "03", label: "Boleta de Venta" },
    { value: "07", label: "Nota de Crédito" },
    { value: "08", label: "Nota de Débito" },
    { value: "D1", label: "Documento Interno" },
  ]

  const fetchDocuments = async () => {
    if (!filters.personaId || !filters.personaToken) {
      toast.error("Error",{
        description: "PersonaId y PersonaToken son requeridos",
      })
      return
    }

    setLoading(true)
    try {
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })

      if ((fromDate && toDate) && (fromDate.getTime() > toDate.getTime())) {
        toast.error("Error", {
          description: "La fecha 'Desde' no puede ser mayor que la fecha 'Hasta'",
        })
        return
      }

      if (fromDate) {
        params.append("from", Math.floor(fromDate.getTime() / 1000).toString())
      }
      if (toDate) {
        params.append("to", Math.floor(toDate.getTime() / 1000).toString())
      }

      // Simulación de API call
      const response = await documentsSrv.getAll(params)
      console.log(response)
      setDocuments(response.data)
      toast.success('Éxito', {
        description: `Se encontraron ${response.data.length} documentos`,
      })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any){
      if (err.status === 401) {
        toast.error("Error", {
          description: "Credenciales inválidas. Por favor, verifica tu Persona ID y Token.",
        })
        return
      }
      console.log(err)
      toast.error("Error", {
        description: "Error al obtener los documentos",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatUnixDate = (timestamp: number) => {
    return format(new Date(timestamp * 1000), "dd/MM/yyyy HH:mm")
  }

  const handleFilterChange = (key: keyof FilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      personaId: "",
      personaToken: "",
      limit: 50,
      skip: 0,
      order: "DESC",
    })
    setFromDate(undefined)
    setToDate(undefined)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Documentos</h1>
          <p className="text-muted-foreground">Consulta y administra tus documentos electrónicos</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={fetchDocuments} variant="outline">
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <PlusIcon className="mr-2 h-4 w-4" />}
            {loading ? "Cargando..." : "Emitir"}
          </Button>
          <Button onClick={fetchDocuments} disabled={loading}>
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
            {loading ? "Cargando..." : "Buscar"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros de Búsqueda</CardTitle>
              <CardDescription>Configura los parámetros para consultar tus documentos</CardDescription>
            </div>
            <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  {isFiltersOpen ? "Ocultar" : "Mostrar"} Filtros
                </Button>
              </CollapsibleTrigger>
            </Collapsible>
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
              <Label htmlFor="limit">Límite</Label>
              <Input
                id="limit"
                type="number"
                placeholder="Máximo 100"
                value={filters.limit || ""}
                onChange={(e) => handleFilterChange("limit", Number.parseInt(e.target.value) || undefined)}
              />
            </div>
          </div>

          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <CollapsibleContent className="space-y-4">
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skip">Saltar</Label>
                  <Input
                    id="skip"
                    type="number"
                    placeholder="0"
                    value={filters.skip || ""}
                    onChange={(e) => handleFilterChange("skip", Number.parseInt(e.target.value) || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Select
                    value={filters.status || "ALL"}
                    onValueChange={(value) => handleFilterChange("status", value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los estados" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                      <SelectItem value="EXCEPCION">Excepción</SelectItem>
                      <SelectItem value="ACEPTADO">Aceptado</SelectItem>
                      <SelectItem value="RECHAZADO">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo de Documento</Label>
                  <Select
                    value={filters.type || "ALL"}
                    onValueChange={(value) => handleFilterChange("type", value || undefined)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los tipos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todos</SelectItem>
                      {documentTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Orden</Label>
                  <Select
                    value={filters.order || "DESC"}
                    onValueChange={(value) => handleFilterChange("order", value as "ASC" | "DESC")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DESC">Descendente</SelectItem>
                      <SelectItem value="ASC">Ascendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Fecha Desde</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !fromDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {fromDate ? format(fromDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={fromDate} onSelect={setFromDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Fecha Hasta</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !toDate && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {toDate ? format(toDate, "dd/MM/yyyy") : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={toDate} onSelect={setToDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serie">Serie</Label>
                  <Input
                    id="serie"
                    placeholder="F001, B001, etc."
                    value={filters.serie || ""}
                    onChange={(e) => handleFilterChange("serie", e.target.value || undefined)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="number">Correlativo</Label>
                  <Input
                    id="number"
                    placeholder="8 dígitos"
                    value={filters.number || ""}
                    onChange={(e) => handleFilterChange("number", e.target.value || undefined)}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={resetFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos Encontrados</CardTitle>
          <CardDescription>
            {documents.length} documento{documents.length !== 1 ? "s" : ""} encontrado
            {documents.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando documentos...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron documentos con los filtros aplicados
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Fecha Respuesta</TableHead>
                    <TableHead>Ambiente</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        <div>
                          <div className="font-semibold">{doc.fileName}</div>
                          {doc.reference && <div className="text-sm text-muted-foreground">{doc.reference}</div>}
                          {/* {doc.faults.length > 0 && (
                            <div className="text-sm text-red-600 mt-1">
                              {doc.faults.length} error{doc.faults.length !== 1 ? "es" : ""}
                            </div>
                          )}
                          {doc.notes.length > 0 && (
                            <div className="text-sm text-blue-600 mt-1">
                              {doc.notes.length} nota{doc.notes.length !== 1 ? "s" : ""}
                            </div>
                          )} */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[doc.status]}>{doc.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {documentTypes.find((t) => t.value === doc.type)?.label || doc.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatUnixDate(doc.issueTime)}</TableCell>
                      <TableCell>{formatUnixDate(doc.responseTime)}</TableCell>
                      <TableCell>
                        <Badge variant={doc.production ? "default" : "secondary"}>
                          {doc.production ? "Producción" : "Pruebas"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          {doc.xml && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.xml} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                XML
                              </a>
                            </Button>
                          )}
                          {doc.cdr && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={doc.cdr} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4 mr-1" />
                                CDR
                              </a>
                            </Button>
                          )}
                          <Button size="sm" variant="outline" asChild>
                              <a href={documentsSrv.urlPdfByDocument(doc.id, doc.fileName)} target="_blank" rel="noopener noreferrer">
                                <Eye className="h-4 w-4 mr-1" />
                                PDF
                              </a>
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
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
