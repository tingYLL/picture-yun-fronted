// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** downloadFile POST /api/download */
export async function downloadFileUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.downloadFileUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/download', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** getDownloadHistory POST /api/download/history */
export async function getDownloadHistoryUsingPost(
  body: API.DownloadRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageDownloadHistoryVO_>('/api/download/history', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getRemainingDownloads GET /api/download/remaining */
export async function getRemainingDownloadsUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseInt_>('/api/download/remaining', {
    method: 'GET',
    ...(options || {}),
  })
}
