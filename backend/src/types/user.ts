import { Socio } from './Socio';
export type Sexo = 'MASCULINO' | 'FEMENINO' | 'OTRO';
export type Role = 'ADMIN' | 'ADMINISTRATIVO' | 'SOCIO';
import { Administrativo } from './administrativo';

export interface UserData {
  id: number;
  email: string;
  role: Role;
  creadoEn: Date;
  requiereCambioPassword?: boolean;
  socio?: Socio | null; 
  administrativo?: Administrativo| null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role: Role;
  socio?: {
    nombre: string;
    apellido: string;
    dni: number;
    fechaNacimiento: Date;
    pais: string;
    sexo: Sexo;
    fotoCarnet?: string | null;
  };
  administrativo?: {
    nombre: string;
    apellido: string;
    dni: number;
  };
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: Role;
  socio?: {
    nombre: string;
    apellido: string;
    dni: number;
    fechaNacimiento: Date;
    pais: string;
    sexo: Sexo;
    fotoCarnet?: string | null;
  }; 
  administrativo?: {
    nombre: string;
    apellido: string;
    dni: number;
  };
}

export interface UserResponse {
  user: UserData;
  message: string;
}

export interface UsersListResponse {
  users: UserData[];
  total: number;
  message: string;
}
