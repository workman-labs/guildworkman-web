import axios from "axios";
import { API_BASE_URL } from "./config";
import type {
  ApiEnvelope,
  AuthApiResponse,
  BookAppointmentRequest,
  BookAppointmentResponse,
  LoginRequest,
  RegistrationRequest,
  RegistrationResponse,
  UpdateAppointmentRequest,
  UserType,
  ViewAllAppointmentsResponse,
} from "./types";

async function requestJson<TResponse>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorData.message ?? "unknown error"}`
    );
  }

  return response.json();
}

const postJson = <T>(path: string, body: unknown) => requestJson<T>("POST", path, body);
const getJson = <T>(path: string) => requestJson<T>("GET", path);

// --- Client ---

export const clientSignupApi = (userData: RegistrationRequest) =>
  postJson<RegistrationResponse>("/api/v1/client/registerClient", userData);

export const bookingApi = (userData: BookAppointmentRequest) =>
  postJson<BookAppointmentResponse>("/api/v1/client/bookAppointment", userData);

/* Appointment management — shapes matched to guildworkman-api:
   - cancel/update are PUT with the id in the `appointmentId` query param
   - delete is DELETE with the id in query + a { appointment_Id } body
   - all wrap their payload in ApiResponse { data, status }
   NOTE: viewAllAppointment currently returns a SINGLE appointment
   (scheduleTime + category, no id/status). A proper list is pending a
   backend change — see the appointments-API spec in this PR. */

export const viewAllAppointmentApi = (clientId: string) =>
  getJson<ApiEnvelope<ViewAllAppointmentsResponse>>(
    `/api/v1/client/viewAllAppointment?clientId=${encodeURIComponent(clientId)}`
  );

export const cancelAppointmentApi = (appointmentId: number) =>
  requestJson<ApiEnvelope<unknown>>(
    "PUT",
    `/api/v1/client/cancelAppointment?appointmentId=${appointmentId}`
  );

export const updateAppointmentApi = (appointmentId: number, body: UpdateAppointmentRequest) =>
  requestJson<ApiEnvelope<unknown>>(
    "PUT",
    `/api/v1/client/updateAppointment?appointmentId=${appointmentId}`,
    body
  );

export const deleteAppointmentApi = (appointmentId: number) =>
  requestJson<ApiEnvelope<unknown>>(
    "DELETE",
    `/api/v1/client/deleteAppointment?appointmentId=${appointmentId}`,
    { appointment_Id: appointmentId }
  );

// --- Skilled worker ---

export const skillWorkerApi = (userData: RegistrationRequest) =>
  postJson<RegistrationResponse>("/api/v1/skilledWorker/registerSkilledWorker", userData);

export const addSkillApi = (userData: unknown) =>
  postJson<{ message?: string }>("/api/v1/skilledWorker/addSkill", userData);

export const findWorkerById = (userData: unknown) =>
  postJson<unknown>("/api/v1/skilledWorker/findById", userData);

export const updateWorkerProfileApi = (userData: unknown) =>
  postJson<{ message?: string }>("/api/v1/skilledWorker/updateProfile", userData);

// --- Auth ---

export const loginApi = (loginData: LoginRequest, userType: UserType) => {
  const path =
    userType === "worker" ? "/api/v1/auth/login/worker" : "/api/v1/auth/login/client";
  return axios.post<AuthApiResponse["data"]>(`${API_BASE_URL}${path}`, loginData);
};
