<template>
    <div>
        <mForm />

        <el-empty v-if="isEmpty" description="暂无任务" />

        <div v-else>
            <div v-if="taskStore.manga.length" class="task-section">
                <h3>主任务队列</h3>
                <div v-for="item in taskStore.manga" class="task" :key="'manga-' + item.id">
                    <span class="task-name">[{{ item.website }}] {{ item.name }}</span>
                    <p class="task-bottom">
                        <el-tag v-if="item.chapterCount">总数: {{ item.chapterCount }}</el-tag>
                        <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
                    </p>
                </div>
            </div>

            <div v-if="taskStore.bilibili.length" class="task-section">
                <h3>Bilibili 任务</h3>
                <div v-for="item in taskStore.bilibili" class="task" :key="'bilibili-' + item.id">
                    <span class="task-name">[{{ item.website }}] {{ item.name }}</span>
                    <p class="task-bottom">
                        <el-tag v-if="item.chapterCount">总数: {{ item.chapterCount }}</el-tag>
                        <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
                    </p>
                </div>
            </div>

            <div v-if="taskStore.toomics.length" class="task-section">
                <h3>Toomics 任务</h3>
                <div v-for="item in taskStore.toomics" class="task" :key="'toomics-' + item.id">
                    <span class="task-name">[{{ item.website }}] {{ item.name }}</span>
                    <p class="task-bottom">
                        <el-tag v-if="item.chapterCount">总数: {{ item.chapterCount }}</el-tag>
                        <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
                    </p>
                </div>
            </div>

            <div v-if="taskStore.omegascans.length" class="task-section">
                <h3>OmegaScans 任务</h3>
                <div v-for="item in taskStore.omegascans" class="task" :key="'omegascans-' + item.id">
                    <span class="task-name">[{{ item.website }}] {{ item.name }}</span>
                    <p class="task-bottom">
                        <el-tag v-if="item.chapterCount">总数: {{ item.chapterCount }}</el-tag>
                        <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import mForm from './form.vue'
import { computed, onMounted } from 'vue'
import useTaskStore from '@/stores/task'
import type { subscribeType } from '@/type/index'

const taskStore = useTaskStore()

const isEmpty = computed(() =>
    taskStore.bilibili.length === 0 &&
    taskStore.toomics.length === 0 &&
    taskStore.omegascans.length === 0 &&
    taskStore.manga.length === 0
)

onMounted(() => {
    taskStore.get()
})

function task_delete(item: subscribeType) {
    taskStore.delete(item)
}

</script>

<style>
.task-section {
    margin: 16px 0;
}

.task-section h3 {
    margin-bottom: 8px;
    color: #333;
}

.task {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    width: 280px;
}

.task-name {
    font-size: 14px;
    word-break: break-all;
}

.task-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 8px;
}
</style>