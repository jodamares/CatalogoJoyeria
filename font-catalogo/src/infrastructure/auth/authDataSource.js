const AUTH_API_BASE_URL =
  import.meta.env.VITE_AUTH_API_URL || "http://localhost:3000/api/auth";

async function requestAuth(path, options = {}) {
  const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Error en autenticacion.");
  }

  return data;
}

export function registerUser(payload) {
  return requestAuth("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload) {
  return requestAuth("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getCurrentUser(token) {
  return requestAuth("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
