<template>
  <el-header class="app-header">
    <div class="header-brand">
      <span class="brand-icon">📚</span>
      <span class="brand-title">Smanga Get</span>
    </div>
    <el-menu
      :default-active="activeIndex"
      class="header-menu"
      mode="horizontal"
      :ellipsis="false"
      @select="handleSelect"
    >
      <el-menu-item index="subscribe">
        <el-icon><Collection /></el-icon>
        <span>订阅</span>
      </el-menu-item>
      <el-menu-item index="task">
        <el-icon><List /></el-icon>
        <span>任务</span>
      </el-menu-item>
      <el-menu-item index="manga">
        <el-icon><Picture /></el-icon>
        <span>成果</span>
      </el-menu-item>
      <el-menu-item index="log">
        <el-icon><Document /></el-icon>
        <span>日志</span>
      </el-menu-item>
      <el-menu-item index="config">
        <el-icon><Setting /></el-icon>
        <span>配置</span>
      </el-menu-item>
      <el-menu-item index="priority">
        <el-icon><Star /></el-icon>
        <span>优先级</span>
      </el-menu-item>
    </el-menu>
  </el-header>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Collection, List, Document, Setting, Picture, Star } from '@element-plus/icons-vue'

defineOptions({
  name: 'SmangaNav',
})

const router = useRouter()
const route = useRoute()

const activeIndex = computed(() => {
  const name = route.name as string
  return name || 'subscribe'
})

const handleSelect = async (key: string) => {
  await router.push(key)
}
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  padding: 0 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 60px;
}

.header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 32px;
  flex-shrink: 0;
}

.brand-icon {
  font-size: 24px;
  line-height: 1;
}

.brand-title {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.header-menu {
  flex: 1;
  border-bottom: none !important;
  background: transparent !important;
}

.header-menu .el-menu-item {
  color: rgba(255, 255, 255, 0.85) !important;
  border-bottom-color: transparent !important;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-menu .el-menu-item:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.15) !important;
}

.header-menu .el-menu-item.is-active {
  color: #fff !important;
  border-bottom: 3px solid #ffd04b !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

@media (max-width: 768px) {
  .app-header {
    padding: 0 16px;
    height: 52px;
  }

  .header-brand {
    margin-right: 0;
  }

  .brand-title {
    font-size: 17px;
  }

  .header-menu {
    display: none;
  }
}
</style>
