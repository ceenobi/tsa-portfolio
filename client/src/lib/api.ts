import type { ApiSuccessResponse } from '@tsa/shared';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

export const axiosClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

async function request<TBody = undefined>(
  method: string,
  path: string,
  body?: unknown
): Promise<ApiSuccessResponse<TBody>> {
  try {
    const response = await axiosClient.request({
      method,
      url: path,
      data: body,
    })
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const { message } = error.response.data ?? {}
      throw new Error(message || 'Request failed', { cause: error })
    }
    throw new Error('Network error', { cause: error })
  }
}

export const api = {
  get: <TBody = undefined>(path: string) => request<TBody>('GET', path),
  post: <TBody = undefined>(path: string, body: unknown) => request<TBody>('POST', path, body),
  patch: <TBody = undefined>(path: string, body: unknown) => request<TBody>('PATCH', path, body),
  delete: <TBody = undefined>(path: string) => request<TBody>('DELETE', path),
}
