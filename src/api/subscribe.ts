import smangaAxios from '@/api'

export default {
    async get() {
        const http = await smangaAxios.get('subscribe')
        return http.data
    },
    async add(subscribe: any) {
        return await smangaAxios.post('subscribe', subscribe)
    },
    async delete(data: any) {
        return await smangaAxios.delete(`subscribe`, { data: data })
    }
}