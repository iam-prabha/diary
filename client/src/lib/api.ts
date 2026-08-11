import axios from "axios";
import type { Entry, Tag, User, CreateEntryInput, UpdateEntryInput } from "@/types";
import { toaster } from "@/components/ui/Toaster";

declare module "axios" {
  export interface AxiosRequestConfig {
    silent?: boolean;
  }
}

export interface ListParams {
  q?: string;
  tag?: string;
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface EntryListResponse {
  entries: Entry[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  nextCursor?: string | null;
  hasMore?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 15000,
  withCredentials: true,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const data = err.response?.data;
    const message = data?.error?.message || "Network error. Please try again.";
    if (!err.config?.silent) toaster.error(message);
    return Promise.reject(new Error(message));
  },
);

export const entriesApi = {
  list: (params: ListParams = {}) =>
    api.get<EntryListResponse>("/entries", { params }).then((r) => r.data),
  get: (id: string) => api.get<Entry>(`/entries/${id}`).then((r) => r.data),
  create: (input: CreateEntryInput) =>
    api.post<Entry>("/entries", input).then((r) => r.data),
  update: (id: string, input: UpdateEntryInput) =>
    api.patch<Entry>(`/entries/${id}`, input).then((r) => r.data),
  delete: (id: string) => api.delete(`/entries/${id}`),
};

export const tagsApi = {
  list: () => api.get<{ tags: Tag[] }>("/tags").then((r) => r.data.tags),
  create: (name: string, color?: string) =>
    api.post<Tag>("/tags", { name, color }).then((r) => r.data),
};

export interface UploadSignParams {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  uploadPreset: string;
  folder: string;
}

export const authApi = {
  me: () => api.get<{ user: User }>("/auth/me", { silent: true }).then((r) => r.data.user),
  logout: () => api.post("/auth/logout", undefined, { silent: true }),
  googleUrl: () => `${import.meta.env.VITE_API_URL || "/api"}/auth/google`,
};

export const uploadApi = {
  sign: () => api.get<UploadSignParams>("/upload/sign").then((r) => r.data),
  confirm: (data: {
    publicId: string;
    url: string;
    mimeType: string;
    size: number;
    width?: number;
    height?: number;
  }) => api.post("/upload/confirm", data).then((r) => r.data),
  delete: (publicId: string) => api.delete(`/upload/${publicId}`),
};
