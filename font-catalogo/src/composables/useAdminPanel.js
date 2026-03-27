import { onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "./useAuth.js";
import {
  actualizarPrecioOro,
  crearProductoAdmin,
  actualizarProductoAdmin,
  actualizarSiteConfig,
  obtenerComprasAdmin,
  obtenerPreciosOro,
  obtenerProductosAdmin,
  obtenerSiteConfig,
  obtenerSolicitudesAdmin,
} from "../services/adminService.js";

function createProductTemplate() {
  return {
    name: "",
    description: "",
    imageUrl: "",
    categoryId: "",
    materialType: "ORO",
    karat: "K18",
    weightGrams: 1,
    laborCost: 0,
    marginCost: 0,
    fixedBasePrice: 0,
    active: true,
  };
}

function cloneEditableProduct(product) {
  return {
    id: product.id,
    name: product.name || "",
    description: product.description || "",
    categoryId: product.categoryId || "",
    materialType: product.materialType || "ORO",
    karat: product.karat || "K18",
    weightGrams: Number(product.weightGrams || 0),
    laborCost: Number(product.laborCost || 0),
    marginCost: Number(product.marginCost || 0),
    fixedBasePrice: Number(product.fixedBasePrice || 0),
    imageUrl: product.imageUrl || "",
    active: Boolean(product.active),
    calculatedPrice: Number(product.calculatedPrice || 0),
  };
}

export function useAdminPanel() {
  const router = useRouter();
  const { token } = useAuth();

  const loading = ref(false);
  const error = ref("");
  const goldPrices = ref([]);
  const products = ref([]);
  const categories = ref([]);
  const orders = ref([]);
  const quotes = ref([]);
  const siteConfigForm = reactive({ storeName: "Joyeria Premiun", logoUrl: "" });
  const newProduct = reactive(createProductTemplate());
  const editProduct = reactive(createProductTemplate());
  const editProductId = ref("");
  const showEditModal = ref(false);

  const sections = [
    { id: "brand", label: "Configuracion marca" },
    { id: "gold", label: "Precio oro" },
    { id: "create", label: "Agregar producto" },
    { id: "products", label: "Editar productos" },
    { id: "orders", label: "Compras" },
    { id: "quotes", label: "Solicitudes" },
  ];
  const activeSection = ref("brand");

  const goCatalog = () => router.push("/");
  const formatPrice = (value) => Number(value || 0).toLocaleString("es");
  const formatDate = (value) => new Date(value).toLocaleString("es-CO");
  const setError = (message) => {
    error.value = message || "";
  };

  const handleSiteLogoFileChange = async (event) => {
    try {
      error.value = "";
      const input = event.target;
      const file = input?.files?.[0];
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        throw new Error("Debes seleccionar un archivo de imagen.");
      }
      const reader = new FileReader();
      const imageDataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(new Error("No fue posible leer el archivo de imagen."));
        reader.readAsDataURL(file);
      });
      siteConfigForm.logoUrl = String(imageDataUrl);
    } catch (err) {
      error.value = err.message || "No fue posible cargar el logo.";
    }
  };

  const loadAll = async () => {
    loading.value = true;
    error.value = "";
    try {
      const [goldRes, productsRes, siteRes, ordersRes, quotesRes] = await Promise.all([
        obtenerPreciosOro(token.value),
        obtenerProductosAdmin(token.value),
        obtenerSiteConfig(),
        obtenerComprasAdmin(token.value),
        obtenerSolicitudesAdmin(token.value),
      ]);

      goldPrices.value = goldRes.items || [];
      products.value = productsRes.items || [];
      categories.value = productsRes.categories || [];
      orders.value = ordersRes.items || [];
      quotes.value = quotesRes.items || [];

      if (!newProduct.categoryId && categories.value.length) {
        newProduct.categoryId = categories.value[0].id;
      }

      if (siteRes.item) {
        siteConfigForm.storeName = siteRes.item.storeName || "Joyeria Premiun";
        siteConfigForm.logoUrl = siteRes.item.logoUrl || "";
      }
    } catch (err) {
      error.value = err.message || "No fue posible cargar panel admin.";
    } finally {
      loading.value = false;
    }
  };

  const saveGold = async (item) => {
    try {
      error.value = "";
      await actualizarPrecioOro(token.value, {
        karat: item.karat,
        pricePerGram: item.pricePerGram,
        source: "admin-panel",
      });
    } catch (err) {
      error.value = err.message || "No fue posible guardar precio de oro.";
    }
  };

  const saveConfig = async () => {
    try {
      error.value = "";
      await actualizarSiteConfig(token.value, {
        storeName: siteConfigForm.storeName,
        logoUrl: siteConfigForm.logoUrl,
      });
    } catch (err) {
      error.value = err.message || "No fue posible guardar configuracion.";
    }
  };

  const createProduct = async () => {
    try {
      error.value = "";
      const payload = {
        ...newProduct,
        karat: newProduct.materialType === "ORO" ? newProduct.karat : null,
        fixedBasePrice: newProduct.materialType === "ORO" ? null : Number(newProduct.fixedBasePrice || 0),
      };
      const response = await crearProductoAdmin(token.value, payload);
      if (response?.item) {
        products.value.unshift(response.item);
        Object.assign(newProduct, createProductTemplate(), {
          categoryId: categories.value[0]?.id || "",
        });
      }
    } catch (err) {
      error.value = err.message || "No fue posible crear producto.";
    }
  };

  const openEditProduct = (product) => {
    error.value = "";
    editProductId.value = product.id;
    Object.assign(editProduct, cloneEditableProduct(product));
    showEditModal.value = true;
  };

  const closeEditProduct = () => {
    showEditModal.value = false;
    editProductId.value = "";
    Object.assign(editProduct, createProductTemplate());
  };

  const updateEditingProduct = async () => {
    try {
      error.value = "";
      if (!editProductId.value) return;

      const response = await actualizarProductoAdmin(token.value, editProductId.value, {
        name: editProduct.name,
        description: editProduct.description,
        categoryId: editProduct.categoryId,
        materialType: editProduct.materialType,
        karat: editProduct.materialType === "ORO" ? editProduct.karat : null,
        weightGrams: editProduct.weightGrams,
        laborCost: editProduct.laborCost,
        marginCost: editProduct.marginCost,
        fixedBasePrice: editProduct.materialType === "ORO" ? null : editProduct.fixedBasePrice,
        imageUrl: editProduct.imageUrl,
        active: editProduct.active,
      });

      const updated = response?.item;
      if (updated) {
        const index = products.value.findIndex((item) => item.id === editProductId.value);
        if (index >= 0) {
          products.value[index] = { ...products.value[index], ...updated };
        }
      }
      closeEditProduct();
    } catch (err) {
      error.value = err.message || "No fue posible actualizar producto.";
    }
  };

  const toJoyaCard = (product) => ({
    id: product.id,
    nombre: product.name,
    tipo: product.description,
    precio: Number(product.calculatedPrice || 0),
    imagen: product.imageUrl,
  });

  onMounted(loadAll);

  return {
    loading,
    error,
    goldPrices,
    products,
    categories,
    orders,
    quotes,
    siteConfigForm,
    newProduct,
    editProduct,
    showEditModal,
    sections,
    activeSection,
    goCatalog,
    formatPrice,
    formatDate,
    setError,
    handleSiteLogoFileChange,
    saveGold,
    saveConfig,
    createProduct,
    openEditProduct,
    closeEditProduct,
    updateEditingProduct,
    toJoyaCard,
  };
}
