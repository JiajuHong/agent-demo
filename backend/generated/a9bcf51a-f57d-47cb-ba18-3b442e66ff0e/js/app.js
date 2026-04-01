// TodoList 应用主逻辑
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.editingTaskId = null;
        
        // 初始化DOM元素引用
        this.initializeElements();
        // 初始化事件监听
        this.initializeEventListeners();
        // 加载保存的任务
        this.loadTasks();
        // 更新UI
        this.updateUI();
    }
    
    // 初始化DOM元素引用
    initializeElements() {
        // 输入和按钮
        this.taskInput = document.getElementById('taskInput');
        this.prioritySelect = document.getElementById('prioritySelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.searchInput = document.getElementById('searchInput');
        
        // 过滤按钮
        this.filterButtons = document.querySelectorAll('.filter-btn');
        
        // 统计元素
        this.totalTasksElement = document.getElementById('totalTasks');
        this.completedTasksElement = document.getElementById('completedTasks');
        this.pendingTasksElement = document.getElementById('pendingTasks');
        this.tasksCountElement = document.getElementById('tasksCount');
        
        // 任务列表容器
        this.tasksListElement = document.getElementById('tasksList');
        
        // 操作按钮
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.exportTasksBtn = document.getElementById('exportTasksBtn');
        this.importTasksBtn = document.getElementById('importTasksBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // 模态框相关
        this.editModal = document.getElementById('editModal');
        this.importModal = document.getElementById('importModal');
        this.confirmModal = document.getElementById('confirmModal');
        this.notification = document.getElementById('notification');
        
        // 编辑表单元素
        this.editTaskTitle = document.getElementById('editTaskTitle');
        this.editPrioritySelect = document.getElementById('editPrioritySelect');
        this.saveEditBtn = document.getElementById('saveEditBtn');
        
        // 导入表单元素
        this.importText = document.getElementById('importText');
        this.confirmImportBtn = document.getElementById('confirmImportBtn');
        
        // 确认对话框元素
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmActionBtn = document.getElementById('confirmActionBtn');
        
        // 通知消息元素
        this.notificationMessage = document.getElementById('notificationMessage');
        
        // 关闭模态框按钮
        this.closeModalButtons = document.querySelectorAll('.close-modal');
    }
    
    // 初始化事件监听
    initializeEventListeners() {
        // 添加任务
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // 搜索任务
        this.searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            this.updateUI();
        });
        
        // 过滤任务
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setFilter(filter);
            });
        });
        
        // 操作按钮
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        this.exportTasksBtn.addEventListener('click', () => this.exportTasks());
        this.importTasksBtn.addEventListener('click', () => this.showImportModal());
        this.clearAllBtn.addEventListener('click', () => this.confirmClearAll());
        
        // 编辑任务
        this.saveEditBtn.addEventListener('click', () => this.saveTaskEdit());
        
        // 导入任务
        this.confirmImportBtn.addEventListener('click', () => this.importTasks());
        
        // 确认操作
        this.confirmActionBtn.addEventListener('click', () => this.executeConfirmedAction());
        
        // 关闭模态框
        this.closeModalButtons.forEach(button => {
            button.addEventListener('click', () => this.closeAllModals());
        });
        
        // 点击模态框背景关闭
        [this.editModal, this.importModal, this.confirmModal].forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
        
        // 键盘事件：ESC关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    // 添加新任务
    addTask() {
        const title = this.taskInput.value.trim();
        if (!title) {
            this.showNotification('请输入任务内容', 'error');
            return;
        }
        
        const task = {
            id: Date.now(),
            title: title,
            priority: this.prioritySelect.value,
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task); // 添加到开头
        this.saveTasks();
        this.updateUI();
        
        // 清空输入框
        this.taskInput.value = '';
        this.taskInput.focus();
        
        this.showNotification('任务添加成功');
    }
    
    // 切换任务完成状态
    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.updateUI();
            
            const message = task.completed ? '任务标记为已完成' : '任务标记为待完成';
            this.showNotification(message);
        }
    }
    
    // 编辑任务
    editTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            this.editingTaskId = taskId;
            this.editTaskTitle.value = task.title;
            this.editPrioritySelect.value = task.priority;
            this.editModal.classList.add('active');
        }
    }
    
    // 保存任务编辑
    saveTaskEdit() {
        if (!this.editingTaskId) return;
        
        const title = this.editTaskTitle.value.trim();
        if (!title) {
            this.showNotification('请输入任务内容', 'error');
            return;
        }
        
        const task = this.tasks.find(t => t.id === this.editingTaskId);
        if (task) {
            task.title = title;
            task.priority = this.editPrioritySelect.value;
            task.updatedAt = new Date().toISOString();
            this.saveTasks();
            this.updateUI();
            this.closeAllModals();
            this.showNotification('任务编辑成功');
        }
    }
    
    // 删除任务
    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.updateUI();
        this.showNotification('任务删除成功');
    }
    
    // 清除已完成任务
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            this.showNotification('没有已完成的任务', 'info');
            return;
        }
        
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveTasks();
        this.updateUI();
        this.showNotification(`已清除 ${completedCount} 个已完成任务`);
    }
    
    // 清空所有任务
    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showNotification('没有任务可清除', 'info');
            return;
        }
        
        this.tasks = [];
        this.saveTasks();
        this.updateUI();
        this.showNotification('所有任务已清空');
    }
    
    // 导出任务
    exportTasks() {
        const exportData = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            tasks: this.tasks
        };
        
        const jsonString = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `todolist-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('任务导出成功');
    }
    
    // 显示导入模态框
    showImportModal() {
        this.importText.value = '';
        this.importModal.classList.add('active');
    }
    
    // 导入任务
    importTasks() {
        const importText = this.importText.value.trim();
        if (!importText) {
            this.showNotification('请输入要导入的数据', 'error');
            return;
        }
        
        try {
            const importData = JSON.parse(importText);
            
            // 验证导入数据格式
            if (!importData.tasks || !Array.isArray(importData.tasks)) {
                throw new Error('导入数据格式不正确');
            }
            
            // 验证每个任务的基本结构
            const validTasks = importData.tasks.filter(task => 
                task.id && task.title && typeof task.completed === 'boolean'
            );
            
            if (validTasks.length === 0) {
                throw new Error('没有有效的任务数据');
            }
            
            this.tasks = validTasks;
            this.saveTasks();
            this.updateUI();
            this.closeAllModals();
            this.showNotification(`成功导入 ${validTasks.length} 个任务`);
            
        } catch (error) {
            this.showNotification(`导入失败: ${error.message}`, 'error');
        }
    }
    
    // 设置过滤条件
    setFilter(filter) {
        this.currentFilter = filter;
        
        // 更新过滤按钮状态
        this.filterButtons.forEach(button => {
            if (button.dataset.filter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        this.updateUI();
    }
    
    // 获取过滤后的任务
    getFilteredTasks() {
        let filteredTasks = this.tasks;
        
        // 应用状态过滤
        switch (this.currentFilter) {
            case 'pending':
                filteredTasks = filteredTasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = filteredTasks.filter(task => task.completed);
                break;
            // 'all' 不进行过滤
        }
        
        // 应用搜索过滤
        if (this.currentSearch) {
            filteredTasks = filteredTasks.filter(task => 
                task.title.toLowerCase().includes(this.currentSearch)
            );
        }
        
        return filteredTasks;
    }
    
    // 更新UI
    updateUI() {
        const filteredTasks = this.getFilteredTasks();
        
        // 更新统计信息
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        
        this.totalTasksElement.textContent = totalTasks;
        this.completedTasksElement.textContent = completedTasks;
        this.pendingTasksElement.textContent = pendingTasks;
        this.tasksCountElement.textContent = `${filteredTasks.length} 个任务`;
        
        // 更新任务列表
        this.renderTasks(filteredTasks);
    }
    
    // 渲染任务列表
    renderTasks(tasks) {
        if (tasks.length === 0) {
            this.tasksListElement.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>暂无任务</h3>
                    <p>${this.currentSearch ? '没有找到匹配的任务' : '添加您的第一个任务开始管理'}</p>
                </div>
            `;
            return;
        }
        
        this.tasksListElement.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       onclick="todoApp.toggleTaskCompletion(${task.id})">
                
                <div class="task-content">
                    <div class="task-title">${this.escapeHtml(task.title)}</div>
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">
                            ${this.getPriorityText(task.priority)}
                        </span>
                        <span class="task-date">
                            <i class="far fa-calendar"></i>
                            ${new Date(task.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                
                <div class="task-actions">
                    <button class="action-btn edit-btn" onclick="todoApp.editTask(${task.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="todoApp.deleteTask(${task.id})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }
    
    // 获取优先级文本
    getPriorityText(priority) {
        const priorityMap = {
            'low': '低优先级',
            'medium': '中优先级',
            'high': '高优先级'
        };
        return priorityMap[priority] || '未知';
    }
    
    // 转义HTML
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // 保存任务到本地存储
    saveTasks() {
        try {
            localStorage.setItem('todolist_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('保存任务失败:', error);
            this.showNotification('保存任务失败，请检查存储空间', 'error');
        }
    }
    
    // 从本地存储加载任务
    loadTasks() {
        try {
            const savedTasks = localStorage.getItem('todolist_tasks');
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
        } catch (error) {
            console.error('加载任务失败:', error);
            this.tasks = [];
        }
    }
    
    // 显示确认对话框
    confirmClearAll() {
        if (this.tasks.length === 0) {
            this.showNotification('没有任务可清除', 'info');
            return;
        }
        
        this.confirmMessage.textContent = `您确定要清空所有 ${this.tasks.length} 个任务吗？此操作不可撤销。`;
        this.confirmActionBtn.onclick = () => this.clearAllTasks();
        this.confirmModal.classList.add('active');
    }
    
    // 执行确认的操作
    executeConfirmedAction() {
        // 这个函数现在只用于确认对话框的回调
        this.closeAllModals();
    }
    
    // 关闭所有模态框
    closeAllModals() {
        this.editModal.classList.remove('active');
        this.importModal.classList.remove('active');
        this.confirmModal.classList.remove('active');
        this.editingTaskId = null;
    }
    
    // 显示通知消息
    showNotification(message, type = 'success') {
        this.notificationMessage.textContent = message;
        
        // 根据类型设置样式
        const notificationContent = this.notification.querySelector('.notification-content');
        const icon = notificationContent.querySelector('i');
        
        switch (type) {
            case 'error':
                this.notification.style.background = '#dc3545';
                icon.className = 'fas fa-exclamation-circle';
                break;
            case 'info':
                this.notification.style.background = '#17a2b8';
                icon.className = 'fas fa-info-circle';
                break;
            default:
                this.notification.style.background = '#4caf50';
                icon.className = 'fas fa-check-circle';
        }
        
        this.notification.classList.add('active');
        
        // 3秒后自动隐藏
        setTimeout(() => {
            this.notification.classList.remove('active');
        }, 3000);
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
    
    // 添加一些示例任务（如果本地存储为空）
    if (todoApp.tasks.length === 0) {
        const exampleTasks = [
            {
                id: Date.now() - 1000,
                title: '学习HTML/CSS/JavaScript',
                priority: 'high',
                completed: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: Date.now() - 2000,
                title: '完成TodoList项目',
                priority: 'high',
                completed: true,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: Date.now() - 3000,
                title: '阅读技术文档',
                priority: 'medium',
                completed: false,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];
        
        todoApp.tasks = exampleTasks;
        todoApp.saveTasks();
        todoApp.updateUI();
    }
});