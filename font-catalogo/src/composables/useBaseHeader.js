import { onMounted } from "vue";
import { useRoute } from "vue-router";
import { useAuth } from "./useAuth.js";
import { useSiteConfig } from "./useSiteConfig.js";

export function useBaseHeader() {
  const { isAuthenticated, isAdmin, logout, initAuth } = useAuth();
  const { siteConfig, loadSiteConfig } = useSiteConfig();
  const route = useRoute();

  const handleLogout = () => {
    logout();
  };

  const isCategoryActive = (slug) => {
    const currentCategory = String(route.query.categoria || "");
    if (slug === "all") return !currentCategory;
    return currentCategory === slug;
  };

  onMounted(() => {
    initAuth();
    loadSiteConfig();
  });

  return {
    siteConfig,
    isAuthenticated,
    isAdmin,
    handleLogout,
    isCategoryActive,
  };
}
