import smangaAxios from '@/api'
import type { subscribeType } from '@/type'

type SubscribePayload = {
    mangaUrl?: string
    id: number | null
    name: string
    website: string
    moveEndSubscribe?: boolean
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
    }
}
