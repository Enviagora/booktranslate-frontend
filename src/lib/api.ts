import { createClient } from '@/lib/supabase/client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

async function getAuthToken(): Promise<string> {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Não autenticado');
  }

  return session.access_token;
}

interface ApiOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
}

export async function apiCall(
  endpoint: string,
  options: ApiOptions = {}
): Promise<Response> {
  const token = await getAuthToken();
  const url = `${API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(options.headers || {}),
  };

  const config: RequestInit = {
    method: options.method,
    headers,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.detail || errorData.message || `Erro da API: ${response.status}`
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  return response;
}

export async function apiGet(endpoint: string) {
  const response = await apiCall(endpoint, { method: 'GET' });
  return response.json();
}

export async function apiPost(endpoint: string, body: unknown) {
  const response = await apiCall(endpoint, {
    method: 'POST',
    body,
  });
  return response.json();
}

export async function apiPut(endpoint: string, body: unknown) {
  const response = await apiCall(endpoint, {
    method: 'PUT',
    body,
  });
  return response.json();
}

export async function apiDelete(endpoint: string) {
  await apiCall(endpoint, { method: 'DELETE' });
}

export async function apiPatch(endpoint: string, body: unknown) {
  const response = await apiCall(endpoint, {
    method: 'PATCH',
    body,
  });
  return response.json();
}
