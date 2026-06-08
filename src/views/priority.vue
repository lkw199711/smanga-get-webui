<template>
  <div class="priority-page">
    <div class="page-toolbar">
      <div class="toolbar-left">
        <h2 class="page-title">
          <el-icon :size="22"><Star /></el-icon>
          Toomics 优先级管理
        </h2>
        <el-tag type="info" round effect="plain" size="small">
          阈值 {{ autoUpgradeThreshold }} 话
        </el-tag>
      </div>
      <div class="toolbar-right">
        <el-button type="primary" :loading="saving" @click="savePriority">
          <el-icon><Check /></el-icon>
          保存
        </el-button>
        <el-button :loading="loading" @click="reloadData">
          <el-icon><Refresh /></el-icon>
          刷新
        </el-button>
      </div>
    </div>

    <el-skeleton v-if="loading && !hasData" :rows="10" animated />

    <div v-else class="columns-wrapper">
      <!-- HIGH 优先级列 -->
      <div
        class="priority-column high-column"
        @dragover.prevent="onDragOver($event, 'high')"
        @dragleave="onDragLeave($event)"
        @drop="onDrop($event, 'high')"
      >
        <div class="column-header high-header">
          <div class="header-info">
            <el-icon :size="18"><Top /></el-icon>
            <span>高优先级</span>
            <el-tag type="danger" size="small" round>{{ highList.length }}</el-tag>
          </div>
          <span class="header-hint">手动管理 · 拖入添加</span>
        </div>
        <div class="column-body">
          <div
            v-for="manga in highList"
            :key="manga.id"
            class="manga-card"
            :class="{ 'drag-over': dragOverColumn === 'high' }"
            draggable="true"
            @dragstart="onDragStart($event, manga)"
            @dragend="onDragEnd"
          >
            <div class="card-cover">
              <el-image
                v-if="getCover(manga)"
                :src="getCover(manga)"
                fit="cover"
                loading="lazy"
              >
                <template #error>
                  <div class="cover-placeholder"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div v-else class="cover-placeholder"><el-icon><Picture /></el-icon></div>
            </div>
            <div class="card-info">
              <span class="card-name">{{ manga.name }}</span>
              <span class="card-meta">ID: {{ manga.id }} · {{ manga.chapterCount }} 话</span>
            </div>
            <el-button
              class="card-remove"
              link
              type="danger"
              size="small"
              @click="removeFromHigh(manga)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>
          <el-empty
            v-if="!highList.length"
            description="拖拽漫画到此处设为高优先级"
            :image-size="48"
          />
        </div>
      </div>

      <!-- MEDIUM 优先级列 (自动) -->
      <div
        class="priority-column medium-column"
        @dragover.prevent
      >
        <div class="column-header medium-header">
          <div class="header-info">
            <el-icon :size="18"><Rank /></el-icon>
            <span>中优先级</span>
            <el-tag type="warning" size="small" round>{{ mediumList.length }}</el-tag>
          </div>
          <span class="header-hint">自动 · ≥{{ autoUpgradeThreshold }} 话待下载</span>
        </div>
        <div class="column-body">
          <div
            v-for="manga in mediumList"
            :key="manga.id"
            class="manga-card"
            draggable="true"
            @dragstart="onDragStart($event, manga)"
            @dragend="onDragEnd"
          >
            <div class="card-cover">
              <el-image
                v-if="getCover(manga)"
                :src="getCover(manga)"
                fit="cover"
                loading="lazy"
              >
                <template #error>
                  <div class="cover-placeholder"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div v-else class="cover-placeholder"><el-icon><Picture /></el-icon></div>
            </div>
            <div class="card-info">
              <span class="card-name">{{ manga.name }}</span>
              <span class="card-meta">
                ID: {{ manga.id }} · {{ manga.indexedCount }}/{{ manga.chapterCount }} 话
              </span>
            </div>
            <el-tag size="small" type="warning" effect="plain" class="card-badge">
              +{{ manga.chapterCount - manga.indexedCount }}
            </el-tag>
          </div>
          <el-empty
            v-if="!mediumList.length"
            description="暂无中优先级漫画"
            :image-size="48"
          />
        </div>
      </div>

      <!-- LOW 优先级列 (自动) -->
      <div
        class="priority-column low-column"
        @dragover.prevent
      >
        <div class="column-header low-header">
          <div class="header-info">
            <el-icon :size="18"><Bottom /></el-icon>
            <span>低优先级</span>
            <el-tag type="info" size="small" round>{{ lowList.length }}</el-tag>
          </div>
          <span class="header-hint">自动 · 默认</span>
        </div>
        <div class="column-body">
          <div
            v-for="manga in lowList"
            :key="manga.id"
            class="manga-card"
            draggable="true"
            @dragstart="onDragStart($event, manga)"
            @dragend="onDragEnd"
          >
            <div class="card-cover">
              <el-image
                v-if="getCover(manga)"
                :src="getCover(manga)"
                fit="cover"
                loading="lazy"
              >
                <template #error>
                  <div class="cover-placeholder"><el-icon><Picture /></el-icon></div>
                </template>
              </el-image>
              <div v-else class="cover-placeholder"><el-icon><Picture /></el-icon></div>
            </div>
            <div class="card-info">
              <span class="card-name">{{ manga.name }}</span>
              <span class="card-meta">
                ID: {{ manga.id }} · {{ manga.indexedCount }}/{{ manga.chapterCount }} 话
              </span>
            </div>
          </div>
          <el-empty
            v-if="!lowList.length"
            description="暂无低优先级漫画"
            :image-size="48"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Star,
  Top,
  Bottom,
  Rank,
  Check,
  Refresh,
  Close,
  Picture,
} from '@element-plus/icons-vue'
import priorityApi, { getMangaCoverUrl, type PriorityMangaItem } from '@/api/priority'

defineOptions({
  name: 'PriorityView',
})

const loading = ref(false)
const saving = ref(false)
const highList = ref<PriorityMangaItem[]>([])
const mediumList = ref<PriorityMangaItem[]>([])
const lowList = ref<PriorityMangaItem[]>([])
const autoUpgradeThreshold = ref(3)

const hasData = computed(() => highList.value.length > 0 || mediumList.value.length > 0 || lowList.value.length > 0)

// ── 拖拽状态 ──────────────────────────────
const draggedManga = ref<PriorityMangaItem | null>(null)
const dragOverColumn = ref<string | null>(null)

function getCover(manga: PriorityMangaItem) {
  return getMangaCoverUrl(manga)
}

function onDragStart(event: DragEvent, manga: PriorityMangaItem) {
  draggedManga.value = manga
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(manga.id))
  }
}

function onDragEnd() {
  draggedManga.value = null
  dragOverColumn.value = null
}

function onDragOver(event: DragEvent, _column: string) {
  event.preventDefault()
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move'
  }
  dragOverColumn.value = 'high'
}

function onDragLeave(_event: DragEvent) {
  dragOverColumn.value = null
}

function onDrop(event: DragEvent, column: string) {
  event.preventDefault()
  dragOverColumn.value = null

  if (column !== 'high' || !draggedManga.value) return

  const manga = draggedManga.value

  // 如果已经在 HIGH 列表，不重复添加
  if (highList.value.some((m) => m.id === manga.id)) return

  // 从 MEDIUM/LOW 列表移出，加入 HIGH
  mediumList.value = mediumList.value.filter((m) => m.id !== manga.id)
  lowList.value = lowList.value.filter((m) => m.id !== manga.id)

  // 创建新的 HIGH 项（改 priority 标记）
  const highItem: PriorityMangaItem = { ...manga, priority: 'high' }
  highList.value.push(highItem)

  draggedManga.value = null
}

function removeFromHigh(manga: PriorityMangaItem) {
  highList.value = highList.value.filter((m) => m.id !== manga.id)
  // 重新计算该漫画的自动优先级，放回对应列表
  const gap = manga.chapterCount - manga.indexedCount
  if (gap >= autoUpgradeThreshold.value) {
    mediumList.value.push({ ...manga, priority: 'medium' })
  } else {
    lowList.value.push({ ...manga, priority: 'low' })
  }
}

async function reloadData() {
  loading.value = true
  try {
    const data = await priorityApi.get()
    highList.value = data.highList
    mediumList.value = data.mediumList
    lowList.value = data.lowList
    autoUpgradeThreshold.value = data.autoUpgradeThreshold
  } catch {
    ElMessage.error('加载优先级数据失败')
  } finally {
    loading.value = false
  }
}

async function savePriority() {
  saving.value = true
  try {
    const ids = highList.value.map((m) => m.id)
    await priorityApi.update(ids)
    ElMessage.success('优先级配置已保存')
  } catch {
    ElMessage.error('保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  reloadData()
})
</script>

<style scoped>
.priority-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 20px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── 三列布局 ───────────────────────────── */
.columns-wrapper {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
  align-items: start;
}

@media (max-width: 1100px) {
  .columns-wrapper {
    grid-template-columns: 1fr;
  }
}

/* ── 列 ─────────────────────────────────── */
.priority-column {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  min-height: 200px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.high-column {
  border-top: 3px solid var(--el-color-danger);
}

.medium-column {
  border-top: 3px solid var(--el-color-warning);
}

.low-column {
  border-top: 3px solid var(--el-color-info);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-hover);
  border-radius: var(--radius-md) var(--radius-md) 0 0;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 14px;
}

.header-hint {
  font-size: 11px;
  color: var(--text-muted);
}

.column-body {
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* ── 漫画卡片 ───────────────────────────── */
.manga-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  cursor: grab;
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast), opacity var(--transition-fast);
  user-select: none;
}

.manga-card:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.manga-card:active {
  cursor: grabbing;
  opacity: 0.8;
}

.manga-card.drag-over {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.card-cover {
  width: 48px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid var(--border-light);
  background: var(--bg-hover);
  flex-shrink: 0;
}

.card-cover :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 18px;
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.card-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  font-size: 11px;
  color: var(--text-secondary);
}

.card-remove {
  flex-shrink: 0;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.manga-card:hover .card-remove {
  opacity: 1;
}

.card-badge {
  flex-shrink: 0;
}

/* ── 响应式 ─────────────────────────────── */
@media (max-width: 768px) {
  .page-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .toolbar-right {
    justify-content: flex-end;
  }

  .column-body {
    max-height: 380px;
  }
}
</style>
