import { ref } from "vue";
import { obtenerSiteConfig } from "../services/adminService.js";

const siteConfig = ref({
  logoUrl: "",
  storeName: "Joyeria Premiun",
});
const loaded = ref(false);

export function useSiteConfig() {
  const loadSiteConfig = async () => {
    if (loaded.value) return;
    loaded.value = true;
    try {
      const response = await obtenerSiteConfig();
      if (response?.item) {
        siteConfig.value = {
          logoUrl: response.item.logoUrl || "",
          storeName: response.item.storeName || "Joyeria Premiun",
        };
      }
    } catch {
      // silencioso, deja fallback
    }
  };

  return {
    siteConfig,
    loadSiteConfig,
  };
}
