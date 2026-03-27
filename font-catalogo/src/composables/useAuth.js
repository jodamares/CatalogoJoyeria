import { computed, ref } from "vue";
import { iniciarSesion, obtenerPerfil, registrarUsuario } from "../services/authService.js";

const TOKEN_KEY = "auth_token";

const token = ref(localStorage.getItem(TOKEN_KEY) || "");
const user = ref(null);
const loading = ref(false);
const error = ref("");
const initialized = ref(false);

const isAuthenticated = computed(() => Boolean(token.value && user.value));
const isAdmin = computed(() => user.value?.role === "ADMIN");

function setSession(authToken, authUser) {
  token.value = authToken;
  user.value = authUser;

  if (authToken) {
    localStorage.setItem(TOKEN_KEY, authToken);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function login({ email, password }) {
  loading.value = true;
  error.value = "";

  try {
    const response = await iniciarSesion({ email, password });
    setSession(response.token, response.user);
    return response.user;
  } catch (err) {
    error.value = err.message || "No fue posible iniciar sesion.";
    throw err;
  } finally {
    loading.value = false;
  }
}

async function register({ name, email, password }) {
  loading.value = true;
  error.value = "";

  try {
    const response = await registrarUsuario({ name, email, password });
    setSession(response.token, response.user);
    return response.user;
  } catch (err) {
    error.value = err.message || "No fue posible registrar usuario.";
    throw err;
  } finally {
    loading.value = false;
  }
}

async function initAuth() {
  if (initialized.value) {
    return;
  }

  initialized.value = true;

  if (!token.value) {
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const response = await obtenerPerfil(token.value);
    user.value = response.user;
  } catch {
    setSession("", null);
  } finally {
    loading.value = false;
  }
}

function logout() {
  setSession("", null);
}

export function useAuth() {
  return {
    token,
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    login,
    register,
    logout,
    initAuth,
  };
}
