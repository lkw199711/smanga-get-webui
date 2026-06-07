import smangaAxios from '@/api'

export type MangaChapterSummary = {
  name: string
  title?: string
  date?: string
  url?: string
  cover?: string
  isFree?: boolean
  price?: number
  imageCount?: number
}

export type MangaResult = {
  indexId: number
  key: string
  id?: number | string
  name: string
  website: string
  source: string
  sourcePath: string
  metaPath: string
  coverToken?: string
  remoteCover?: string
  crawledAt: string
  updatedAt?: string
  finished: boolean
  status?: string
  chapterCount: number
  latestChapterName?: string
  latestChapterDate?: string
  author?: string
  description?: string
  tags: string[]
  chapters: MangaChapterSummary[]
}

type MangaListResponse = {
  code: number
  data: MangaResult[]
  meta?: {
    total?: number
    page?: number
    pageSize?: number
    hasMore?: boolean
  }
}

type MangaChapterResponse = {
  code: number
  data: MangaChapterSummary[]
}

export type MangaListParams = {
  page?: number
  pageSize?: number
  keyword?: string
  website?: string
  status?: 'all' | 'serial' | 'finished'
}

const apiAssetBase = import.meta.env.DEV
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:9800'

export function getMangaCoverUrl(manga: Pick<MangaResult, 'coverToken' | 'remoteCover'>) {
  if (manga.coverToken) {
    return `${apiAssetBase}/manga/cover?file=${encodeURIComponent(manga.coverToken)}`
  }

  return manga.remoteCover || ''
}

export default {
  async get(params: MangaListParams = {}) {
    const http = await smangaAxios.get<MangaListResponse>('manga', { params })
    return {
      data: http.data.data ?? [],
      meta: http.data.meta ?? {},
    }
  },
  async chapters(indexId: number) {
    const http = await smangaAxios.get<MangaChapterResponse>(`manga/${indexId}/chapters`)
    return http.data.data ?? []
  },
}
