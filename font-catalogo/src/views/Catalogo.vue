<template>

  <BaseHeader />

  <body>
    <div class="catalogo">
      <div class="bolsa-de-compras" :class="{ oculta: carritoAbierto }">
        <button type="button" class="bolsa-boton" @click="toggleCarrito" aria-label="Abrir bolsa de compras">
          <img src="../assets/img/bag.png" alt="Carrito de compras">
          <span v-if="cantidadTotalItems > 0" class="bolsa-cantidad">{{ cantidadTotalItems }}</span>
        </button>
      </div>
      <p v-if="loading" class="estado">Cargando catálogo...</p>
      <p v-else-if="error" class="estado error">{{ error }}</p>

      <p v-else-if="!joyasFiltradas.length" class="estado">No hay productos en esta categoria.</p>

      <div v-else class="grid">
        <JoyaItem v-for="joya in joyasFiltradas" :key="joya.id" :joya="joya" @agregar-al-carrito="agregarAlCarrito" />
      </div>
    </div>

    <div class="carrito-overlay" :class="{ abierto: carritoAbierto }" @click="cerrarCarrito"></div>
    <aside class="carrito-panel" :class="{ abierto: carritoAbierto }" aria-label="Bolsa de compras">
      <div class="carrito-header">
        <h3 class="no-margin">Tu bolsa</h3>
        <button type="button" class="carrito-cerrar" @click="cerrarCarrito" aria-label="Cerrar bolsa">×</button>
      </div>

      <p v-if="!carrito.length" class="carrito-vacio">Todavia no agregaste articulos.</p>

      <ul v-else class="carrito-lista">
        <li v-for="item in carrito" :key="item.id" class="carrito-item">
          <div class="carrito-item__encabezado">
            <img
              :src="item.imagen"
              :alt="item.nombre" class="carrito-item__imagen">
            <div class="carrito-item__info">
              <p class="no-margin carrito-item__nombre">{{ item.nombre }}</p>
              <p class="no-margin carrito-item__precio">Precio: ${{ formatearPrecio(item.precio) }}</p>
            </div>
            <button type="button" class="carrito-item__eliminar" @click="eliminarItem(item.id)">
              <svg viewBox="0 0 448 512" aria-hidden="true" focusable="false">
                <path
                  d="M135.2 17.7C140.6 7.1 151.3 0 162.9 0H285.1c11.6 0 22.3 7.1 27.7 17.7L328 32H432c8.8 0 16 7.2 16 16s-7.2 16-16 16H16C7.2 64 0 56.8 0 48s7.2-16 16-16H120l15.2-14.3zM53.2 467c1.6 25.1 22.4 45 47.6 45H347.2c25.2 0 46-19.9 47.6-45L416 128H32L53.2 467z" />
              </svg>
              <span>Eliminar</span>
            </button>
          </div>

          <div class="carrito-item__acciones">
            <button type="button" @click="disminuirCantidad(item.id)">-</button>
            <span>{{ item.cantidad }}</span>
            <button type="button" @click="incrementarCantidad(item.id)">+</button>
          </div>
        </li>
      </ul>

      <div class="carrito-footer">
        <button type="button" class="carrito-seguir" @click="cerrarCarrito">Seguir comprando</button>
        <p class="no-margin carrito-total">Total: ${{ formatearPrecio(totalCompra) }}</p>
        <button type="button" class="carrito-pagar" :disabled="!carrito.length" @click="irAPagar">Ir a pagar</button>
      </div>
    </aside>

    <BaseFooter />
  </body>

</template>

<script setup>
import BaseFooter from "../components/BaseFooter.vue";
import BaseHeader from "../components/BaseHeader.vue";
import JoyaItem from "../components/JoyaItem.vue";
import { useCatalogoView } from "../composables/useCatalogoView.js";
import "./styleCatalogo.css";

const {
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
} = useCatalogoView();
</script>
