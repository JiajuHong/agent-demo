<template>
  <view class="login-container">
    <!-- 背景图 -->
    <view class="background">
      <image src="/static/login-bg.jpg" mode="aspectFill" class="bg-image"></image>
      <view class="bg-overlay"></view>
    </view>
    
    <!-- 登录表单 -->
    <view class="login-form">
      <!-- Logo和标题 -->
      <view class="logo-section">
        <image src="/static/logo.png" mode="aspectFit" class="logo"></image>
        <text class="app-name">单词记忆助手</text>
        <text class="app-slogan">高效记忆，轻松学习</text>
      </view>
      
      <!-- 表单区域 -->
      <view class="form-section">
        <!-- 用户名输入框 -->
        <view class="input-group">
          <view class="input-icon">
            <text class="iconfont icon-user"></text>
          </view>
          <input 
            v-model="form.username" 
            type="text" 
            placeholder="请输入用户名" 
            class="input"
            @focus="onInputFocus('username')"
            @blur="onInputBlur('username')"
          />
        </view>
        
        <!-- 密码输入框 -->
        <view class="input-group">
          <view class="input-icon">
            <text class="iconfont icon-lock"></text>
          </view>
          <input 
            v-model="form.password" 
            :type="showPassword ? 'text' : 'password'" 
            placeholder="请输入密码" 
            class="input"
            @focus="onInputFocus('password')"
            @blur="onInputBlur('password')"
          />
          <view class="password-toggle" @click="togglePassword">
            <text class="iconfont" :class="showPassword ? 'icon-eye' : 'icon-eye-close'"></text>
          </view>
        </view>
        
        <!-- 登录按钮 -->
        <button 
          class="login-btn" 
          :class="{ 'btn-disabled': !form.username || !form.password }" 
          :disabled="!form.username || !form.password || loading"
          @click="handleLogin"
        >
          <text v-if="!loading">登录</text>
          <view v-else class="loading-spinner"></view>
        </button>
        
        <!-- 注册链接 -->
        <view class="register-link">
          <text>还没有账号？</text>
          <text class="link-text" @click="goToRegister">立即注册</text>
        </view>
        
        <!-- 快速登录（测试用） -->
        <view class="quick-login">
          <text class="quick-title">快速登录（测试）</text>
          <view class="quick-buttons">
            <button class="quick-btn" @click="quickLogin('testuser')">测试用户</button>
            <button class="quick-btn" @click="quickLogin('student')">学生用户</button>
            <button class="quick-btn" @click="quickLogin('teacher')">教师用户</button>
          </view>
        </view>
      </view>
      
      <!-- 底部信息 -->
      <view class="footer">
        <text class="footer-text">© 2023 单词记忆助手 版权所有</text>
        <text class="footer-text">版本 1.0.0</text>
      </view>
    </view>
  </view>
</template>

<script>
import api from '../../api/api.js'

export default {
  data() {
    return {
      form: {
        username: '',
        password: ''
      },
      showPassword: false,
      loading: false,
      activeInput: ''
    }
  },
  
  onLoad() {
    // 页面加载时检查是否已登录
    const token = uni.getStorageSync('token')
    if (token) {
      uni.switchTab({
        url: '/pages/index/index'
      })
    }
  },
  
  methods: {
    // 输入框聚焦
    onInputFocus(field) {
      this.activeInput = field
    },
    
    // 输入框失焦
    onInputBlur(field) {
      if (this.activeInput === field) {
        this.activeInput = ''
      }
    },
    
    // 切换密码显示
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    
    // 处理登录
    async handleLogin() {
      // 表单验证
      if (!this.form.username.trim()) {
        this.showToast('请输入用户名')
        return
      }
      
      if (!this.form.password.trim()) {
        this.showToast('请输入密码')
        return
      }
      
      this.loading = true
      
      try {
        // 调用登录API
        const response = await api.auth.login({
          username: this.form.username.trim(),
          password: this.form.password.trim()
        })
        
        // 保存用户信息和token
        this.setUserInfo(response)
        this.setToken(response.token)
        
        // 显示登录成功提示
        this.showToast('登录成功', 'success')
        
        // 跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
        
      } catch (error) {
        console.error('登录失败:', error)
        // 错误信息已经在request.js中处理了
      } finally {
        this.loading = false
      }
    },
    
    // 快速登录（测试用）
    async quickLogin(username) {
      this.form.username = username
      this.form.password = 'test123' // 测试密码
      
      // 自动触发登录
      setTimeout(() => {
        this.handleLogin()
      }, 300)
    },
    
    // 跳转到注册页面
    goToRegister() {
      // 这里可以跳转到注册页面
      // 由于需求是简单注册登录，我们可以直接在当前页面切换
      uni.showModal({
        title: '注册功能',
        content: '注册功能将在后续版本中开放，请使用测试账号登录。',
        showCancel: false,
        confirmText: '知道了'
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  height: 100vh;
  position: relative;
}

/* 背景样式 */
.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.bg-image {
  width: 100%;
  height: 100%;
}

.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 122, 255, 0.8), rgba(0, 122, 255, 0.6));
}

/* 登录表单样式 */
.login-form {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 60rpx;
}

/* Logo区域 */
.logo-section {
  text-align: center;
  margin-bottom: 80rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.app-slogan {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

/* 表单区域 */
.form-section {
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* 输入框组 */
.input-group {
  position: relative;
  margin-bottom: 40rpx;
  border-bottom: 2rpx solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 20rpx 0;
}

.input-group:focus-within {
  border-bottom-color: #007AFF;
}

.input-icon {
  width: 60rpx;
  text-align: center;
}

.iconfont {
  font-size: 36rpx;
  color: #999999;
}

.input-group:focus-within .iconfont {
  color: #007AFF;
}

.input {
  flex: 1;
  height: 60rpx;
  font-size: 32rpx;
  color: #333333;
  background: transparent;
  border: none;
  outline: none;
}

.input::placeholder {
  color: #999999;
}

.password-toggle {
  width: 60rpx;
  text-align: center;
}

/* 登录按钮 */
.login-btn {
  background: linear-gradient(to right, #007AFF, #0056CC);
  color: #ffffff;
  border: none;
  border-radius: 12rpx;
  height: 88rpx;
  font-size: 32rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 40rpx;
  transition: all 0.3s;
}

.login-btn:active {
  opacity: 0.8;
  transform: scale(0.98);
}

.btn-disabled {
  background: #cccccc !important;
  opacity: 0.6;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 注册链接 */
.register-link {
  text-align: center;
  margin-top: 40rpx;
  font-size: 28rpx;
  color: #666666;
}

.link-text {
  color: #007AFF;
  margin-left: 10rpx;
  font-weight: bold;
}

.link-text:active {
  opacity: 0.8;
}

/* 快速登录 */
.quick-login {
  margin-top: 60rpx;
  padding-top: 40rpx;
  border-top: 2rpx solid #f0f0f0;
}

.quick-title {
  display: block;
  text-align: center;
  font-size: 26rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

.quick-buttons {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
}

.quick-btn {
  flex: 1;
  background-color: #f0f0f0;
  color: #666666;
  border: none;
  border-radius: 8rpx;
  height: 64rpx;
  font-size: 26rpx;
  line-height: 64rpx;
}

.quick-btn:active {
  background-color: #e0e0e0;
}

/* 底部信息 */
.footer {
  text-align: center;
  margin-top: 80rpx;
}

.footer-text {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 10rpx;
}
</style>