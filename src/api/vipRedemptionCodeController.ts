// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** listAll GET /api/api/vip-redemption-codes */
export async function listAllUsingGet(options?: { [key: string]: any }) {
  return request<API.BaseResponseListVIPRedemptionCode_>('/api/api/vip-redemption-codes', {
    method: 'GET',
    ...(options || {}),
  })
}

/** update PUT /api/api/vip-redemption-codes */
export async function updateUsingPut(
  body: API.VIPRedemptionCodeDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/api/vip-redemption-codes', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** create POST /api/api/vip-redemption-codes */
export async function createUsingPost(
  body: API.VIPRedemptionCodeDTO,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/api/vip-redemption-codes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getById GET /api/api/vip-redemption-codes/${param0} */
export async function getByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getByIdUsingGETParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseVIPRedemptionCode_>(`/api/api/vip-redemption-codes/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** delete DELETE /api/api/vip-redemption-codes/${param0} */
export async function deleteUsingDelete(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.deleteUsingDELETEParams,
  options?: { [key: string]: any }
) {
  const { id: param0, ...queryParams } = params
  return request<API.BaseResponseBoolean_>(`/api/api/vip-redemption-codes/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  })
}

/** generateCode POST /api/api/vip-redemption-codes/generate */
export async function generateCodeUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.generateCodeUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseMapStringObject_>('/api/api/vip-redemption-codes/generate', {
    method: 'POST',
    params: {
      // count has a default value: 1
      count: '1',
      // type has a default value: MONTHLY
      type: 'MONTHLY',
      ...params,
    },
    ...(options || {}),
  })
}

/** validateCode GET /api/api/vip-redemption-codes/validate/${param0} */
export async function validateCodeUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.validateCodeUsingGETParams,
  options?: { [key: string]: any }
) {
  const { code: param0, ...queryParams } = params
  return request<API.BaseResponseMapStringObject_>(
    `/api/api/vip-redemption-codes/validate/${param0}`,
    {
      method: 'GET',
      params: { ...queryParams },
      ...(options || {}),
    }
  )
}
