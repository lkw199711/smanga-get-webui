<template>
  <nav class="tabbar">
    <div
      v-for="tab in tabs"
      :key="tab.name"
      class="tabbar-item"
      :class="{ active: activeTab === tab.name }"
      @click="navigate(tab.name)"
    >
      <el-icon :size="20"><component :is="tab.icon" /></el-icon>
      <span class="tabbar-label">{{ tab.label }}</span>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { computed, markRaw } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Collection, List, Document, Setting } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

const tabs = [
  { name: 'subscribe', label: '订阅', icon: markRaw(Collection) },
  { name: 'task', label: '任务', icon: markRaw(List) },
  { name: 'log', label: '日志', icon: markRaw(Document) },
  { name: 'config', label: '配置', icon: markRaw(Setting) },
]

const activeTab = computed(() => {
  return (route.name as string) || 'subscribe'
})

function navigate(name: string) {
  if (activeTab.value !== name) {
    router.push(name)
  }
}
</script>

<style scoped>
.tabbar {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 56px;
  background: var(--bg-card);
  border-top: 1px solid var(--border-light);
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.06);
}

.tabbar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.2s ease;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.tabbar-item:active {
  opacity: 0.7;
}

.tabbar-item.active {
  color: var(--primary);
}

.tabbar-label {
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
}

@media (max-width: 768px) {
  .tabbar {
    display: flex;
  }
}
</style>
