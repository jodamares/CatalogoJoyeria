const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

function mapJoya(item) {
  return {
    id: item.id,
    nombre: item.name,
    tipo: item.description,
    precio: Number(item.price) || 0,
    imagen: item.imageUrl,
    categoria: item.category?.name || "Otros",
    categoriaSlug: item.category?.slug || "otros",
  };
}

export async function obtenerJoyas() {
  const response = await fetch(`${BACKEND_API_URL}/api/catalogo`);

  if (!response.ok) {
    throw new Error("No fue posible cargar catalogo desde backend.");
  }

  const data = await response.json();
  return (data.items || []).map(mapJoya);
}
