<template>
  <div class="subscribe-page">
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

      <div v-else class="subscribe-grid">
        <div
          v-for="item in subscribeStore.subscribes"
          :key="item.id"
          class="subscribe-card"
        >
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
import { onMounted } from 'vue'
import { Collection, Delete } from '@element-plus/icons-vue'
import useSubscribeStore from '@/stores/subscribe'
import type { subscribeType } from '@/type'

const subscribeStore = useSubscribeStore()

onMounted(() => {
  subscribeStore.get()
})

function sub_delete(item: subscribeType) {
  subscribeStore.delete(item)
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
}

.subscribe-card:hover {
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
  border-top: 1px solid var(--border-light);
}
</style>