// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addCategory POST /api/category/add */
export async function addCategoryUsingPost(
  body: API.CategoryAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/category/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteCategory POST /api/category/delete */
export async function deleteCategoryUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/category/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getCategoryListAsHome GET /api/category/home/list */
export async function getCategoryListAsHomeUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListCategoryVO_>('/api/category/home/list', {
    method: 'GET',
    ...(options || {}),
  })
}

/** getCategoryListAsManage POST /api/category/manage/list */
export async function getCategoryListAsManageUsingPost(
  body: API.CategoryQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCategoryVO_>('/api/category/manage/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** updateCategory POST /api/category/update */
export async function updateCategoryUsingPost(
  body: API.CategoryUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/category/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}
