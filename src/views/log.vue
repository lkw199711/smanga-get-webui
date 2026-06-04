<template>
  <div class="log-page" :class="{ 'is-full-size': fullSize }">
    <div class="log-card">
      <div class="log-header">
        <div class="log-title-group">
          <el-icon class="log-icon" :size="20"><Document /></el-icon>
          <h3 class="log-title">系统日志</h3>
        </div>
        <div class="log-actions">
          <label class="log-switch-control">
            <span>铺满窗口</span>
            <el-switch v-model="fullSize" size="small" />
          </label>
          <label class="auto-refresh-control">
            <span>自动刷新</span>
            <el-switch v-model="autoRefresh" size="small" />
          </label>
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
import { computed, onMounted, ref } from 'vue'
import { Document, Refresh, Delete } from '@element-plus/icons-vue'
import useLogStore from '@/stores/log'
import useAutoRefreshStore from '@/stores/autoRefresh'

const logStore = useLogStore()
const autoRefreshStore = useAutoRefreshStore()

const logs = computed(() => logStore.logs)
const fullSize = ref(true)

const autoRefresh = computed({
  get: () => autoRefreshStore.logEnabled,
  set: (val) => autoRefreshStore.setLogAutoRefresh(val),
})

onMounted(() => {
  if (autoRefreshStore.logEnabled) {
    autoRefreshStore.setLogAutoRefresh(true)
  } else {
    logStore.fetch()
  }
})

async function refresh() {
  await logStore.fetch()
}

async function clear() {
  await logStore.clear()
}
</script>

<style scoped>
.log-page {
  display: flex;
  height: 100%;
}

.log-page.is-full-size {
  width: calc(100vw - 48px);
  height: calc(100vh - 108px);
  margin-left: calc(50% - 50vw + 24px);
}

.log-card {
  flex: 1;
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
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.auto-refresh-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.log-switch-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.log-console {
  flex: 1;
  min-height: 400px;
  display: flex;
  flex-direction: column;
}

.is-full-size .log-card,
.is-full-size .log-console {
  min-height: 0;
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

.is-full-size .console-body {
  min-height: 0;
  max-height: none;
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
