/** 已发布消息 */
export type UmsMessage = {
  /** ID */
  id?: number
  /** 消息类型：1->系统通知；2->订单通知；3->营销通知 */
  type: number
  /** 发送类型：0->定向；1->广播 */
  sendType: number
  /** 消息标题 */
  title: string
  /** 消息内容 */
  content: string
  /** 业务ID（如优惠券ID、订单ID） */
  bizId?: string
  /** 创建时间 */
  createTime?: string
}

/** 消息发布参数 */
export type UmsMessageParam = {
  /** 消息类型：1->系统通知；2->订单通知；3->营销通知 */
  type: number
  /** 发送类型：0->定向；1->广播 */
  sendType: number
  /** 消息标题 */
  title: string
  /** 消息内容 */
  content: string
  /** 业务ID（如优惠券ID） */
  bizId?: string
  /** 定向发送的会员ID列表（sendType=0时必填） */
  memberIds?: number[]
}

/** 消息列表查询参数 */
export type MessageQueryParam = {
  /** 当前页码，从1开始 */
  pageNum: number
  /** 每页数量，默认10 */
  pageSize: number
}