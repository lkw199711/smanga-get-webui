<template>
    <el-button @click="refresh" type="success">刷新</el-button>
    <el-button @click="clear" type="danger">清空</el-button>
    <div class="log-list">
        <div v-for="(log, index) in logs" :key="index" class="log-item">
            <p>{{ log }}</p>
        </div>
    </div>
</template>

<script lang="ts" setup>
import logApi from '@/api/log'
import { onMounted, ref } from 'vue'

const logs = ref([])

onMounted(() => {
    refresh()
})

async function refresh() {
    logs.value = await logApi.get()
}

async function clear() {
    await logApi.clear()
    logs.value = []
}

</script>

<style scoped></style>