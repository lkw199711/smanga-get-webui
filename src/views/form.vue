<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="漫画链接">
            <el-input v-model="mangaUrl" />
        </el-form-item>
        <el-form-item label="漫画平台">
            <el-select v-model="form.website" placeholder="请选择漫画网站">
                <el-option label="玩漫(toomics)" value="toomics" />
                <el-option label="哔哩哔哩(bilibili)" value="bilibili" />
            </el-select>
        </el-form-item>

        <el-form-item label="漫画标识">
            <el-input type="number" v-model="form.id" />
        </el-form-item>

        <el-form-item label="漫画名称">
            <el-input v-model="form.name" />
        </el-form-item>

        <el-form-item>
            <el-button type="primary" @click="analysis">分析链接</el-button>
            <el-button type="primary" @click="subscribe">订阅漫画</el-button>
            <el-button type="success" @click="task">添加任务</el-button>
        </el-form-item>
    </el-form>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import smangaAxios from '@/api'
import { ElMessage } from 'element-plus'
import useSubscribeStore from '@/stores/subscribe'
import useTaskstore from '@/stores/task'

const subscribeStore = useSubscribeStore()
const taskStore = useTaskstore()
// do not use same name with ref

let mangaUrl = ref('');
const form = reactive({
    id: null as number | null,
    name: '',
    website: '',
})

function analysis() {
    if (!mangaUrl) {
        console.log('mangaUrl is empty')
        return
    }

    //https://toomics.com/sc/webtoon/episode/toon/4866

    if (/toomics/.test(mangaUrl.value)) {
        form.website = 'toomics'
    } else if (/bilibili/.test(mangaUrl.value)) {
        form.website = 'bilibili'
    } else {
        ElMessage({
            message: '不支持的漫画网站',
            type: 'error',
        })
        return
    }
    const endStr = mangaUrl.value.split('/').pop()
    const idStr = endStr?.match(/\d+/g)?.[0]
    form.id = Number(idStr)
    form.name = idStr || '';
}

async function task() {
    if (!form.id || !form.name || !form.website) {
        console.log('id or name or website is empty');
        return
    }
    await smangaAxios.post('task', form)

    ElMessage({
        message: '任务添加成功',
        type: 'success',
    })

    taskStore.get()
}

async function subscribe() {
    if (!form.id || !form.name) {
        console.log('id or name is empty')
        return
    }
    await smangaAxios.post('subscribe', form)

    ElMessage({
        message: '订阅添加成功',
        type: 'success',
    })

    subscribeStore.get()
}
</script>
