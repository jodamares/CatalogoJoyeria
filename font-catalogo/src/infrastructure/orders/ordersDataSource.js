const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export async function createOrder(payload, token) {
  const response = await fetch(`${BACKEND_API_URL}/api/ordenes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || "No fue posible crear la orden.");
  }

  return data;
}
