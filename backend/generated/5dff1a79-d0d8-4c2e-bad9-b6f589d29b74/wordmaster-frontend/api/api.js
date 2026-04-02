import request from './request.js'

// 认证相关API
export const authApi = {
  // 用户注册
  register(data) {
    return request.post('/v1/auth/register', data)
  },
  
  // 用户登录
  login(data) {
    return request.post('/v1/auth/login', data)
  },
  
  // 测试接口
  test() {
    return request.get('/v1/auth/test')
  }
}

// 用户相关API
export const userApi = {
  // 获取当前用户信息
  getCurrentUser() {
    return request.get('/v1/users/me')
  },
  
  // 更新用户信息
  updateUserInfo(data) {
    return request.put('/v1/users/me', data)
  },
  
  // 获取指定用户信息
  getUserById(userId) {
    return request.get(`/v1/users/${userId}`)
  }
}

// 单词相关API
export const wordApi = {
  // 获取单词详情
  getWordDetail(wordId) {
    return request.get(`/v1/words/${wordId}`)
  },
  
  // 搜索单词
  searchWords(keyword, page = 1, size = 10) {
    return request.get('/v1/words/search', {
      keyword,
      page,
      size
    })
  },
  
  // 获取随机单词
  getRandomWords(count = 10) {
    return request.get('/v1/words/random', { count })
  },
  
  // 获取词库单词
  getWordsByDictionary(dictionaryId, page = 1, size = 10) {
    return request.get(`/v1/words/dictionary/${dictionaryId}`, {
      page,
      size
    })
  },
  
  // 根据难度获取单词
  getWordsByDifficulty(difficulty, limit = 20) {
    return request.get(`/v1/words/difficulty/${difficulty}`, { limit })
  },
  
  // 查询单词（从网易API）
  queryWord(word) {
    return request.get(`/v1/words/query/${word}`)
  }
}

// 学习相关API
export const studyApi = {
  // 学习单词
  learnWord(data) {
    return request.post('/v1/study/learn', data)
  },
  
  // 复习单词
  reviewWord(data) {
    return request.post('/v1/study/review', data)
  },
  
  // 获取复习列表
  getReviewList(limit = 20) {
    return request.get('/v1/study/review-list', { limit })
  },
  
  // 获取学习记录
  getStudyRecords(page = 1, size = 10) {
    return request.get('/v1/study/records', { page, size })
  },
  
  // 获取单词学习记录
  getStudyRecord(wordId) {
    return request.get(`/v1/study/records/${wordId}`)
  },
  
  // 获取今日学习统计
  getTodayStudyStats() {
    return request.get('/v1/study/today-stats')
  },
  
  // 获取总学习统计
  getTotalStudyStats() {
    return request.get('/v1/study/total-stats')
  },
  
  // 获取词库学习进度
  getDictionaryProgress(dictionaryId) {
    return request.get(`/v1/study/dictionary-progress/${dictionaryId}`)
  },
  
  // 重置学习记录
  resetStudyRecord(wordId) {
    return request.delete(`/v1/study/records/${wordId}`)
  },
  
  // 批量学习单词
  batchLearnWords(data) {
    return request.post('/v1/study/batch-learn', data)
  }
}

// 词库相关API
export const dictionaryApi = {
  // 获取所有词库
  getAllDictionaries() {
    return request.get('/v1/dictionaries')
  },
  
  // 获取词库详情
  getDictionaryById(dictionaryId) {
    return request.get(`/v1/dictionaries/${dictionaryId}`)
  },
  
  // 根据分类获取词库
  getDictionariesByCategory(category) {
    return request.get(`/v1/dictionaries/category/${category}`)
  },
  
  // 获取热门词库
  getPopularDictionaries(limit = 10) {
    return request.get('/v1/dictionaries/popular', { limit })
  },
  
  // 获取词库学习进度
  getDictionaryWithProgress(dictionaryId) {
    return request.get(`/v1/dictionaries/${dictionaryId}/progress`)
  },
  
  // 创建词库
  createDictionary(data) {
    return request.post('/v1/dictionaries', data)
  },
  
  // 更新词库
  updateDictionary(dictionaryId, data) {
    return request.put(`/v1/dictionaries/${dictionaryId}`, data)
  },
  
  // 删除词库
  deleteDictionary(dictionaryId) {
    return request.delete(`/v1/dictionaries/${dictionaryId}`)
  },
  
  // 获取词库单词数量
  getWordCount(dictionaryId) {
    return request.get(`/v1/dictionaries/${dictionaryId}/word-count`)
  },
  
  // 更新词库单词数量
  updateWordCount(dictionaryId) {
    return request.put(`/v1/dictionaries/${dictionaryId}/update-word-count`)
  }
}

// 统计相关API
export const statApi = {
  // 获取今日统计
  getTodayStat() {
    return request.get('/v1/stats/today')
  },
  
  // 获取指定日期统计
  getStatByDate(date) {
    return request.get(`/v1/stats/date/${date}`)
  },
  
  // 获取最近N天统计
  getRecentStats(days) {
    return request.get(`/v1/stats/recent/${days}`)
  },
  
  // 获取月度统计
  getMonthlyStats(year, month) {
    return request.get(`/v1/stats/monthly/${year}/${month}`)
  },
  
  // 获取年度统计
  getYearlyStats(year) {
    return request.get(`/v1/stats/yearly/${year}`)
  },
  
  // 获取学习趋势
  getStudyTrend(days) {
    return request.get(`/v1/stats/trend/${days}`)
  },
  
  // 获取学习概况
  getStudyOverview() {
    return request.get('/v1/stats/overview')
  },
  
  // 获取总学习时间
  getTotalStudyTime() {
    return request.get('/v1/stats/total-time')
  },
  
  // 获取总学习单词数
  getTotalLearnedWords() {
    return request.get('/v1/stats/total-learned')
  },
  
  // 获取总复习单词数
  getTotalReviewedWords() {
    return request.get('/v1/stats/total-reviewed')
  }
}

// 导出所有API
export default {
  auth: authApi,
  user: userApi,
  word: wordApi,
  study: studyApi,
  dictionary: dictionaryApi,
  stat: statApi
}