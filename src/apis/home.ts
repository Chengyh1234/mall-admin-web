import type { HomeStatisticResult, OrderTrendResult, OrderTrendQueryParam } from '@/types/home'
import http from '@/utils/http'

/**
 * 获取首页统计数据：订单信息、待处理事务、商品总览、用户总览、订单统计
 */
export function getHomeStatisticAPI() {
  return http<HomeStatisticResult>({
    url: '/home/statistic/index',
    method: 'get',
  })
}

/**
 * 获取指定日期区间内的订单趋势（按天分组）
 */
export function getOrderTrendAPI(params: OrderTrendQueryParam) {
  return http<OrderTrendResult[]>({
    url: '/home/statistic/orderTrend',
    method: 'get',
    params: params,
  })
}
