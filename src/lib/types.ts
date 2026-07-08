export interface RegistrationRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegistrationResponse {
  message: string;
  clientId?: number;
  skilledWorkerId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponseData {
  token: string;
  refreshToken: string;
  userId: string;
}

export interface AuthApiResponse {
  data: {
    data: LoginResponseData;
    message?: string;
  };
}

export type UserType = "client" | "worker";

export interface BookAppointmentRequest {
  scheduleTime: string;
  category: string;
  clientId: string;
}

export interface Appointment {
  id: number;
  title?: string;
  date?: string;
  scheduleTime?: string;
  category?: string;
  status?: string;
}

export interface BookAppointmentResponse {
  status: boolean;
  data: {
    message?: string;
    scheduleTime?: string;
    status?: string;
    error?: string;
  };
}

export interface CancelAppointmentRequest {
  id: number;
}

export interface UpdateAppointmentRequest {
  id: number;
  status: string;
}

export interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const apiError = error as ApiErrorResponse;
  return apiError.response?.data?.message ?? apiError.message ?? fallback;
}
