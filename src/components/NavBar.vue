<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { BLACK_LIST_PATHS } from "../utils";

const emit = defineEmits(["searchResult"]);

const router = useRouter();
const search = ref("");
const activeTags = ref(new Set());
const showUntagged = ref(false)

const allRoutes = computed(() => router.options.routes);
const filteredRoutes = allRoutes.value.filter(
  (route) => !BLACK_LIST_PATHS.includes(route.path)
);

const availableTags = computed(() => {
  const tags = new Set()
  filteredRoutes.forEach((r) => {
    r.meta?.tags?.forEach((t) => tags.add(t))
  })
  return tags
})

const applyFilters = () => {
  let result = filteredRoutes
  if (showUntagged.value) {
    result = result.filter((r) => !r.meta?.tags?.length)
  } else if (activeTags.value.size > 0) {
    result = result.filter((r) => r.meta?.tags?.some((t) => activeTags.value.has(t)))
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((r) => r.name.toLowerCase().includes(q))
  }
  emit("searchResult", result)
}

const toggleTag = (tag) => {
  const next = new Set(activeTags.value)
  if (next.has(tag)) next.delete(tag)
  else next.add(tag)
  activeTags.value = next
  applyFilters()
}

const toggleUntagged = () => {
  showUntagged.value = !showUntagged.value
  if (showUntagged.value) activeTags.value = new Set()
  applyFilters()
}

watch(search, () => applyFilters())

onMounted(() => {
  applyFilters()
});
</script>
<template>
  <nav class="sticky-bar has-background-light" role="navigation" aria-label="main navigation">
    <div class="bar-inner px-4">
      <input
        class="input is-medium search-input"
        type="text"
        id="search"
        name="search"
        placeholder="Search"
        v-model="search"
      />
      <div class="tags-row" v-if="availableTags.size > 0">
        <span
          v-for="tag in availableTags"
          :key="tag"
          class="tag is-medium is-clickable tag-badge"
          :class="activeTags.has(tag) ? 'is-info' : 'is-dark'"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </span>
        <span
          class="tag is-medium is-clickable tag-badge"
          :class="showUntagged ? 'is-warning' : 'is-dark'"
          @click="toggleUntagged"
        >
          Untagged
        </span>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid #e8e8e8;
}

.bar-inner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}

.search-input {
  flex-shrink: 0;
  width: 220px;
}

.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.tag-badge {
  transition: background-color 0.15s, color 0.15s;
  user-select: none;
}
</style>
