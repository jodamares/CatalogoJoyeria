<template>
  <main class="checkout">
    <div class="checkout__contenedor">
      <header class="checkout__header">
        <h1>Finalizar compra</h1>
        <button type="button" class="checkout__volver" @click="volverAlCatalogo">
          Volver al catalogo
        </button>
      </header>

      <div class="checkout__layout">
        <section class="checkout__formulario">
          <h2>Datos personales y envio</h2>
          <form @submit.prevent="procesarPago">
            <label>
              Nombre completo
              <input v-model.trim="form.nombre" type="text" required />
            </label>

            <label>
              Correo electronico
              <input v-model.trim="form.email" type="email" required />
            </label>

            <label>
              Telefono
              <input v-model.trim="form.telefono" type="tel" required />
            </label>

            <label>
              Direccion
              <input v-model.trim="form.direccion" type="text" required />
            </label>

            <div class="checkout__grid">
              <label>
                Ciudad
                <input v-model.trim="form.ciudad" type="text" required />
              </label>

              <label>
                Codigo postal
                <input v-model.trim="form.codigoPostal" type="text" required />
              </label>
            </div>

            <label>
              Metodo de pago
              <select v-model="form.metodoPago" required>
                <option value="tarjeta">Tarjeta (pasarela)</option>
                <option value="paypal">PayPal (pasarela)</option>
                <option value="transferencia">Transferencia bancaria</option>
              </select>
            </label>

            <p v-if="mensaje" class="checkout__mensaje">{{ mensaje }}</p>
            <button class="checkout__pagar" type="submit" :disabled="!carrito.length || procesandoPago">
              {{ procesandoPago ? "Procesando..." : "Confirmar y pagar" }}
            </button>
          </form>
        </section>

        <aside class="checkout__resumen">
          <h2>Resumen del pedido</h2>
          <p v-if="!carrito.length">Tu carrito esta vacio.</p>

          <ul v-else>
            <li v-for="item in carrito" :key="item.id">
              <img :src="item.imagen" :alt="item.nombre" />
              <div>
                <p>{{ item.nombre }}</p>
                <small>{{ item.cantidad }} x ${{ formatearPrecio(item.precio) }}</small>
              </div>
              <strong>${{ formatearPrecio(item.precio * item.cantidad) }}</strong>
            </li>
          </ul>

          <div class="checkout__total">
            <span>Total</span>
            <strong>${{ formatearPrecio(totalCompra) }}</strong>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useCheckoutView } from "../composables/useCheckoutView.js";
import "./styleCheckout.css";

const { carrito, totalCompra, formatearPrecio, form, procesandoPago, mensaje, procesarPago, volverAlCatalogo } =
  useCheckoutView();
</script>
