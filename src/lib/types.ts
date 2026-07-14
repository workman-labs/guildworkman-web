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
  /** The pro being booked. Optional on the backend; we can only send it once
      workers come from the API — the browse list is still sample data whose
      ids ("gw-chidi") aren't the backend's numeric SkilledWorker ids. */
  skilledWorkerId?: number;
  /** Agreed price, in naira. */
  amount?: number;
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

/** The pro attached to an appointment. Null when the booking didn't record
    one (skilledWorkerId is optional on the backend). */
export interface AppointmentWorker {
  id: number;
  fullName: string;
  category: string | null;
}

/** One appointment from viewAllAppointment, which returns a LIST of these.
    The `id` is what cancel/update/delete take as ?appointmentId= — without it
    appointment management was unreachable from the client. */
export interface ViewAllAppointmentsResponse {
  id: number;
  status: AppointmentStatus;
  category: string;
  /** LocalDateTime, no zone — e.g. "2026-07-20T10:30:00". */
  scheduleTime: string;
  amount: number | null;
  worker: AppointmentWorker | null;
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
