import Axios from 'axios'
import { ElMessage } from 'element-plus'

type ApiResponse = {
  code?: number
  message?: string
  data?: unknown
  meta?: Record<string, unknown>
  [key: string]: unknown
}

type MessageType = 'success' | 'warning' | 'info' | 'error'

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function parseApiResponse(response: string | unknown | null): unknown {
  if (!response) return { code: 0, message: '', data: null }

  if (typeof response === 'string') {
    if (!response) return { code: 0, message: '', data: null }

    const parsed: unknown = JSON.parse(response)
    return parsed
  }

  return response
}

const axios = Axios.create({
  baseURL: import.meta.env.DEV
    ? '/api'
    : import.meta.env.VITE_API_URL || 'http://localhost:9800',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  transformRequest: [
    (data) => {
      return JSON.stringify(data)
    },
  ],
  transformResponse: [
    function (response: string | unknown | null): unknown {
      const parsedResponse = parseApiResponse(response)

      if (
        isRecord(parsedResponse) &&
        typeof parsedResponse.message === 'string' &&
        parsedResponse.message
      ) {
        let type: MessageType
        switch (parsedResponse.code) {
          case 0:
            type = 'success'
            break
          case 1:
            type = 'error'
            break
          case 2:
            type = 'warning'
            break
          case 200:
            type = 'success'
            break
          case 400:
            type = 'error'
            break
          case 401:
            type = 'error'
            break
          case 403:
            type = 'error'
            break
          case 404:
            type = 'error'
            break
          case 500:
            type = 'error'
            break
          default:
            type = 'info'
            break
        }

        ElMessage({
          message: parsedResponse.message,
          type: type,
        })
      }

      return parsedResponse
    },
  ],
})

export default axios
