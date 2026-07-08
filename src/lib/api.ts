import axios from "axios";
import { API_BASE_URL } from "./config";
import type {
  Appointment,
  AuthApiResponse,
  BookAppointmentRequest,
  BookAppointmentResponse,
  CancelAppointmentRequest,
  LoginRequest,
  RegistrationRequest,
  RegistrationResponse,
  UpdateAppointmentRequest,
  UserType,
} from "./types";

async function postJson<TResponse>(path: string, body: unknown): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorData.message ?? "unknown error"}`
    );
  }

  return response.json();
}

async function getJson<TResponse>(path: string): Promise<TResponse> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorData.message ?? "unknown error"}`
    );
  }

  return response.json();
}

// --- Client ---

export const clientSignupApi = (userData: RegistrationRequest) =>
  postJson<RegistrationResponse>("/api/v1/client/registerClient", userData);

export const bookingApi = (userData: BookAppointmentRequest) =>
  postJson<BookAppointmentResponse>("/api/v1/client/bookAppointment", userData);

export const cancelAppointmentApi = (userData: CancelAppointmentRequest) =>
  postJson<{ message?: string; data?: { token: string; refreshToken: string } }>(
    "/api/v1/client/cancelAppointment",
    userData
  );

export const updateAppointmentApi = (userData: UpdateAppointmentRequest) =>
  postJson<{ message?: string }>("/api/v1/client/updateAppointment", userData);

export const viewAllAppointmentApi = (clientId: string) =>
  getJson<Appointment[]>(`/api/v1/client/viewAllAppointment?clientId=${clientId}`);

export const deleteAppointmentApi = (userData: { id: number }) =>
  postJson<{ message?: string }>("/api/v1/client/deleteAppointment", userData);

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
