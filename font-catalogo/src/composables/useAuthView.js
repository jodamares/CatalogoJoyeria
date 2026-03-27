import { reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "./useAuth.js";

export function useAuthView() {
  const router = useRouter();
  const { register, login, loading, error } = useAuth();

  const isRegisterMode = ref(false);
  const form = reactive({
    name: "",
    email: "",
    password: "",
  });

  const resetForm = () => {
    form.name = "";
    form.email = "";
    form.password = "";
  };

  const toggleMode = () => {
    isRegisterMode.value = !isRegisterMode.value;
    resetForm();
  };

  const goToCatalog = () => {
    router.push("/");
  };

  const submit = async () => {
    try {
      let authUser;
      if (isRegisterMode.value) {
        authUser = await register({
          name: form.name,
          email: form.email,
          password: form.password,
        });
      } else {
        authUser = await login({
          email: form.email,
          password: form.password,
        });
      }

      router.push(authUser?.role === "ADMIN" ? "/admin" : "/");
    } catch {
      // El mensaje de error ya se expone desde useAuth.
    }
  };

  return {
    isRegisterMode,
    form,
    loading,
    error,
    toggleMode,
    goToCatalog,
    submit,
  };
}
