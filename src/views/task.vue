<template>
    <div>
        <mForm />
        <div class="bilibili-list">
            <div v-for="(item, index) in taskStore.bilibili" :key="item.id">
                [{{ item.website }}] {{ item.name }}
                <p class="task-bottom">
                    <el-tag>总数: {{ item.chapterCount }}</el-tag>
                    <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
                </p>
                <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
            </div>
        </div>

        <div class="toomics-list">
            <div v-for="(item, index) in taskStore.toomics" class="task" :key="item.id">
                [{{ item.website }}] {{ item.name }}
                <p class="task-bottom">
                    <el-tag>总数: {{ item.chapterCount }}</el-tag>
                    <el-button type="danger" size="small" @click="task_delete(item)">删除</el-button>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import mForm from './form.vue'
import { onMounted } from 'vue'
import useTaskStore from '@/stores/task'
import type { subscribeType } from '@/type/index'

const taskStore = useTaskStore()

onMounted(() => {
    taskStore.get()
})

function task_delete(item: subscribeType) {
    taskStore.delete(item)
}

</script>

<style>
.task {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    width: 200px;
}

.task-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>