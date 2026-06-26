import { defineStore } from 'pinia'
import logApi from '@/api/log'

const useLogStore = defineStore('log', {
  state: () => ({
    logs: [] as string[],
    isRefreshing: false,
    /** 可选日志日期列表 */
    dates: [] as string[],
    /** 当前选中的日期，空字符串表示"今天" */
    selectedDate: '',
  }),
  actions: {
    async fetch(date?: string) {
      if (this.isRefreshing) return
      this.isRefreshing = true
      try {
        this.logs = await logApi.get(date || undefined)
      } finally {
        this.isRefreshing = false
      }
    },
    async fetchDates() {
      try {
        this.dates = await logApi.getDates()
      } catch {
        this.dates = []
      }
    },
    selectDate(date: string) {
      this.selectedDate = date
      this.fetch(date)
    },
    async clear() {
      await logApi.clear()
      this.logs = []
    },
  },
})

export default useLogStore
