# 软件设计文档

## 1. 系统架构

### 1.1 整体架构

这是一个纯前端TodoList应用，采用HTML5 + CSS3 + JavaScript技术栈，使用浏览器本地存储（localStorage）进行数据持久化。

```
┌─────────────────────────────────────┐
│          用户界面 (UI)               │
│  ┌─────────────────────────────┐  │
│  │   HTML结构 + CSS样式         │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│        业务逻辑层 (JavaScript)       │
│  ┌─────────────────────────────┐  │
│  │  任务管理模块                │  │
│  │  - 添加任务                  │  │
│  │  - 删除任务                  │  │
│  │  - 编辑任务                  │  │
│  │  - 标记完成                  │  │
│  │  - 过滤任务                  │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│        数据持久化层                 │
│  ┌─────────────────────────────┐  │
│  │  浏览器本地存储              │  │
│  │  (localStorage)             │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

技术栈：
- 前端：HTML5 + CSS3 + JavaScript (ES6+)
- 样式：原生CSS，支持响应式设计
- 数据存储：浏览器localStorage
- 图标：Font Awesome图标库

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| UI模块 | 负责页面布局和样式渲染 | 无 |
| 任务管理模块 | 处理任务的增删改查、状态切换 | 数据存储模块 |
| 数据存储模块 | 负责与localStorage交互，数据持久化 | 无 |
| 过滤模块 | 根据状态过滤显示任务 | 任务管理模块 |

### 1.3 项目目录结构

```
todo-list/
├── index.html          # 主页面
├── style.css           # 样式文件
├── app.js              # 主应用逻辑
├── README.md           # 项目说明
└── assets/             # 静态资源
    └── favicon.ico     # 网站图标
```

## 2. API 设计

由于是纯前端应用，这里定义的是JavaScript模块接口：

### 2.1 数据模型接口

#### Task 对象结构
```javascript
{
  id: number,           // 任务ID（时间戳）
  title: string,        // 任务标题
  description: string,  // 任务描述（可选）
  completed: boolean,   // 完成状态
  priority: string,     // 优先级：low/medium/high
  createdAt: string,    // 创建时间
  updatedAt: string     // 更新时间
}
```

### 2.2 任务管理模块接口

#### 2.2.1 任务操作接口

**函数名称**: `addTask(title, description, priority)`

功能：添加新任务

参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| title | string | 是 | 任务标题 |
| description | string | 否 | 任务描述 |
| priority | string | 否 | 优先级（默认'medium'） |

返回值：新创建的任务对象

**函数名称**: `deleteTask(taskId)`

功能：删除任务

参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | number | 是 | 任务ID |

返回值：boolean（是否删除成功）

**函数名称**: `toggleTaskCompletion(taskId)`

功能：切换任务完成状态

参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | number | 是 | 任务ID |

返回值：更新后的任务对象

**函数名称**: `editTask(taskId, updates)`

功能：编辑任务

参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| taskId | number | 是 | 任务ID |
| updates | object | 是 | 更新字段对象 |

返回值：更新后的任务对象

### 2.3 数据存储模块接口

**函数名称**: `saveTasks(tasks)`

功能：保存任务列表到localStorage

参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| tasks | array | 是 | 任务数组 |

返回值：无

**函数名称**: `loadTasks()`

功能：从localStorage加载任务列表

参数：无

返回值：任务数组

### 2.4 过滤模块接口

**函数名称**: `filterTasks(filterType)`

功能：根据类型过滤任务

参数：
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| filterType | string | 是 | 过滤类型：all/active/completed |

返回值：过滤后的任务数组

## 3. 数据库设计

由于是纯前端应用，使用浏览器localStorage存储数据：

### 3.1 存储结构

**存储键名**: `todoListTasks`

**存储格式**: JSON字符串

**示例**:
```json
[
  {
    "id": 1672531200000,
    "title": "学习JavaScript",
    "description": "完成ES6学习",
    "completed": false,
    "priority": "high",
    "createdAt": "2023-01-01T10:00:00",
    "updatedAt": "2023-01-01T10:00:00"
  },
  {
    "id": 1672617600000,
    "title": "购物",
    "description": "购买生活用品",
    "completed": true,
    "priority": "medium",
    "createdAt": "2023-01-02T09:00:00",
    "updatedAt": "2023-01-02T15:30:00"
  }
]
```

### 3.2 数据操作

| 操作 | 方法 | 说明 |
|------|------|------|
| 读取 | `localStorage.getItem('todoListTasks')` | 获取任务数据 |
| 保存 | `localStorage.setItem('todoListTasks', JSON.stringify(tasks))` | 保存任务数据 |
| 清空 | `localStorage.removeItem('todoListTasks')` | 清空所有任务 |

## 4. 核心模块设计

### 4.1 UI模块

**职责**：负责页面渲染和用户交互

**核心功能**：
- 渲染任务列表
- 处理表单提交
- 绑定事件监听器
- 显示欢迎信息"hello world"

**关键函数**：
- `renderTaskList(tasks)` - 渲染任务列表
- `renderWelcomeMessage()` - 显示欢迎信息
- `bindEventListeners()` - 绑定所有事件监听器

### 4.2 任务管理模块

**职责**：管理任务的生命周期和状态

**核心流程**：
```
添加任务流程：
1. 验证输入数据
2. 生成任务ID（时间戳）
3. 创建任务对象
4. 添加到任务数组
5. 保存到localStorage
6. 重新渲染UI

删除任务流程：
1. 根据ID查找任务索引
2. 从数组中移除
3. 保存到localStorage
4. 重新渲染UI
```

### 4.3 数据存储模块

**职责**：处理数据持久化

**实现要点**：
- 使用try-catch处理localStorage操作异常
- 提供默认值处理空数据情况
- 数据序列化/反序列化

### 4.4 过滤模块

**职责**：根据状态过滤任务

**过滤逻辑**：
- `all`: 显示所有任务
- `active`: 显示未完成的任务（completed: false）
- `completed`: 显示已完成的任务（completed: true）

## 5. 页面布局设计

### 5.1 HTML结构
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TodoList 任务管理</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="container">
        <!-- 欢迎信息区域 -->
        <div class="welcome-section">
            <h1 id="welcome-message">hello world</h1>
        </div>
        
        <!-- 头部区域 -->
        <header class="header">
            <h1>TodoList 任务管理</h1>
            <p class="subtitle">高效管理您的日常任务</p>
        </header>
        
        <!-- 添加任务表单 -->
        <div class="add-task-section">
            <form id="add-task-form">
                <div class="form-group">
                    <input type="text" id="task-title" placeholder="输入任务标题..." required>
                    <textarea id="task-description" placeholder="任务描述（可选）..."></textarea>
                </div>
                <div class="form-group">
                    <select id="task-priority">
                        <option value="low">低优先级</option>
                        <option value="medium" selected>中优先级</option>
                        <option value="high">高优先级</option>
                    </select>
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-plus"></i> 添加任务
                    </button>
                </div>
            </form>
        </div>
        
        <!-- 过滤选项 -->
        <div class="filter-section">
            <div class="filter-buttons">
                <button class="filter-btn active" data-filter="all">全部任务</button>
                <button class="filter-btn" data-filter="active">进行中</button>
                <button class="filter-btn" data-filter="completed">已完成</button>
            </div>
            <div class="stats">
                <span id="task-count">0 个任务</span>
                <button id="clear-completed" class="btn btn-secondary">清除已完成</button>
            </div>
        </div>
        
        <!-- 任务列表 -->
        <div class="task-list-section">
            <ul id="task-list">
                <!-- 任务项将通过JavaScript动态生成 -->
            </ul>
            <div id="empty-state" class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>暂无任务，添加一个任务开始吧！</p>
            </div>
        </div>
        
        <!-- 页脚 -->
        <footer class="footer">
            <p>© 2023 TodoList 任务管理应用 | 纯前端实现</p>
        </footer>
    </div>
    
    <script src="app.js"></script>
</body>
</html>
```

### 5.2 响应式设计断点
- 移动端: < 768px
- 平板: 768px - 1024px
- 桌面端: > 1024px

### 5.3 颜色方案
- 主色调: #4a6fa5 (蓝色)
- 成功色: #28a745 (绿色)
- 警告色: #ffc107 (黄色)
- 危险色: #dc3545 (红色)
- 背景色: #f8f9fa (浅灰)
- 文字色: #333333 (深灰)

## 6. 错误处理设计

### 6.1 输入验证
- 任务标题不能为空
- 任务标题长度限制（最大100字符）
- 任务描述长度限制（最大500字符）

### 6.2 存储异常处理
- localStorage配额不足处理
- 数据格式错误处理
- 浏览器不支持localStorage的降级方案

### 6.3 用户反馈
- 操作成功提示
- 操作失败提示
- 加载状态指示