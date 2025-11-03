// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** connect GET /api/comment/sse/connect */
export async function connectUsingGet(options?: { [key: string]: any }) {
  return request<API.SseEmitter>('/api/comment/sse/connect', {
    method: 'GET',
    ...(options || {}),
  })
}

/** disconnect POST /api/comment/sse/disconnect */
export async function disconnectUsingPost(options?: { [key: string]: any }) {
  return request<boolean>('/api/comment/sse/disconnect', {
    method: 'POST',
    ...(options || {}),
  })
}

/** getOnlineCount GET /api/comment/sse/online/count */
export async function getOnlineCountUsingGet(options?: { [key: string]: any }) {
  return request<number>('/api/comment/sse/online/count', {
    method: 'GET',
    ...(options || {}),
  })
}
