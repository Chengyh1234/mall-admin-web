<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { Tickets } from '@element-plus/icons-vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { getCouponListAPI } from '@/apis/coupon'
import { messageCreateAPI, getMessageListAPI } from '@/apis/message'
import { formatDateTime } from '@/utils/datetime'
import type { MessageQueryParam, UmsMessage, UmsMessageParam } from '@/types/message'
import type { SmsCoupon } from '@/types/coupon'

// 消息类型选项
const typeOptions = ref([
  { label: '系统通知', value: 1 },
  { label: '订单通知', value: 2 },
  { label: '营销通知', value: 3 },
])
// 发送方式选项
const sendTypeOptions = ref([
  { label: '定向', value: 0 },
  { label: '广播', value: 1 },
])

// 列表查询参数
const listQuery = ref<MessageQueryParam>({ pageNum: 1, pageSize: 10 })
// 列表数据
const list = ref<UmsMessage[]>([])
// 总数
const total = ref<number>(0)
// 加载状态
const listLoading = ref<boolean>(false)

// 发布消息弹窗
const dialogVisible = ref<boolean>(false)
// 提交状态
const submitting = ref<boolean>(false)
// 发布消息表单引用
const messageForm = ref<FormInstance>()
// 默认表单值
const defaultMessageParam: UmsMessageParam = {
  type: 1,
  sendType: 1,
  title: '',
  content: '',
  bizId: '',
  memberIds: [],
}
// 发布消息参数
const messageParam = ref<UmsMessageParam>(Object.assign({}, defaultMessageParam))
// 定向会员ID输入（逗号分隔，提交时转换为数组）
const memberIdsInput = ref<string>('')
// 优惠券选择器当前选中ID（营销通知时显示）
const selectedCouponId = ref<number>(0)
// 优惠券列表（营销通知选券器数据源）
const couponList = ref<SmsCoupon[]>([])

// 动态校验规则：营销通知必选优惠券，定向发送必填会员ID
const rules = computed<FormRules<UmsMessageParam>>(() => ({
  type: [{ required: true, message: '请选择消息类型', trigger: 'change' }],
  sendType: [{ required: true, message: '请选择发送方式', trigger: 'change' }],
  title: [{ required: true, message: '请输入消息标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入消息内容', trigger: 'blur' }],
  ...(messageParam.value.type === 3
    ? { bizId: [{ required: true, message: '请选择优惠券', trigger: 'change' }] }
    : {}),
  ...(messageParam.value.sendType === 0
    ? { memberIds: [{ required: true, message: '请输入定向会员ID', trigger: 'blur' }] }
    : {}),
}))

// 获取消息列表数据
const getList = async () => {
  listLoading.value = true
  try {
    const response = await getMessageListAPI(listQuery.value)
    listLoading.value = false
    list.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    listLoading.value = false
    console.error('获取消息列表失败:', error)
  }
}

// 获取优惠券列表（选券器数据源，与优惠券管理页同一接口）
const getCouponList = async () => {
  try {
    const response = await getCouponListAPI({ pageNum: 1, pageSize: 100 })
    couponList.value = response.data.list
  } catch (error) {
    console.error('获取优惠券列表失败:', error)
  }
}

// 组件挂载时获取数据
onMounted(() => {
  getList()
  getCouponList()
})

// 处理页面大小变化
const handleSizeChange = (val: number) => {
  listQuery.value.pageNum = 1
  listQuery.value.pageSize = val
  getList()
}

// 处理当前页变化
const handleCurrentChange = (val: number) => {
  listQuery.value.pageNum = val
  getList()
}

// 打开发布消息弹窗
const handleAdd = () => {
  messageParam.value = Object.assign({}, defaultMessageParam)
  memberIdsInput.value = ''
  selectedCouponId.value = 0
  dialogVisible.value = true
}

// 优惠券选择变化时自动回填bizId（无需手填）
const handleCouponChange = () => {
  messageParam.value.bizId = selectedCouponId.value ? String(selectedCouponId.value) : ''
}

// 提交发布消息
const handleSubmit = async () => {
  messageForm.value!.validate(async valid => {
    if (!valid) {
      ElMessage({
        message: '验证失败',
        type: 'error',
        duration: 1000
      })
      return
    }
    // 定向发送时，将逗号分隔的会员ID转换为数组
    if (messageParam.value.sendType === 0) {
      messageParam.value.memberIds = memberIdsInput.value
        .split(',')
        .map(id => Number(id.trim()))
        .filter(id => !Number.isNaN(id))
    }
    submitting.value = true
    try {
      await messageCreateAPI(messageParam.value)
      ElMessage({
        message: '发布成功',
        type: 'success',
        duration: 1000
      })
      dialogVisible.value = false
      getList()
    } catch (error) {
      console.error('发布消息失败:', error)
    } finally {
      submitting.value = false
    }
  })
}

// 格式化消息类型
const formatType = (type: number) => {
  const findItem = typeOptions.value.find(item => item.value === type)
  return findItem?.label
}

// 格式化发送方式
const formatSendType = (sendType: number) => {
  const findItem = sendTypeOptions.value.find(item => item.value === sendType)
  return findItem?.label
}

// 格式化优惠券选项：券名（金额）
const formatCouponLabel = (coupon: SmsCoupon) => {
  return coupon.name + '（' + coupon.amount + '元）'
}
</script>

<template>
  <div class="app-container">
    <el-card class="operate-container" shadow="never">
      <el-icon class="el-icon-middle">
        <Tickets />
      </el-icon>
      <span>数据列表</span>
      <el-button class="btn-add" @click="handleAdd()">发布消息</el-button>
    </el-card>
    <div class="table-container">
      <el-table :data="list" style="width: 100%;" v-loading="listLoading" border>
        <el-table-column label="ID" width="80" align="center">
          <template #default="scope">{{ scope.row.id }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100" align="center">
          <template #default="scope">{{ formatType(scope.row.type) }}</template>
        </el-table-column>
        <el-table-column label="发送方式" width="100" align="center">
          <template #default="scope">{{ formatSendType(scope.row.sendType) }}</template>
        </el-table-column>
        <el-table-column label="标题" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.title }}</template>
        </el-table-column>
        <el-table-column label="内容" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.content }}</template>
        </el-table-column>
        <el-table-column label="业务ID" width="120" align="center">
          <template #default="scope">{{ scope.row.bizId || 'N/A' }}</template>
        </el-table-column>
        <el-table-column label="发送时间" width="180" align="center">
          <template #default="scope">{{ formatDateTime(scope.row.createTime!) }}</template>
        </el-table-column>
      </el-table>
    </div>
    <div class="pagination-container">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        layout="total, sizes,prev, pager, next,jumper" v-model:current-page="listQuery.pageNum"
        :page-size="listQuery.pageSize" :page-sizes="[5, 10, 15]" :total="total">
      </el-pagination>
    </div>

    <!-- 发布消息弹窗 -->
    <el-dialog title="发布消息" v-model="dialogVisible" width="600px" :close-on-click-modal="false">
      <el-form ref="messageForm" :model="messageParam" :rules="rules" label-width="120px">
        <el-form-item label="消息类型：" prop="type">
          <el-select v-model="messageParam.type" placeholder="请选择消息类型" class="input-width">
            <el-option v-for="type in typeOptions" :key="type.value" :label="type.label" :value="type.value">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="发送方式：" prop="sendType">
          <el-radio-group v-model="messageParam.sendType">
            <el-radio :label="0">定向</el-radio>
            <el-radio :label="1">广播</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="标题：" prop="title">
          <el-input v-model="messageParam.title" class="input-width" placeholder="请输入消息标题"></el-input>
        </el-form-item>
        <el-form-item label="内容：" prop="content">
          <el-input class="input-width" type="textarea" :rows="5" placeholder="请输入消息内容"
            v-model="messageParam.content"></el-input>
        </el-form-item>
        <el-form-item v-if="messageParam.type === 3" label="优惠券：" prop="bizId">
          <el-select v-model="selectedCouponId" placeholder="请选择优惠券" class="input-width" filterable
            @change="handleCouponChange">
            <el-option v-for="coupon in couponList" :key="coupon.id" :label="formatCouponLabel(coupon)"
              :value="coupon.id!">
            </el-option>
          </el-select>
          <div class="tip-text">选择优惠券后自动填入业务ID（bizId）</div>
        </el-form-item>
        <el-form-item v-if="messageParam.sendType === 0" label="定向会员ID：" prop="memberIds">
          <el-input v-model="memberIdsInput" class="input-width"
            placeholder="多个会员ID用英文逗号分隔，如：1,2,3"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit()">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.input-width {
  width: 70%;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  line-height: 20px;
}
</style>