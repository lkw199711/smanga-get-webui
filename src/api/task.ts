import smangaAxios from '@/api'

const taskApi = {
    async get() {
        const http = await smangaAxios.get('task')
        return http.data
    },
    async add() {
        const http = await smangaAxios.post('task')
        return http.data
    },
    async delete(data: any) {
        return await smangaAxios.delete(`task`, { data: data })
    },
}

export default taskApi;