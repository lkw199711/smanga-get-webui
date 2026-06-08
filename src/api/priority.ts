import smangaAxios from '@/api'

export interface PriorityMangaItem {
  id: number
  key: string
  name: string
  website: string
  chapterCount: number
  indexedCount: number
  finished: boolean
  coverToken?: string
  remoteCover?: string
  priority: 'high' | 'medium' | 'low'
}

export interface PriorityData {
  highPriorityIds: number[]
  autoUpgradeThreshold: number
  highList: PriorityMangaItem[]
  mediumList: PriorityMangaItem[]
  lowList: PriorityMangaItem[]
}

type PriorityUpdateResponse = {
  code: number
  message: string
  data: {
    highPriorityIds: number[]
  }
}

export function getMangaCoverUrl(manga: Pick<PriorityMangaItem, 'coverToken' | 'remoteCover'>) {
  if (manga.coverToken) {
    const apiAssetBase = import.meta.env.DEV
      ? '/api'
      : import.meta.env.VITE_API_URL || 'http://localhost:9800'
    return `${apiAssetBase}/manga/cover?file=${encodeURIComponent(manga.coverToken)}`
  }
  return manga.remoteCover || ''
}

export default {
  async get() {
    const http = await smangaAxios.get<{ code: number; data: PriorityData }>('/config/priority')
    return http.data.data
  },
  async update(highPriorityIds: number[]) {
    const http = await smangaAxios.put<PriorityUpdateResponse>('/config/priority', {
      highPriorityIds,
    })
    return http.data
  },
}
