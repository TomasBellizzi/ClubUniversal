import { Evento } from "./evento";

export interface Actividad {
  id: number;
  nombre: string;
  monto: number;
  activo: boolean;
  eventos?: Evento[];     
  createdAt?: Date | null;
}

export interface CreateActividadRequest {
  nombre: string;
  monto: number;
  activo?: boolean;
}

export interface UpdateActividadRequest {
  nombre?: string;
  monto?: number;
  activo?: boolean;
}

export interface ActividadResponse {
  actividad: Actividad;
  message: string;
}

export interface ActividadListResponse {
  actividades: Actividad[];
  total: number;
}
