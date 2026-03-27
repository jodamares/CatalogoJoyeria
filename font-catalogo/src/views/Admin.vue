<template>
  <main class="min-h-screen bg-stone-100 px-2 py-4 sm:px-4 sm:py-8">
    <div class="mx-auto flex w-full max-w-[1500px] flex-col gap-4">
      <header class="flex items-center justify-between">
        <h1 class="text-[2.8rem] font-bold text-stone-900 sm:text-4xl">Panel admin</h1>
        <button
          type="button"
          @click="goCatalog"
          class="rounded-lg border border-stone-300 bg-white px-2 py-2 text-[1.2rem] font-semibold text-stone-700 transition hover:bg-stone-50 sm:px-3 sm:text-sm"
        >
          Volver al catalogo
        </button>
      </header>

      <p v-if="loading" class="text-[1.4rem] font-medium text-stone-600">Cargando datos...</p>
      <p v-if="error" class="text-[1.4rem] font-semibold text-red-700">{{ error }}</p>

      <div
        class="grid items-start gap-4"
        :class="activeSection === 'products' ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]'"
      >
        <aside
          class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4"
          :class="activeSection === 'products' ? 'static' : 'lg:sticky lg:top-4'"
        >
          <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Ajustes</h2>
          <nav
            class="flex gap-2"
            :class="activeSection === 'products' ? 'flex-row flex-wrap' : 'flex-col md:flex-row md:overflow-x-auto lg:flex-col'"
            aria-label="Secciones del panel admin"
          >
            <button
              v-for="section in sections"
              :key="section.id"
              type="button"
              class="rounded-lg border px-2 py-2 text-left text-[1.4rem] font-semibold transition sm:px-3"
              :class="
                activeSection === section.id
                  ? 'border-stone-800 bg-stone-800 text-white'
                  : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
              "
              @click="activeSection = section.id"
            >
              {{ section.label }}
            </button>
          </nav>
        </aside>

        <div class="min-w-0">
          <section class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4" v-show="activeSection === 'brand'">
            <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Configuracion de marca</h2>
            <div class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label class="flex flex-col gap-1 text-[1.55rem] leading-[1.2] font-semibold text-stone-700"
                >Nombre de la tienda
                <input
                  v-model.trim="siteConfigForm.storeName"
                  type="text"
                  class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
                />
              </label>
              <label class="flex flex-col gap-1 text-[1.55rem] leading-[1.2] font-semibold text-stone-700"
                >URL del logo
                <input
                  v-model.trim="siteConfigForm.logoUrl"
                  type="url"
                  class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
                />
              </label>
              <label class="flex flex-col gap-1 text-[1.55rem] leading-[1.2] font-semibold text-stone-700">
                Logo (archivo)
                <input
                  type="file"
                  accept="image/*"
                  @change="handleSiteLogoFileChange"
                  class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.35rem] text-stone-800 file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-1 file:text-[1.25rem] file:text-amber-800"
                />
              </label>
            </div>
            <div class="flex items-center gap-4">
              <img
                v-if="siteConfigForm.logoUrl"
                :src="siteConfigForm.logoUrl"
                alt="Preview logo"
                class="h-16 w-16 rounded-lg border border-stone-200 bg-white object-cover"
              />
              <button
                type="button"
                @click="saveConfig"
                class="rounded-lg bg-amber-700 px-4 py-2 text-[1.4rem] font-semibold text-white transition hover:bg-amber-800"
              >
                Guardar configuracion
              </button>
            </div>
          </section>

          <section class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4" v-show="activeSection === 'gold'">
            <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Precio del oro por quilataje</h2>
            <div
              class="mb-2 grid grid-cols-1 items-center gap-2 sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:gap-3"
              v-for="item in goldPrices"
              :key="item.karat"
            >
              <span class="text-[1.6rem] leading-[1.2] font-semibold tracking-[0.02em] text-stone-700">{{ item.karat }}</span>
              <input
                v-model.number="item.pricePerGram"
                type="number"
                min="1"
                class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
              />
              <button
                type="button"
                @click="saveGold(item)"
                class="rounded-lg bg-amber-700 px-3 py-2 text-[1.3rem] font-semibold text-white transition hover:bg-amber-800"
              >
                Guardar
              </button>
            </div>
          </section>

          <section class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4" v-show="activeSection === 'create'">
            <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Agregar producto</h2>
            <ProductForm
              :product="newProduct"
              :categories="categories"
              submit-label="Crear producto"
              @submit="createProduct"
              @form-error="setError"
            />
          </section>

          <section class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4" v-show="activeSection === 'products'">
            <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Editar productos</h2>
            <div class="grid grid-cols-1 gap-3 min-[360px]:grid-cols-[repeat(auto-fill,minmax(170px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] sm:gap-4">
              <JoyaItem
                v-for="product in products"
                :key="product.id"
                :joya="toJoyaCard(product)"
                action-label="Editar"
                :always-show-action="true"
                @accion="openEditProduct(product)"
              />
            </div>
          </section>

          <section class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4" v-show="activeSection === 'orders'">
            <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Compras realizadas</h2>
            <ul class="m-0 list-disc pl-4 text-[1.45rem] text-stone-800">
              <li v-for="order in orders" :key="order.id">
                <strong>{{ order.customerName }}</strong> - {{ order.paymentMethod }} - ${{ formatPrice(order.total) }}
                <small>{{ formatDate(order.createdAt) }}</small>
              </li>
            </ul>
          </section>

          <section class="rounded-xl border border-stone-200 bg-white/95 p-3 sm:p-4" v-show="activeSection === 'quotes'">
            <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Solicitudes de servicio</h2>
            <ul class="m-0 list-disc pl-4 text-[1.45rem] text-stone-800">
              <li v-for="quote in quotes" :key="quote.id">
                <strong>{{ quote.clientName }}</strong> - {{ quote.phone }} - {{ quote.status }}
                <small>{{ quote.detail }}</small>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>

    <div
      v-if="showEditModal"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/35 p-4"
      @click.self="closeEditProduct"
    >
      <section class="max-h-[calc(100vh-1rem)] w-full max-w-[960px] overflow-y-auto rounded-xl border border-stone-200 bg-white/95 p-3 sm:max-h-[calc(100vh-2rem)] sm:p-4">
        <h2 class="mb-3 text-[2.4rem] font-bold text-stone-900 sm:text-3xl">Actualizar producto</h2>
        <ProductForm
          :product="editProduct"
          :categories="categories"
          submit-label="Actualizar producto"
          @submit="updateEditingProduct"
          @form-error="setError"
        />
        <div class="mt-3 flex justify-end">
          <button
            type="button"
            class="rounded-lg border border-stone-300 bg-stone-100 px-3 py-2 text-[1.4rem] font-semibold text-stone-700 transition hover:bg-stone-200"
            @click="closeEditProduct"
          >
            Cancelar
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import JoyaItem from "../components/JoyaItem.vue";
import ProductForm from "../components/admin/ProductForm.vue";
import { useAdminPanel } from "../composables/useAdminPanel.js";
const {
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
} = useAdminPanel();
</script>
