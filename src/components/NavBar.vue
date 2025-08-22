<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { gsap } from "gsap";
import { BLACK_LIST_PATHS } from "../utils";

const emit = defineEmits(["searchResult"]);

const router = useRouter();
const data = ref();
const search = ref("");
const currentTag = ref("All");

const allRoutes = computed(() => router.options.routes);
const filteredRoutes = allRoutes.value.filter(
  (route) => !BLACK_LIST_PATHS.includes(route.path)
);
data.value = filteredRoutes;
const goAllRoutes = () => {
  data.value = filteredRoutes;
  currentTag.value = "All";
  emit("searchResult", data.value);
};

const tags = new Set(data.value.map((route) => route.meta.section));

const mapTagName = (tag) => {
  return tag.replaceAll("_", " ").replaceAll(/\b\w/g, (char) => char.toUpperCase());
};

const filterByTag = (tag) => {
  currentTag.value = tag;
  data.value = filteredRoutes.filter((demo) => demo.meta.section === tag);
  const scrollTriggerRef = gsap.utils.toArray(".scrollTriggerRef");
  scrollTriggerRef.map((card) => {
    gsap.to(card, { duration: 0.5, opacity: 1 });
  });
  emit("searchResult", data.value);
};

watch(search, (newVal) => {
  if (newVal) {
    search.value = newVal.toLowerCase();
    const filterKeyResult = data.value.filter((route) => {
      const routeName = route.name.toLowerCase();
      return routeName.includes(search.value);
    });
    const scrollTriggerRef = gsap.utils.toArray(".scrollTriggerRef");
    scrollTriggerRef.map((card) => {
      gsap.to(card, { duration: 0.5, opacity: 1 });
    });
    data.value = filterKeyResult;
  } else {
    if (currentTag.value !== "All") {
      filterByTag(currentTag.value);
    } else {
      goAllRoutes();
    }
  }
  emit("searchResult", data.value);
});
const isOpen = ref(false);
const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};
</script>
<template>
  <nav class="navbar has-background-light" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <a
        role="button"
        class="navbar-burger"
        :class="{ 'is-active': isOpen }"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="toggleMenu"
      >
        <span aria-hidden="true" :class="{ 'is-active': isOpen }"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div class="navbar-menu" :class="{ 'is-active': isOpen }">
      <div class="navbar-start tabs is-boxed">
        <ul class="is-flex is-align-content-center is-justify-content-center">
          <li
            class="has-text-black mx-2 is-clickable"
            :class="{ 'is-active': currentTag === 'All' }"
            @click="goAllRoutes()"
          >
            <a role="button"> All </a>
          </li>
          <li
            v-for="tag in tags"
            :key="tag"
            class="mx-2 has-text-black is-clickable"
            :class="{ 'is-active': currentTag === tag }"
            @click="filterByTag(tag)"
          >
            <a role="button">{{ mapTagName(tag) }}</a>
          </li>
        </ul>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <input
            class="input is-medium"
            type="text"
            placeholder="Search"
            v-model="search"
          />
        </div>
      </div>
    </div>
  </nav>
</template>
<style scoped>
.tabs {
  --bulma-block-spacing: 0;
  --bulma-tabs-border-bottom-color: transparent;
}
.is-active {
  --bulma-tabs-link-active-color: #f7f7f7;
}
.responsive-nav {
  @media (max-width: 1250px) {
    justify-content: center;
  }
}
</style>
