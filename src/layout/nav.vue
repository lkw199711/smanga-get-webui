<template>
    <el-menu :default-active="activeIndex2" class="el-menu-demo" mode="horizontal" background-color="#545c64"
        text-color="#fff" active-text-color="#ffd04b" @select="handleSelect">
        <el-menu-item index="subscribe">订阅</el-menu-item>
        <el-menu-item index="task">任务</el-menu-item>
        <el-menu-item index="log">日志</el-menu-item>
        <el-menu-item index="config">配置</el-menu-item>
    </el-menu>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeIndex = ref('1')
const activeIndex2 = ref('1')
const handleSelect = async (key: string, keyPath: string[]) => {
    await router.push(key)
    // /console.log(key, keyPath)
}
</script>
