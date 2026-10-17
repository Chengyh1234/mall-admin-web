import type { CommonPage } from '@/types/common'
import type { MessageQueryParam, UmsMessage, UmsMessageParam } from '@/types/message'
import http from '@/utils/http'

/**
 * 发布消息（定向/广播）
 */
export function messageCreateAPI(data: UmsMessageParam) {
  return http({
    url: '/message/create',
    method: 'post',
    data: data,
  })
}

/**
 * 分页查询已发布消息列表
 */
export function getMessageListAPI(params: MessageQueryParam) {
  return http<CommonPage<UmsMessage>>({
    url: '/message/list',
    method: 'get',
    params: params,
  })
}