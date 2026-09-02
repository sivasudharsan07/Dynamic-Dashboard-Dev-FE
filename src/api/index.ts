// ============================================================
// Centralised API Layer — all backend calls go through here
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem('dd-session');
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const token = parsed?.state?.session?.token;
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ---- Auth ----
export const authApi = {
  login: (creds: { username: string; password: string }) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify(creds) }),
  register: (data: { username: string; email: string; password: string }) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  requestAccess: (data: { username: string; email: string; reason: string }) =>
    request('/auth/request-access', { method: 'POST', body: JSON.stringify(data) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
};

// ---- Tenant ----
export const tenantApi = {
  get: (tenantId: string) => request(`/tenant/${tenantId}`),
  update: (tenantId: string, data: unknown) =>
    request(`/tenant/${tenantId}`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ---- Datasets ----
export const datasetsApi = {
  list: () => request('/datasets'),
  get: (uniqueId: string) => request(`/datasets/${uniqueId}`),
  rename: (uniqueId: string, displayName: string) =>
    request(`/datasets/${uniqueId}/rename`, { method: 'PATCH', body: JSON.stringify({ displayName }) }),
  delete: (uniqueId: string) => request(`/datasets/${uniqueId}`, { method: 'DELETE' }),
};

// ---- Sources ----
export const sourcesApi = {
  getLimits: () => request('/sources/limits'),
  upload: (formData: FormData) =>
    fetch(`${BASE_URL}/sources/upload`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    }).then((r) => r.json()),
  uploadDbml: (formData: FormData) =>
    fetch(`${BASE_URL}/sources/dbml`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: formData,
    }).then((r) => r.json()),
  getDbmlSchema: (uniqueId: string) => request(`/sources/dbml/${uniqueId}/schema`),
};

// ---- Ingestion ----
export const ingestionApi = {
  list: () => request('/ingestion'),
  get: (uniqueId: string) => request(`/ingestion/${uniqueId}`),
  retry: (uniqueId: string) => request(`/ingestion/${uniqueId}/retry`, { method: 'POST' }),
  delete: (uniqueId: string) => request(`/ingestion/${uniqueId}`, { method: 'DELETE' }),
  setNullValues: (uniqueId: string, enabled: boolean) =>
    request(`/ingestion/${uniqueId}/null-values`, { method: 'PATCH', body: JSON.stringify({ enabled }) }),
};

// ---- Catalog ----
export const catalogApi = {
  list: () => request('/catalog'),
  get: (uniqueId: string) => request(`/catalog/${uniqueId}`),
  getLineage: (uniqueId: string) => request(`/catalog/${uniqueId}/lineage`),
};

// ---- Semantics ----
export const semanticsApi = {
  getAll: () => request('/semantics'),
  createTerm: (data: unknown) => request('/semantics/terms', { method: 'POST', body: JSON.stringify(data) }),
  updateTerm: (id: string, data: unknown) => request(`/semantics/terms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTerm: (id: string) => request(`/semantics/terms/${id}`, { method: 'DELETE' }),
  createMeasure: (data: unknown) => request('/semantics/measures', { method: 'POST', body: JSON.stringify(data) }),
  updateMeasure: (id: string, data: unknown) => request(`/semantics/measures/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMeasure: (id: string) => request(`/semantics/measures/${id}`, { method: 'DELETE' }),
  createJoin: (data: unknown) => request('/semantics/joins', { method: 'POST', body: JSON.stringify(data) }),
  deleteJoin: (id: string) => request(`/semantics/joins/${id}`, { method: 'DELETE' }),
};

// ---- Dashboard & Widgets ----
export const dashboardApi = {
  get: () => request('/dashboard'),
  rename: (name: string) => request('/dashboard/rename', { method: 'PATCH', body: JSON.stringify({ name }) }),
};

export const widgetsApi = {
  list: () => request('/widgets'),
  get: (id: string) => request(`/widgets/${id}`),
  create: (data: unknown) => request('/widgets', { method: 'POST', body: JSON.stringify(data) }),
  rename: (id: string, name: string) => request(`/widgets/${id}/rename`, { method: 'PATCH', body: JSON.stringify({ name }) }),
  duplicate: (id: string) => request(`/widgets/${id}/duplicate`, { method: 'POST' }),
  delete: (id: string) => request(`/widgets/${id}`, { method: 'DELETE' }),
  getInsight: (id: string) => request(`/widgets/${id}/insight`),
  morph: (id: string, type: string) => request(`/widgets/${id}/morph`, { method: 'PATCH', body: JSON.stringify({ type }) }),
};

// ---- Chat ----
export const chatApi = {
  sendMessage: (threadId: string, message: string, datasetIds?: string[]) =>
    request('/chat', { method: 'POST', body: JSON.stringify({ threadId, message, datasetIds }) }),
  getThread: (threadId: string) => request(`/chat/${threadId}`),
};

// ---- Reports ----
export const reportsApi = {
  list: () => request('/reports'),
  generate: (widgetIds: string[]) => request('/reports', { method: 'POST', body: JSON.stringify({ widgetIds }) }),
  exportPdf: (id: string) => `${BASE_URL}/reports/${id}/export/pdf`,
  exportCsv: (id: string) => `${BASE_URL}/reports/${id}/export/csv`,
};

// ---- Users ----
export const usersApi = {
  list: () => request('/users'),
  get: (id: string) => request(`/users/${id}`),
  block: (id: string) => request(`/users/${id}/block`, { method: 'POST' }),
  unblock: (id: string) => request(`/users/${id}/unblock`, { method: 'POST' }),
  getActive: () => request('/users/active'),
};

// ---- Agent Logs ----
export const agentLogsApi = {
  list: () => request('/agent-logs'),
};

// ---- Audit ----
export const auditApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/audit${qs}`);
  },
  getEvent: (id: string) => request(`/audit/${id}`),
};
