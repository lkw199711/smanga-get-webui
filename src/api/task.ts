import smangaAxios from '@/api'
import type { subscribeType } from '@/type'

const taskApi = {
    async get() {
        const http = await smangaAxios.get('task')
        return http.data
    },
    async add() {
        const http = await smangaAxios.post('task')
        return http.data
    },
    async delete(data: subscribeType) {
        return await smangaAxios.delete(`task`, { data: data })
    },
}

export default taskApi;
