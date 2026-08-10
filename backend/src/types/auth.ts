import { UserData } from './user';

export interface LoginRequest {
  emailOdni: string;
  password: string;
}

export interface ChangeInitialPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    user: UserData; 
  };
}
