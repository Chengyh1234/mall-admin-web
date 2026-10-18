/** 首页统计信息 */
export type HomeStatisticResult = {
  /** 今日订单总数 */
  todayOrderCount: number
  /** 今日销售总额 */
  todayOrderAmount: number
  /** 昨日销售总额 */
  yesterdayOrderAmount: number
  /** 待付款订单数 */
  unPayCount: number
  /** 已完成订单数 */
  finishCount: number
  /** 待确认收货订单数 */
  unReceiveCount: number
  /** 待发货订单数 */
  unDeliverCount: number
  /** 新缺货登记数 */
  newStockCount: number
  /** 待处理退款申请数 */
  returnApplyPendingCount: number
  /** 已发货订单数 */
  shipCount: number
  /** 待处理退货订单数 */
  returningCount: number
  /** 广告位即将到期数量 */
  advertiseCount: number
  /** 商品总览：已下架 */
  offShelfCount: number
  /** 商品总览：已上架 */
  onShelfCount: number
  /** 商品总览：库存紧张 */
  lowStockCount: number
  /** 商品总览：全部商品 */
  productCount: number
  /** 用户总览：今日新增 */
  memberTodayAdd: number
  /** 用户总览：昨日新增 */
  memberYesterdayAdd: number
  /** 用户总览：本月新增 */
  memberMonthAdd: number
  /** 用户总览：会员总数 */
  memberCount: number
  /** 订单统计：本月订单总数 */
  monthOrderCount: number
  /** 订单统计：本周订单总数 */
  weekOrderCount: number
  /** 订单统计：本月销售总额 */
  monthOrderAmount: number
  /** 订单统计：本周销售总额 */
  weekOrderAmount: number
  /** 订单统计：本月订单总数同比上月增长率(%) */
  monthOrderCountGrowth: number
  /** 订单统计：本周订单总数同比上周增长率(%) */
  weekOrderCountGrowth: number
  /** 订单统计：本月销售总额同比上月增长率(%) */
  monthOrderAmountGrowth: number
  /** 订单统计：本周销售总额同比上周增长率(%) */
  weekOrderAmountGrowth: number
}

/** 订单趋势统计（按天分组） */
export type OrderTrendResult = {
  /** 日期（yyyy-MM-dd） */
  date: string
  /** 订单数量 */
  orderCount: number
  /** 订单金额 */
  orderAmount: number
}

/** 订单趋势查询参数 */
export type OrderTrendQueryParam = {
  /** 开始日期（yyyy-MM-dd） */
  startDate: string
  /** 结束日期（yyyy-MM-dd） */
  endDate: string
}
