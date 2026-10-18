<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { dayjs } from 'element-plus'
import img_home_order from '@/assets/images/home_order.png'
import img_home_today_amount from '@/assets/images/home_today_amount.png'
import img_home_yesterday_amount from '@/assets/images/home_yesterday_amount.png'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart } from 'echarts/charts'
import VChart from 'vue-echarts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from 'echarts/components'
import type { HomeStatisticResult, OrderTrendResult } from '@/types/home'
import { getHomeStatisticAPI, getOrderTrendAPI } from '@/apis/home'

// 通过use()方法按需注入ECharts的模块
use([
  CanvasRenderer, // 画布渲染器
  LineChart, // 折线图的绘制功能
  GridComponent, // 直角坐标系网格组件
  TooltipComponent, // 鼠标悬停时显示数据详情
  LegendComponent,  // 图例组件
  TitleComponent // 显示图表标题
])

// 折线图数据类型
type LineChartDataItem = {
  date: string, // 交易日期
  orderCount: number, // 订单数量
  orderAmount: number // 订单金额
}

// 首页统计数据
const homeStatistic = ref<HomeStatisticResult>({
  todayOrderCount: 0,
  todayOrderAmount: 0,
  yesterdayOrderAmount: 0,
  unPayCount: 0,
  finishCount: 0,
  unReceiveCount: 0,
  unDeliverCount: 0,
  newStockCount: 0,
  returnApplyPendingCount: 0,
  shipCount: 0,
  returningCount: 0,
  advertiseCount: 0,
  offShelfCount: 0,
  onShelfCount: 0,
  lowStockCount: 0,
  productCount: 0,
  memberTodayAdd: 0,
  memberYesterdayAdd: 0,
  memberMonthAdd: 0,
  memberCount: 0,
  monthOrderCount: 0,
  weekOrderCount: 0,
  monthOrderAmount: 0,
  weekOrderAmount: 0,
  monthOrderCountGrowth: 0,
  weekOrderCountGrowth: 0,
  monthOrderAmountGrowth: 0,
  weekOrderAmountGrowth: 0
})

// 日期选择器日期范围[start,end]
const datePickerRange = ref<Date[]>([])
// 图表数据
const lineChartData = ref<LineChartDataItem[]>([])
// 图表数据加载状态
const loading = ref(false)

// 格式化日期为 yyyy-MM-dd
const formatDate = (date: Date) => dayjs(date).format('YYYY-MM-DD')

// 初始化日期选择器数据：默认最近一周
const initDatePickerRange = () => {
  const end = new Date()
  const start = dayjs(end).subtract(6, 'day').toDate()
  datePickerRange.value = [start, end]
}

// 获取首页统计数据
const getHomeStatistic = () => {
  getHomeStatisticAPI().then(res => {
    homeStatistic.value = res.data
  })
}

// 获取图表数据
const getLineChartData = () => {
  const start = datePickerRange.value[0]
  const end = datePickerRange.value[1]
  if (!start || !end) return
  loading.value = true
  getOrderTrendAPI({ startDate: formatDate(start), endDate: formatDate(end) })
    .then(res => {
      lineChartData.value = res.data
      loading.value = false
    })
    .catch(() => {
      loading.value = false
    })
}

// 组件挂载成功初始化数据
onMounted(() => {
  initDatePickerRange()
  getHomeStatistic()
  getLineChartData()
})

// 日期选择器选项
const shortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = dayjs(end).subtract(6, 'day').toDate()
      return [start, end]
    }
  },
  {
    text: '最近一月',
    value: () => {
      const end = new Date()
      const start = dayjs(end).subtract(29, 'day').toDate()
      return [start, end]
    }
  }
]
// 处理日期范围变化
const handleDatePickerRangeChange = () => {
  getLineChartData()
}

// 格式化金额为 ￥xxx.xx
const formatAmount = (amount: number) => {
  return '￥' + (amount ?? 0).toFixed(2)
}

// 环比增长率文案，正数带+号
const growthText = (growth: number) => {
  return (growth >= 0 ? '+' : '') + growth + '%'
}

// 环比增长率颜色：增长绿色、下降红色
const growthClass = (growth: number) => {
  return growth >= 0 ? 'color-success' : 'color-danger'
}

// vue-charts中的选项
const chartOption = computed(() => {
  const dates = lineChartData.value.map(item => item.date)
  const orderCounts = lineChartData.value.map(item => item.orderCount)
  const orderAmounts = lineChartData.value.map(item => item.orderAmount)
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates,
      axisLabel: {
        formatter: '{value}',
        rotate: 0
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单数量',
        position: 'left',
        axisLabel: {
          formatter: '{value}'
        }
      },
      {
        type: 'value',
        name: '订单金额',
        position: 'right',
        axisLabel: {
          formatter: '{value}'
        }
      }
    ],
    series: [
      {
        name: '订单数量',
        type: 'line',
        areaStyle: {},
        data: orderCounts,
        smooth: true,
        itemStyle: {
          color: '#409EFF'
        }
      },
      {
        name: '订单金额',
        type: 'line',
        yAxisIndex: 1,
        areaStyle: {},
        data: orderAmounts,
        smooth: true,
        itemStyle: {
          color: '#67C23A'
        }
      }
    ]
  }
})
</script>

<template>
  <div class="app-container">
    <div class="total-layout">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_order" class="total-icon">
            <div class="total-title">今日订单总数</div>
            <div class="total-value">{{ homeStatistic.todayOrderCount }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_today_amount" class="total-icon">
            <div class="total-title">今日销售总额</div>
            <div class="total-value">{{ formatAmount(homeStatistic.todayOrderAmount) }}</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="total-frame">
            <img :src="img_home_yesterday_amount" class="total-icon">
            <div class="total-title">昨日销售总额</div>
            <div class="total-value">{{ formatAmount(homeStatistic.yesterdayOrderAmount) }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="un-handle-layout">
      <div class="layout-title">待处理事务</div>
      <div class="un-handle-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待付款订单</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.unPayCount }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">已完成订单</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.finishCount }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待确认收货订单</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.unReceiveCount }})</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待发货订单</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.unDeliverCount }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">新缺货登记</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.newStockCount }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待处理退款申请</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.returnApplyPendingCount }})</span>
            </div>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">已发货订单</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.shipCount }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">待处理退货订单</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.returningCount }})</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="un-handle-item">
              <span class="font-medium">广告位即将到期</span>
              <span style="float: right" class="color-danger">({{ homeStatistic.advertiseCount }})</span>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="overview-layout">
      <el-row :gutter="20">
        <el-col :span="12">
          <div class="out-border">
            <div class="layout-title">商品总览</div>
            <div style="padding: 40px">
              <el-row>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.offShelfCount }}</el-col>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.onShelfCount }}</el-col>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.lowStockCount }}</el-col>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.productCount }}</el-col>
              </el-row>
              <el-row class="font-medium">
                <el-col :span="6" class="overview-item-title">已下架</el-col>
                <el-col :span="6" class="overview-item-title">已上架</el-col>
                <el-col :span="6" class="overview-item-title">库存紧张</el-col>
                <el-col :span="6" class="overview-item-title">全部商品</el-col>
              </el-row>
            </div>
          </div>
        </el-col>
        <el-col :span="12">
          <div class="out-border">
            <div class="layout-title">用户总览</div>
            <div style="padding: 40px">
              <el-row>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.memberTodayAdd }}</el-col>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.memberYesterdayAdd }}</el-col>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.memberMonthAdd }}</el-col>
                <el-col :span="6" class="color-danger overview-item-value">{{ homeStatistic.memberCount }}</el-col>
              </el-row>
              <el-row class="font-medium">
                <el-col :span="6" class="overview-item-title">今日新增</el-col>
                <el-col :span="6" class="overview-item-title">昨日新增</el-col>
                <el-col :span="6" class="overview-item-title">本月新增</el-col>
                <el-col :span="6" class="overview-item-title">会员总数</el-col>
              </el-row>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="statistics-layout">
      <div class="layout-title">订单统计</div>
      <el-row>
        <el-col :span="4">
          <div style="padding: 20px">
            <div>
              <div style="color: #909399;font-size: 14px">本月订单总数</div>
              <div style="color: #606266;font-size: 24px;padding: 10px 0">{{ homeStatistic.monthOrderCount }}</div>
              <div>
                <span :class="growthClass(homeStatistic.monthOrderCountGrowth)" style="font-size: 14px">{{ growthText(homeStatistic.monthOrderCountGrowth) }}</span>
                <span style="color: #C0C4CC;font-size: 14px">同比上月</span>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <div style="color: #909399;font-size: 14px">本周订单总数</div>
              <div style="color: #606266;font-size: 24px;padding: 10px 0">{{ homeStatistic.weekOrderCount }}</div>
              <div>
                <span :class="growthClass(homeStatistic.weekOrderCountGrowth)" style="font-size: 14px">{{ growthText(homeStatistic.weekOrderCountGrowth) }}</span>
                <span style="color: #C0C4CC;font-size: 14px">同比上周</span>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <div style="color: #909399;font-size: 14px">本月销售总额</div>
              <div style="color: #606266;font-size: 24px;padding: 10px 0">{{ formatAmount(homeStatistic.monthOrderAmount) }}</div>
              <div>
                <span :class="growthClass(homeStatistic.monthOrderAmountGrowth)" style="font-size: 14px">{{ growthText(homeStatistic.monthOrderAmountGrowth) }}</span>
                <span style="color: #C0C4CC;font-size: 14px">同比上月</span>
              </div>
            </div>
            <div style="margin-top: 20px;">
              <div style="color: #909399;font-size: 14px">本周销售总额</div>
              <div style="color: #606266;font-size: 24px;padding: 10px 0">{{ formatAmount(homeStatistic.weekOrderAmount) }}</div>
              <div>
                <span :class="growthClass(homeStatistic.weekOrderAmountGrowth)" style="font-size: 14px">{{ growthText(homeStatistic.weekOrderAmountGrowth) }}</span>
                <span style="color: #C0C4CC;font-size: 14px">同比上周</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="20">
          <div style="padding: 10px;border-left:1px solid #DCDFE6">
            <el-date-picker style="float: right;z-index: 1" size="small" v-model="datePickerRange" type="daterange"
              align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"
              :shortcuts="shortcuts" @change="handleDatePickerRangeChange">
            </el-date-picker>
            <div style="height: 400px;">
              <v-chart v-if="!loading" :option="chartOption" autoresize />
              <div v-else
                style="display: flex; justify-content: center; align-items: center; height: 100%;width: 100%;">
                <el-skeleton :rows="5" animated />
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  margin-top: 40px;
  margin-left: 120px;
  margin-right: 120px;
}

.total-layout {
  margin-top: 20px;
}

.total-frame {
  border: 1px solid #DCDFE6;
  padding: 20px;
  height: 100px;
}

.total-icon {
  color: #409EFF;
  width: 60px;
  height: 60px;
}

.total-title {
  position: relative;
  font-size: 16px;
  color: #909399;
  left: 70px;
  top: -50px;
}

.total-value {
  position: relative;
  font-size: 18px;
  color: #606266;
  left: 70px;
  top: -40px;
}

.un-handle-layout {
  margin-top: 20px;
  border: 1px solid #DCDFE6;
}

.layout-title {
  color: #606266;
  padding: 15px 20px;
  background: #F2F6FC;
  font-weight: bold;
}

.un-handle-content {
  padding: 20px 40px;
}

.un-handle-item {
  border-bottom: 1px solid #EBEEF5;
  padding: 10px;
}

.overview-layout {
  margin-top: 20px;
}

.overview-item-value {
  font-size: 24px;
  text-align: center;
}

.overview-item-title {
  margin-top: 10px;
  text-align: center;
}

.out-border {
  border: 1px solid #DCDFE6;
}

.statistics-layout {
  margin-top: 20px;
  border: 1px solid #DCDFE6;
}
</style>
