<template>
  <div class="config-page">
    <div class="config-card">
      <div class="config-header">
        <div class="config-title-group">
          <el-icon class="config-icon" :size="20"><Setting /></el-icon>
          <h3 class="config-title">系统配置</h3>
        </div>
      </div>

      <el-empty description="配置功能开发中，敬请期待">
        <template #image>
          <el-icon :size="80" color="var(--text-muted)"><Tools /></el-icon>
        </template>
      </el-empty>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Setting, Tools } from '@element-plus/icons-vue'
</script>

<style scoped>
.config-page {
  height: 100%;
}

.config-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.config-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.config-icon {
  color: var(--primary);
}

.config-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}
</style>