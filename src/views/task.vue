<template>
  <div class="task-page" @dragover.prevent @drop.prevent="onTaskPageDrop">
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
          <el-button
            type="danger"
            size="small"
            plain
            :loading="clearingTasks"
            :disabled="totalTaskCount === 0"
            @click="clearTasks"
          >
            <el-icon><Delete /></el-icon>
            清空任务
          </el-button>
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

      <div class="quick-task-actions">
        <el-button
          v-for="action in quickTaskActions"
          :key="action.type"
          type="primary"
          size="small"
          plain
          :loading="triggeringTask === action.type"
          :disabled="triggeringTask !== null && triggeringTask !== action.type"
          @click="triggerQuickTask(action.type)"
        >
          <el-icon><VideoPlay /></el-icon>
          {{ action.label }}
        </el-button>
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
            <div class="task-grid" @dragover.prevent @drop.prevent="onTaskPageDrop">
              <div
                v-for="(item, index) in group.items"
                :key="item.taskId || `${group.key}-${item.website}-${item.id}-${item.name}`"
                class="task-card"
                :class="{
                  'is-dragging': isTaskDragging(group.key, index),
                  'is-drag-over': isTaskDragOver(group.key, index),
                }"
                draggable="true"
                @dragstart="onTaskDragStart(group.key, index, $event)"
                @dragover.prevent="onTaskDragOver(group.key, index)"
                @dragleave="onTaskDragLeave(group.key, index)"
                @drop.stop.prevent="onTaskDrop(group.key, index)"
                @dragend="onTaskDragEnd"
              >
                <el-tooltip content="拖拽排序" placement="top">
                  <el-icon class="drag-handle"><Rank /></el-icon>
                </el-tooltip>
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
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { List, Delete, FolderOpened, Rank, VideoPlay } from '@element-plus/icons-vue'
import useTaskStore, { type taskQueueKey } from '@/stores/task'
import useAutoRefreshStore from '@/stores/autoRefresh'
import type { TaskTriggerType } from '@/api/task'
import type { subscribeType } from '@/type/index'

defineOptions({
  name: 'TaskView',
})

const taskStore = useTaskStore()
const autoRefreshStore = useAutoRefreshStore()
const draggingTask = ref<{ queue: taskQueueKey; index: number } | null>(null)
const dragOverTask = ref<{ queue: taskQueueKey; index: number } | null>(null)
const triggeringTask = ref<TaskTriggerType | null>(null)
const clearingTasks = ref(false)

const quickTaskActions: Array<{ type: TaskTriggerType; label: string }> = [
  { type: 'toomics', label: '玩漫订阅' },
  { type: 'toptoon', label: '顶通订阅' },
  { type: 'omegascans', label: 'OmegaScans订阅' },
  { type: 'gentleman', label: 'Gentleman订阅' },
]

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
  if (currentRunningTask.value.status === 'paused') return '已暂停'

  return '执行中'
})

const currentTaskTagType = computed(() => {
  if (!currentRunningTask.value) return 'info'
  if (currentRunningTask.value.status === 'success') return 'success'
  if (currentRunningTask.value.status === 'failed') return 'danger'
  if (currentRunningTask.value.status === 'paused') return 'warning'

  return 'primary'
})

const currentTaskProgressStatus = computed(() => {
  if (!currentRunningTask.value) return undefined
  if (currentRunningTask.value.status === 'success') return 'success'
  if (currentRunningTask.value.status === 'failed') return 'exception'
  if (currentRunningTask.value.status === 'paused') return 'warning'

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

const taskGroups = computed<{ key: taskQueueKey; label: string; badgeColor: string; items: subscribeType[] }[]>(() => [
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

async function triggerQuickTask(type: TaskTriggerType) {
  triggeringTask.value = type

  try {
    await taskStore.trigger(type)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (!message || message === 'Request failed') {
      ElMessage.error('任务触发失败')
    }
  } finally {
    if (triggeringTask.value === type) {
      triggeringTask.value = null
    }
  }
}

async function clearTasks() {
  try {
    await ElMessageBox.confirm('确定清空所有等待中的任务吗？正在执行的任务不会被中断。', '清空任务', {
      type: 'warning',
      confirmButtonText: '清空',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }

  clearingTasks.value = true

  try {
    await taskStore.clear()
  } catch {
    ElMessage.error('任务清空失败')
  } finally {
    clearingTasks.value = false
  }
}

function moveTaskItem(items: subscribeType[], fromIndex: number, toIndex: number) {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  if (!moved) return items

  next.splice(toIndex, 0, moved)

  return next
}

function clearTaskDragState() {
  draggingTask.value = null
  dragOverTask.value = null
}

function isTaskDragging(queue: taskQueueKey, index: number) {
  return draggingTask.value?.queue === queue && draggingTask.value.index === index
}

function isTaskDragOver(queue: taskQueueKey, index: number) {
  return dragOverTask.value?.queue === queue && dragOverTask.value.index === index
}

function onTaskDragStart(queue: taskQueueKey, index: number, event: DragEvent) {
  draggingTask.value = { queue, index }
  dragOverTask.value = { queue, index }

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-smanga-task-index', `${queue}:${index}`)
  }
}

function onTaskDragOver(queue: taskQueueKey, index: number) {
  if (!draggingTask.value || draggingTask.value.queue !== queue || draggingTask.value.index === index) {
    return
  }

  dragOverTask.value = { queue, index }
}

function onTaskDragLeave(queue: taskQueueKey, index: number) {
  if (dragOverTask.value?.queue === queue && dragOverTask.value.index === index) {
    dragOverTask.value = null
  }
}

async function onTaskDrop(queue: taskQueueKey, index: number) {
  const source = draggingTask.value
  clearTaskDragState()

  if (!source || source.queue !== queue || source.index === index) return

  const orderedTasks = moveTaskItem(taskStore[queue], source.index, index)

  try {
    await taskStore.reorder(queue, orderedTasks)
  } catch {
    ElMessage.error('任务顺序保存失败')
  }
}

function onTaskDragEnd() {
  clearTaskDragState()
}

function onTaskPageDrop() {
  clearTaskDragState()
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

.quick-task-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.quick-task-actions :deep(.el-button + .el-button) {
  margin-left: 0;
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
  position: relative;
  cursor: grab;
}

.task-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.task-card:active {
  cursor: grabbing;
}

.task-card.is-dragging {
  opacity: 0.55;
  transform: scale(0.98);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.task-card.is-drag-over {
  border-color: var(--primary);
  box-shadow: inset 0 0 0 2px var(--primary-light);
}

.drag-handle {
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 1;
  color: var(--text-muted);
  cursor: grab;
  transition: color var(--transition-fast);
}

.task-card:hover .drag-handle,
.task-card.is-drag-over .drag-handle {
  color: var(--primary);
}

.card-badge {
  display: inline-block;
  align-self: flex-start;
  padding: 3px 10px;
  margin: 12px 42px 0 12px;
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
