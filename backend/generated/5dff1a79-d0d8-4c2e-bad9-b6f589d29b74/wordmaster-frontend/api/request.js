// 请求配置
const BASE_URL = 'http://localhost:8080/api' // 后端API地址

// 请求拦截器
const request = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 合并配置
    const config = {
      url: '',
      method: 'GET',
      data: {},
      header: {
        'Content-Type': 'application/json'
      },
      ...options
    }
    
    // 添加token到请求头
    const token = uni.getStorageSync('token')
    if (token) {
      config.header['Authorization'] = `Bearer ${token}`
    }
    
    // 处理URL
    if (!config.url.startsWith('http')) {
      config.url = BASE_URL + config.url
    }
    
    // 显示加载中
    if (config.showLoading !== false) {
      uni.showLoading({
        title: '加载中...',
        mask: true
      })
    }
    
    // 发送请求
    uni.request({
      url: config.url,
      method: config.method,
      data: config.data,
      header: config.header,
      success: (res) => {
        // 隐藏加载中
        if (config.showLoading !== false) {
          uni.hideLoading()
        }
        
        // 处理响应
        const { statusCode, data } = res
        
        if (statusCode === 200) {
          // 检查响应格式
          if (data && typeof data === 'object') {
            if (data.code === 0) {
              // 请求成功
              resolve(data.data)
            } else {
              // 业务错误
              const errorMsg = data.message || '请求失败'
              
              // 特殊错误处理
              if (data.code === 1004 || data.code === 1005) {
                // token无效或过期，清除token并跳转到登录页
                uni.removeStorageSync('token')
                uni.removeStorageSync('userInfo')
                
                uni.showModal({
                  title: '提示',
                  content: '登录已过期，请重新登录',
                  showCancel: false,
                  success: () => {
                    uni.redirectTo({
                      url: '/pages/login/login'
                    })
                  }
                })
              } else {
                // 其他错误，显示错误信息
                uni.showToast({
                  title: errorMsg,
                  icon: 'none',
                  duration: 2000
                })
              }
              
              reject(new Error(errorMsg))
            }
          } else {
            // 响应格式错误
            uni.showToast({
              title: '响应格式错误',
              icon: 'none'
            })
            reject(new Error('响应格式错误'))
          }
        } else if (statusCode === 401) {
          // 未授权
          uni.removeStorageSync('token')
          uni.removeStorageSync('userInfo')
          
          uni.showModal({
            title: '提示',
            content: '请先登录',
            showCancel: false,
            success: () => {
              uni.redirectTo({
                url: '/pages/login/login'
              })
            }
          })
          reject(new Error('未授权'))
        } else if (statusCode === 403) {
          // 禁止访问
          uni.showToast({
            title: '权限不足',
            icon: 'none'
          })
          reject(new Error('权限不足'))
        } else if (statusCode === 404) {
          // 资源不存在
          uni.showToast({
            title: '资源不存在',
            icon: 'none'
          })
          reject(new Error('资源不存在'))
        } else if (statusCode >= 500) {
          // 服务器错误
          uni.showToast({
            title: '服务器错误',
            icon: 'none'
          })
          reject(new Error('服务器错误'))
        } else {
          // 其他HTTP错误
          uni.showToast({
            title: `请求失败: ${statusCode}`,
            icon: 'none'
          })
          reject(new Error(`请求失败: ${statusCode}`))
        }
      },
      fail: (err) => {
        // 隐藏加载中
        if (config.showLoading !== false) {
          uni.hideLoading()
        }
        
        // 网络错误
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      },
      complete: () => {
        // 请求完成，可以在这里做一些清理工作
      }
    })
  })
}

// GET请求
request.get = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

// POST请求
request.post = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

// PUT请求
request.put = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

// DELETE请求
request.delete = (url, data = {}, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

// 上传文件
request.upload = (url, filePath, formData = {}, options = {}) => {
  return new Promise((resolve, reject) => {
    // 添加token到请求头
    const token = uni.getStorageSync('token')
    const header = {
      'Authorization': token ? `Bearer ${token}` : ''
    }
    
    uni.uploadFile({
      url: BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data)
            } else {
              uni.showToast({
                title: data.message || '上传失败',
                icon: 'none'
              })
              reject(new Error(data.message || '上传失败'))
            }
          } catch (e) {
            uni.showToast({
              title: '解析响应失败',
              icon: 'none'
            })
            reject(e)
          }
        } else {
          uni.showToast({
            title: `上传失败: ${res.statusCode}`,
            icon: 'none'
          })
          reject(new Error(`上传失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 下载文件
request.download = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    // 添加token到请求头
    const token = uni.getStorageSync('token')
    const header = {
      'Authorization': token ? `Bearer ${token}` : ''
    }
    
    uni.downloadFile({
      url: BASE_URL + url,
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath)
        } else {
          uni.showToast({
            title: `下载失败: ${res.statusCode}`,
            icon: 'none'
          })
          reject(new Error(`下载失败: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '下载失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

// 导出请求工具
export default request