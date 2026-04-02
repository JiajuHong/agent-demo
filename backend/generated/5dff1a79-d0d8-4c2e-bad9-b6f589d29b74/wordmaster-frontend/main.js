import { createSSRApp } from 'vue'
import App from './App.vue'
import uView from 'uview-ui'

// 配置请求拦截器
import request from './api/request.js'

export function createApp() {
  const app = createSSRApp(App)
  
  // 使用uView UI
  app.use(uView)
  
  // 挂载全局方法
  app.config.globalProperties.$request = request
  
  // 全局混入
  app.mixin({
    data() {
      return {
        // 全局loading状态
        loading: false
      }
    },
    methods: {
      // 显示提示消息
      showToast(title, icon = 'none', duration = 2000) {
        uni.showToast({
          title,
          icon,
          duration
        })
      },
      
      // 显示加载中
      showLoading(title = '加载中...') {
        uni.showLoading({
          title,
          mask: true
        })
      },
      
      // 隐藏加载中
      hideLoading() {
        uni.hideLoading()
      },
      
      // 显示确认对话框
      showConfirm(title, content, confirmText = '确定', cancelText = '取消') {
        return new Promise((resolve, reject) => {
          uni.showModal({
            title,
            content,
            confirmText,
            cancelText,
            success: (res) => {
              if (res.confirm) {
                resolve(true)
              } else if (res.cancel) {
                resolve(false)
              }
            },
            fail: (err) => {
              reject(err)
            }
          })
        })
      },
      
      // 格式化日期
      formatDate(date, format = 'YYYY-MM-DD') {
        if (!date) return ''
        
        const d = new Date(date)
        const year = d.getFullYear()
        const month = String(d.getMonth() + 1).padStart(2, '0')
        const day = String(d.getDate()).padStart(2, '0')
        const hour = String(d.getHours()).padStart(2, '0')
        const minute = String(d.getMinutes()).padStart(2, '0')
        const second = String(d.getSeconds()).padStart(2, '0')
        
        return format
          .replace('YYYY', year)
          .replace('MM', month)
          .replace('DD', day)
          .replace('HH', hour)
          .replace('mm', minute)
          .replace('ss', second)
      },
      
      // 格式化时间
      formatTime(time) {
        if (!time) return ''
        
        const date = new Date(time)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        
        // 小于1分钟
        if (diff < 60 * 1000) {
          return '刚刚'
        }
        
        // 小于1小时
        if (diff < 60 * 60 * 1000) {
          return `${Math.floor(diff / (60 * 1000))}分钟前`
        }
        
        // 小于1天
        if (diff < 24 * 60 * 60 * 1000) {
          return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
        }
        
        // 小于7天
        if (diff < 7 * 24 * 60 * 60 * 1000) {
          return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
        }
        
        // 返回完整日期
        return this.formatDate(date, 'YYYY-MM-DD')
      },
      
      // 检查登录状态
      checkLogin() {
        const token = uni.getStorageSync('token')
        if (!token) {
          uni.showModal({
            title: '提示',
            content: '请先登录',
            success: (res) => {
              if (res.confirm) {
                uni.redirectTo({
                  url: '/pages/login/login'
                })
              }
            }
          })
          return false
        }
        return true
      },
      
      // 获取用户信息
      getUserInfo() {
        return uni.getStorageSync('userInfo') || {}
      },
      
      // 设置用户信息
      setUserInfo(userInfo) {
        uni.setStorageSync('userInfo', userInfo)
      },
      
      // 获取token
      getToken() {
        return uni.getStorageSync('token')
      },
      
      // 设置token
      setToken(token) {
        uni.setStorageSync('token', token)
      },
      
      // 清除用户信息
      clearUserInfo() {
        uni.removeStorageSync('token')
        uni.removeStorageSync('userInfo')
      },
      
      // 退出登录
      logout() {
        this.clearUserInfo()
        uni.redirectTo({
          url: '/pages/login/login'
        })
      },
      
      // 跳转到页面
      navigateTo(url) {
        uni.navigateTo({
          url
        })
      },
      
      // 重定向到页面
      redirectTo(url) {
        uni.redirectTo({
          url
        })
      },
      
      // 切换tab页
      switchTab(url) {
        uni.switchTab({
          url
        })
      },
      
      // 返回上一页
      navigateBack(delta = 1) {
        uni.navigateBack({
          delta
        })
      },
      
      // 复制文本到剪贴板
      copyText(text) {
        uni.setClipboardData({
          data: text,
          success: () => {
            this.showToast('复制成功')
          }
        })
      },
      
      // 防抖函数
      debounce(fn, delay = 500) {
        let timer = null
        return function(...args) {
          if (timer) clearTimeout(timer)
          timer = setTimeout(() => {
            fn.apply(this, args)
          }, delay)
        }
      },
      
      // 节流函数
      throttle(fn, delay = 500) {
        let lastTime = 0
        return function(...args) {
          const now = Date.now()
          if (now - lastTime > delay) {
            fn.apply(this, args)
            lastTime = now
          }
        }
      }
    }
  })
  
  return {
    app
  }
}