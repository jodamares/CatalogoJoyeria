import { useRouter } from "vue-router";
import { useAuth } from "./useAuth.js";
import { useCarrito } from "./useCarrito.js";
import { useCheckoutFlow } from "./useCheckoutFlow.js";

export function useCheckoutView() {
  const router = useRouter();
  const { token } = useAuth();
  const { carrito, totalCompra, formatearPrecio, limpiarCarrito } = useCarrito();
  const { form, procesandoPago, mensaje, procesarPago } = useCheckoutFlow({
    carrito,
    totalCompra,
    limpiarCarrito,
    authToken: token,
  });

  const volverAlCatalogo = () => {
    router.push("/");
  };

  return {
    carrito,
    totalCompra,
    formatearPrecio,
    form,
    procesandoPago,
    mensaje,
    procesarPago,
    volverAlCatalogo,
  };
}
