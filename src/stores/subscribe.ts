import { defineStore } from 'pinia'
import subscribeApi from '@/api/subscribe'
import type { subscribeType } from '@/type/index'

const useSubscribestore = defineStore('counter', {
    state: () => ({
        subscribes: [] as subscribeType[],
    }),
    actions: {
        async get() {
            this.subscribes = await subscribeApi.get()
        },
        async delete(subscribe: subscribeType) {
            await subscribeApi.delete(subscribe)
            this.subscribes = this.subscribes.filter((item) => item.id !== subscribe.id)
        }
    }
})

export default useSubscribestore
