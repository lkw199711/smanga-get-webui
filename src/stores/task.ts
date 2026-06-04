import { defineStore } from 'pinia'
import taskApi from '@/api/task'
import type { runningTasksType, subscribeType } from '@/type/index'

const useTaskstore = defineStore('task', {
    state: () => ({
        bilibili: [] as subscribeType[],
        toomics: [] as subscribeType[],
        omegascans: [] as subscribeType[],
        manga: [] as subscribeType[],
        running: {
            bilibili: null,
            toomics: null,
            omegascans: null,
            manga: null,
        } as runningTasksType,
    }),
    actions: {
        async get() {
            const tasks = await taskApi.get();
            this.bilibili = tasks.bilibili ?? [];
            this.toomics = tasks.toomics ?? [];
            this.omegascans = tasks.omegascans ?? [];
            this.manga = tasks.manga ?? [];
            this.running = tasks.running ?? {
                bilibili: null,
                toomics: null,
                omegascans: null,
                manga: null,
            };
        },
        async delete(task: subscribeType) {
            await taskApi.delete(task);
            this.get();
        }
    }
})

export default useTaskstore
