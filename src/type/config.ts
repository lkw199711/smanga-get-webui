/** 定时任务配置 */
export interface CronConfig {
  enable: boolean
  interval: string
  clearCookies?: boolean
}

/** 代理配置 */
export interface ProxyConfig {
  enable: boolean
  server: string
  username?: string
  password?: string
}

/** 启动立即任务配置 */
export interface ImmediatelyConfig {
  subscribeTask: boolean
  toomicsUpdateSc: boolean
  toomicsUpdateTc: boolean
  omegascansUpdate: boolean
  bilibili?: boolean
  toomicsCompressSc: boolean
  toomicsCompressTc: boolean
  omegascansCompress: boolean
  omegascansSyncCloud: boolean
  debugOmegascans?: boolean
}

/** 站点配置基类 */
export interface WebsiteConfig {
  cookieFile: string
  downloadPath: string
  compressPath: string
  [key: string]: any
}

/** 完整应用配置 */
export interface AppConfig {
  headless: boolean
  proxy: ProxyConfig
  cron: CronConfig
  immediately: ImmediatelyConfig
  endAfterSetCookie: boolean
  shutdownAfterSetCookie?: boolean
  autoRemoveSubscribe?: boolean
  watting?: number
  cacheRoot?: string
  downloadPath?: string
  compressPath?: string
  toomics: WebsiteConfig
  'toomics-sc': WebsiteConfig
  'toomics-tc': WebsiteConfig
  bilibili: WebsiteConfig
  omegascans: WebsiteConfig
  gentleman: WebsiteConfig
  [key: string]: any
}
