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

/** Backend wraps most responses as ApiResponse { data, status }. */
export interface ApiEnvelope<T> {
  data: T;
  status: boolean;
}

/** Mirrors the backend's AppointmentStatus enum. */
export type AppointmentStatus =
  | "ACCEPTED"
  | "DECLINED"
  | "SCHEDULED"
  | "CANCELLED"
  | "UPDATED";

/** What the current viewAllAppointment endpoint actually returns — a single
    record with just these two fields. A full list (id, status, worker,
    amount) is pending a backend change; see the appointments-API spec. */
export interface ViewAllAppointmentsResponse {
  scheduleTime: string;
  category: string;
}

/** Richer domain shape the redesigned account screens will use once the
    backend returns it. Not yet populated by the live API. */
export interface Appointment {
  id: number;
  scheduleTime?: string;
  category?: string;
  status?: AppointmentStatus;
  amount?: number;
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

/** PUT body for updateAppointment; the id travels in the `appointmentId`
    query param, not the body. */
export interface UpdateAppointmentRequest {
  status: AppointmentStatus;
  clientId?: string;
  amount?: number;
  startTime?: string;
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
