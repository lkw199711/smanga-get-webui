import smangaAxios from '@/api'


export default {
    async get() {
        const http = await smangaAxios.get('log')

        return http.data
    },
    async clear() {
        return await smangaAxios.delete('log')
    }
}


