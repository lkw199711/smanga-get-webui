<script setup lang="ts">
import smangaNav from './layout/nav.vue'
import smangaTabbar from './layout/tabbar.vue'
</script>

<template>
  <smangaNav />
  <div class="layout">
    <div class="page-container">
      <router-view />
    </div>
  </div>
  <smangaTabbar />
</template>

<style scoped>
.layout {
  position: absolute;
  top: 60px;
  bottom: 0;
  width: 100%;
  overflow: auto;
  background: var(--bg-page);
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

@media (max-width: 768px) {
  .layout {
    top: 52px;
    bottom: 56px;
  }

  .page-container {
    padding: 12px;
    padding-bottom: 16px;
  }
}
</style>
