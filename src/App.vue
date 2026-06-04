<script setup lang="ts">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import subForm from './views/form.vue'
import smangaNav from './layout/nav.vue'
</script>

<template>
  <smangaNav />
  <div class="layout">
    <div class="page-container">
      <router-view />
    </div>
  </div>
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
</style>
