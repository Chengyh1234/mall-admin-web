import { defineStore } from 'pinia'
import { getAdminInfoAPI, adminLoginAPI, adminLogoutAPI } from '@/apis/admin'
import { ref } from 'vue'
import type { LoginParam, UserInfo } from '@/types/admin'

export const useUserStore = defineStore(
  'user',
  () => {
    // 用户信息（注意：不存储密码，密码仅用于登录请求，不落库也不持久化）
    const userInfo = ref<UserInfo>({
      username: '',
      avatar: '',
      nickName: '',
      email: '',
      note: '',
      roles: [],
      token: '',
      menus: [],
    })

    // 用户登录
    const userLogin = async (loginParam: LoginParam) => {
      const res = await adminLoginAPI(loginParam)
      const tokenStr = res.data.tokenHead + res.data.token
      userInfo.value.token = tokenStr
      userInfo.value.username = loginParam.username
      await getUserInfo()
    }

    // 获取用户信息
    const getUserInfo = async () => {
      const res = await getAdminInfoAPI()
      if (res.data.roles && res.data.roles.length > 0) {
        // 验证返回的roles是否是一个非空数组
        userInfo.value.roles = res.data.roles
      } else {
        throw new Error('该用户暂未分配角色，请先分配角色！')
      }
      userInfo.value.menus = res.data.menus
      userInfo.value.avatar = res.data.icon
      userInfo.value.nickName = res.data.nickName
      userInfo.value.email = res.data.email
      userInfo.value.note = res.data.note
    }

    // 用户登出
    const userLogout = async () => {
      await adminLogoutAPI()
      userInfo.value.token = ''
      userInfo.value.roles = []
    }

    // 前端登出
    const fedLogout = () => {
      userInfo.value.token = ''
    }

    return {
      userInfo,
      userLogin,
      getUserInfo,
      userLogout,
      fedLogout,
    }
  },
  {
    // 持久化配置：只持久化必要字段（白名单），避免敏感信息（如密码）落入 localStorage
    // 注意：setup store 的 state 挂在 userInfo 下，pick 需带 userInfo. 前缀
    persist: {
      pick: [
        'userInfo.token',
        'userInfo.username',
        'userInfo.avatar',
        'userInfo.nickName',
        'userInfo.email',
        'userInfo.note',
        'userInfo.roles',
        'userInfo.menus',
      ],
      // 迁移清理：清除历史版本遗留的明文密码快照（一次性）
      afterHydrate: () => {
        const raw = localStorage.getItem('user')
        if (raw) {
          try {
            const data = JSON.parse(raw)
            if (data && data.userInfo && typeof data.userInfo.password === 'string') {
              delete data.userInfo.password
              localStorage.setItem('user', JSON.stringify(data))
            }
          } catch {
            // 解析失败说明快照损坏，忽略即可
          }
        }
      },
    },
  },
)
