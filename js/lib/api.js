/**
 * HTTP client for Django REST API
 */
window.BSAPI = {
  _token: localStorage.getItem("barwaaqo_access_token"),

  setToken(token) {
    this._token = token;
    if (token) localStorage.setItem("barwaaqo_access_token", token);
    else localStorage.removeItem("barwaaqo_access_token");
  },

  getToken() {
    return this._token || localStorage.getItem("barwaaqo_access_token");
  },

  async request(path, options = {}) {
    const url = `${window.BSConfig.API_BASE.replace(/\/$/, "")}${path}`;
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let res;
    try {
      res = await fetch(url, { ...options, headers, signal: controller.signal });
    } catch (error) {
      if (controller.signal.aborted) {
        throw new Error("The server is taking too long to respond. Please try again.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }
    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { detail: text };
      }
    }

    if (!res.ok) {
      const err = new Error(data?.detail || data?.message || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      if (data?.code) err.code = data.code;
      if (data?.email) err.email = data.email;
      throw err;
    }
    return data;
  },

  get(path) {
    return this.request(path);
  },

  post(path, body) {
    return this.request(path, { method: "POST", body: JSON.stringify(body) });
  },

  patch(path, body) {
    return this.request(path, { method: "PATCH", body: JSON.stringify(body) });
  },

  delete(path) {
    return this.request(path, { method: "DELETE" });
  },

  async upload(path, formData) {
    const url = `${window.BSConfig.API_BASE.replace(/\/$/, "")}${path}`;
    const headers = {};
    const token = this.getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { method: "POST", body: formData, headers });
    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = { detail: text };
      }
    }
    if (!res.ok) {
      const err = new Error(data?.detail || data?.message || `Upload failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  async healthCheck() {
    const base = window.BSConfig.API_BASE;
    if (!base) return false;

    try {
      const url = `${base.replace(/\/$/, "")}/health/`;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const res = await fetch(url, { method: "GET", signal: controller.signal });
        return res.ok;
      } finally {
        clearTimeout(timeout);
      }
    } catch {
      return false;
    }
  },
};
