import smangaAxios from '@/api'
import type { subscribeType } from '@/type'

type SubscribePayload = {
    mangaUrl?: string
    id: number | null
    name: string
    website: string
    moveEndSubscribe?: boolean
}

function assertApiSuccess(data: unknown) {
    if (data && typeof data === 'object' && 'code' in data && Number(data.code) >= 400) {
        const response = data as Record<string, unknown>
        throw new Error(typeof response.message === 'string' ? response.message : 'Request failed')
    }
}

export default {
    async get() {
        const http = await smangaAxios.get('subscribe')
        return http.data
    },
    async add(subscribe: SubscribePayload) {
        return await smangaAxios.post('subscribe', subscribe)
    },
    async delete(data: subscribeType) {
        return await smangaAxios.delete(`subscribe`, { data: data })
    },
    async reorder(subscribes: subscribeType[]) {
        const http = await smangaAxios.put('subscribe/reorder', { subscribes })
        assertApiSuccess(http.data)
        return http
    }
}
