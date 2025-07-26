import { http } from "./http";

export class PersonaService {
  getLastDocument () {
    return http.get("/personas/lastDocument")
  }
}
