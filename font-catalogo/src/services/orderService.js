import { createOrder } from "../infrastructure/orders/ordersDataSource.js";

export async function crearOrden(payload, token) {
  return createOrder(payload, token);
}
