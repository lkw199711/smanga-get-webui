export type subscribeType = {
    website: string
    id: number | string
    taskId?: string
    name: string
    chapterCount: number
    url?: string
    moveEndSubscribe?: boolean
}

export type taskProgressType = {
    percent: number
    stage: string
    message: string
    current?: number
    total?: number
    subCurrent?: number
    subTotal?: number
    updatedAt: string
}

export type runningTaskType = {
    status: 'running' | 'success' | 'failed' | 'paused'
    task: subscribeType
    progress: taskProgressType
    startedAt: string
    updatedAt: string
    error?: string
}

export type runningTasksType = {
    bilibili: runningTaskType | null
    toomics: runningTaskType | null
    omegascans: runningTaskType | null
    manga: runningTaskType | null
}
