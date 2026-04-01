# 软件设计文档

## 1. 系统架构

### 1.1 整体架构
这是一个纯前端单页应用，所有功能在一个HTML文件中实现。

```
[架构图]
┌─────────────────────────────────────┐
│         Todo List Application       │
├─────────────────────────────────────┤
│  HTML (UI结构)                      │
│  CSS  (样式布局)                    │
│  JavaScript (业务逻辑)              │
│  localStorage (数据持久化)          │
└─────────────────────────────────────┘
```

技术栈：
- 前端：HTML5 + CSS3 + Vanilla JavaScript
- 存储：浏览器 localStorage
- 部署：单HTML文件

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| UI模块 | 负责界面渲染和用户交互 | 无 |
| 数据模块 | 负责待办事项的增删改查 | localStorage |
| 存储模块 | 负责数据持久化 | 浏览器API |

### 1.3 项目目录结构

```
todo-app/
├── index.html          # 主HTML文件
├── style.css          # 样式文件
├── script.js          # JavaScript逻辑文件
└── README.md          # 项目说明文档
```

## 2. API 设计

由于是纯前端应用，没有后端API。我们设计以下JavaScript接口：

### 2.1 数据操作接口

#### 2.1.1 TodoService

**职责**：管理待办事项数据

**接口**：
- `getTodos() -> Array<Todo>` - 获取所有待办事项
- `addTodo(title) -> Todo` - 添加待办事项
- `toggleTodo(id) -> Todo` - 切换待办事项状态
- `deleteTodo(id) -> boolean` - 删除待办事项
- `clearCompleted() -> number` - 清除已完成事项

**Todo对象结构**：
```javascript
{
  id: number,           // 唯一标识符
  title: string,        // 待办事项标题
  completed: boolean,   // 是否完成
  createdAt: number     // 创建时间戳
}
```

## 3. 数据库设计

由于使用localStorage，我们设计以下存储结构：

### 3.1 存储结构

**键名**：`todo_app_todos`

**值结构**：
```json
[
  {
    "id": 1,
    "title": "学习JavaScript",
    "completed": false,
    "createdAt": 1634567890123
  },
  {
    "id": 2,
    "title": "完成项目",
    "completed": true,
    "createdAt": 1634567890456
  }
]
```

### 3.2 数据操作

| 操作 | 输入 | 输出 | 说明 |
|------|------|------|------|
| 读取 | 无 | Array<Todo> | 从localStorage读取 |
| 保存 | Array<Todo> | boolean | 保存到localStorage |
| 清空 | 无 | boolean | 清除所有数据 |

## 4. 核心模块设计

### 4.1 UI模块

**职责**：管理用户界面和交互

**主要函数**：
- `renderTodoList(todos)` - 渲染待办事项列表
- `renderTodoItem(todo)` - 渲染单个待办事项
- `bindEvents()` - 绑定事件监听器
- `updateStats(todos)` - 更新统计信息

**界面结构**：
```html
<div class="todo-app">
  <header>
    <h1>待办事项</h1>
    <input type="text" id="new-todo" placeholder="添加新待办事项...">
  </header>
  
  <main>
    <ul id="todo-list">
      <!-- 待办事项列表 -->
    </ul>
  </main>
  
  <footer>
    <div class="stats">
      <span id="total-count">0</span> 个待办事项
      <span id="completed-count">0</span> 个已完成
    </div>
    <button id="clear-completed">清除已完成</button>
  </footer>
</div>
```

### 4.2 数据模块

**职责**：管理待办事项数据

**主要函数**：
```javascript
class TodoService {
  constructor() {
    this.storageKey = 'todo_app_todos';
  }
  
  // 获取所有待办事项
  getTodos() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
  
  // 添加待办事项
  addTodo(title) {
    const todos = this.getTodos();
    const newTodo = {
      id: Date.now(),
      title: title.trim(),
      completed: false,
      createdAt: Date.now()
    };
    todos.push(newTodo);
    this.saveTodos(todos);
    return newTodo;
  }
  
  // 切换待办事项状态
  toggleTodo(id) {
    const todos = this.getTodos();
    const todo = todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos(todos);
      return todo;
    }
    return null;
  }
  
  // 删除待办事项
  deleteTodo(id) {
    const todos = this.getTodos();
    const index = todos.findIndex(t => t.id === id);
    if (index !== -1) {
      todos.splice(index, 1);
      this.saveTodos(todos);
      return true;
    }
    return false;
  }
  
  // 清除已完成事项
  clearCompleted() {
    const todos = this.getTodos();
    const completedCount = todos.filter(t => t.completed).length;
    const activeTodos = todos.filter(t => !t.completed);
    this.saveTodos(activeTodos);
    return completedCount;
  }
  
  // 保存待办事项
  saveTodos(todos) {
    localStorage.setItem(this.storageKey, JSON.stringify(todos));
    return true;
  }
}
```

### 4.3 应用主模块

**职责**：协调UI模块和数据模块

**主要流程**：
```
初始化应用
    ↓
加载现有待办事项
    ↓
渲染界面
    ↓
绑定事件监听器
    ↓
等待用户交互
    ↓
处理用户操作
    ↓
更新数据和界面
```

## 5. 事件处理设计

### 5.1 事件列表

| 事件源 | 事件类型 | 处理函数 | 功能 |
|--------|----------|----------|------|
| #new-todo | keypress | handleAddTodo | 添加新待办事项 |
| .todo-item | click | handleToggleTodo | 切换完成状态 |
| .delete-btn | click | handleDeleteTodo | 删除待办事项 |
| #clear-completed | click | handleClearCompleted | 清除已完成事项 |

### 5.2 事件处理流程

```javascript
// 添加待办事项
function handleAddTodo(event) {
  if (event.key === 'Enter') {
    const input = event.target;
    const title = input.value.trim();
    if (title) {
      const todo = todoService.addTodo(title);
      renderTodoList(todoService.getTodos());
      input.value = '';
    }
  }
}

// 切换待办事项状态
function handleToggleTodo(event) {
  const id = parseInt(event.target.closest('.todo-item').dataset.id);
  todoService.toggleTodo(id);
  renderTodoList(todoService.getTodos());
}

// 删除待办事项
function handleDeleteTodo(event) {
  event.stopPropagation();
  const id = parseInt(event.target.closest('.todo-item').dataset.id);
  todoService.deleteTodo(id);
  renderTodoList(todoService.getTodos());
}

// 清除已完成事项
function handleClearCompleted() {
  const count = todoService.clearCompleted();
  renderTodoList(todoService.getTodos());
}
```

## 6. 样式设计

### 6.1 设计原则
- 简洁明了，不复杂
- 响应式设计
- 良好的视觉层次
- 适当的交互反馈

### 6.2 主要样式类

| 类名 | 用途 |
|------|------|
| .todo-app | 应用容器 |
| .todo-item | 待办事项项 |
| .todo-item.completed | 已完成事项 |
| .todo-title | 待办事项标题 |
| .delete-btn | 删除按钮 |
| .stats | 统计信息区域 |

## 7. 错误处理

### 7.1 可能出现的错误

1. **localStorage不可用**
   - 处理：使用内存存储，显示警告信息
   
2. **JSON解析错误**
   - 处理：重置存储数据，重新初始化
   
3. **无效的用户输入**
   - 处理：验证输入，显示错误提示

### 7.2 错误处理策略

```javascript
function safeGetTodos() {
  try {
    return todoService.getTodos();
  } catch (error) {
    console.error('获取待办事项失败:', error);
    return [];
  }
}

function safeSaveTodos(todos) {
  try {
    return todoService.saveTodos(todos);
  } catch (error) {
    console.error('保存待办事项失败:', error);
    return false;
  }
}
```

## 8. 浏览器兼容性

### 8.1 支持特性
- localStorage (IE8+)
- ES6语法 (通过Babel或直接使用)
- CSS Flexbox (IE10+)

### 8.2 降级方案
- 如果localStorage不可用，使用内存存储
- 提供基本的CSS回退样式
- 确保JavaScript功能在旧浏览器中可用