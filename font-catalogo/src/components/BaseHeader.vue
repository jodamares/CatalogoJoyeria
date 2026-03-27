<template>
  <header class="encabezado">
    <div class="contenedor">
      <div class="barra">
        <a class="logo" href="index.html">
          <img v-if="siteConfig.logoUrl" :src="siteConfig.logoUrl" :alt="siteConfig.storeName" class="logo__imagen" />
          <h1 v-else class="logo__nombre">{{ siteConfig.storeName }}</h1>
        </a>

        <nav class="navegacion">
          <a href="nosotros.html" class="navegacion__enlace">Nosotros</a>
          <a href="contacto.html" class="navegacion__enlace">Contacto</a>
          <RouterLink v-if="!isAuthenticated" to="/auth" class="navegacion__enlace">Iniciar sesion</RouterLink>
          <RouterLink v-if="isAdmin" to="/admin" class="navegacion__enlace">Panel admin</RouterLink>
          <button v-if="isAuthenticated" type="button" class="navegacion__enlace navegacion__logout" @click="handleLogout">
            Cerrar sesion
          </button>
        </nav>
      </div>
    </div>

    <div class="encabezado__texto">
      <h2 class="no-margin">Piezas seleccionadas en oro y plata</h2>
      <p class="no-margin">Desliza hacia abajo para ver el catálogo</p>
    </div>

    <div class="menu-categorias">
      <nav class="menu-categorias__nav contenedor" aria-label="Categorias">
        <RouterLink to="/" class="menu-categorias__link" :class="{ 'menu-categorias__link--activo': isCategoryActive('all') }">
          Todos
        </RouterLink>
        <RouterLink
          to="/?categoria=anillos"
          class="menu-categorias__link"
          :class="{ 'menu-categorias__link--activo': isCategoryActive('anillos') }"
        >
          Anillos
        </RouterLink>
        <RouterLink
          to="/?categoria=cadenas"
          class="menu-categorias__link"
          :class="{ 'menu-categorias__link--activo': isCategoryActive('cadenas') }"
        >
          Cadenas
        </RouterLink>
        <RouterLink
          to="/?categoria=pulseras"
          class="menu-categorias__link"
          :class="{ 'menu-categorias__link--activo': isCategoryActive('pulseras') }"
        >
          Pulseras
        </RouterLink>
        <RouterLink
          to="/?categoria=aretes"
          class="menu-categorias__link"
          :class="{ 'menu-categorias__link--activo': isCategoryActive('aretes') }"
        >
          Aretes
        </RouterLink>
        <RouterLink
          to="/?categoria=manillas-tejidas"
          class="menu-categorias__link"
          :class="{ 'menu-categorias__link--activo': isCategoryActive('manillas-tejidas') }"
        >
          Manillas
        </RouterLink>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { RouterLink } from "vue-router";
import { useBaseHeader } from "../composables/useBaseHeader.js";
const { siteConfig, isAuthenticated, isAdmin, handleLogout, isCategoryActive } = useBaseHeader();
</script>
