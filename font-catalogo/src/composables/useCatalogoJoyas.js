import { computed, onMounted, ref } from "vue";
import { obtenerJoyas } from "../services/catalogoService.js";

export function useCatalogoJoyas() {
  const joyas = ref([]);
  const loading = ref(false);
  const error = ref("");

  const totalJoyas = computed(() => joyas.value.length);

  async function cargarJoyas() {
    loading.value = true;
    error.value = "";
    try {
      joyas.value = await obtenerJoyas();
    } catch {
      error.value = "No fue posible cargar el catálogo.";
    } finally {
      loading.value = false;
    }
  }

  onMounted(cargarJoyas);

  return {
    joyas,
    loading,
    error,
    totalJoyas,
    cargarJoyas,
  };
}
