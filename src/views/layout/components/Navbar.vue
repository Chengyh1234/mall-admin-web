<script lang="ts" setup>
import { ref, computed } from 'vue'
import Breadcrumb from '@/components/Breadcrumb/index.vue'
import Hamburger from '@/components/Hamburger/index.vue'
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { ArrowDown, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import SingleUpload from '@/components/Upload/singleUpload.vue'
import { adminUpdateSelfAPI } from '@/apis/admin'
import type { UmsAdmin } from '@/types/admin'

// 定义组件名称
defineOptions({
  name: 'Navbar'
})

const appStore = useAppStore()
const userStore = useUserStore()

const sidebar = computed(() => appStore.sidebar)
const avatar = computed(() => userStore.userInfo.avatar)

// 个人中心弹窗可见性
const profileVisible = ref(false)
// 个人中心表单数据（仅头像、昵称、邮箱、备注）
const profile = ref<Partial<UmsAdmin>>({})

// 打开个人中心
const openProfile = async () => {
  try {
    // 打开前拉取最新用户信息，保证头像/昵称/邮箱/备注正确回填（数据库改动即时生效）
    await userStore.getUserInfo()
  } catch (error) {
    // 拉取失败时使用当前缓存的信息回填
  }
  profile.value = {
    icon: userStore.userInfo.avatar,
    nickName: userStore.userInfo.nickName,
    email: userStore.userInfo.email,
    note: userStore.userInfo.note,
  }
  profileVisible.value = true
}

// 保存个人中心信息
const handleProfileSave = async () => {
  try {
    await adminUpdateSelfAPI(profile.value as UmsAdmin)
    // 同步更新本地用户信息，右上角头像即时生效
    userStore.userInfo.avatar = profile.value.icon || ''
    userStore.userInfo.nickName = profile.value.nickName
    userStore.userInfo.email = profile.value.email
    userStore.userInfo.note = profile.value.note
    ElMessage.success('个人信息修改成功！')
    profileVisible.value = false
  } catch (error) {
    console.error('修改个人信息失败:', error)
  }
}

// 处理开关侧边栏操作
const handleToggleSideBar = () => {
  appStore.toggleSideBar()
}

// 处理用户登出
const handleLogout = async () => {
  await userStore.userLogout()
  // 为了重新实例化vue-router对象 避免bug
  location.reload()
}
</script>

<template>
  <el-menu class="navbar" mode="horizontal">
    <hamburger class="hamburger-container" :toggle-click="handleToggleSideBar" :is-active="sidebar.opened"></hamburger>
    <breadcrumb></breadcrumb>
    <el-dropdown class="avatar-container" trigger="click">
      <div class="avatar-wrapper">
        <el-avatar class="user-avatar" :size="40" :src="avatar">
          <el-icon><User /></el-icon>
        </el-avatar>
        <el-icon class="el-icon-caret-bottom">
          <arrow-down />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="user-dropdown">
          <router-link class="inlineBlock" to="/">
            <el-dropdown-item>
              首页
            </el-dropdown-item>
          </router-link>
          <el-dropdown-item @click="openProfile">
            个人中心
          </el-dropdown-item>
          <el-dropdown-item divided>
            <span @click="handleLogout" style="display:block;">退出</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
    <el-dialog v-model="profileVisible" title="个人中心" width="40%">
      <el-form :model="profile" label-width="100px" size="default">
        <el-form-item label="头像：">
          <SingleUpload v-model="profile.icon" />
        </el-form-item>
        <el-form-item label="昵称：">
          <el-input v-model="profile.nickName" style="width: 220px"></el-input>
        </el-form-item>
        <el-form-item label="邮箱：">
          <el-input v-model="profile.email" style="width: 220px"></el-input>
        </el-form-item>
        <el-form-item label="备注：">
          <el-input v-model="profile.note" type="textarea" :rows="3" style="width: 220px"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="profileVisible = false" size="default">取 消</el-button>
          <el-button type="primary" @click="handleProfileSave" size="default">确 定</el-button>
        </span>
      </template>
    </el-dialog>
  </el-menu>
</template>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  line-height: 50px;
  border-radius: 0px !important;

  .hamburger-container {
    line-height: 58px;
    height: 50px;
    float: left;
    padding: 0 10px;
  }

  .screenfull {
    position: absolute;
    right: 90px;
    top: 16px;
    color: red;
  }

  .avatar-container {
    height: 50px;
    display: inline-block;
    position: absolute;
    right: 35px;

    .avatar-wrapper {
      cursor: pointer;
      margin-top: 5px;
      position: relative;

      .user-avatar {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: #dcdfe6;
      }

      .el-icon-caret-bottom {
        position: absolute;
        right: -20px;
        top: 25px;
        font-size: 12px;
      }
    }
  }
}
</style>
