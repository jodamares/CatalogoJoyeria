export async function iniciarPagoConPasarela(payload) {
  const baseUrl = import.meta.env.VITE_PAYMENT_API_URL;

  if (!baseUrl) {
    return {
      ok: false,
      message:
        "Falta configurar VITE_PAYMENT_API_URL para conectar la pasarela de pago.",
    };
  }

  try {
    const response = await fetch(`${baseUrl}/checkout-session`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        message: errorText || "No se pudo crear la sesion de pago.",
      };
    }

    const data = await response.json();
    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      message: "Error de conexion con la pasarela de pago.",
      error,
    };
  }
}
