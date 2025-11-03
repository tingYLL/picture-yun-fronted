// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** clearReadNotifications POST /api/comment/notification/clear */
export async function clearReadNotificationsUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/comment/notification/clear', {
    method: 'POST',
    ...(options || {}),
  })
}

/** deleteNotification POST /api/comment/notification/delete */
export async function deleteNotificationUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comment/notification/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** batchDeleteNotifications POST /api/comment/notification/delete/batch */
export async function batchDeleteNotificationsUsingPost(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comment/notification/delete/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getUserNotifications GET /api/comment/notification/list */
export async function getUserNotificationsUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getUserNotificationsUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentNotificationVO_>('/api/comment/notification/list', {
    method: 'GET',
    params: {
      // current has a default value: 1
      current: '1',

      // pageSize has a default value: 10
      pageSize: '10',
      ...params,
    },
    ...(options || {}),
  })
}

/** markAsRead POST /api/comment/notification/read */
export async function markAsReadUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.markAsReadUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/comment/notification/read', {
    method: 'POST',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}

/** markAllAsRead POST /api/comment/notification/read/all */
export async function markAllAsReadUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/comment/notification/read/all', {
    method: 'POST',
    ...(options || {}),
  })
}

/** batchMarkAsRead POST /api/comment/notification/read/batch */
export async function batchMarkAsReadUsingPost(body: number[], options?: { [key: string]: any }) {
  return request<API.BaseResponseBoolean_>('/api/comment/notification/read/batch', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getUnreadCount GET /api/comment/notification/unread/count */
export async function getUnreadCountUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseLong_>('/api/comment/notification/unread/count', {
    method: 'GET',
    ...(options || {}),
  })
}
