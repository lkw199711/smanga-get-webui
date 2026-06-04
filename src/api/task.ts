import smangaAxios from '@/api'
import type { subscribeType } from '@/type'

type TaskPayload = subscribeType & {
    mangaUrl?: string
}

export type TaskTriggerType = 'toomics' | 'toptoon' | 'omegascans' | 'gentleman'

function assertApiSuccess(data: unknown) {
    if (data && typeof data === 'object' && 'code' in data && Number(data.code) >= 400) {
        const response = data as Record<string, unknown>
        throw new Error(typeof response.message === 'string' ? response.message : 'Request failed')
    }
}

const taskApi = {
    async get() {
        const http = await smangaAxios.get('task')
        return http.data
    },
    async add(task: TaskPayload) {
        const http = await smangaAxios.post('task', task)
        assertApiSuccess(http.data)
        return http.data
    },
    async delete(data: subscribeType) {
        return await smangaAxios.delete(`task`, { data: data })
    },
    async clear() {
        const http = await smangaAxios.delete('task/clear')
        assertApiSuccess(http.data)
        return http.data
    },
    async reorder(queue: string, tasks: subscribeType[]) {
        const http = await smangaAxios.put('task/reorder', { queue, tasks })
        assertApiSuccess(http.data)
        return http
    },
    async trigger(type: TaskTriggerType) {
        const http = await smangaAxios.post('task/trigger', { type })
        assertApiSuccess(http.data)
        return http.data
    },
}

export default taskApi;
