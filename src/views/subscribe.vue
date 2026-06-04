<template>
  <div class="subscribe-page" @dragover.prevent @drop.prevent="onSubscribePageDrop">
    <mForm />

    <div class="section-card">
      <div class="section-header">
        <div class="section-title-group">
          <el-icon class="section-icon" :size="20"><Collection /></el-icon>
          <h3 class="section-title">订阅列表</h3>
        </div>
        <el-tag type="info" round effect="plain">共 {{ subscribeStore.subscribes.length }} 部</el-tag>
      </div>

      <el-empty v-if="!subscribeStore.subscribes.length" description="暂无订阅，快去添加吧" />

      <div v-else class="subscribe-grid" @dragover.prevent @drop.prevent="onSubscribePageDrop">
        <div
          v-for="(item, index) in subscribeStore.subscribes"
          :key="`${item.website}-${item.id}-${item.name}`"
          class="subscribe-card"
          :class="{ 'is-dragging': draggingIndex === index, 'is-drag-over': dragOverIndex === index }"
          draggable="true"
          @dragstart="onSubscribeDragStart(index, $event)"
          @dragover.prevent="onSubscribeDragOver(index)"
          @dragleave="onSubscribeDragLeave(index)"
          @drop.stop.prevent="onSubscribeDrop(index)"
          @dragend="onSubscribeDragEnd"
        >
          <el-tooltip content="拖拽排序" placement="top">
            <el-icon class="drag-handle"><Rank /></el-icon>
          </el-tooltip>
          <div class="card-badge">{{ item.website }}</div>
          <div class="card-body">
            <h4 class="card-name">{{ item.name }}</h4>
            <div class="card-meta">
              <el-tag size="small" type="success" effect="plain">
                {{ item.chapterCount || 0 }} 话
              </el-tag>
            </div>
          </div>
          <div class="card-footer">
            <el-button
              type="primary"
              size="small"
              plain
              :loading="downloadingKey === getSubscribeKey(item)"
              @click.stop="task_add(item)"
            >
              <el-icon><Download /></el-icon>
              下载
            </el-button>
            <el-button
              type="danger"
              size="small"
              plain
              @click="sub_delete(item)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import mForm from './form.vue'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Collection, Delete, Download, Rank } from '@element-plus/icons-vue'
import useSubscribeStore from '@/stores/subscribe'
import useTaskStore from '@/stores/task'
import type { subscribeType } from '@/type'

defineOptions({
  name: 'SubscribeView',
})

const subscribeStore = useSubscribeStore()
const taskStore = useTaskStore()
const draggingIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const downloadingKey = ref<string | null>(null)

onMounted(() => {
  subscribeStore.get()
})

function sub_delete(item: subscribeType) {
  subscribeStore.delete(item)
}

function getSubscribeKey(item: subscribeType) {
  return `${item.website}-${item.id}-${item.name}`
}

async function task_add(item: subscribeType) {
  const key = getSubscribeKey(item)
  downloadingKey.value = key

  try {
    await taskStore.add({
      ...item,
      mangaUrl: item.url,
    })
  } catch {
    ElMessage.error('下载任务添加失败')
  } finally {
    if (downloadingKey.value === key) {
      downloadingKey.value = null
    }
  }
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const next = [...items]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)

  return next
}

function clearDragState() {
  draggingIndex.value = null
  dragOverIndex.value = null
}

function onSubscribeDragStart(index: number, event: DragEvent) {
  draggingIndex.value = index
  dragOverIndex.value = index

  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-smanga-subscribe-index', String(index))
  }
}

function onSubscribeDragOver(index: number) {
  if (draggingIndex.value === null || draggingIndex.value === index) return

  dragOverIndex.value = index
}

function onSubscribeDragLeave(index: number) {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null
  }
}

async function onSubscribeDrop(index: number) {
  const fromIndex = draggingIndex.value
  clearDragState()

  if (fromIndex === null || fromIndex === index) return

  const orderedSubscribes = moveItem(subscribeStore.subscribes, fromIndex, index)

  try {
    await subscribeStore.reorder(orderedSubscribes)
  } catch {
    ElMessage.error('订阅顺序保存失败')
  }
}

function onSubscribeDragEnd() {
  clearDragState()
}

function onSubscribePageDrop() {
  clearDragState()
}
</script>

<style scoped>
.subscribe-page {
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

.section-icon {
  color: var(--primary);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.subscribe-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.subscribe-card {
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

.subscribe-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.subscribe-card:active {
  cursor: grabbing;
}

.subscribe-card.is-dragging {
  opacity: 0.55;
  transform: scale(0.98);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.subscribe-card.is-drag-over {
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

.subscribe-card:hover .drag-handle,
.subscribe-card.is-drag-over .drag-handle {
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
  text-transform: uppercase;
}

.card-body {
  flex: 1;
  padding: 12px 16px 8px;
}

.card-name {
  font-size: 15px;
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
  gap: 8px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border-light);
}

.card-footer :deep(.el-button + .el-button) {
  margin-left: 0;
}

@media (max-width: 768px) {
  .section-card {
    padding: 16px;
  }

  .section-header {
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .section-title {
    font-size: 16px;
  }

  .subscribe-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}
</style>
