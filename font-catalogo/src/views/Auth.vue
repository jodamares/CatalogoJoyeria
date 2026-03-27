<template>
  <main class="auth-page">
    <section class="auth-card">
      <h1>{{ isRegisterMode ? "Crear cuenta" : "Iniciar sesion" }}</h1>
      <p class="auth-subtitle">
        {{ isRegisterMode ? "Registra tu usuario para gestionar tus compras." : "Accede a tu cuenta para continuar." }}
      </p>

      <form class="auth-form" @submit.prevent="submit">
        <label v-if="isRegisterMode">
          Nombre completo
          <input v-model.trim="form.name" type="text" required />
        </label>

        <label>
          Correo electronico
          <input v-model.trim="form.email" type="email" required />
        </label>

        <label>
          Contraseña
          <input v-model="form.password" type="password" minlength="6" required />
        </label>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button type="submit" :disabled="loading">
          {{ loading ? "Procesando..." : isRegisterMode ? "Registrarme" : "Iniciar sesion" }}
        </button>
      </form>

      <button class="auth-switch" type="button" @click="toggleMode">
        {{ isRegisterMode ? "Ya tienes cuenta? Inicia sesion" : "No tienes cuenta? Registrate" }}
      </button>

      <button class="auth-back" type="button" @click="goToCatalog">
        Volver al catalogo
      </button>
    </section>
  </main>
</template>

<script setup>
import { useAuthView } from "../composables/useAuthView.js";
import "./styleAuth.css";

const { isRegisterMode, form, loading, error, toggleMode, goToCatalog, submit } = useAuthView();
</script>
