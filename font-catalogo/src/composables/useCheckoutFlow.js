import { reactive, ref } from "vue";
import { iniciarPagoConPasarela } from "../infrastructure/payments/paymentGateway";
import { crearOrden } from "../services/orderService.js";

export function useCheckoutFlow({ carrito, totalCompra, limpiarCarrito, authToken }) {
  const procesandoPago = ref(false);
  const mensaje = ref("");

  const form = reactive({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    ciudad: "",
    codigoPostal: "",
    metodoPago: "tarjeta",
  });

  const procesarPago = async () => {
    if (!carrito.value.length) {
      mensaje.value = "No hay articulos en el carrito.";
      return;
    }

    mensaje.value = "";
    procesandoPago.value = true;

    const payload = {
      customer: { ...form },
      items: carrito.value,
      total: totalCompra.value,
      currency: "COP",
    };

    try {
      await crearOrden(payload, authToken?.value || "");
    } catch (error) {
      procesandoPago.value = false;
      mensaje.value = error.message || "No fue posible registrar la compra.";
      return;
    }

    if (form.metodoPago === "transferencia") {
      procesandoPago.value = false;
      mensaje.value =
        "Pedido creado. Te contactaremos por correo para compartir datos de transferencia.";
      limpiarCarrito();
      return;
    }

    const resultado = await iniciarPagoConPasarela(payload);
    procesandoPago.value = false;

    if (!resultado.ok) {
      mensaje.value = resultado.message;
      return;
    }

    const checkoutUrl = resultado.data?.checkoutUrl;
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
      return;
    }

    mensaje.value = "Sesion de pago creada, pero falta URL de redireccion en la respuesta.";
  };

  return {
    form,
    procesandoPago,
    mensaje,
    procesarPago,
  };
}
