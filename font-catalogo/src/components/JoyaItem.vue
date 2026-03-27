<template>
  <article class="joya-card" :class="{ 'joya-card--accion-visible': alwaysShowAction }">
    <img
      :src="joya.imagen"
      :alt="joya.nombre"
      @error="handleImageError"
      referrerpolicy="no-referrer"
      loading="lazy"
    />
    <h4>{{ joya.nombre }}</h4>
    <p class="tipo">{{ joya.tipo }}</p>
    <p class="precio">Precio: ${{ joya.precio.toLocaleString("es") }}</p>
    <button v-if="showAction" class="btn btn-primary" @click="handleActionClick">{{ actionLabel }}</button>
  </article>
</template>

<script setup>
const props = defineProps({
  joya: {
    type: Object,
    required: true,
  },
  actionLabel: {
    type: String,
    default: "Agregar al carrito",
  },
  showAction: {
    type: Boolean,
    default: true,
  },
  alwaysShowAction: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["agregar-al-carrito", "accion"]);

const fallbackImage =
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=80";

const handleImageError = (event) => {
  const img = event.target;

  if (img.dataset.fallbackApplied === "true") {
    return;
  }

  img.dataset.fallbackApplied = "true";
  img.src = fallbackImage;
};

const handleActionClick = () => {
  emit("accion", props.joya);
  emit("agregar-al-carrito", props.joya);
};
</script>

<style scoped src="./JoyaItem.css"></style>
