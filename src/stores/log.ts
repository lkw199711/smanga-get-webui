import { defineStore } from 'pinia'
import logApi from '@/api/log'

const useLogStore = defineStore('log', {
  state: () => ({
    logs: [] as string[],
    isRefreshing: false,
  }),
  actions: {
    async fetch() {
      if (this.isRefreshing) return
      this.isRefreshing = true
      try {
        this.logs = await logApi.get()
      } finally {
        this.isRefreshing = false
      }
    },
    async clear() {
      await logApi.clear()
      this.logs = []
    },
  },
})

export default useLogStore
