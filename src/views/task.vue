<template>
  <div class="task-page">
    <mForm />

    <div class="section-card">
      <div class="section-header">
        <div class="section-title-group">
          <el-icon class="section-icon" :size="20"><List /></el-icon>
          <h3 class="section-title">任务队列</h3>
        </div>
        <div class="section-actions">
          <label class="auto-refresh-control">
            <span>自动刷新</span>
            <el-switch v-model="autoRefresh" size="small" />
          </label>
          <el-tag type="info" round effect="plain">
            {{
              taskStore.manga.length +
              taskStore.bilibili.length +
              taskStore.toomics.length +
              taskStore.omegascans.length
            }} 个任务
          </el-tag>
        </div>
      </div>

      <div v-if="currentRunningTask || totalTaskCount > 0" class="current-task-progress">
        <div class="progress-header">
          <div>
            <span class="progress-title">当前任务</span>
            <p class="progress-name">
              {{ currentRunningTask?.task.name || '等待任务调度' }}
            </p>
          </div>
          <el-tag :type="currentTaskTagType" size="small" round>
            {{ currentTaskStatusText }}
          </el-tag>
        </div>
        <template v-if="currentRunningTask">
          <div class="progress-detail">
            <el-tag size="small" effect="plain">{{ currentRunningTask.task.website }}</el-tag>
            <span>{{ currentRunningTask.progress.stage }}</span>
            <span v-if="currentRunningTask.progress.current && currentRunningTask.progress.total">
              {{ currentRunningTask.progress.current }} / {{ currentRunningTask.progress.total }}
            </span>
          </div>
          <el-progress
            :percentage="currentRunningTask.progress.percent"
            :stroke-width="10"
            :status="currentTaskProgressStatus"
          />
          <div v-if="hasSubProgress" class="sub-progress">
            <div class="sub-progress-label">
              <span>图片下载</span>
              <span>{{ currentRunningTask.progress.subCurrent }} / {{ currentRunningTask.progress.subTotal }}</span>
            </div>
            <el-progress
              :percentage="subProgressPercent"
              :stroke-width="6"
              color="var(--primary-light, #79bbff)"
            />
          </div>
          <p class="progress-message">{{ currentRunningTask.progress.message }}</p>
        </template>
        <p v-else class="progress-message">队列中有 {{ totalTaskCount }} 个任务，等待开始执行。</p>
      </div>

      <el-empty v-if="isEmpty" description="暂无任务，快去添加吧">
        <template #image>
          <el-icon :size="60" color="var(--text-muted)"><FolderOpened /></el-icon>
        </template>
      </el-empty>

      <div v-else-if="totalTaskCount > 0" class="task-groups">
        <template v-for="group in taskGroups" :key="group.key">
          <div v-if="group.items.length" class="task-group">
            <div class="group-header">
              <h4 class="group-title">{{ group.label }}</h4>
              <el-tag size="small" round>{{ group.items.length }} 部</el-tag>
            </div>
            <div class="task-grid">
              <div
                v-for="item in group.items"
                :key="group.key + '-' + item.id"
                class="task-card"
              >
                <div class="card-badge">{{ group.badgeColor }}</div>
                <div class="card-body">
                  <h5 class="card-name">{{ item.name }}</h5>
                  <div class="card-meta">
                    <el-tag v-if="item.chapterCount" size="small" type="success" effect="plain">
                      {{ item.chapterCount }} 话
                    </el-tag>
                  </div>
                </div>
                <div class="card-footer">
                  <el-button
                    type="danger"
                    size="small"
                    plain
                    @click="task_delete(item)"
                  >
                    <el-icon><Delete /></el-icon>
                    删除
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import mForm from './form.vue'
import { computed, onMounted } from 'vue'
import { List, Delete, FolderOpened } from '@element-plus/icons-vue'
import useTaskStore from '@/stores/task'
import useAutoRefreshStore from '@/stores/autoRefresh'
import type { subscribeType } from '@/type/index'

defineOptions({
  name: 'TaskView',
})

const taskStore = useTaskStore()
const autoRefreshStore = useAutoRefreshStore()

const autoRefresh = computed({
  get: () => autoRefreshStore.taskEnabled,
  set: (val) => autoRefreshStore.setTaskAutoRefresh(val),
})

const totalTaskCount = computed(
  () =>
    taskStore.manga.length +
    taskStore.bilibili.length +
    taskStore.toomics.length +
    taskStore.omegascans.length
)

const currentRunningTask = computed(
  () =>
    taskStore.running.manga ??
    taskStore.running.bilibili ??
    taskStore.running.toomics ??
    taskStore.running.omegascans
)

const currentTaskStatusText = computed(() => {
  if (!currentRunningTask.value) return '等待中'
  if (currentRunningTask.value.status === 'success') return '已完成'
  if (currentRunningTask.value.status === 'failed') return '执行失败'

  return '执行中'
})

const currentTaskTagType = computed(() => {
  if (!currentRunningTask.value) return 'info'
  if (currentRunningTask.value.status === 'success') return 'success'
  if (currentRunningTask.value.status === 'failed') return 'danger'

  return 'primary'
})

const currentTaskProgressStatus = computed(() => {
  if (!currentRunningTask.value) return undefined
  if (currentRunningTask.value.status === 'success') return 'success'
  if (currentRunningTask.value.status === 'failed') return 'exception'

  return undefined
})

const hasSubProgress = computed(() => {
  const p = currentRunningTask.value?.progress
  return p?.subTotal != null && p.subTotal > 0 && p.subCurrent != null
})

const subProgressPercent = computed(() => {
  const p = currentRunningTask.value?.progress
  if (!p?.subTotal || !p.subCurrent) return 0
  return Math.round((p.subCurrent / p.subTotal) * 100)
})

const isEmpty = computed(() => totalTaskCount.value === 0 && !currentRunningTask.value)

const taskGroups = computed(() => [
  { key: 'manga', label: '主任务', badgeColor: '通用', items: taskStore.manga },
  { key: 'bilibili', label: 'Bilibili', badgeColor: 'B站', items: taskStore.bilibili },
  { key: 'toomics', label: 'Toomics', badgeColor: '韩漫', items: taskStore.toomics },
  { key: 'omegascans', label: 'OmegaScans', badgeColor: '欧美', items: taskStore.omegascans },
])

onMounted(() => {
  if (autoRefreshStore.taskEnabled) {
    autoRefreshStore.setTaskAutoRefresh(true)
  } else {
    taskStore.get()
  }
})

function task_delete(item: subscribeType) {
  taskStore.delete(item)
}
</script>

<style scoped>
.task-page {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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

.section-icon {
  color: var(--primary);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.current-task-progress {
  margin-bottom: 20px;
  padding: 16px;
  background: var(--bg-hover);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
}

.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.progress-title {
  display: block;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 600;
}

.progress-name {
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  word-break: break-all;
}

.progress-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-size: 13px;
}

.progress-message {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 13px;
  word-break: break-all;
}

.sub-progress {
  margin-top: 10px;
  padding: 8px 12px;
  background: var(--bg-card);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.sub-progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  font-size: 12px;
  color: var(--text-secondary);
}

.task-groups {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-group {
  background: var(--bg-hover);
  border-radius: var(--radius-sm);
  padding: 16px;
  border: 1px solid var(--border-light);
}

.group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.group-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.task-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  transition: all var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.card-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 3px 10px;
  margin: 12px 12px 0;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  letter-spacing: 0.5px;
}

.card-body {
  flex: 1;
  padding: 12px 16px 8px;
}

.card-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-footer {
  padding: 10px 16px 14px;
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid var(--border-light);
}

@media (max-width: 768px) {
  .section-card {
    padding: 16px;
  }

  .section-header {
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .current-task-progress {
    padding: 12px;
    margin-bottom: 14px;
  }

  .task-groups {
    gap: 16px;
  }

  .task-group {
    padding: 12px;
  }

  .task-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
