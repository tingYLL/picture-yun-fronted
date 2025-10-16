// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** redeemVIP POST /api/vip/redeem */
export async function redeemVipUsingPost(
  body: API.RedeemCodeRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseString_>('/api/vip/redeem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** checkVIPStatus GET /api/vip/status */
export async function checkVipStatusUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.checkVIPStatusUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/vip/status', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  })
}
