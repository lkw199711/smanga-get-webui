<template>
    <el-form :model="form" label-width="auto" style="max-width: 600px">
        <el-form-item label="漫画链接">
            <el-input v-model="form.mangaUrl" />
        </el-form-item>
        <el-form-item label="漫画平台">
            <el-select v-model="form.website" placeholder="请选择漫画网站">
                <el-option label="玩漫(toomics)" value="toomics" />
                <el-option label="哔哩哔哩(bilibili)" value="bilibili" />
                <el-option label="绅士漫画(gentleman)" value="gentleman" />
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
import _ from 'lodash'

const subscribeStore = useSubscribeStore()
const taskStore = useTaskstore()
// do not use same name with ref
const form = reactive({
    mangaUrl: '',
    id: null as number | null,
    name: '',
    website: '',
})

function analysis() {
    if (!form.mangaUrl) {
        console.log('mangaUrl is empty')
        return
    }

    //https://toomics.com/sc/webtoon/episode/toon/4866

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
        // 截取参数q
        const idStr = form.mangaUrl.split('q=')[1].split('&')[0]
        // 编码回原始字符
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
    
}

async function task() {
    if (!form.id || !form.name || !form.website) {
        console.log('id or name or website is empty');
        return
    }
    await smangaAxios.post('task', form)

    taskStore.get()
}

async function subscribe() {
    if (!form.id || !form.name) {
        console.log('id or name is empty')
        return
    }
    await smangaAxios.post('subscribe', form)

    subscribeStore.get()
}
</script>
