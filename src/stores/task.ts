import { defineStore } from 'pinia'
import taskApi, { type TaskTriggerType } from '@/api/task'
import type { runningTasksType, subscribeType } from '@/type/index'

export type taskQueueKey = 'bilibili' | 'toomics' | 'omegascans' | 'manga'
type taskPayload = subscribeType & {
    mangaUrl?: string
}

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
        },
        async clear() {
            await taskApi.clear()
            await this.get()
        },
        async add(task: taskPayload) {
            await taskApi.add(task)
            await this.get()
        },
        async trigger(type: TaskTriggerType) {
            await taskApi.trigger(type)
            await this.get()
        },
        async reorder(queue: taskQueueKey, tasks: subscribeType[]) {
            const previous = [...this[queue]]
            this[queue] = [...tasks]

            try {
                await taskApi.reorder(queue, this[queue])
            } catch (error) {
                this[queue] = previous
                throw error
            }
        }
    }
})

export default useTaskstore
