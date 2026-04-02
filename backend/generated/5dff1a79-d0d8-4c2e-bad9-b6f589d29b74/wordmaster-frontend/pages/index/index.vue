<template>
  <view class="index-container">
    <!-- 顶部导航栏 -->
    <view class="navbar">
      <view class="navbar-content">
        <view class="user-info" @click="goToProfile">
          <image :src="userInfo.avatar || '/static/default-avatar.png'" class="avatar"></image>
          <view class="user-details">
            <text class="username">{{ userInfo.nickname || userInfo.username || '用户' }}</text>
            <text class="welcome">欢迎回来！</text>
          </view>
        </view>
        <view class="search-icon" @click="goToSearch">
          <text class="iconfont icon-search"></text>
        </view>
      </view>
    </view>
    
    <!-- 主要内容区域 -->
    <scroll-view class="main-content" scroll-y="true" @scrolltolower="loadMore" refresher-enabled @refresherrefresh="onRefresh">
      <!-- 今日学习统计 -->
      <view class="today-stats card">
        <view class="stats-header">
          <text class="stats-title">今日学习</text>
          <text class="stats-date">{{ todayDate }}</text>
        </view>
        <view class="stats-grid">
          <view class="stat-item">
            <text class="stat-value">{{ todayStats.learnedCount || 0 }}</text>
            <text class="stat-label">学习单词</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ todayStats.reviewedCount || 0 }}</text>
            <text class="stat-label">复习单词</text>
          </view>
          <view class="stat-item">
            <text class="stat-value">{{ todayStats.totalTime || 0 }}</text>
            <text class="stat-label">学习时长(分钟)</text>
          </view>
        </view>
      </view>
      
      <!-- 快速开始 -->
      <view class="quick-start card">
        <view class="section-header">
          <text class="section-title">快速开始</text>
        </view>
        <view class="quick-buttons">
          <view class="quick-button" @click="startLearning">
            <view class="button-icon study">
              <text class="iconfont icon-study"></text>
            </view>
            <text class="button-text">开始学习</text>
          </view>
          <view class="quick-button" @click="startReview">
            <view class="button-icon review">
              <text class="iconfont icon-review"></text>
            </view>
            <text class="button-text">开始复习</text>
          </view>
          <view class="quick-button" @click="goToDictionary">
            <view class="button-icon dictionary">
              <text class="iconfont icon-dictionary"></text>
            </view>
            <text class="button-text">选择词库</text>
          </view>
        </view>
      </view>
      
      <!-- 学习进度 -->
      <view class="learning-progress card">
        <view class="section-header">
          <text class="section-title">学习进度</text>
          <text class="section-more" @click="goToStatistics">查看详情</text>
        </view>
        <view class="progress-list">
          <view class="progress-item" v-for="item in progressList" :key="item.id" @click="viewDictionary(item.id)">
            <view class="progress-info">
              <text class="dictionary-name">{{ item.name }}</text>
              <text class="progress-text">{{ item.learnedWords }}/{{ item.totalWords }} 单词</text>
            </view>
            <view class="progress-bar">
              <view class="progress-fill" :style="{ width: item.progress + '%' }"></view>
            </view>
            <text class="progress-percent">{{ item.progress }}%</text>
          </view>
        </view>
      </view>
      
      <!-- 推荐单词 -->
      <view class="recommended-words card">
        <view class="section-header">
          <text class="section-title">推荐单词</text>
          <text class="section-more" @click="refreshWords">换一批</text>
        </view>
        <view class="words-list">
          <view class="word-item" v-for="word in recommendedWords" :key="word.id" @click="viewWordDetail(word.id)">
            <view class="word-main">
              <text class="word-text">{{ word.word }}</text>
              <text class="word-phonetic">{{ word.phonetic }}</text>
            </view>
            <view class="word-details">
              <text class="word-definition">{{ word.definition }}</text>
              <text class="word-difficulty" :class="getDifficultyClass(word.difficulty)">
                {{ getDifficultyText(word.difficulty) }}
              </text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 学习提醒 -->
      <view class="study-reminder card" v-if="hasReviewWords">
        <view class="reminder-content">
          <view class="reminder-icon">
            <text class="iconfont icon-bell"></text>
          </view>
          <view class="reminder-text">
            <text class="reminder-title">有 {{ reviewCount }} 个单词需要复习</text>
            <text class="reminder-desc">及时复习可以提高记忆效果</text>
          </view>
          <button class="reminder-btn" @click="startReview">立即复习</button>
        </view>
      </view>
      
      <!-- 加载更多 -->
      <view class="load-more" v-if="loading">
        <view class="loading-spinner"></view>
        <text class="loading-text">加载中...</text>
      </view>
      
      <!-- 空状态 -->
      <view class="empty-state" v-if="!loading && recommendedWords.length === 0">
        <view class="empty-icon">
          <text class="iconfont icon-empty"></text>
        </view>
        <text class="empty-text">暂无数据</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import api from '../../api/api.js'

export default {
  data() {
    return {
      userInfo: {},
      todayStats: {},
      progressList: [],
      recommendedWords: [],
      reviewCount: 0,
      loading: false,
      refreshing: false,
      page: 1,
      pageSize: 10,
      hasMore: true
    }
  },
  
  computed: {
    // 今日日期
    todayDate() {
      const now = new Date()
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    
    // 是否有需要复习的单词
    hasReviewWords() {
      return this.reviewCount > 0
    }
  },
  
  onLoad() {
    // 检查登录状态
    if (!this.checkLogin()) {
      return
    }
    
    // 获取用户信息
    this.userInfo = this.getUserInfo()
    
    // 加载数据
    this.loadData()
  },
  
  onShow() {
    // 页面显示时刷新数据
    if (this.checkLogin()) {
      this.refreshData()
    }
  },
  
  onPullDownRefresh() {
    this.onRefresh()
  },
  
  methods: {
    // 加载数据
    async loadData() {
      this.loading = true
      
      try {
        // 并行加载数据
        await Promise.all([
          this.loadTodayStats(),
          this.loadProgress(),
          this.loadRecommendedWords(),
          this.loadReviewCount()
        ])
      } catch (error) {
        console.error('加载数据失败:', error)
        this.showToast('加载失败，请重试')
      } finally {
        this.loading = false
        this.refreshing = false
        uni.stopPullDownRefresh()
      }
    },
    
    // 刷新数据
    async refreshData() {
      this.page = 1
      this.hasMore = true
      this.recommendedWords = []
      await this.loadData()
    },
    
    // 下拉刷新
    onRefresh() {
      this.refreshing = true
      this.refreshData()
    },
    
    // 加载更多
    async loadMore() {
      if (this.loading || !this.hasMore) return
      
      this.page++
      await this.loadMoreWords()
    },
    
    // 加载今日统计
    async loadTodayStats() {
      try {
        const data = await api.stat.getTodayStat()
        this.todayStats = data
      } catch (error) {
        console.error('加载今日统计失败:', error)
      }
    },
    
    // 加载学习进度
    async loadProgress() {
      try {
        const dictionaries = await api.dictionary.getAllDictionaries()
        
        // 获取每个词库的学习进度
        const progressPromises = dictionaries.map(async dict => {
          try {
            const progress = await api.study.getDictionaryProgress(dict.id)
            return {
              id: dict.id,
              name: dict.name,
              totalWords: dict.totalWords || 0,
              learnedWords: progress.reviewCount || 0,
              progress: dict.totalWords > 0 ? Math.round((progress.reviewCount || 0) * 100 / dict.totalWords) : 0
            }
          } catch (error) {
            return {
              id: dict.id,
              name: dict.name,
              totalWords: dict.totalWords || 0,
              learnedWords: 0,
              progress: 0
            }
          }
        })
        
        const progressList = await Promise.all(progressPromises)
        this.progressList = progressList.slice(0, 3) // 只显示前3个
      } catch (error) {
        console.error('加载学习进度失败:', error)
        this.progressList = []
      }
    },
    
    // 加载推荐单词
    async loadRecommendedWords() {
      try {
        const words = await api.word.getRandomWords(this.pageSize)
        this.recommendedWords = words
        this.hasMore = words.length === this.pageSize
      } catch (error) {
        console.error('加载推荐单词失败:', error)
        this.recommendedWords = []
      }
    },
    
    // 加载更多单词
    async loadMoreWords() {
      try {
        const words = await api.word.getRandomWords(this.pageSize)
        if (words.length > 0) {
          this.recommendedWords = [...this.recommendedWords, ...words]
          this.hasMore = words.length === this.pageSize
        } else {
          this.hasMore = false
        }
      } catch (error) {
        console.error('加载更多单词失败:', error)
        this.page-- // 加载失败，回退页码
      }
    },
    
    // 加载复习单词数量
    async loadReviewCount() {
      try {
        const reviewList = await api.study.getReviewList(1) // 只获取1个来检查数量
        this.reviewCount = reviewList.length
      } catch (error) {
        console.error('加载复习数量失败:', error)
        this.reviewCount = 0
      }
    },
    
    // 获取难度等级对应的类名
    getDifficultyClass(difficulty) {
      const classes = {
        1: 'difficulty-easy',
        2: 'difficulty-medium',
        3: 'difficulty-normal',
        4: 'difficulty-hard',
        5: 'difficulty-expert'
      }
      return classes[difficulty] || 'difficulty-normal'
    },
    
    // 获取难度等级文本
    getDifficultyText(difficulty) {
      const texts = {
        1: '简单',
        2: '较易',
        3: '中等',
        4: '较难',
        5: '困难'
      }
      return texts[difficulty] || '中等'
    },
    
    // 开始学习
    startLearning() {
      uni.navigateTo({
        url: '/pages/study/study'
      })
    },
    
    // 开始复习
    startReview() {
      uni.navigateTo({
        url: '/pages/review/review'
      })
    },
    
    // 跳转到词库
    goToDictionary() {
      uni.switchTab({
        url: '/pages/dictionary/dictionary'
      })
    },
    
    // 跳转到统计
    goToStatistics() {
      uni.switchTab({
        url: '/pages/statistics/statistics'
      })
    },
    
    // 跳转到搜索
    goToSearch() {
      uni.navigateTo({
        url: '/pages/search/search'
      })
    },
    
    // 跳转到个人中心
    goToProfile() {
      uni.switchTab({
        url: '/pages/profile/profile'
      })
    },
    
    // 查看单词详情
    viewWordDetail(wordId) {
      uni.navigateTo({
        url: `/pages/word-detail/word-detail?id=${wordId}`
      })
    },
    
    // 查看词库详情
    viewDictionary(dictionaryId) {
      uni.navigateTo({
        url: `/pages/dictionary/dictionary?detail=${dictionaryId}`
      })
    },
    
    // 刷新单词
    refreshWords() {
      this.loadRecommendedWords()
    }
  }
}
</script>

<style scoped>
.index-container {
  height: 100vh;
  background-color: #f8f8f8;
}

/* 导航栏样式 */
.navbar {
  background: linear-gradient(to right, #007AFF, #0056CC);
  padding: 40rpx 30rpx 20rpx;
  color: #ffffff;
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  margin-right: 20rpx;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.welcome {
  font-size: 24rpx;
  opacity: 0.9;
}

.search-icon {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iconfont {
  font-size: 40rpx;
}

/* 主要内容区域 */
.main-content {
  height: calc(100vh - 160rpx);
  padding: 20rpx;
}

/* 卡片样式 */
.card {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

/* 今日统计 */
.today-stats {
  margin-top: -60rpx;
  position: relative;
  z-index: 1;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.stats-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.stats-date {
  font-size: 24rpx;
  color: #999999;
}

.stats-grid {
  display: flex;
  justify-content: space-between;
}

.stat-item {
  flex: 1;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #007AFF;
  margin-bottom: 8rpx;
}

.stat-label {
  display: block;
  font-size: 24rpx;
  color: #666666;
}

/* 快速开始 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.section-more {
  font-size: 24rpx;
  color: #007AFF;
}

.quick-buttons {
  display: flex;
  justify-content: space-between;
}

.quick-button {
  flex: 1;
  text-align: center;
  padding: 20rpx;
}

.button-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20rpx;
}

.button-icon.study {
  background-color: #E6F3FF;
}

.button-icon.review {
  background-color: #E6F7ED;
}

.button-icon.dictionary {
  background-color: #FFF4E6;
}

.button-icon .iconfont {
  font-size: 48rpx;
}

.button-icon.study .iconfont {
  color: #007AFF;
}

.button-icon.review .iconfont {
  color: #34C759;
}

.button-icon.dictionary .iconfont {
  color: #FF9500;
}

.button-text {
  font-size: 26rpx;
  color: #333333;
}

/* 学习进度 */
.progress-list {
  margin-top: 20rpx;
}

.progress-item {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
}

.progress-info {
  flex: 1;
}

.dictionary-name {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.progress-text {
  display: block;
  font-size: 24rpx;
  color: #999999;
}

.progress-bar {
  width: 200rpx;
  height: 12rpx;
  background-color: #e0e0e0;
  border-radius: 6rpx;
  margin: 0 20rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(to right, #007AFF, #0056CC);
  border-radius: 6rpx;
  transition: width 0.3s;
}

.progress-percent {
  font-size: 24rpx;
  font-weight: bold;
  color: #007AFF;
  min-width: 60rpx;
  text-align: right;
}

/* 推荐单词 */
.words-list {
  margin-top: 20rpx;
}

.word-item {
  padding: 24rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.word-item:last-child {
  border-bottom: none;
}

.word-main {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.word-text {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-right: 20rpx;
}

.word-phonetic {
  font-size: 24rpx;
  color: #999999;
}

.word-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.word-definition {
  flex: 1;
  font-size: 28rpx;
  color: #666666;
  line-height: 1.4;
}

.word-difficulty {
  font-size: 22rpx;
  padding: 6rpx 12rpx;
  border-radius: 6rpx;
  margin-left: 20rpx;
}

.difficulty-easy {
  background-color: #E6F7ED;
  color: #34C759;
}

.difficulty-medium {
  background-color: #FFF4E6;
  color: #FF9500;
}

.difficulty-normal {
  background-color: #E6F3FF;
  color: #007AFF;
}

.difficulty-hard {
  background-color: #FFEBE9;
  color: #FF3B30;
}

.difficulty-expert {
  background-color: #F2E6FF;
  color: #5856D6;
}

/* 学习提醒 */
.study-reminder {
  background: linear-gradient(to right, #FF9500, #FF6B00);
  color: #ffffff;
}

.reminder-content {
  display: flex;
  align-items: center;
}

.reminder-icon {
  width: 80rpx;
  height: 80rpx;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.reminder-icon .iconfont {
  font-size: 40rpx;
}

.reminder-text {
  flex: 1;
}

.reminder-title {
  display: block;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 4rpx;
}

.reminder-desc {
  display: block;
  font-size: 24rpx;
  opacity: 0.9;
}

.reminder-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 8rpx;
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  margin-left: 20rpx;
}

.reminder-btn:active {
  background-color: rgba(255, 255, 255, 0.3);
}

/* 加载更多 */
.load-more {
  display: flex;
  flex-direction: column;
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
  margin-bottom: 20rpx;
}

.loading-text {
  font-size: 24rpx;
  color: #999999;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 40rpx;
}

.empty-icon {
  font-size: 120rpx;
  color: #cccccc;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}
</style>