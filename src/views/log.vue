<template>
  <div class="log-page" :class="{ 'is-full-size': fullSize }">
    <div class="log-card">
      <div class="log-header">
        <div class="log-title-group">
          <el-icon class="log-icon" :size="20"><Document /></el-icon>
          <h3 class="log-title">系统日志</h3>
        </div>
        <div class="log-actions">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="选择日期"
            size="small"
            :disabled-date="disabledDate"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable
            style="width: 160px"
            @change="onDateChange"
          />
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
          <span class="console-label">{{ consoleLabel }}</span>
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
import type { DateModelType } from 'element-plus'
import useLogStore from '@/stores/log'
import useAutoRefreshStore from '@/stores/autoRefresh'

defineOptions({
  name: 'LogView',
})

const logStore = useLogStore()
const autoRefreshStore = useAutoRefreshStore()

const logs = computed(() => logStore.logs)
const availableDates = computed(() => logStore.dates)
const fullSize = ref(true)

/** 日期选择器的绑定值，空字符串 = 今天 */
const selectedDate = ref('')

/** 控制台标签：显示当前查看的日志文件名 */
const consoleLabel = computed(() => {
  const d = selectedDate.value
  return d ? `${d}.log` : `${todayStr()}.log`
})

/** 获取今天日期字符串 */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

/** 禁用没有日志的日期 */
function disabledDate(date: Date): boolean {
  const ds = date.toISOString().slice(0, 10)
  if (ds === todayStr()) return false // 今天始终可选
  return !availableDates.value.includes(ds)
}

/** 日期变更：清空选择 = 今天，否则加载指定日期 */
function onDateChange(value: DateModelType) {
  if (!value) {
    selectedDate.value = ''
    logStore.fetch()
  } else {
    logStore.selectDate(value as string)
  }
}

const autoRefresh = computed({
  get: () => autoRefreshStore.logEnabled,
  set: (val) => autoRefreshStore.setLogAutoRefresh(val),
})

onMounted(async () => {
  await logStore.fetchDates()
  if (autoRefreshStore.logEnabled) {
    autoRefreshStore.setLogAutoRefresh(true)
  } else {
    logStore.fetch()
  }
})

async function refresh() {
  if (selectedDate.value) {
    await logStore.fetch(selectedDate.value)
  } else {
    await logStore.fetch()
  }
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

@media (max-width: 768px) {
  .log-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 16px;
  }

  .log-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .log-title {
    font-size: 16px;
  }

  .log-page.is-full-size {
    width: 100%;
    height: auto;
    margin-left: 0;
  }

  .console-body {
    padding: 10px;
    font-size: 11px;
    line-height: 1.6;
    max-height: 400px;
  }

  .is-full-size .console-body {
    max-height: none;
  }

  .line-number {
    display: none;
  }

  .console-line {
    gap: 0;
  }
}
</style>
