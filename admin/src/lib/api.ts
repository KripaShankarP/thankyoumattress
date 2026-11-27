/** Thin fetch wrapper for the NestJS API (proxied at /api by Vite, cookies included) */
export class ApiError extends Error {
  status: number;
  /** Every validation message (the headline is `message`) */
  messages: string[];
  constructor(status: number, message: string, messages: string[] = [message]) {
    super(message);
    this.status = status;
    this.messages = messages;
  }
}

/** Called when a request comes back 401 (session expired): the app sends the admin to sign in */
let onUnauthorized: () => void = () => {};
export const setUnauthorizedHandler = (fn: () => void) => {
  onUnauthorized = fn;
};

export async function api<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(`/api${path}`, {
    credentials: 'same-origin',
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/sign-in')) onUnauthorized();
    const raw = data?.message;
    const list: string[] = Array.isArray(raw) ? raw : [raw ?? res.statusText ?? 'Something went wrong'];
    // "variants.0.prices: Give one price…" → "Give one price…" for the headline
    throw new ApiError(res.status, list[0].replace(/^[\w.]+:\s*/, ''), list);
  }
  return data as T;
}

export const get = <T>(path: string) => api<T>(path);
export const post = <T>(path: string, json?: unknown) => api<T>(path, { method: 'POST', json });
export const put = <T>(path: string, json: unknown) => api<T>(path, { method: 'PUT', json });
export const patch = <T>(path: string, json: unknown) => api<T>(path, { method: 'PATCH', json });
export const del = (path: string) => api<void>(path, { method: 'DELETE' });

export type Uploaded = { url: string; type: 'image' | 'video'; size: number; name: string };

/** Uploads one file (image ≤ 10 MB, video ≤ 500 MB) with progress */
export function upload(file: File, onProgress?: (pct: number) => void): Promise<Uploaded> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/admin/uploads');
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: { message?: string | string[] } & Partial<Uploaded> = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data as Uploaded);
      if (xhr.status === 401) onUnauthorized();
      const m = Array.isArray(data.message) ? data.message[0] : data.message;
      reject(new ApiError(xhr.status, xhr.status === 413 && !m ? 'File is too large' : (m ?? 'Upload failed')));
    };
    xhr.onerror = () => reject(new ApiError(0, 'Network error — is the backend running?'));
    const body = new FormData();
    body.append('file', file);
    xhr.send(body);
  });
}
