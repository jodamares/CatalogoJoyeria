import { getCurrentUser, loginUser, registerUser } from "../infrastructure/auth/authDataSource.js";

export async function registrarUsuario({ name, email, password }) {
  return registerUser({ name, email, password });
}

export async function iniciarSesion({ email, password }) {
  return loginUser({ email, password });
}

export async function obtenerPerfil(token) {
  return getCurrentUser(token);
}
