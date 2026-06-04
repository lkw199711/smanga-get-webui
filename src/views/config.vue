<template>
  <div class="config-page">
    <div class="config-card">
      <!-- Header -->
      <div class="config-header">
        <div class="config-title-group">
          <el-icon class="config-icon" :size="20"><Setting /></el-icon>
          <h3 class="config-title">系统配置</h3>
        </div>
        <div class="config-actions">
          <el-tag v-if="configPath" size="small" type="info" effect="plain">{{
            configPath
          }}</el-tag>
          <el-button @click="fetchConfig" :loading="loading" size="small">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
          <el-button
            type="primary"
            size="small"
            @click="saveConfig"
            :loading="saving"
            :disabled="!isDirty"
          >
            <el-icon><Check /></el-icon>
            保存
          </el-button>
          <el-button size="small" @click="resetConfig" :disabled="!isDirty">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="!configLoaded" class="config-loading">
        <el-skeleton :rows="8" animated />
      </div>

      <!-- Config tabs -->
      <template v-else>
        <el-tabs v-model="activeTab" type="border-card" class="config-tabs">
          <!-- 基础配置 -->
          <el-tab-pane label="基础" name="basic">
            <el-form :model="form" label-width="180px" class="config-form">
              <el-form-item label="无头浏览器">
                <el-switch v-model="form.headless" />
                <span class="form-hint">浏览器是否在后台无界面运行</span>
              </el-form-item>
              <el-form-item label="设置Cookie后退出">
                <div class="one-shot-row">
                  <el-switch v-model="form.endAfterSetCookie" />
                  <el-tag size="small" type="warning" effect="plain" round>一次性</el-tag>
                  <span class="form-hint">开启后本次启动完成Cookie设置即自动退出，<b>执行后自动重置为关闭</b></span>
                </div>
              </el-form-item>
              <el-form-item label="设置Cookie后关机">
                <div class="one-shot-row">
                  <el-switch v-model="form.shutdownAfterSetCookie" />
                  <el-tag size="small" type="danger" effect="plain" round>一次性</el-tag>
                  <span class="form-hint">开启后本次启动完成Cookie设置即自动关机，<b>执行后自动重置为关闭</b></span>
                </div>
              </el-form-item>
              <el-form-item label="自动移除已完成订阅">
                <el-switch v-model="form.autoRemoveSubscribe" />
              </el-form-item>
              <el-form-item label="全局下载路径">
                <el-input v-model="form.downloadPath" placeholder="如 C:\manga\download" />
              </el-form-item>
              <el-form-item label="全局压缩路径">
                <el-input v-model="form.compressPath" placeholder="如 C:\manga\compress" />
              </el-form-item>
              <el-form-item label="缓存根目录">
                <el-input v-model="form.cacheRoot" placeholder="缓存目录路径" />
              </el-form-item>
              <el-form-item label="等待时间(ms)">
                <el-input-number v-model="form.watting" :min="0" :step="100" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 代理配置 -->
          <el-tab-pane label="代理" name="proxy">
            <el-form :model="form.proxy" label-width="140px" class="config-form">
              <el-form-item label="启用代理">
                <el-switch v-model="form.proxy.enable" />
              </el-form-item>
              <el-form-item label="代理服务器">
                <el-input
                  v-model="form.proxy.server"
                  placeholder="http://192.168.1.1:7890"
                />
              </el-form-item>
              <el-form-item label="用户名">
                <el-input v-model="form.proxy.username" placeholder="代理用户名" />
              </el-form-item>
              <el-form-item label="密码">
                <el-input
                  v-model="form.proxy.password"
                  type="password"
                  show-password
                  placeholder="代理密码"
                />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 定时任务 -->
          <el-tab-pane label="定时任务" name="cron">
            <el-form :model="form.cron" label-width="140px" class="config-form">
              <el-form-item label="启用定时任务">
                <el-switch v-model="form.cron.enable" />
              </el-form-item>
              <el-form-item label="Cron 表达式">
                <el-input v-model="form.cron.interval" placeholder="0 0 1,13 * * *">
                  <template #append>
                    <el-tooltip
                      content="格式: 秒 分 时 日 月 星期，例如 0 0 1,13 * * * 表示每天1点和13点"
                    >
                      <el-icon><QuestionFilled /></el-icon>
                    </el-tooltip>
                  </template>
                </el-input>
              </el-form-item>
              <el-form-item label="清理Cookies">
                <el-switch v-model="form.cron.clearCookies" />
                <span class="form-hint">每次定时任务前清理cookie记录</span>
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 启动任务 -->
          <el-tab-pane label="启动任务" name="immediately">
            <el-form :model="form.immediately" label-width="200px" class="config-form">
              <el-alert
                type="info"
                :closable="false"
                show-icon
                title="以下开关仅在服务启动时生效，保存后需重启服务"
                style="margin-bottom: 16px"
              />
              <el-form-item label="执行订阅任务">
                <el-switch v-model="form.immediately.subscribeTask" />
                <span class="form-hint">启动后立即执行所有订阅任务</span>
              </el-form-item>
              <el-form-item label="更新简体Toomics封面">
                <el-switch v-model="form.immediately.toomicsUpdateSc" />
              </el-form-item>
              <el-form-item label="更新繁体Toomics封面">
                <el-switch v-model="form.immediately.toomicsUpdateTc" />
              </el-form-item>
              <el-form-item label="更新OmegaScans封面">
                <el-switch v-model="form.immediately.omegascansUpdate" />
              </el-form-item>
              <el-form-item label="执行Bilibili任务">
                <el-switch v-model="form.immediately.bilibili" />
              </el-form-item>
              <el-form-item label="压缩简体Toomics">
                <el-switch v-model="form.immediately.toomicsCompressSc" />
              </el-form-item>
              <el-form-item label="压缩繁体Toomics">
                <el-switch v-model="form.immediately.toomicsCompressTc" />
              </el-form-item>
              <el-form-item label="压缩OmegaScans">
                <el-switch v-model="form.immediately.omegascansCompress" />
              </el-form-item>
              <el-form-item label="同步OmegaScans到云盘">
                <el-switch v-model="form.immediately.omegascansSyncCloud" />
              </el-form-item>
            </el-form>
          </el-tab-pane>

          <!-- 站点配置 -->
          <el-tab-pane label="站点配置" name="sites">
            <el-tabs v-model="activeSiteTab" type="card" class="site-tabs">
              <el-tab-pane
                v-for="site in siteTabs"
                :key="site.key"
                :label="site.label"
                :name="site.key"
              >
                <el-form
                  :model="form[site.key]"
                  label-width="160px"
                  class="config-form"
                >
                  <el-form-item label="Cookie文件">
                    <el-input
                      v-model="form[site.key].cookieFile"
                      placeholder="data/cookies/xxx.json"
                    />
                  </el-form-item>
                  <el-form-item label="下载路径">
                    <el-input
                      v-model="form[site.key].downloadPath"
                      placeholder="下载目录"
                    />
                  </el-form-item>
                  <el-form-item label="压缩路径">
                    <el-input
                      v-model="form[site.key].compressPath"
                      placeholder="压缩输出目录"
                    />
                  </el-form-item>

                  <!-- Toomics extra fields -->
                  <template v-if="isToomicsSite(site.key)">
                    <el-form-item label="用户名">
                      <el-input v-model="form[site.key].userName" />
                    </el-form-item>
                    <el-form-item label="密码">
                      <el-input
                        v-model="form[site.key].passWord"
                        type="password"
                        show-password
                      />
                    </el-form-item>
                    <el-form-item label="滚动步长">
                      <el-input-number
                        v-model="form[site.key].scrollStep"
                        :min="100"
                        :step="100"
                      />
                    </el-form-item>
                    <el-form-item label="滚动延迟(ms)">
                      <el-input-number
                        v-model="form[site.key].scrollDelay"
                        :min="0"
                        :step="100"
                      />
                    </el-form-item>
                    <el-form-item label="最大重试">
                      <el-input-number
                        v-model="form[site.key].maxRetry"
                        :min="1"
                        :max="20"
                      />
                    </el-form-item>
                    <el-form-item label="下载锁定元数据">
                      <el-switch v-model="form[site.key].downloadLockedMeta" />
                    </el-form-item>
                    <el-form-item label="自动压缩">
                      <el-switch v-model="form[site.key].autoCompress" />
                    </el-form-item>
                    <el-form-item label="云盘路径">
                      <el-input v-model="form[site.key].cloudPath" />
                    </el-form-item>
                    <el-form-item label="封面缓存">
                      <el-input v-model="form[site.key].coverCache" />
                    </el-form-item>
                    <el-form-item label="章节缓存">
                      <el-input v-model="form[site.key].chapterCache" />
                    </el-form-item>
                    <el-form-item label="跳过已有">
                      <el-switch v-model="form[site.key].jumpExist" />
                    </el-form-item>
                    <el-form-item label="跳过漫画">
                      <el-input
                        v-model="form[site.key].jumpMangas"
                        type="textarea"
                        :rows="2"
                        placeholder="一行一个漫画名称"
                      />
                    </el-form-item>
                    <el-form-item label="仅更新当天">
                      <el-switch v-model="form[site.key].updateOnlyDay" />
                    </el-form-item>
                  </template>

                  <!-- Bilibili extra -->
                  <template v-if="site.key === 'bilibili'">
                    <el-form-item label="滚动步长">
                      <el-input-number
                        v-model="form.bilibili.scrollStep"
                        :min="100"
                        :step="100"
                      />
                    </el-form-item>
                    <el-form-item label="滚动延迟(ms)">
                      <el-input-number
                        v-model="form.bilibili.scrollDelay"
                        :min="0"
                        :step="100"
                      />
                    </el-form-item>
                    <el-form-item label="下载锁定元数据">
                      <el-switch v-model="form.bilibili.downloadLockedMeta" />
                    </el-form-item>
                  </template>

                  <!-- OmegaScans extra -->
                  <template v-if="site.key === 'omegascans'">
                    <el-form-item label="自动压缩">
                      <el-switch v-model="form.omegascans.autoCompress" />
                    </el-form-item>
                    <el-form-item label="云盘路径">
                      <el-input v-model="form.omegascans.cloudPath" />
                    </el-form-item>
                  </template>

                  <!-- Gentleman extra -->
                  <template v-if="site.key === 'gentleman'">
                    <el-form-item label="整理路径">
                      <el-input v-model="form.gentleman.organizePath" />
                    </el-form-item>
                    <el-form-item label="启用整理">
                      <el-switch v-model="form.gentleman.organize" />
                    </el-form-item>
                  </template>

                  <el-form-item
                    v-if="form[site.key]?.latestSyncCloud !== undefined"
                    label="上次云同步"
                  >
                    <el-input
                      :model-value="formatTimestamp(form[site.key].latestSyncCloud)"
                      readonly
                      disabled
                    />
                  </el-form-item>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-tab-pane>

          <!-- 原始 JSON -->
          <el-tab-pane label="原始JSON" name="raw">
            <div class="raw-section">
              <div class="raw-toolbar">
                <el-button size="small" @click="syncFormToRaw"
                  >从表单生成</el-button
                >
                <el-alert
                  v-if="rawError"
                  :title="rawError"
                  type="error"
                  :closable="false"
                  show-icon
                />
              </div>
              <el-input
                v-model="rawJson"
                type="textarea"
                :rows="20"
                placeholder="编辑原始 JSON 配置"
                class="raw-editor"
                @input="rawError = ''"
              />
              <div class="raw-actions">
                <el-button
                  type="primary"
                  size="small"
                  @click="saveRawJson"
                  :disabled="!rawJson"
                >
                  校验并保存 JSON
                </el-button>
                <el-button size="small" @click="syncFormToRaw"
                  >从表单重新生成</el-button
                >
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, watch, computed } from 'vue'
import {
  Setting,
  Refresh,
  Check,
  RefreshLeft,
  QuestionFilled,
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import configApi from '@/api/config'
import type { AppConfig, WebsiteConfig } from '@/type/config'
import _ from 'lodash'

defineOptions({
  name: 'ConfigView',
})

const loading = ref(false)
const saving = ref(false)
const configLoaded = ref(false)
const activeTab = ref('basic')
const activeSiteTab = ref('toomics')
const configPath = ref('')
const rawJson = ref('')
const rawError = ref('')

// 深拷贝原始配置，用于比对修改
let originalConfig: AppConfig | null = null

type SiteKey = 'toomics' | 'toomics-sc' | 'toomics-tc' | 'bilibili' | 'omegascans' | 'gentleman'

const defaultSiteConfig: WebsiteConfig = {
  cookieFile: '',
  downloadPath: '',
  compressPath: '',
}

// 表单默认值（防止首次渲染时 undefined 报错）
const defaultConfig: AppConfig = {
  headless: true,
  proxy: { enable: false, server: '', username: '', password: '' },
  cron: { enable: false, interval: '0 0 1,13 * * *', clearCookies: false },
  immediately: {
    subscribeTask: false,
    toomicsUpdateSc: false,
    toomicsUpdateTc: false,
    omegascansUpdate: false,
    bilibili: false,
    toomicsCompressSc: false,
    toomicsCompressTc: false,
    omegascansCompress: false,
    omegascansSyncCloud: false,
  },
  endAfterSetCookie: false,
  shutdownAfterSetCookie: false,
  autoRemoveSubscribe: true,
  watting: 0,
  downloadPath: '',
  compressPath: '',
  cacheRoot: '',
  toomics: {
    ...defaultSiteConfig,
    coverCache: '',
    chapterCache: '',
    userName: '',
    passWord: '',
    scrollStep: 400,
    scrollDelay: 500,
    maxRetry: 7,
    downloadLockedMeta: false,
    autoCompress: false,
    cloudPath: '',
    jumpExist: false,
    jumpMangas: '',
    updateOnlyDay: false,
  },
  'toomics-sc': {
    ...defaultSiteConfig,
    coverCache: '',
    chapterCache: '',
    userName: '',
    passWord: '',
    scrollStep: 400,
    scrollDelay: 500,
    maxRetry: 7,
    downloadLockedMeta: false,
    autoCompress: false,
    cloudPath: '',
    jumpExist: false,
    jumpMangas: '',
    updateOnlyDay: false,
  },
  'toomics-tc': {
    ...defaultSiteConfig,
    coverCache: '',
    chapterCache: '',
    userName: '',
    passWord: '',
    scrollStep: 400,
    scrollDelay: 500,
    maxRetry: 7,
    downloadLockedMeta: false,
    autoCompress: false,
    cloudPath: '',
    jumpExist: false,
    jumpMangas: '',
    updateOnlyDay: false,
  },
  bilibili: {
    ...defaultSiteConfig,
    scrollStep: 400,
    scrollDelay: 500,
    downloadLockedMeta: false,
  },
  omegascans: {
    ...defaultSiteConfig,
    autoCompress: false,
    cloudPath: '',
  },
  gentleman: {
    ...defaultSiteConfig,
    organizePath: '',
    organize: false,
  },
}

const form = reactive<AppConfig>(_.cloneDeep(defaultConfig))

const siteTabs: Array<{ key: SiteKey; label: string }> = [
  { key: 'toomics', label: 'Toomics' },
  { key: 'toomics-sc', label: 'Toomics-SC' },
  { key: 'toomics-tc', label: 'Toomics-TC' },
  { key: 'bilibili', label: 'Bilibili' },
  { key: 'omegascans', label: 'OmegaScans' },
  { key: 'gentleman', label: '绅士漫画' },
]

const siteSwitchFields: Record<SiteKey, string[]> = {
  toomics: ['downloadLockedMeta', 'autoCompress', 'jumpExist', 'updateOnlyDay'],
  'toomics-sc': ['downloadLockedMeta', 'autoCompress', 'jumpExist', 'updateOnlyDay'],
  'toomics-tc': ['downloadLockedMeta', 'autoCompress', 'jumpExist', 'updateOnlyDay'],
  bilibili: ['downloadLockedMeta'],
  omegascans: ['autoCompress'],
  gentleman: ['organize'],
}

const isDirty = computed(() => {
  if (!originalConfig) return false
  return !_.isEqual(form, originalConfig)
})

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}

function toSwitchValue(value: unknown, fallback = false) {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes', 'on'].includes(normalized)) return true
    if (['0', 'false', 'no', 'off', ''].includes(normalized)) return false
  }
  if (value === null || value === undefined) return fallback
  return Boolean(value)
}

function normalizeConfig(config: AppConfig) {
  const normalized = _.merge(_.cloneDeep(defaultConfig), _.cloneDeep(config))

  normalized.headless = toSwitchValue(normalized.headless, defaultConfig.headless)
  normalized.endAfterSetCookie = toSwitchValue(
    normalized.endAfterSetCookie,
    defaultConfig.endAfterSetCookie,
  )
  normalized.shutdownAfterSetCookie = toSwitchValue(
    normalized.shutdownAfterSetCookie,
    defaultConfig.shutdownAfterSetCookie,
  )
  normalized.autoRemoveSubscribe = toSwitchValue(
    normalized.autoRemoveSubscribe,
    defaultConfig.autoRemoveSubscribe,
  )
  normalized.proxy.enable = toSwitchValue(normalized.proxy.enable, defaultConfig.proxy.enable)
  normalized.cron.enable = toSwitchValue(normalized.cron.enable, defaultConfig.cron.enable)
  normalized.cron.clearCookies = toSwitchValue(
    normalized.cron.clearCookies,
    defaultConfig.cron.clearCookies,
  )

  normalized.immediately.subscribeTask = toSwitchValue(normalized.immediately.subscribeTask)
  normalized.immediately.toomicsUpdateSc = toSwitchValue(normalized.immediately.toomicsUpdateSc)
  normalized.immediately.toomicsUpdateTc = toSwitchValue(normalized.immediately.toomicsUpdateTc)
  normalized.immediately.omegascansUpdate = toSwitchValue(normalized.immediately.omegascansUpdate)
  normalized.immediately.bilibili = toSwitchValue(normalized.immediately.bilibili)
  normalized.immediately.toomicsCompressSc = toSwitchValue(normalized.immediately.toomicsCompressSc)
  normalized.immediately.toomicsCompressTc = toSwitchValue(normalized.immediately.toomicsCompressTc)
  normalized.immediately.omegascansCompress = toSwitchValue(normalized.immediately.omegascansCompress)
  normalized.immediately.omegascansSyncCloud = toSwitchValue(
    normalized.immediately.omegascansSyncCloud,
  )
  if (normalized.immediately.debugOmegascans !== undefined) {
    normalized.immediately.debugOmegascans = toSwitchValue(normalized.immediately.debugOmegascans)
  }

  for (const site of siteTabs) {
    const siteConfig = normalized[site.key]
    for (const field of siteSwitchFields[site.key]) {
      siteConfig[field] = toSwitchValue(siteConfig[field])
    }
  }

  return normalized
}

// 填充表单
function fillForm(config: AppConfig) {
  const normalized = normalizeConfig(config)
  Object.assign(form, normalized)
  originalConfig = _.cloneDeep(normalized)
  syncFormToRaw()
}

// 拉取配置
async function fetchConfig() {
  loading.value = true
  try {
    const res = await configApi.get()
    if (res?.data) {
      fillForm(res.data)
      configPath.value = res.meta?.configPath || ''
      configLoaded.value = true
    } else {
      ElMessage.error('获取配置失败')
    }
  } catch (e: unknown) {
    ElMessage.error(`获取配置失败: ${errorMessage(e)}`)
  } finally {
    loading.value = false
  }
}

// 保存配置
async function saveConfig() {
  saving.value = true
  try {
    await configApi.update({ ...form })
    originalConfig = _.cloneDeep({ ...form })
    ElMessage.success('配置保存成功')
  } catch (e: unknown) {
    ElMessage.error(`保存失败: ${errorMessage(e)}`)
  } finally {
    saving.value = false
  }
}

// 重置未保存修改
function resetConfig() {
  if (originalConfig) {
    Object.assign(form, _.cloneDeep(originalConfig))
    syncFormToRaw()
  }
}

// 表单 -> 原始 JSON
function syncFormToRaw() {
  try {
    rawJson.value = JSON.stringify({ ...form }, null, 2)
    rawError.value = ''
  } catch (e: unknown) {
    rawError.value = `格式化失败: ${errorMessage(e)}`
  }
}

// 校验并保存原始 JSON
async function saveRawJson() {
  rawError.value = ''
  let parsed: unknown
  try {
    parsed = JSON.parse(rawJson.value)
  } catch (e: unknown) {
    rawError.value = `JSON 格式错误: ${errorMessage(e)}`
    return
  }

  if (!isRecord(parsed)) {
    rawError.value = 'JSON 必须是对象类型'
    return
  }

  const parsedConfig = parsed as AppConfig
  saving.value = true
  try {
    await configApi.update(parsedConfig)
    fillForm(parsedConfig)
    ElMessage.success('JSON 配置保存成功')
  } catch (e: unknown) {
    rawError.value = `保存失败: ${errorMessage(e)}`
  } finally {
    saving.value = false
  }
}

function isToomicsSite(key: string) {
  return key.startsWith('toomics')
}

function formatTimestamp(ts: unknown) {
  if (!ts) return ''
  const num = Number(ts)
  if (isNaN(num)) return String(ts)
  return new Date(num).toLocaleString()
}

// 监听 tab 切换到原始JSON时自动同步
watch(activeTab, (val) => {
  if (val === 'raw') {
    syncFormToRaw()
  }
})

onMounted(() => {
  fetchConfig()
})
</script>

<style scoped>
.config-page {
  height: 100%;
}

.config-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
  gap: 12px;
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

.config-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.config-loading {
  padding: 24px;
}

.config-tabs {
  border: none;
  box-shadow: none;
}

.config-tabs :deep(.el-tabs__content) {
  padding: 20px 24px;
  min-height: 400px;
}

.config-form {
  max-width: 700px;
}

.config-form .el-form-item {
  margin-bottom: 16px;
}

.form-hint {
  margin-left: 8px;
  font-size: 12px;
  color: var(--text-muted);
}

.one-shot-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.site-tabs {
  margin-top: -8px;
}

.site-tabs :deep(.el-tabs__content) {
  padding: 16px 0;
}

/* Raw JSON section */
.raw-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.raw-toolbar {
  display: flex;
  align-items: center;
  gap: 16px;
}

.raw-editor :deep(textarea) {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 13px;
  line-height: 1.6;
}

.raw-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .config-header {
    padding: 12px 16px;
  }

  .config-title {
    font-size: 16px;
  }

  .config-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .config-tabs :deep(.el-tabs__content) {
    padding: 14px 12px;
  }

  .config-form {
    max-width: 100%;
  }

  .config-form :deep(.el-form-item__label) {
    width: auto !important;
    display: block;
    padding-bottom: 4px;
  }

  .config-form :deep(.el-form-item__content) {
    margin-left: 0 !important;
  }

  .form-hint {
    margin-left: 0;
    margin-top: 4px;
    display: block;
  }

  .site-tabs :deep(.el-tabs__content) {
    padding: 12px 0;
  }

  .raw-toolbar {
    flex-wrap: wrap;
    gap: 8px;
  }

  .raw-actions {
    flex-wrap: wrap;
  }
}
</style>
