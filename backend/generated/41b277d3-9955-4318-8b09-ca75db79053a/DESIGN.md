# 软件设计文档

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                       前端界面 (Vue.js)                      │
├─────────────────────────────────────────────────────────────┤
│                    API网关 (Spring Cloud Gateway)            │
├─────────────────────────────────────────────────────────────┤
│                   认证服务         │       业务服务           │
│                 (Auth Service)    │    (Word Service)       │
├─────────────────────────────────────────────────────────────┤
│                   缓存层 (Redis)   │      数据库 (MySQL)      │
└─────────────────────────────────────────────────────────────┘
```

技术栈：
- 前端：Vue.js 3 + Element Plus + Axios
- 后端：Spring Boot 3.2 + Spring Security + JWT
- 数据库：MySQL 8.0 + Redis 7.0
- 缓存：Redis（用于会话缓存和热门单词缓存）
- 消息队列：RabbitMQ（可选，用于异步处理学习记录）
- 部署：Docker + Docker Compose

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| auth-module | 用户认证、注册、登录、权限管理 | 无 |
| user-module | 用户信息管理、学习统计 | auth-module |
| word-module | 单词库管理、单词CRUD、单词导入导出 | 无 |
| study-module | 学习模式实现、学习记录管理 | word-module, user-module |
| review-module | 复习系统、遗忘曲线算法 | study-module, word-module |
| test-module | 测试评估、成绩记录 | word-module, user-module |
| common-module | 通用工具类、异常处理、配置 | 无 |

### 1.3 项目目录结构

```
word-master/
├── word-master-api/              # API接口定义
├── word-master-common/           # 公共模块
├── word-master-auth/             # 认证模块
├── word-master-user/             # 用户模块
├── word-master-word/             # 单词模块
├── word-master-study/            # 学习模块
├── word-master-review/           # 复习模块
├── word-master-test/             # 测试模块
├── word-master-gateway/          # API网关
├── docker-compose.yml            # Docker编排
├── README.md                     # 项目说明
└── pom.xml                       # Maven父工程
```

## 2. API 设计

### 2.1 接口规范

**Base URL**: `/api/v1`

**通用规范**：
- 认证方式：Bearer Token (JWT)
- 通用请求头：`Content-Type: application/json`
- 通用响应格式：
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1640995200000
}
```

**错误码规范**：
- 0: 成功
- 1000-1999: 用户相关错误
- 2000-2999: 单词相关错误
- 3000-3999: 学习相关错误
- 4000-4999: 系统错误

### 2.2 接口列表

#### 2.2.1 认证模块

**接口名称**：POST `/auth/register`

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |
| email | string | 否 | 邮箱 |

请求示例：
```json
{
  "username": "user123",
  "password": "password123",
  "email": "user@example.com"
}
```

响应示例：
```json
{
  "code": 0,
  "message": "注册成功",
  "data": {
    "userId": 1,
    "username": "user123"
  }
}
```

**接口名称**：POST `/auth/login`

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| username | string | 是 | 用户名 |
| password | string | 是 | 密码 |

响应示例：
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "userId": 1,
    "username": "user123",
    "expiresIn": 86400
  }
}
```

#### 2.2.2 单词模块

**接口名称**：GET `/words`

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| page | integer | 否 | 页码，默认1 |
| size | integer | 否 | 每页大小，默认20 |
| keyword | string | 否 | 搜索关键词 |
| difficulty | string | 否 | 难度级别 |

响应示例：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "size": 20,
    "list": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "v. 放弃，遗弃",
        "example": "He abandoned his car and ran.",
        "difficulty": "medium",
        "tags": ["CET4", "高频"]
      }
    ]
  }
}
```

**接口名称**：POST `/words/import`

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| file | file | 是 | Excel/CSV文件 |
| wordbookId | integer | 否 | 单词库ID |

#### 2.2.3 学习模块

**接口名称**：POST `/study/start`

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| mode | string | 是 | 学习模式（new/review/test） |
| wordbookId | integer | 否 | 单词库ID |
| count | integer | 否 | 单词数量，默认20 |

响应示例：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "sessionId": "session_123456",
    "words": [
      {
        "id": 1,
        "word": "abandon",
        "phonetic": "/əˈbændən/",
        "definition": "v. 放弃，遗弃",
        "options": ["放弃", "接受", "开始", "结束"]
      }
    ],
    "total": 20,
    "current": 1
  }
}
```

**接口名称**：POST `/study/submit`

请求参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| sessionId | string | 是 | 学习会话ID |
| wordId | integer | 是 | 单词ID |
| answer | string | 是 | 用户答案 |
| isCorrect | boolean | 是 | 是否正确 |

#### 2.2.4 复习模块

**接口名称**：GET `/review/schedule`

响应示例：
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "todayReviewCount": 50,
    "reviewSchedule": [
      {
        "date": "2024-01-01",
        "count": 20,
        "completed": 15
      }
    ],
    "forgettingCurve": {
      "retentionRate": 0.85,
      "nextReviewTime": "2024-01-02 10:00:00"
    }
  }
}
```

## 3. 数据库设计

### 3.1 ER 图（文字版）

```
用户(User) --(1:n)--> 单词库(Wordbook)
用户(User) --(1:n)--> 学习记录(StudyRecord)
单词库(Wordbook) --(1:n)--> 单词(Word)
单词(Word) --(1:n)--> 学习记录(StudyRecord)
单词(Word) --(1:n)--> 复习计划(ReviewPlan)
```

### 3.2 表结构

#### 表名：`user`

| 字段名 | 类型 | 主键 | 索引 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | PK | - | 用户ID |
| username | VARCHAR(50) | - | UNIQUE | 用户名 |
| password | VARCHAR(100) | - | - | 密码（加密） |
| email | VARCHAR(100) | - | INDEX | 邮箱 |
| nickname | VARCHAR(50) | - | - | 昵称 |
| avatar | VARCHAR(200) | - | - | 头像URL |
| level | INT | - | - | 用户等级 |
| experience | INT | - | - | 经验值 |
| streak_days | INT | - | - | 连续学习天数 |
| created_at | DATETIME | - | - | 创建时间 |
| updated_at | DATETIME | - | - | 更新时间 |

DDL：
```sql
CREATE TABLE `user` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(50) NOT NULL UNIQUE,
  `password` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100),
  `nickname` VARCHAR(50),
  `avatar` VARCHAR(200),
  `level` INT DEFAULT 1,
  `experience` INT DEFAULT 0,
  `streak_days` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 表名：`wordbook`

| 字段名 | 类型 | 主键 | 索引 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | PK | - | 单词库ID |
| name | VARCHAR(100) | - | INDEX | 单词库名称 |
| description | TEXT | - | - | 描述 |
| cover_image | VARCHAR(200) | - | - | 封面图片 |
| word_count | INT | - | - | 单词数量 |
| difficulty | VARCHAR(20) | - | - | 难度级别 |
| tags | VARCHAR(200) | - | - | 标签（逗号分隔） |
| user_id | BIGINT | - | FK | 创建用户ID |
| is_public | TINYINT(1) | - | - | 是否公开 |
| created_at | DATETIME | - | - | 创建时间 |

DDL：
```sql
CREATE TABLE `wordbook` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `cover_image` VARCHAR(200),
  `word_count` INT DEFAULT 0,
  `difficulty` VARCHAR(20),
  `tags` VARCHAR(200),
  `user_id` BIGINT NOT NULL,
  `is_public` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_name` (`name`),
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 表名：`word`

| 字段名 | 类型 | 主键 | 索引 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | PK | - | 单词ID |
| word | VARCHAR(100) | - | UNIQUE | 单词 |
| phonetic | VARCHAR(100) | - | - | 音标 |
| definition | TEXT | - | - | 释义 |
| example | TEXT | - | - | 例句 |
| difficulty | VARCHAR(20) | - | INDEX | 难度级别 |
| tags | VARCHAR(200) | - | - | 标签（逗号分隔） |
| wordbook_id | BIGINT | - | FK | 所属单词库ID |
| created_at | DATETIME | - | - | 创建时间 |

DDL：
```sql
CREATE TABLE `word` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `word` VARCHAR(100) NOT NULL UNIQUE,
  `phonetic` VARCHAR(100),
  `definition` TEXT NOT NULL,
  `example` TEXT,
  `difficulty` VARCHAR(20),
  `tags` VARCHAR(200),
  `wordbook_id` BIGINT NOT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_word` (`word`),
  INDEX `idx_difficulty` (`difficulty`),
  INDEX `idx_wordbook_id` (`wordbook_id`),
  FULLTEXT INDEX `idx_definition` (`definition`),
  FOREIGN KEY (`wordbook_id`) REFERENCES `wordbook`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 表名：`study_record`

| 字段名 | 类型 | 主键 | 索引 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | PK | - | 记录ID |
| user_id | BIGINT | - | FK | 用户ID |
| word_id | BIGINT | - | FK | 单词ID |
| session_id | VARCHAR(50) | - | INDEX | 学习会话ID |
| is_correct | TINYINT(1) | - | - | 是否正确 |
| answer | VARCHAR(200) | - | - | 用户答案 |
| response_time | INT | - | - | 响应时间（毫秒） |
| study_mode | VARCHAR(20) | - | - | 学习模式 |
| created_at | DATETIME | - | - | 学习时间 |

DDL：
```sql
CREATE TABLE `study_record` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `word_id` BIGINT NOT NULL,
  `session_id` VARCHAR(50),
  `is_correct` TINYINT(1) NOT NULL,
  `answer` VARCHAR(200),
  `response_time` INT,
  `study_mode` VARCHAR(20),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_word_id` (`word_id`),
  INDEX `idx_session_id` (`session_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`word_id`) REFERENCES `word`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### 表名：`review_plan`

| 字段名 | 类型 | 主键 | 索引 | 说明 |
|--------|------|------|------|------|
| id | BIGINT | PK | - | 计划ID |
| user_id | BIGINT | - | FK | 用户ID |
| word_id | BIGINT | - | FK | 单词ID |
| next_review_time | DATETIME | - | INDEX | 下次复习时间 |
| interval_days | INT | - | - | 间隔天数 |
| ease_factor | DECIMAL(4,2) | - | - | 易度因子 |
| review_count | INT | - | - | 复习次数 |
| retention_rate | DECIMAL(4,3) | - | - | 记忆保留率 |
| created_at | DATETIME | - | - | 创建时间 |
| updated_at | DATETIME | - | - | 更新时间 |

DDL：
```sql
CREATE TABLE `review_plan` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` BIGINT NOT NULL,
  `word_id` BIGINT NOT NULL,
  `next_review_time` DATETIME NOT NULL,
  `interval_days` INT DEFAULT 1,
  `ease_factor` DECIMAL(4,2) DEFAULT 2.5,
  `review_count` INT DEFAULT 0,
  `retention_rate` DECIMAL(4,3) DEFAULT 0.0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_next_review_time` (`next_review_time`),
  UNIQUE KEY `uk_user_word` (`user_id`, `word_id`),
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`word_id`) REFERENCES `word`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 4. 核心模块设计

### 4.1 认证模块 (Auth Module)

**职责**：处理用户注册、登录、JWT令牌生成与验证

**核心接口**：
- `AuthService.register(UserRegisterDTO) -> UserVO`
- `AuthService.login(LoginDTO) -> LoginResultVO`
- `AuthService.validateToken(String) -> UserDetails`

**流程**：
```
用户注册/登录 -> 验证凭证 -> 生成JWT -> 返回令牌
```

### 4.2 学习模块 (Study Module)

**职责**：管理学习会话、记录学习结果、应用遗忘曲线算法

**核心接口**：
- `StudyService.startSession(StudyStartDTO) -> StudySessionVO`
- `StudyService.submitAnswer(AnswerDTO) -> StudyResultVO`
- `StudyService.calculateNextReview(Word, boolean) -> ReviewPlan`

**遗忘曲线算法**：
```java
public ReviewPlan updateReviewPlan(ReviewPlan plan, boolean isCorrect) {
    if (isCorrect) {
        plan.setIntervalDays((int)(plan.getIntervalDays() * plan.getEaseFactor()));
        plan.setEaseFactor(Math.max(1.3, plan.getEaseFactor() + 0.1));
    } else {
        plan.setIntervalDays(1);
        plan.setEaseFactor(Math.max(1.3, plan.getEaseFactor() - 0.2));
    }
    plan.setNextReviewTime(LocalDateTime.now().plusDays(plan.getIntervalDays()));
    return plan;
}
```

### 4.3 复习模块 (Review Module)

**职责**：根据遗忘曲线生成复习计划、提醒用户复习

**核心接口**：
- `ReviewService.getTodayReviewWords(Long userId) -> List<Word>`
- `ReviewService.generateReviewPlan(Long userId, Long wordId) -> ReviewPlan`
- `ReviewService.getReviewSchedule(Long userId) -> ReviewScheduleVO`

**流程**：
```
查询需要复习的单词 -> 应用SM-2算法 -> 生成复习计划 -> 返回给用户
```

### 4.4 缓存策略

**Redis缓存设计**：
- 用户会话：`session:{userId}` (TTL: 7天)
- 热门单词：`hot:words:{difficulty}` (TTL: 1小时)
- 用户学习统计：`stats:{userId}:{date}` (TTL: 24小时)
- 分布式锁：`lock:study:{userId}` (TTL: 30秒)

## 5. 部署配置

### 5.1 Docker Compose 配置

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root123
      MYSQL_DATABASE: word_master
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
  
  redis:
    image: redis:7.0-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
  
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/word_master
      SPRING_REDIS_HOST: redis
    depends_on:
      - mysql
      - redis

volumes:
  mysql_data:
  redis_data:
```

### 5.2 应用配置文件

**application.yml**:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/word_master
    username: root
    password: root123
    driver-class-name: com.mysql.cj.jdbc.Driver
  
  redis:
    host: localhost
    port: 6379
    password: 
    database: 0
  
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 10MB

jwt:
  secret: word-master-secret-key-2024
  expiration: 86400000  # 24小时
  header: Authorization

app:
  study:
    daily-new-words-limit: 50
    review-words-per-day: 100
    session-timeout: 1800  # 30分钟
```

## 6. 安全设计

### 6.1 认证安全
- 密码使用BCrypt加密存储
- JWT令牌包含用户ID和权限信息
- 令牌刷新机制防止长时间未操作

### 6.2 API安全
- 敏感接口需要认证
- 防止SQL注入（使用JPA参数化查询）
- 防止XSS攻击（输入输出过滤）
- 接口限流（使用Redis实现）

### 6.3 数据安全
- 敏感数据加密存储
- 数据库备份策略
- 操作日志记录