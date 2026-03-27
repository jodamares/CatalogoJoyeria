const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

async function requestAdmin(path, token, options = {}) {
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "Error en API admin.");
  }
  return data;
}

export function fetchGoldPrices(token) {
  return requestAdmin("/api/precio-oro", token, { method: "GET" });
}

export function saveGoldPrice(token, payload) {
  return requestAdmin("/api/admin/precio-oro", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminProducts(token) {
  return requestAdmin("/api/admin/productos", token, { method: "GET" });
}

export function updateAdminProduct(token, id, payload) {
  return requestAdmin(`/api/admin/productos/${id}`, token, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function createAdminProduct(token, payload) {
  return requestAdmin("/api/admin/productos", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchSiteConfig() {
  return fetch(`${BACKEND_API_URL}/api/site-config`)
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.message || "Error al cargar configuracion.");
      }
      return data;
    });
}

export function saveSiteConfig(token, payload) {
  return requestAdmin("/api/admin/site-config", token, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAdminOrders(token) {
  return requestAdmin("/api/admin/compras", token, { method: "GET" });
}

export function fetchAdminQuotes(token) {
  return requestAdmin("/api/admin/solicitudes", token, { method: "GET" });
}
