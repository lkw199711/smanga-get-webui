<template>
  <div class="log-page">
    <div class="log-card">
      <div class="log-header">
        <div class="log-title-group">
          <el-icon class="log-icon" :size="20"><Document /></el-icon>
          <h3 class="log-title">系统日志</h3>
        </div>
        <div class="log-actions">
          <el-button @click="refresh" type="primary" size="small">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button @click="clear" type="danger" size="small" plain>
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
        </div>
      </div>

      <div class="log-console">
        <div class="console-header">
          <span class="console-dot dot-red"></span>
          <span class="console-dot dot-yellow"></span>
          <span class="console-dot dot-green"></span>
          <span class="console-label">log.txt</span>
        </div>
        <div class="console-body">
          <div v-if="!logs.length" class="console-empty">暂无日志记录</div>
          <div
            v-for="(log, index) in logs"
            :key="index"
            class="console-line"
          >
            <span class="line-number">{{ String(index + 1).padStart(3, ' ') }}</span>
            <span class="line-content">{{ log }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import logApi from '@/api/log'
import { onMounted, ref } from 'vue'
import { Document, Refresh, Delete } from '@element-plus/icons-vue'

const logs = ref<string[]>([])

onMounted(() => {
  refresh()
})

async function refresh() {
  logs.value = await logApi.get()
}

async function clear() {
  await logApi.clear()
  logs.value = []
}
</script>

<style scoped>
.log-page {
  height: 100%;
}

.log-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
}

.log-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-icon {
  color: var(--primary);
}

.log-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.log-actions {
  display: flex;
  gap: 8px;
}

.log-console {
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.console-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #2d2d2d;
  border-bottom: 1px solid #1a1a1a;
}

.console-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-red {
  background: #ff5f56;
}

.dot-yellow {
  background: #ffbd2e;
}

.dot-green {
  background: #27c93f;
}

.console-label {
  margin-left: 8px;
  color: #999;
  font-size: 12px;
}

.console-body {
  flex: 1;
  background: #1e1e1e;
  padding: 16px;
  overflow: auto;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.8;
  max-height: 500px;
}

.console-empty {
  color: #666;
  font-style: italic;
  padding: 40px 0;
  text-align: center;
}

.console-line {
  display: flex;
  gap: 12px;
  color: #d4d4d4;
  white-space: pre-wrap;
  word-break: break-all;
}

.console-line:hover {
  background: rgba(255, 255, 255, 0.04);
}

.line-number {
  flex-shrink: 0;
  color: #666;
  user-select: none;
  text-align: right;
  min-width: 28px;
}

.line-content {
  color: #a8d8a8;
  flex: 1;
}
</style>