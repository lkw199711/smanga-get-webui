import { defineStore } from 'pinia'
import useTaskStore from './task'
import useLogStore from './log'

const REFRESH_INTERVAL = 5000

const useAutoRefreshStore = defineStore('autoRefresh', {
  state: () => ({
    taskEnabled: false,
    logEnabled: false,
    taskTimer: null as ReturnType<typeof setInterval> | null,
    logTimer: null as ReturnType<typeof setInterval> | null,
  }),
  actions: {
    setTaskAutoRefresh(enabled: boolean) {
      this.taskEnabled = enabled
      if (enabled) {
        this.startTaskTimer()
      } else {
        this.stopTaskTimer()
      }
    },
    setLogAutoRefresh(enabled: boolean) {
      this.logEnabled = enabled
      if (enabled) {
        this.startLogTimer()
      } else {
        this.stopLogTimer()
      }
    },
    startTaskTimer() {
      this.stopTaskTimer()
      const taskStore = useTaskStore()
      taskStore.get()
      this.taskTimer = setInterval(() => {
        taskStore.get()
      }, REFRESH_INTERVAL)
    },
    stopTaskTimer() {
      if (this.taskTimer) {
        clearInterval(this.taskTimer)
        this.taskTimer = null
      }
    },
    startLogTimer() {
      this.stopLogTimer()
      const logStore = useLogStore()
      logStore.fetch()
      this.logTimer = setInterval(() => {
        logStore.fetch()
      }, REFRESH_INTERVAL)
    },
    stopLogTimer() {
      if (this.logTimer) {
        clearInterval(this.logTimer)
        this.logTimer = null
      }
    },
  },
})

export default useAutoRefreshStore
