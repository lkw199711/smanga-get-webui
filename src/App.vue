<script setup lang="ts">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import subForm from './views/form.vue'
import smangaNav from './layout/nav.vue'
</script>

<template>
  <smangaNav></smangaNav>
  <div class="layout">
    <router-view />
  </div>
</template>

<style scoped>
.layout {
  position: absolute;
  top: 60px;
  bottom: 0;
  padding: 20px;
  width: 100%;
  overflow: auto;
}
</style>
