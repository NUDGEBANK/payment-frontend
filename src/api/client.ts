import type { ApiErrorResponse } from '../types/payment'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export class ApiError extends Error {
  code: string
  status: number
  timestamp?: string
  fieldErrors: ApiErrorResponse['fieldErrors']

  constructor(payload: ApiErrorResponse) {
    super(payload.message || payload.code)
    this.name = 'ApiError'
    this.code = payload.code
    this.status = payload.status
    this.timestamp = payload.timestamp
    this.fieldErrors = payload.fieldErrors
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    if (response.status === 204) {
      return undefined as T
    }

    return response.json() as Promise<T>
  }

  let payload: ApiErrorResponse
  try {
    payload = await response.json() as ApiErrorResponse
  } catch {
    payload = {
      code: 'HTTP_ERROR',
      message: response.statusText || 'Request failed.',
      status: response.status,
      timestamp: new Date().toISOString(),
    }
  }

  throw new ApiError(payload)
}

export async function apiRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    })
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Network request failed.'
    throw new Error(`API 요청 실패: ${message}`)
  }

  return parseResponse<T>(response)
}
