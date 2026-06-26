import smangaAxios from '@/api'


export default {
    /**
     * 获取日志（默认当天，可指定日期）
     * @param date 可选日期，格式 YYYY-MM-DD，不传则获取当天
     */
    async get(date?: string) {
        const params = date ? { date } : {}
        const http = await smangaAxios.get('log', { params })
        return http.data
    },
    async clear() {
        return await smangaAxios.delete('log')
    },
    /**
     * 获取所有可用的日志日期列表
     */
    async getDates(): Promise<string[]> {
        const http = await smangaAxios.get('log/dates')
        return http.data
    }
}


