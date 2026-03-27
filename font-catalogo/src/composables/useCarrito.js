import { computed, onMounted, ref, watch } from "vue";

const STORAGE_KEY = "carrito";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&auto=format&fit=crop&q=80";

function normalizarItem(item) {
  return {
    id: item.id,
    nombre: item.nombre,
    precio: Number(item.precio) || 0,
    imagen: item.imagen || FALLBACK_IMAGE,
    cantidad: Number(item.cantidad) || 1,
  };
}

export function useCarrito() {
  const carrito = ref([]);

  const cantidadTotalItems = computed(() =>
    carrito.value.reduce((acumulado, item) => acumulado + item.cantidad, 0)
  );

  const totalCompra = computed(() =>
    carrito.value.reduce((acumulado, item) => acumulado + item.precio * item.cantidad, 0)
  );

  const formatearPrecio = (valor) => Number(valor).toLocaleString("es");

  const cargarDesdeStorage = () => {
    try {
      const carritoGuardado = localStorage.getItem(STORAGE_KEY);
      if (!carritoGuardado) {
        carrito.value = [];
        return;
      }

      const parsed = JSON.parse(carritoGuardado);
      carrito.value = Array.isArray(parsed) ? parsed.map(normalizarItem) : [];
    } catch {
      carrito.value = [];
    }
  };

  const guardarEnStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito.value));
  };

  const agregarAlCarrito = (joya) => {
    const itemExistente = carrito.value.find((item) => item.id === joya.id);

    if (itemExistente) {
      itemExistente.cantidad += 1;
      return;
    }

    carrito.value.push(
      normalizarItem({
        id: joya.id,
        nombre: joya.nombre,
        precio: joya.precio,
        imagen: joya.imagen,
        cantidad: 1,
      })
    );
  };

  const incrementarCantidad = (id) => {
    const item = carrito.value.find((producto) => producto.id === id);
    if (item) {
      item.cantidad += 1;
    }
  };

  const disminuirCantidad = (id) => {
    const item = carrito.value.find((producto) => producto.id === id);
    if (!item) return;

    if (item.cantidad > 1) {
      item.cantidad -= 1;
      return;
    }

    carrito.value = carrito.value.filter((producto) => producto.id !== id);
  };

  const eliminarItem = (id) => {
    carrito.value = carrito.value.filter((producto) => producto.id !== id);
  };

  const limpiarCarrito = () => {
    carrito.value = [];
  };

  onMounted(cargarDesdeStorage);

  watch(
    carrito,
    () => {
      guardarEnStorage();
    },
    { deep: true }
  );

  return {
    carrito,
    cantidadTotalItems,
    totalCompra,
    formatearPrecio,
    agregarAlCarrito,
    incrementarCantidad,
    disminuirCantidad,
    eliminarItem,
    limpiarCarrito,
    cargarDesdeStorage,
  };
}
