<template>
    <div>
        <mForm />
        <div>订阅总数： {{ subscribeStore.subscribes.length }}</div>
        <div class="subscribe-list">
            <div v-for="(item, index) in subscribeStore.subscribes" class="subscribe" :key="item.id">
                [{{ item.website }}] {{ item.name }}
                <p class="subscribe-bottom">
                    <el-tag>总数: {{ item.chapterCount }}</el-tag>
                    <el-button type="danger" size="small" @click="sub_delete(item)">删除</el-button>
                </p>
            </div>
        </div>
    </div>

</template>

<script lang="ts" setup>
import mForm from './form.vue'
import { onMounted, ref } from 'vue'
import useSubscribeStore from '@/stores/subscribe'
import type { subscribeType } from '@/type'
const subscribeStore = useSubscribeStore()

onMounted(() => {
    subscribeStore.get();
})

function sub_delete(item: subscribeType) {
    subscribeStore.delete(item)
}

</script>

<style>
.subscribe {
    margin: 10px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #f9f9f9;
    width: 200px;
}

.subscribe-bottom {
    display: flex;
    justify-content: space-between;
    align-items: center;
}
</style>