<template>
  <div class="form-card">
    <div class="form-card-header">
      <h3 class="form-title">添加漫画</h3>
      <p class="form-desc">输入漫画链接自动解析，或手动填写信息后订阅</p>
    </div>
    <el-form :model="form" label-width="100px" class="subscribe-form">
      <el-form-item label="漫画链接">
        <el-input
          v-model="form.mangaUrl"
          placeholder="粘贴漫画链接，将自动解析信息"
          clearable
        />
      </el-form-item>

      <el-row :gutter="16">
        <el-col :xs="24" :sm="8">
          <el-form-item label="漫画平台">
            <el-select v-model="form.website" placeholder="选择平台" style="width: 100%">
              <el-option label="玩漫 (Toomics)" value="toomics" />
              <el-option label="哔哩哔哩 (Bilibili)" value="bilibili" />
              <el-option label="绅士漫画" value="gentleman" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="漫画ID">
            <el-input v-model="form.id" placeholder="自动解析" />
          </el-form-item>
        </el-col>
        <el-col :xs="24" :sm="8">
          <el-form-item label="漫画名称">
            <el-input v-model="form.name" placeholder="自动解析" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" @click="analysis">
          <el-icon><Search /></el-icon>
          分析链接
        </el-button>
        <el-button type="success" @click="subscribe">
          <el-icon><Plus /></el-icon>
          订阅漫画
        </el-button>
        <el-button type="warning" @click="task">
          <el-icon><VideoPlay /></el-icon>
          添加任务
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { Search, Plus, VideoPlay } from '@element-plus/icons-vue'
import smangaAxios from '@/api'
import { ElMessage } from 'element-plus'
import useSubscribeStore from '@/stores/subscribe'
import useTaskstore from '@/stores/task'
import _ from 'lodash'

const subscribeStore = useSubscribeStore()
const taskStore = useTaskstore()
// do not use same name with ref
const form = reactive({
    mangaUrl: '',
    id: null as number | null,
    name: '',
    website: '',
    moveEndSubscribe: false,
})

function analysis() {
    if (!form.mangaUrl) {
        ElMessage.warning('请先输入漫画链接')
        return
    }

    if (/toomics/.test(form.mangaUrl)) {
        form.website = 'toomics'
        const endStr = form.mangaUrl.split('/').pop()
        const idStr = endStr?.match(/\d+/g)?.[0]
        form.id = Number(idStr)
        form.name = idStr || '';
    } else if (/bilibili/.test(form.mangaUrl)) {
        form.website = 'bilibili'
        const endStr = form.mangaUrl.split('/').pop()
        const idStr = endStr?.match(/\d+/g)?.[0]
        form.id = Number(idStr)
        form.name = idStr || '';
    } else if (/wnacg.ru/.test(form.mangaUrl)) {
        form.website = 'gentleman'
        form.id = 1
        const idStr = form.mangaUrl.split('q=')[1].split('&')[0]
        const name = decodeURIComponent(idStr)
        form.name = name || '';
        form.moveEndSubscribe = true
    } else {
        ElMessage({
            message: '不支持的漫画网站',
            type: 'error',
        })
        return
    }

    ElMessage.success('链接解析成功')
}

async function task() {
    if (!form.id || !form.name || !form.website) {
        ElMessage.warning('请填写完整的漫画信息')
        return
    }
    await smangaAxios.post('task', form)
    ElMessage.success('任务添加成功')
    taskStore.get()
}

async function subscribe() {
    if (!form.id || !form.name) {
        ElMessage.warning('请先解析漫画链接或手动填写信息')
        return
    }
    await smangaAxios.post('subscribe', form)
    ElMessage.success('订阅成功')
    subscribeStore.get()
}
</script>

<style scoped>
.form-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  margin-bottom: 24px;
}

.form-card-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.form-desc {
  font-size: 13px;
  color: var(--text-muted);
}

.subscribe-form {
  max-width: 100%;
}

.subscribe-form .el-form-item {
  margin-bottom: 18px;
}

.subscribe-form .el-button {
  border-radius: var(--radius-sm);
  font-weight: 500;
}

.subscribe-form .el-input,
.subscribe-form .el-select {
  --el-input-border-radius: var(--radius-sm);
}

@media (max-width: 768px) {
  .form-card {
    padding: 16px;
    margin-bottom: 12px;
  }

  .form-card-header {
    margin-bottom: 14px;
    padding-bottom: 12px;
  }

  .subscribe-form .el-form-item {
    margin-bottom: 14px;
  }
}
</style>
