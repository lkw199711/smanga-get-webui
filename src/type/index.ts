export type subscribeType = {
    website: string
    id: number
    name: string
    chapterCount: number
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
    status: 'running' | 'success' | 'failed'
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
