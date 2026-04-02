<template>
  <view>
    <!-- 页面内容 -->
  </view>
</template>

<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
    
    // 检查登录状态
    this.checkLoginStatus()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    // 检查登录状态
    checkLoginStatus() {
      const token = uni.getStorageSync('token')
      const userInfo = uni.getStorageSync('userInfo')
      
      if (token && userInfo) {
        // 已登录，跳转到首页
        uni.switchTab({
          url: '/pages/index/index'
        })
      } else {
        // 未登录，跳转到登录页
        uni.redirectTo({
          url: '/pages/login/login'
        })
      }
    }
  }
}
</script>

<style>
/* 全局样式 */
page {
  background-color: #f8f8f8;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 通用样式 */
.container {
  padding: 20rpx;
}

.card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
}

.title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
}

.text-secondary {
  font-size: 24rpx;
  color: #999999;
}

/* 按钮样式 */
.btn {
  border-radius: 8rpx;
  padding: 20rpx 32rpx;
  font-size: 28rpx;
  text-align: center;
  transition: all 0.3s;
}

.btn-primary {
  background-color: #007AFF;
  color: #ffffff;
}

.btn-primary:active {
  background-color: #0056CC;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333333;
}

.btn-secondary:active {
  background-color: #e0e0e0;
}

.btn-success {
  background-color: #34C759;
  color: #ffffff;
}

.btn-success:active {
  background-color: #2AA44F;
}

.btn-warning {
  background-color: #FF9500;
  color: #ffffff;
}

.btn-warning:active {
  background-color: #CC7700;
}

.btn-danger {
  background-color: #FF3B30;
  color: #ffffff;
}

.btn-danger:active {
  background-color: #CC2F26;
}

/* 输入框样式 */
.input {
  border: 2rpx solid #e0e0e0;
  border-radius: 8rpx;
  padding: 20rpx;
  font-size: 28rpx;
  background-color: #ffffff;
}

.input:focus {
  border-color: #007AFF;
  outline: none;
}

/* 标签样式 */
.tag {
  display: inline-block;
  padding: 8rpx 16rpx;
  border-radius: 6rpx;
  font-size: 22rpx;
  margin-right: 10rpx;
  margin-bottom: 10rpx;
}

.tag-primary {
  background-color: #E6F3FF;
  color: #007AFF;
}

.tag-success {
  background-color: #E6F7ED;
  color: #34C759;
}

.tag-warning {
  background-color: #FFF4E6;
  color: #FF9500;
}

.tag-danger {
  background-color: #FFEBE9;
  color: #FF3B30;
}

/* 进度条样式 */
.progress {
  height: 8rpx;
  background-color: #f0f0f0;
  border-radius: 4rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #007AFF;
  border-radius: 4rpx;
  transition: width 0.3s;
}

/* 加载动画 */
.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40rpx;
}

.loading-spinner {
  width: 40rpx;
  height: 40rpx;
  border: 4rpx solid #f0f0f0;
  border-top-color: #007AFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态样式 */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 40rpx;
  text-align: center;
}

.empty-icon {
  font-size: 120rpx;
  color: #cccccc;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 20rpx;
}

/* 响应式工具类 */
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.flex-row {
  flex-direction: row;
}

.flex-center {
  justify-content: center;
  align-items: center;
}

.flex-between {
  justify-content: space-between;
}

.flex-around {
  justify-content: space-around;
}

.flex-wrap {
  flex-wrap: wrap;
}

.align-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.text-center {
  text-align: center;
}

.text-left {
  text-align: left;
}

.text-right {
  text-align: right;
}

.mt-10 { margin-top: 10rpx; }
.mt-20 { margin-top: 20rpx; }
.mt-30 { margin-top: 30rpx; }
.mt-40 { margin-top: 40rpx; }

.mb-10 { margin-bottom: 10rpx; }
.mb-20 { margin-bottom: 20rpx; }
.mb-30 { margin-bottom: 30rpx; }
.mb-40 { margin-bottom: 40rpx; }

.ml-10 { margin-left: 10rpx; }
.ml-20 { margin-left: 20rpx; }
.ml-30 { margin-left: 30rpx; }
.ml-40 { margin-left: 40rpx; }

.mr-10 { margin-right: 10rpx; }
.mr-20 { margin-right: 20rpx; }
.mr-30 { margin-right: 30rpx; }
.mr-40 { margin-right: 40rpx; }

.pt-10 { padding-top: 10rpx; }
.pt-20 { padding-top: 20rpx; }
.pt-30 { padding-top: 30rpx; }
.pt-40 { padding-top: 40rpx; }

.pb-10 { padding-bottom: 10rpx; }
.pb-20 { padding-bottom: 20rpx; }
.pb-30 { padding-bottom: 30rpx; }
.pb-40 { padding-bottom: 40rpx; }

.pl-10 { padding-left: 10rpx; }
.pl-20 { padding-left: 20rpx; }
.pl-30 { padding-left: 30rpx; }
.pl-40 { padding-left: 40rpx; }

.pr-10 { padding-right: 10rpx; }
.pr-20 { padding-right: 20rpx; }
.pr-30 { padding-right: 30rpx; }
.pr-40 { padding-right: 40rpx; }
</style>