# 软件设计文档

## 1. 系统架构

### 1.1 整体架构

这是一个纯前端的TodoList应用，采用单页面架构，所有数据存储在浏览器本地。

技术栈：
- 前端：HTML5 + CSS3 + JavaScript (ES6)
- 存储：浏览器 localStorage
- 无后端服务

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| UI模块 | 负责界面渲染和用户交互 | 无 |
| 数据管理模块 | 负责任务数据的增删改查 | 无 |
| 存储模块 | 负责与localStorage的交互 | 无 |

### 1.3 项目目录结构

```
todolist/
├── index.html          # 主页面
├── style.css          # 样式文件
├── app.js             # 主应用逻辑
└── README.md          # 项目说明
```

## 2. API 设计

由于是纯前端应用，这里定义的是JavaScript模块接口：

### 2.1 数据管理模块接口

#### 2.1.1 TaskManager 类

**构造函数**：`new TaskManager()`

**方法列表**：

1. **addTask(taskText)**
   - 功能：添加新任务
   - 参数：`taskText` (string) - 任务文本
   - 返回值：`boolean` - 是否添加成功

2. **getAllTasks()**
   - 功能：获取所有任务
   - 参数：无
   - 返回值：`Array<Object>` - 任务列表

3. **toggleTask(taskId)**
   - 功能：切换任务完成状态
   - 参数：`taskId` (number) - 任务ID
   - 返回值：`boolean` - 是否切换成功

4. **deleteTask(taskId)**
   - 功能：删除任务
   - 参数：`taskId` (number) - 任务ID
   - 返回值：`boolean` - 是否删除成功

5. **saveTasks()**
   - 功能：保存任务到localStorage
   - 参数：无
   - 返回值：无

6. **loadTasks()**
   - 功能：从localStorage加载任务
   - 参数：无
   - 返回值：`Array<Object>` - 任务列表

### 2.2 任务数据结构

```javascript
{
  id: number,           // 任务ID（自增）
  text: string,         // 任务文本
  completed: boolean,   // 是否完成
  createdAt: number     // 创建时间戳
}
```

## 3. 数据库设计

由于使用localStorage，这里定义存储结构：

### 3.1 存储结构

**键名**：`todolist_tasks`

**存储格式**：JSON字符串

**数据结构**：
```json
{
  "lastId": 1,
  "tasks": [
    {
      "id": 1,
      "text": "示例任务",
      "completed": false,
      "createdAt": 1630000000000
    }
  ]
}
```

## 4. 核心模块设计

### 4.1 UI模块

**职责**：负责界面渲染和事件绑定

**主要函数**：
- `renderTaskList(tasks)` - 渲染任务列表
- `clearInput()` - 清空输入框
- `bindEvents()` - 绑定事件监听器

**流程**：
```
用户输入任务文本 → 点击添加按钮 → 调用TaskManager.addTask() → 保存到localStorage → 重新渲染列表
```

### 4.2 TaskManager模块

**职责**：管理任务数据

**核心逻辑**：
```javascript
class TaskManager {
  constructor() {
    this.tasks = [];
    this.lastId = 0;
    this.loadTasks();
  }
  
  // 添加任务
  addTask(text) {
    if (!text.trim()) return false;
    
    const task = {
      id: ++this.lastId,
      text: text.trim(),
      completed: false,
      createdAt: Date.now()
    };
    
    this.tasks.push(task);
    this.saveTasks();
    return true;
  }
  
  // 其他方法...
}
```

### 4.3 存储模块

**职责**：处理localStorage的读写

**函数**：
- `saveToStorage(key, data)` - 保存数据
- `loadFromStorage(key)` - 加载数据

## 5. 界面设计

### 5.1 布局结构

```
+-----------------------------------+
|          TodoList 标题            |
+-----------------------------------+
| [输入框] [添加按钮]               |
+-----------------------------------+
| 任务列表：                        |
| □ 任务1              [删除按钮]   |
| ☑ 任务2（已完成）    [删除按钮]   |
| □ 任务3              [删除按钮]   |
+-----------------------------------+
```

### 5.2 样式设计原则

1. **极简风格**：使用基本CSS，无复杂样式
2. **响应式**：适应不同屏幕尺寸
3. **清晰可读**：确保文字和按钮清晰可见
4. **交互反馈**：提供基本的悬停和点击效果

## 6. 错误处理

### 6.1 输入验证
- 空任务不允许添加
- 任务文本长度限制（可选）

### 6.2 存储异常处理
- localStorage不可用时降级处理
- 数据格式错误时重置

## 7. 浏览器兼容性

支持现代浏览器（Chrome, Firefox, Safari, Edge）的最新版本。

## 8. 扩展性考虑

虽然要求极简，但为未来可能的扩展预留接口：
- 任务分类功能
- 任务优先级
- 任务搜索
- 数据导出/导入