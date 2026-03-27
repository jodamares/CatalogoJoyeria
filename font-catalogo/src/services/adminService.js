import {
  createAdminProduct,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminQuotes,
  fetchGoldPrices,
  fetchSiteConfig,
  saveGoldPrice,
  saveSiteConfig,
  updateAdminProduct,
} from "../infrastructure/admin/adminDataSource.js";

export const obtenerPreciosOro = (token) => fetchGoldPrices(token);
export const actualizarPrecioOro = (token, payload) => saveGoldPrice(token, payload);
export const obtenerProductosAdmin = (token) => fetchAdminProducts(token);
export const crearProductoAdmin = (token, payload) => createAdminProduct(token, payload);
export const actualizarProductoAdmin = (token, id, payload) => updateAdminProduct(token, id, payload);
export const obtenerSiteConfig = () => fetchSiteConfig();
export const actualizarSiteConfig = (token, payload) => saveSiteConfig(token, payload);
export const obtenerComprasAdmin = (token) => fetchAdminOrders(token);
export const obtenerSolicitudesAdmin = (token) => fetchAdminQuotes(token);
