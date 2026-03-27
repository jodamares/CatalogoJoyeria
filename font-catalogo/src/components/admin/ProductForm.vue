<template>
  <div>
    <div
      class="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2 [&>label]:flex [&>label]:flex-col [&>label]:gap-1 [&>label]:text-[1.55rem] [&>label]:leading-[1.2] [&>label]:font-semibold [&>label]:text-stone-700"
    >
      <label
        >Nombre
        <input
          v-model.trim="product.name"
          type="text"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label
        >Descripcion
        <input
          v-model.trim="product.description"
          type="text"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label>
        Categoria
        <select
          v-model="product.categoryId"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        >
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </label>
      <label>
        Material
        <select
          v-model="product.materialType"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        >
          <option value="ORO">ORO</option>
          <option value="PLATA">PLATA</option>
          <option value="ACERO">ACERO</option>
          <option value="OTRO">OTRO</option>
        </select>
      </label>
      <label v-if="product.materialType === 'ORO'">
        Kilataje
        <select
          v-model="product.karat"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        >
          <option value="K24">K24</option>
          <option value="K18">K18</option>
          <option value="K14">K14</option>
          <option value="K10">K10</option>
        </select>
      </label>
      <label v-else>
        Precio base
        <input
          v-model.number="product.fixedBasePrice"
          type="number"
          min="1"
          step="0.01"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label
        >Peso (g)
        <input
          v-model.number="product.weightGrams"
          type="number"
          min="0"
          step="0.001"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label
        >Labor
        <input
          v-model.number="product.laborCost"
          type="number"
          min="0"
          step="0.01"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label
        >Margen
        <input
          v-model.number="product.marginCost"
          type="number"
          min="0"
          step="0.01"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label
        >URL Imagen
        <input
          v-model.trim="product.imageUrl"
          type="url"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.45rem] text-stone-800 outline-none ring-0 transition focus:border-amber-500 focus:shadow-[0_0_0_2px_rgba(217,119,6,0.2)]"
        />
      </label>
      <label>
        Imagen (archivo)
        <input
          type="file"
          accept="image/*"
          @change="handleFileChange"
          class="min-h-9 rounded-lg border border-stone-300 bg-white px-3 text-[1.35rem] text-stone-800 file:mr-3 file:rounded-md file:border-0 file:bg-amber-50 file:px-3 file:py-1 file:text-[1.25rem] file:text-amber-800"
        />
      </label>
    </div>

    <div class="flex items-center gap-4">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        alt="Preview producto"
        class="h-[72px] w-[72px] rounded-lg border border-stone-200 bg-white object-cover"
      />
      <button
        type="button"
        @click="$emit('submit')"
        class="rounded-lg bg-amber-700 px-4 py-2 text-[1.4rem] font-semibold text-white transition hover:bg-amber-800"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  categories: {
    type: Array,
    default: () => [],
  },
  submitLabel: {
    type: String,
    default: "Guardar",
  },
});

const emit = defineEmits(["submit", "form-error"]);

const MAX_IMAGE_SIZE_MB = 3;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("No fue posible leer el archivo de imagen."));
    reader.readAsDataURL(file);
  });

const handleFileChange = async (event) => {
  try {
    const input = event.target;
    const file = input?.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      throw new Error("Debes seleccionar un archivo de imagen.");
    }

    if (file.size > MAX_IMAGE_BYTES) {
      throw new Error(`La imagen supera ${MAX_IMAGE_SIZE_MB}MB.`);
    }

    const imageDataUrl = await fileToDataUrl(file);
    props.product.imageUrl = imageDataUrl;
  } catch (error) {
    emit("form-error", error instanceof Error ? error.message : "No fue posible cargar la imagen.");
  }
};
</script>
