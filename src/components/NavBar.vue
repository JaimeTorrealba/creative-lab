<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { BLACK_LIST_PATHS } from "../utils";
import { useUrlSearchParams } from '@vueuse/core'

const emit = defineEmits(["searchResult"]);

const router = useRouter();
const params = useUrlSearchParams('history')
const search = ref("");
const currentSection = ref("All");
const activeTags = ref(new Set());

const allRoutes = computed(() => router.options.routes);
const filteredRoutes = allRoutes.value.filter(
  (route) => !BLACK_LIST_PATHS.includes(route.path)
);

const sections = new Set(filteredRoutes.filter((r) => r.meta?.section).map((r) => r.meta.section));

const availableTags = computed(() => {
  const tags = new Set()
  filteredRoutes.forEach((r) => { if (r.meta?.tag) tags.add(r.meta.tag) })
  return tags
})

const mapTagName = (tag) => {
  return tag.replaceAll("_", " ").replaceAll(/\b\w/g, (char) => char.toUpperCase());
};

const applyFilters = () => {
  let result = filteredRoutes
  if (currentSection.value !== 'All') {
    result = result.filter((r) => r.meta.section === currentSection.value)
  }
  if (activeTags.value.size > 0) {
    result = result.filter((r) => activeTags.value.has(r.meta?.tag))
  }
  if (search.value) {
    const q = search.value.toLowerCase()
    result = result.filter((r) => r.name.toLowerCase().includes(q))
  }
  emit("searchResult", result)
}

const goAllRoutes = () => {
  currentSection.value = "All";
  params.tag = null
  applyFilters()
};

const filterBySection = (section) => {
  params.tag = section
  currentSection.value = section;
  applyFilters()
};

const toggleTag = (tag) => {
  const next = new Set(activeTags.value)
  if (next.has(tag)) next.delete(tag)
  else next.add(tag)
  activeTags.value = next
  applyFilters()
}

watch(search, () => applyFilters())

const isOpen = ref(false);
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

onMounted(() => {
  if (params.tag) {
    const tagParam = params.tag
    if (sections.has(tagParam)) {
      filterBySection(tagParam)
    }
  }
  applyFilters()
});
</script>
<template>
  <nav class="navbar has-background-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <div class="navbar-item">
        <input
          class="input is-medium"
          type="text"
          placeholder="Search"
          v-model="search"
        />
      </div>
      <a
        role="button"
        class="navbar-burger"
        :class="{ 'is-active': isOpen }"
        aria-label="menu"
        aria-expanded="false"
        @click="toggleMenu"
      >
        <span aria-hidden="true" :class="{ 'is-active': isOpen }"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': isOpen }">
      <div class="navbar-end">
        <div class="navbar-item is-flex is-flex-direction-column is-align-items-flex-start gap-2">
          <!-- Section tabs -->
          <div class="tabs is-boxed section-tabs">
            <ul class="is-flex is-align-content-center is-justify-content-center" :class="isOpen ? 'is-flex-direction-column' : ''">
              <li
                class="has-text-black mx-2 is-clickable"
                :class="currentSection === 'All' ? 'is-active' : 'has-text-black-ter'"
                @click="goAllRoutes()"
              >
                <a role="button" class="has-text-weight-medium">All</a>
              </li>
              <li
                v-for="section in sections"
                :key="section"
                class="mx-2 has-text-black is-clickable"
                :class="currentSection === section ? 'is-active' : 'has-text-black-ter'"
                @click="filterBySection(section)"
              >
                <a role="button" class="has-text-weight-medium">{{ mapTagName(section) }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <!-- Tag badges — outside the white navbar background -->
  <div class="tags-row px-4 py-3" v-if="availableTags.size > 0">
    <span
      v-for="tag in availableTags"
      :key="tag"
      class="tag is-medium is-clickable tag-badge"
      :class="activeTags.has(tag) ? 'is-info' : 'is-dark'"
      @click="toggleTag(tag)"
    >
      {{ tag }}
    </span>
  </div>
</template>
<style scoped>
.tabs {
  --bulma-block-spacing: 0;
  --bulma-tabs-border-bottom-color: transparent;
}
.is-active {
  --bulma-tabs-link-active-color: #f7f7f7;
}
.tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.tag-badge {
  transition: background-color 0.15s, color 0.15s;
  user-select: none;
}
</style>
