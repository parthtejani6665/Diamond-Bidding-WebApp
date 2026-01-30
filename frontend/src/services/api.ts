const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

/** Same key as AuthContext - used to attach token when context hasn't updated yet */
const AUTH_STORAGE_KEY = "diamond-bidding-auth";

function getStoredToken(): string | null {
  try {
    const raw = typeof window !== "undefined" ? window.sessionStorage.getItem(AUTH_STORAGE_KEY) : null;
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string };
    return parsed?.token ?? null;
  } catch {
    return null;
  }
}

/** Base URL for backend (without /api) - used for uploads/images */
export const getUploadBaseUrl = () => {
  return API_BASE_URL.replace(/\/api\/?$/, "") || "http://localhost:4000";
};

/** Full URL for an upload path (e.g. /uploads/diamonds/xxx.jpg) */
export const getUploadUrl = (path: string) => {
  if (!path) return "";
  const base = getUploadBaseUrl();
  return path.startsWith("http") ? path : `${base}${path}`;
};

export interface ApiOptions extends RequestInit {
  authToken?: string | null;
}

export const apiFetch = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const { authToken, headers, ...rest } = options;

  const body = (rest as { body?: unknown }).body;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const mergedHeaders: HeadersInit = {
    ...(headers || {}),
  };

  if (!isFormData) {
    (mergedHeaders as Record<string, string>)["Content-Type"] = "application/json";
  }

  const token = authToken ?? getStoredToken();
  if (token) {
    (mergedHeaders as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: mergedHeaders,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const data = await res.json();
      if (data?.message) {
        message = data.message;
      }
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(message);
  }

  return (await res.json()) as T;
};

