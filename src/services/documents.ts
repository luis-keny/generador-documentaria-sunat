import { http } from "./http";

export class DocumentsService {
  getAll (params: URLSearchParams) {
    return http.get("/documents/getAll", { params })
  }
  urlPdfByDocument (documentId: string, fileName: string) {
    return `${import.meta.env.VITE_API_URL}/documents/${documentId}/getPDF/A4/${fileName}.pdf`
  }
}
