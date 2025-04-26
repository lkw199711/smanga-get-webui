import { defineStore } from 'pinia'
import taskApi from '@/api/task'
import type { subscribeType } from '@/type/index'

const useTaskstore = defineStore('counter', {
    state: () => ({
        bilibili: [] as subscribeType[],
        toomics: [] as subscribeType[],
    }),
    actions: {
        async get() {
            const tasks = await taskApi.get();
            this.bilibili = tasks.bilibili;
            this.toomics = tasks.toomics;
        },
        async delete(task: subscribeType) {
            await taskApi.delete(task);
            this.get();
        }
    }
})

export default useTaskstore
