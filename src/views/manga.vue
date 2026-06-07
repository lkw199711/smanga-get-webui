<template>
  <div class="manga-page">
    <div class="section-card">
      <div class="section-header">
        <div class="section-title-group">
          <el-icon class="section-icon" :size="20"><Picture /></el-icon>
          <h3 class="section-title">漫画成果</h3>
        </div>
        <div class="section-actions">
          <el-input
            v-model="keyword"
            class="search-input"
            clearable
            placeholder="搜索名称、作者、标签"
            @clear="reloadMangas"
            @keyup.enter="reloadMangas"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="websiteFilter" class="filter-select" clearable placeholder="网站" @change="reloadMangas">
            <el-option label="全部网站" value="" />
            <el-option
              v-for="website in websiteOptions"
              :key="website"
              :label="formatWebsite(website)"
              :value="website"
            />
          </el-select>
          <el-select v-model="statusFilter" class="filter-select" placeholder="状态" @change="reloadMangas">
            <el-option label="全部状态" value="all" />
            <el-option label="连载中" value="serial" />
            <el-option label="已完结" value="finished" />
          </el-select>
          <el-button size="small" :loading="loading" @click="reloadMangas">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </div>
      </div>

      <div class="summary-bar">
        <div class="summary-item">
          <span class="summary-value">{{ mangas.length }}</span>
          <span class="summary-label">漫画</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ totalChapterCount }}</span>
          <span class="summary-label">章节</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ finishedCount }}</span>
          <span class="summary-label">完结</span>
        </div>
        <div class="summary-item">
          <span class="summary-value">{{ websiteOptions.length }}</span>
          <span class="summary-label">网站</span>
        </div>
        <el-tag type="info" round effect="plain">显示 {{ mangas.length }} / {{ totalMangaCount }} 部</el-tag>
      </div>

      <el-skeleton v-if="loading && !mangas.length" :rows="8" animated />

      <el-empty
        v-else-if="!mangas.length"
        description="暂无漫画元数据"
      >
        <template #image>
          <el-icon :size="60" color="var(--text-muted)"><FolderOpened /></el-icon>
        </template>
      </el-empty>

      <el-empty
        v-else-if="!filteredMangas.length"
        description="没有匹配的漫画"
      />

      <div v-else class="manga-list">
        <article
          v-for="manga in filteredMangas"
          :key="manga.key"
          class="manga-row"
        >
          <div class="cover-frame">
            <el-image
              v-if="getCoverSrc(manga) && !hasImageError(manga.key)"
              class="cover-image"
              :src="getCoverSrc(manga)"
              fit="cover"
              loading="lazy"
              @error="markImageError(manga.key)"
            >
              <template #error>
                <div class="cover-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div v-else class="cover-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </div>

          <div class="manga-content">
            <div class="title-line">
              <h4 class="manga-title">{{ manga.name }}</h4>
              <el-tag :type="manga.finished ? 'success' : 'warning'" size="small" round>
                {{ manga.finished ? '已完结' : '连载中' }}
              </el-tag>
            </div>

            <div class="meta-line">
              <el-tag size="small" effect="plain">{{ formatWebsite(manga.website) }}</el-tag>
              <span v-if="manga.author">{{ manga.author }}</span>
              <span>{{ manga.chapterCount }} 章</span>
              <span>更新 {{ formatDate(manga.updatedAt || manga.latestChapterDate) }}</span>
              <span>爬取 {{ formatDateTime(manga.crawledAt) }}</span>
            </div>

            <div v-if="recentChapters(manga).length" class="chapter-strip">
              <span
                v-for="chapter in recentChapters(manga)"
                :key="`${manga.key}-${chapter.name}-${chapter.date || ''}`"
                class="chapter-pill"
              >
                {{ chapter.name }}
                <small v-if="chapter.date">{{ formatDate(chapter.date) }}</small>
              </span>
            </div>

            <p v-if="manga.description" class="manga-description">
              {{ manga.description }}
            </p>

            <div v-if="manga.tags.length" class="tag-line">
              <el-tag
                v-for="tag in manga.tags.slice(0, 6)"
                :key="tag"
                size="small"
                type="info"
                effect="plain"
              >
                {{ tag }}
              </el-tag>
            </div>
          </div>

          <div class="side-actions">
            <el-tag size="small" type="info" effect="plain">{{ formatSource(manga.source) }}</el-tag>
            <el-tooltip :content="manga.sourcePath" placement="top">
              <el-button link size="small">
                <el-icon><FolderOpened /></el-icon>
                路径
              </el-button>
            </el-tooltip>
            <el-button
              size="small"
              plain
              :loading="loadingChapterKey === manga.key"
              :disabled="manga.chapterCount === 0"
              @click="toggleExpanded(manga.key)"
            >
              <el-icon>
                <ArrowUp v-if="isExpanded(manga.key)" />
                <ArrowDown v-else />
              </el-icon>
              章节
            </el-button>
          </div>

          <el-collapse-transition>
            <div v-if="isExpanded(manga.key)" class="chapter-panel">
              <div class="chapter-panel-header">
                <span>章节信息</span>
                <el-tag size="small" round>{{ manga.chapterCount }} 章</el-tag>
              </div>
              <el-skeleton v-if="loadingChapterKey === manga.key" :rows="3" animated />
              <el-scrollbar max-height="260px">
                <div v-if="sortedChapters(manga).length" class="chapter-list">
                  <div
                    v-for="chapter in sortedChapters(manga)"
                    :key="`${manga.key}-detail-${chapter.name}-${chapter.date || ''}`"
                    class="chapter-item"
                  >
                    <div class="chapter-main">
                      <span class="chapter-name">{{ chapter.name }}</span>
                      <span v-if="chapter.title && chapter.title !== chapter.name" class="chapter-title">
                        {{ chapter.title }}
                      </span>
                    </div>
                    <div class="chapter-meta">
                      <span v-if="chapter.date">
                        <el-icon><Calendar /></el-icon>
                        {{ formatDate(chapter.date) }}
                      </span>
                      <span v-if="chapter.imageCount">{{ chapter.imageCount }} 图</span>
                      <el-tag v-if="chapter.isFree" size="small" type="success" effect="plain">免费</el-tag>
                      <el-tag v-else-if="chapter.price" size="small" type="warning" effect="plain">
                        {{ chapter.price }}
                      </el-tag>
                    </div>
                  </div>
                </div>
                <el-empty v-else-if="loadingChapterKey !== manga.key" description="暂无章节信息" />
              </el-scrollbar>
            </div>
          </el-collapse-transition>
        </article>
      </div>

      <div v-if="mangas.length && hasMore" class="load-more-row">
        <el-button :loading="loading" @click="loadMoreMangas">加载更多</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  ArrowDown,
  ArrowUp,
  Calendar,
  FolderOpened,
  Picture,
  Refresh,
  Search,
} from '@element-plus/icons-vue'
import mangaApi, { getMangaCoverUrl, type MangaChapterSummary, type MangaResult } from '@/api/manga'

defineOptions({
  name: 'MangaView',
})

const mangas = ref<MangaResult[]>([])
const loading = ref(false)
const keyword = ref('')
const websiteFilter = ref('')
const statusFilter = ref<'all' | 'serial' | 'finished'>('all')
const expandedKeys = ref(new Set<string>())
const imageErrors = ref(new Set<string>())
const chapterCache = ref(new Map<number, MangaChapterSummary[]>())
const loadingChapterKey = ref<string | null>(null)
const totalMangaCount = ref(0)
const currentPage = ref(1)
const pageSize = 80
const hasMore = ref(false)

const websiteOptions = computed(() => {
  return Array.from(new Set(mangas.value.map((item) => item.website))).sort()
})

const finishedCount = computed(() => mangas.value.filter((item) => item.finished).length)
const totalChapterCount = computed(() => {
  return mangas.value.reduce((total, item) => total + (item.chapterCount || 0), 0)
})

const filteredMangas = computed(() => {
  const term = keyword.value.trim().toLocaleLowerCase()

  return mangas.value.filter((manga) => {
    if (websiteFilter.value && manga.website !== websiteFilter.value) return false
    if (statusFilter.value === 'finished' && !manga.finished) return false
    if (statusFilter.value === 'serial' && manga.finished) return false

    if (!term) return true

    const haystack = [
      manga.name,
      manga.author,
      manga.website,
      manga.status,
      manga.latestChapterName,
      ...manga.tags,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase()

    return haystack.includes(term)
  })
})

onMounted(() => {
  reloadMangas()
})

async function fetchMangas(append = false) {
  loading.value = true

  try {
    const page = append ? currentPage.value + 1 : 1
    const result = await mangaApi.get({
      page,
      pageSize,
      keyword: keyword.value.trim() || undefined,
      website: websiteFilter.value || undefined,
      status: statusFilter.value,
    })

    mangas.value = append ? [...mangas.value, ...result.data] : result.data
    currentPage.value = Number(result.meta.page || page)
    totalMangaCount.value = Number(result.meta.total || result.data.length)
    hasMore.value = Boolean(result.meta.hasMore)
  } catch {
    ElMessage.error('漫画成果加载失败')
  } finally {
    loading.value = false
  }
}

function reloadMangas() {
  expandedKeys.value = new Set()
  fetchMangas(false)
}

function loadMoreMangas() {
  fetchMangas(true)
}

function getCoverSrc(manga: MangaResult) {
  return getMangaCoverUrl(manga)
}

function markImageError(key: string) {
  const next = new Set(imageErrors.value)
  next.add(key)
  imageErrors.value = next
}

function hasImageError(key: string) {
  return imageErrors.value.has(key)
}

function isExpanded(key: string) {
  return expandedKeys.value.has(key)
}

async function toggleExpanded(key: string) {
  const manga = mangas.value.find((item) => item.key === key)
  if (!manga) return

  const next = new Set(expandedKeys.value)
  if (next.has(key)) {
    next.delete(key)
    expandedKeys.value = next
    return
  }

  next.add(key)
  expandedKeys.value = next

  if (!chapterCache.value.has(manga.indexId)) {
    loadingChapterKey.value = key
    try {
      const chapters = await mangaApi.chapters(manga.indexId)
      const nextCache = new Map(chapterCache.value)
      nextCache.set(manga.indexId, chapters)
      chapterCache.value = nextCache
    } catch {
      ElMessage.error('章节信息加载失败')
    } finally {
      if (loadingChapterKey.value === key) {
        loadingChapterKey.value = null
      }
    }
  } else {
    loadingChapterKey.value = null
  }
}

function dateValue(value?: string) {
  if (!value) return Number.NEGATIVE_INFINITY
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : Number.NEGATIVE_INFINITY
}

function sortedChapters(manga: MangaResult) {
  const chapters = [...(chapterCache.value.get(manga.indexId) ?? manga.chapters)]
  const hasDates = chapters.some((chapter) => Number.isFinite(dateValue(chapter.date)))

  if (hasDates) {
    return chapters.sort((a, b) => dateValue(b.date) - dateValue(a.date))
  }

  return chapters.reverse()
}

function recentChapters(manga: MangaResult) {
  return sortedChapters(manga).slice(0, 5)
}

function formatDate(value?: string) {
  if (!value) return '未知'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function formatDateTime(value?: string) {
  if (!value) return '未知'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatWebsite(website: string) {
  const labels: Record<string, string> = {
    bilibili: 'Bilibili',
    gentleman: 'Gentleman',
    local: '本地',
    omegascans: 'OmegaScans',
    toomics: 'Toomics',
    'toomics-sc': 'Toomics 简体',
    'toomics-tc': 'Toomics 繁体',
  }

  return labels[website] || website
}

function formatSource(source: string) {
  const labels: Record<string, string> = {
    cloud: '云端',
    compress: '压缩',
    download: '下载',
    organize: '归档',
  }

  return labels[source] || source
}
</script>

<style scoped>
.manga-page {
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
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.section-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.section-icon {
  color: var(--primary);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.section-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
}

.filter-select {
  width: 132px;
}

.summary-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 18px;
  padding: 12px;
  background: var(--bg-hover);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
}

.summary-item {
  min-width: 92px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-right: 12px;
  border-right: 1px solid var(--border-color);
}

.summary-value {
  font-size: 18px;
  line-height: 1.1;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-label {
  font-size: 12px;
  color: var(--text-muted);
}

.manga-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.manga-row {
  display: grid;
  grid-template-columns: 96px minmax(0, 1fr) 110px;
  gap: 16px;
  align-items: start;
  padding: 14px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  transition: box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.manga-row:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.cover-frame {
  width: 96px;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
  background: var(--bg-hover);
}

.cover-image,
.cover-placeholder {
  width: 100%;
  height: 100%;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  font-size: 26px;
}

.manga-content {
  min-width: 0;
}

.title-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
}

.manga-title {
  min-width: 0;
  flex: 1;
  font-size: 16px;
  line-height: 1.35;
  font-weight: 700;
  color: var(--text-primary);
  word-break: break-word;
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 12px;
}

.chapter-strip {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.chapter-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 220px;
  padding: 3px 8px;
  border-radius: 999px;
  background: #eef7f2;
  color: #206343;
  font-size: 12px;
  line-height: 1.4;
}

.chapter-pill small {
  color: #5a7d69;
}

.manga-description {
  margin-top: 10px;
  color: var(--text-secondary);
  font-size: 13px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.side-actions {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}

.side-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}

.chapter-panel {
  grid-column: 2 / 4;
  margin-top: -4px;
  padding: 12px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-hover);
}

.chapter-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-weight: 600;
  color: var(--text-primary);
}

.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-right: 8px;
}

.chapter-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;
  padding: 8px 10px;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  background: var(--bg-card);
}

.chapter-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.chapter-name {
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-word;
}

.chapter-title {
  color: var(--text-muted);
  font-size: 12px;
  word-break: break-word;
}

.chapter-meta {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
  color: var(--text-secondary);
  font-size: 12px;
}

.chapter-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.load-more-row {
  display: flex;
  justify-content: center;
  padding-top: 16px;
}

@media (max-width: 900px) {
  .section-header {
    align-items: stretch;
    flex-direction: column;
  }

  .section-actions {
    justify-content: flex-start;
  }

  .search-input {
    width: min(100%, 320px);
  }

  .manga-row {
    grid-template-columns: 84px minmax(0, 1fr);
  }

  .cover-frame {
    width: 84px;
  }

  .side-actions {
    grid-column: 2 / 3;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .chapter-panel {
    grid-column: 1 / 3;
  }
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

  .filter-select,
  .search-input {
    width: 100%;
  }

  .summary-item {
    min-width: calc(50% - 10px);
  }

  .manga-row {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 12px;
    padding: 12px;
  }

  .cover-frame {
    width: 72px;
  }

  .manga-title {
    font-size: 15px;
  }

  .chapter-item {
    grid-template-columns: 1fr;
  }

  .chapter-meta {
    justify-content: flex-start;
  }
}
</style>
