import smangaAxios from './index'
import type { AppConfig } from '@/type/config'

type ConfigGetResponse = {
  code?: number
  data: AppConfig
  meta?: {
    configPath?: string
  }
}

export default {
  /**
   * 获取完整配置
   */
  async get(): Promise<ConfigGetResponse> {
    const res = await smangaAxios.get<ConfigGetResponse>('/config')
    return res.data
  },

  /**
   * 完整替换配置
   */
  async update(config: AppConfig) {
    return await smangaAxios.put('/config', config)
  },

  /**
   * 局部更新配置（深合并）
   */
  async patch(partial: Partial<AppConfig>) {
    return await smangaAxios.patch('/config', partial)
  },
}
