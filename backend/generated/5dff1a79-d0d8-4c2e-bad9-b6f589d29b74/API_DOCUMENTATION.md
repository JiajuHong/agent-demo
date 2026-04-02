# WordMaster API 文档

## 📋 文档概述

本文档详细描述了WordMaster背单词小程序的所有API接口。所有接口均遵循RESTful设计原则，使用JSON格式进行数据交换。

## 🔑 基础信息

### 基础URL
```
http://localhost:8080/api/v1
```

### 请求头
```http
Content-Type: application/json
Authorization: Bearer {token}  # 需要认证的接口
```

### 响应格式
```json
{
  "code": 0,          // 状态码，0表示成功
  "message": "success", // 响应消息
  "data": {}          // 响应数据
}
```

### 错误码说明
| 错误码 | 说明 | HTTP状态码 |
|--------|------|------------|
| 0 | 成功 | 200 |
| 400 | 请求参数错误 | 400 |
| 401 | 未授权或Token过期 | 401 |
| 403 | 权限不足 | 403 |
| 404 | 资源不存在 | 404 |
| 500 | 服务器内部错误 | 500 |

## 🔐 认证接口

### 1. 用户注册
**POST** `/auth/register`

注册新用户。

**请求参数：**
```json
{
  "username": "string",  // 用户名，必填
  "password": "string",  // 密码，必填
  "email": "string",     // 邮箱，可选
  "avatar": "string"     // 头像URL，可选
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

### 2. 用户登录
**POST** `/auth/login`

用户登录，获取访问令牌。

**请求参数：**
```json
{
  "username": "string",  // 用户名
  "password": "string"   // 密码
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "dailyGoal": 20,
      "totalStudied": 150,
      "streakDays": 7
    }
  }
}
```

### 3. 用户登出
**POST** `/auth/logout`

用户登出，使当前Token失效。

**请求头：**
```http
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "登出成功",
  "data": null
}
```

## 👤 用户接口

### 1. 获取用户信息
**GET** `/users/profile`

获取当前登录用户的详细信息。

**请求头：**
```http
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "dailyGoal": 20,
    "totalStudied": 150,
    "streakDays": 7,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-08T00:00:00"
  }
}
```

### 2. 更新用户信息
**PUT** `/users/profile`

更新用户信息。

**请求头：**
```http
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "email": "new@example.com",      // 可选
  "avatar": "new_avatar_url",      // 可选
  "dailyGoal": 30                  // 可选，每日学习目标
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "new@example.com",
    "avatar": "new_avatar_url",
    "dailyGoal": 30,
    "updatedAt": "2024-01-08T12:00:00"
  }
}
```

### 3. 修改密码
**PUT** `/users/password`

修改用户密码。

**请求头：**
```http
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "oldPassword": "old_password",
  "newPassword": "new_password"
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null
}
```

## 📚 单词接口

### 1. 获取单词详情
**GET** `/words/{id}`

根据ID获取单词详细信息。

**请求参数：**
- `id`: 单词ID（路径参数）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "word": "abandon",
    "phonetic": "/əˈbændən/",
    "definition": "v. 放弃，抛弃；n. 放任，狂热",
    "example": "He abandoned his car and continued on foot.",
    "audioUrl": "https://dict.youdao.com/dictvoice?audio=abandon",
    "difficulty": 2,
    "dictionaryId": 1,
    "createdAt": "2024-01-01T00:00:00"
  }
}
```

### 2. 搜索单词
**GET** `/words/search`

搜索单词。

**查询参数：**
- `keyword`: 搜索关键词（必填）
- `page`: 页码，默认1（可选）
- `size`: 每页大小，默认10（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 25,
    "page": 1,
    "size": 10,
    "words": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "v. 放弃，抛弃；n. 放任，狂热"
      },
      {
        "id": 2,
        "word": "ability",
        "phonetic": "/əˈbɪləti/",
        "definition": "n. 能力，才能"
      }
    ]
  }
}
```

### 3. 随机获取单词
**GET** `/words/random`

随机获取指定数量的单词。

**查询参数：**
- `count`: 单词数量，默认5（可选）
- `difficulty`: 难度级别（1-5），可选
- `dictionaryId`: 词库ID，可选

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "word": "abandon",
      "phonetic": "/əˈbændən/",
      "definition": "v. 放弃，抛弃；n. 放任，狂热"
    },
    {
      "id": 2,
      "word": "ability",
      "phonetic": "/əˈbɪləti/",
      "definition": "n. 能力，才能"
    }
  ]
}
```

### 4. 从网易API获取单词
**POST** `/words/fetch`

从网易有道API获取单词详细信息并保存到数据库。

**请求头：**
```http
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "word": "example",          // 单词
  "dictionaryId": 1          // 词库ID
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 100,
    "word": "example",
    "phonetic": "/ɪɡˈzɑːmpl/",
    "definition": "n. 例子，榜样；v. 举例说明",
    "example": "Can you give me an example?",
    "audioUrl": "https://dict.youdao.com/dictvoice?audio=example",
    "difficulty": 1,
    "dictionaryId": 1
  }
}
```

## 📖 学习接口

### 1. 学习单词
**POST** `/study/learn`

标记单词为已学习。

**请求头：**
```http
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "wordId": 1,                // 单词ID
  "masteryLevel": 3,          // 掌握程度（1-5）
  "studyMode": "card"         // 学习模式：card/choice/spelling
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "学习成功",
  "data": {
    "id": 1,
    "userId": 1,
    "wordId": 1,
    "masteryLevel": 3,
    "reviewCount": 1,
    "nextReviewTime": "2024-01-02T10:00:00",
    "createdAt": "2024-01-01T10:00:00"
  }
}
```

### 2. 复习单词
**POST** `/study/review`

复习已学习的单词。

**请求头：**
```http
Authorization: Bearer {token}
```

**请求参数：**
```json
{
  "studyRecordId": 1,         // 学习记录ID
  "masteryLevel": 4           // 新的掌握程度（1-5）
}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "复习成功",
  "data": {
    "id": 1,
    "userId": 1,
    "wordId": 1,
    "masteryLevel": 4,
    "reviewCount": 2,
    "nextReviewTime": "2024-01-05T10:00:00",
    "updatedAt": "2024-01-02T10:00:00"
  }
}
```

### 3. 获取复习列表
**GET** `/study/review-list`

获取需要复习的单词列表。

**请求头：**
```http
Authorization: Bearer {token}
```

**查询参数：**
- `page`: 页码，默认1（可选）
- `size`: 每页大小，默认10（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 15,
    "page": 1,
    "size": 10,
    "records": [
      {
        "id": 1,
        "word": {
          "id": 1,
          "word": "abandon",
          "phonetic": "/əˈbændən/",
          "definition": "v. 放弃，抛弃；n. 放任，狂热"
        },
        "masteryLevel": 3,
        "reviewCount": 1,
        "nextReviewTime": "2024-01-02T10:00:00"
      }
    ]
  }
}
```

### 4. 获取今日学习计划
**GET** `/study/today-plan`

获取今日学习计划（新单词+复习单词）。

**请求头：**
```http
Authorization: Bearer {token}
```

**查询参数：**
- `newCount`: 新单词数量，默认10（可选）
- `reviewCount`: 复习单词数量，默认20（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "newWords": [
      {
        "id": 100,
        "word": "example",
        "phonetic": "/ɪɡˈzɑːmpl/",
        "definition": "n. 例子，榜样"
      }
    ],
    "reviewWords": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "v. 放弃，抛弃",
        "masteryLevel": 3,
        "reviewCount": 1
      }
    ],
    "total": 30,
    "newCount": 10,
    "reviewCount": 20
  }
}
```

## 📂 词库接口

### 1. 获取所有词库
**GET** `/dictionaries`

获取所有词库列表。

**查询参数：**
- `page`: 页码，默认1（可选）
- `size`: 每页大小，默认10（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 5,
    "page": 1,
    "size": 10,
    "dictionaries": [
      {
        "id": 1,
        "name": "四级核心词汇",
        "description": "大学英语四级考试核心词汇",
        "wordCount": 500,
        "difficulty": 2,
        "coverImage": "https://example.com/cet4.jpg",
        "createdAt": "2024-01-01T00:00:00"
      },
      {
        "id": 2,
        "name": "六级高频词汇",
        "description": "大学英语六级考试高频词汇",
        "wordCount": 300,
        "difficulty": 3,
        "coverImage": "https://example.com/cet6.jpg",
        "createdAt": "2024-01-01T00:00:00"
      }
    ]
  }
}
```

### 2. 获取词库详情
**GET** `/dictionaries/{id}`

根据ID获取词库详细信息。

**请求参数：**
- `id`: 词库ID（路径参数）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "name": "四级核心词汇",
    "description": "大学英语四级考试核心词汇",
    "wordCount": 500,
    "difficulty": 2,
    "coverImage": "https://example.com/cet4.jpg",
    "createdAt": "2024-01-01T00:00:00",
    "userProgress": {
      "studiedCount": 150,
      "masteredCount": 100,
      "progress": 30.0
    }
  }
}
```

### 3. 获取词库单词
**GET** `/dictionaries/{id}/words`

获取指定词库的单词列表。

**请求参数：**
- `id`: 词库ID（路径参数）

**查询参数：**
- `page`: 页码，默认1（可选）
- `size`: 每页大小，默认20（可选）
- `difficulty`: 难度筛选（1-5），可选
- `learned`: 是否已学习（true/false），可选

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 500,
    "page": 1,
    "size": 20,
    "words": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "v. 放弃，抛弃；n. 放任，狂热",
        "difficulty": 2,
        "learned": true,
        "masteryLevel": 3
      },
      {
        "id": 2,
        "word": "ability",
        "phonetic": "/əˈbɪləti/",
        "definition": "n. 能力，才能",
        "difficulty": 1,
        "learned": false,
        "masteryLevel": null
      }
    ]
  }
}
```

## 📊 统计接口

### 1. 获取每日统计
**GET** `/stats/daily`

获取每日学习统计。

**请求头：**
```http
Authorization: Bearer {token}
```

**查询参数：**
- `date`: 日期（格式：yyyy-MM-dd），默认今天（可选）
- `days`: 获取最近多少天的数据，默认7（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "date": "2024-01-08",
    "newWordsCount": 10,
    "reviewWordsCount": 15,
    "totalTime": 45,
    "masteryDistribution": {
      "level1": 2,
      "level2": 3,
      "level3": 5,
      "level4": 3,
      "level5": 2
    },
    "dailyGoal": 20,
    "goalCompletion": 75.0
  }
}
```

### 2. 获取每周统计
**GET** `/stats/weekly`

获取每周学习统计。

**请求头：**
```http
Authorization: Bearer {token}
```

**查询参数：**
- `year`: 年份，默认今年（可选）
- `week`: 周数，默认本周（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "year": 2024,
    "week": 2,
    "totalNewWords": 70,
    "totalReviewWords": 105,
    "totalTime": 315,
    "averageDailyTime": 45,
    "streakDays": 7,
    "daysData": [
      {
        "date": "2024-01-01",
        "newWordsCount": 10,
        "reviewWordsCount": 15
      }
    ]
  }
}
```

### 3. 获取每月统计
**GET** `/stats/monthly`

获取每月学习统计。

**请求头：**
```http
Authorization: Bearer {token}
```

**查询参数：**
- `year`: 年份，默认今年（可选）
- `month`: 月份（1-12），默认本月（可选）

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "year": 2024,
    "month": 1,
    "totalNewWords": 300,
    "totalReviewWords": 450,
    "totalTime": 1350,
    "averageDailyTime": 45,
    "streakDays": 7,
    "masteryProgress": 25.0
  }
}
```

### 4. 获取学习概览
**GET** `/stats/overview`

获取学习概览数据。

**请求头：**
```http
Authorization: Bearer {token}
```

**响应示例：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalStudied": 150,
    "totalMastered": 100,
    "streakDays": 7,
    "currentStreak": 7,
    "longestStreak": 10,
    "dailyGoal": 20,
    "todayProgress": 15,
    "recentActivity": [
      {
        "date": "2024-01-07",
        "newWordsCount": 10,
        "reviewWordsCount": 15
      },
      {
        "date": "2024-01-06",
        "newWordsCount": 8,
        "reviewWordsCount": 12
      }
    ]
  }
}
```

## 🔄 WebSocket 接口

### 实时学习进度推送
**WebSocket** `/ws/learning-progress`

实时推送学习进度更新。

**连接URL：**
```
ws://localhost:8080/api/v1/ws/learning-progress?token={token}
```

**消息格式：**
```json
{
  "type": "progress_update",
  "data": {
    "userId": 1,
    "wordId": 1,
    "masteryLevel": 3,
    "timestamp": "2024-01-08T10:00:00"
  }
}
```

## 📝 使用示例

### 完整学习流程示例

```javascript
// 1. 用户登录
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'test123'
  })
});

const { token, user } = await loginResponse.json();

// 2. 获取今日学习计划
const planResponse = await fetch('/api/v1/study/today-plan', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const plan = await planResponse.json();

// 3. 学习单词
for (const word of plan.data.newWords) {
  const learnResponse = await fetch('/api/v1/study/learn', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wordId: word.id,
      masteryLevel: 3,
      studyMode: 'card'
    })
  });
  
  const result = await learnResponse.json();
  console.log(`学习单词: ${word.word}, 掌握程度: ${result.data.masteryLevel}`);
}

// 4. 获取统计信息
const statsResponse = await fetch('/api/v1/stats/overview', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const stats = await statsResponse.json();
console.log(`今日进度: ${stats.data.todayProgress}/${stats.data.dailyGoal}`);
```

## 🔧 接口测试

### 使用curl测试
```bash
# 测试登录接口
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"test123"}'

# 测试获取单词详情（需要先获取token）
TOKEN="your_jwt_token"
curl -X GET http://localhost:8080/api/v1/words/1 \
  -H "Authorization: Bearer $TOKEN"

# 测试学习单词
curl -X POST http://localhost:8080/api/v1/study/learn \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"wordId":1,"masteryLevel":3,"studyMode":"card"}'
```

### 使用Postman测试
1. 导入Postman Collection（可导出为JSON）
2. 设置环境变量：
   - `base_url`: http://localhost:8080/api/v1
   - `token`: 登录后获取的JWT Token
3. 按顺序执行请求

## 📱 前端集成示例

### Vue.js 集成示例
```vue
<template>
  <div>
    <h2>今日学习计划</h2>
    <div v-for="word in plan.newWords" :key="word.id">
      <p>{{ word.word }} - {{ word.definition }}</p>
      <button @click="learnWord(word.id)">学习</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import api from '@/api/request'

export default {
  setup() {
    const plan = ref({ newWords: [], reviewWords: [] })
    
    const fetchPlan = async () => {
      try {
        const response = await api.get('/study/today-plan')
        plan.value = response.data
      } catch (error) {
        console.error('获取学习计划失败:', error)
      }
    }
    
    const learnWord = async (wordId) => {
      try {
        await api.post('/study/learn', {
          wordId,
          masteryLevel: 3,
          studyMode: 'card'
        })
        alert('学习成功！')
      } catch (error) {
        console.error('学习失败:', error)
      }
    }
    
    onMounted(() => {
      fetchPlan()
    })
    
    return { plan, learnWord }
  }
}
</script>
```

## 🚨 注意事项

### 1. 请求频率限制
- 认证接口：每分钟最多10次
- 学习接口：每分钟最多60次
- 统计接口：每分钟最多30次

### 2. Token有效期
- 访问Token：7天
- 刷新Token：30天（如需）

### 3. 数据验证
- 所有输入参数都会进行验证
- 必填字段不能为空
- 参数类型必须正确

### 4. 错误处理
- 客户端应处理所有可能的错误
- 网络错误应重试机制
- Token过期应自动刷新

---

**API版本**: v1.0  
**最后更新**: 2024-01-08  
**维护者**: WordMaster开发团队  

如有问题或建议，请提交Issue或联系开发团队。