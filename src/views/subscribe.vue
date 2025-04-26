<template>
    <div>
        <mForm />
        <div class="subscribe-list">
            <div v-for="(item, index) in subscribeStore.subscribes" :key="item.id">
                [{{ item.website }}] {{ item.name }}
                <el-button type="danger" size="small" @click="sub_delete(item)">删除</el-button>
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