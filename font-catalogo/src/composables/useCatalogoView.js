import { computed, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCarrito } from "./useCarrito.js";
import { useCatalogoJoyas } from "./useCatalogoJoyas.js";

export function useCatalogoView() {
  const { joyas, loading, error } = useCatalogoJoyas();
  const {
    carrito,
    cantidadTotalItems,
    totalCompra,
    formatearPrecio,
    agregarAlCarrito,
    incrementarCantidad,
    disminuirCantidad,
    eliminarItem,
  } = useCarrito();

  const carritoAbierto = ref(false);
  const router = useRouter();
  const route = useRoute();

  const categoriaSeleccionada = computed(() => String(route.query.categoria || ""));
  const joyasFiltradas = computed(() => {
    if (!categoriaSeleccionada.value) return joyas.value;
    return joyas.value.filter((joya) => joya.categoriaSlug === categoriaSeleccionada.value);
  });

  const toggleCarrito = () => {
    carritoAbierto.value = !carritoAbierto.value;
  };

  const cerrarCarrito = () => {
    carritoAbierto.value = false;
  };

  const irAPagar = () => {
    router.push("/checkout");
  };

  return {
    joyas,
    joyasFiltradas,
    loading,
    error,
    carrito,
    cantidadTotalItems,
    totalCompra,
    formatearPrecio,
    agregarAlCarrito,
    incrementarCantidad,
    disminuirCantidad,
    eliminarItem,
    carritoAbierto,
    toggleCarrito,
    cerrarCarrito,
    irAPagar,
  };
}
