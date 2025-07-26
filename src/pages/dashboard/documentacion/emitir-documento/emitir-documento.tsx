import { useState } from "react"
// import { format } from "date-fns"
import { Download, RefreshCw, LucideSave, DownloadIcon } from "lucide-react"
// import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { NavLink } from "react-router"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
// import { Calendar } from "@/components/ui/calendar"
// import { Separator } from "@/components/ui/separator"
// import { toast } from "sonner"
// import { DocumentsService } from "@/services/documents"
// import { NavLink } from "react-router"

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
  email?: string
}

export const EmitirDocumento = () => {
  const [documents] = useState<Document[]>([])
  const [loading] = useState(false)

  const [filters, setFilters] = useState<FilterParams>({
    personaId: localStorage.getItem("personaId") || "",
    personaToken: localStorage.getItem("personaToken") || "",
    email: "",
  })

  const handleFilterChange = (key: keyof FilterParams, value: unknown) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Emitir Guía de Remisión Transportista (GRTE)</h1>
          <p className="text-muted-foreground">Solo podrás emitir el documento GRTE si cuentas con un usuario afiliado a dicha empresa</p>
        </div>
        <div className="flex items-center space-x-2">
          <label 
            className="border border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-800 cursor-pointer px-2 py-1 rounded-md flex items-center shadow-xs transition-all"
          >
            <svg  xmlns="http://www.w3.org/2000/svg"  width={24}  height={24}  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth={2}  strokeLinecap="round"  strokeLinejoin="round">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M14 3v4a1 1 0 0 0 1 1h4" />
              <path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2" />
              <path d="M10 12l4 5" />
              <path d="M10 17l4 -5" />
            </svg>
            {loading ? "Recopilando..." : "Recopilar"}
            <input type="file" className="hidden" accept=".xls,.xlsx" />
          </label>
          <NavLink to="https://docs.google.com/spreadsheets/d/17pb8RG3vgYYwAylvtirZ-L71zNkdo_UBcvreZKmNyc0/edit?usp=sharing" target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <DownloadIcon className="mr-2 h-4 w-4" />
              Plantilla
            </Button>
          </NavLink>
          <Button disabled={loading}>
            {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <LucideSave className="mr-2 h-4 w-4" />}
            {loading ? "Emitiendo..." : "Emitir documento"}
          </Button>
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
          <CardTitle>Datos recopilados</CardTitle>
          <CardDescription>
            {documents.length} dato{documents.length !== 1 ? "s" : ""} recopilado
            {documents.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Recopilando datos...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron datos
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
                        </div>
                      </TableCell>
                      <TableCell>
                        {/* <Badge className={statusColors[doc.status]}>{doc.status}</Badge> */}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {/* {documentTypes.find((t) => t.value === doc.type)?.label || doc.type} */}
                        </Badge>
                      </TableCell>
                      <TableCell>{doc.issueTime}</TableCell>
                      <TableCell>{doc.responseTime}</TableCell>
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