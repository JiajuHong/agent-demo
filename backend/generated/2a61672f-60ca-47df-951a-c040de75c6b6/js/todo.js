/**
 * 极简TodoList应用
 * 使用localStorage存储数据
 */

class TodoApp {
    constructor() {
        this.tasks = [];
        this.storageKey = 'simple-todo-tasks';
        
        // DOM元素
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // 统计元素
        this.totalCount = document.getElementById('totalCount');
        this.pendingCount = document.getElementById('pendingCount');
        this.completedCount = document.getElementById('completedCount');
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    init() {
        this.loadTasks();
        this.bindEvents();
        this.render();
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 添加任务按钮点击事件
        this.addTaskBtn.addEventListener('click', () => this.addTask());
        
        // 输入框回车事件
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });
        
        // 清除已完成按钮
        this.clearCompletedBtn.addEventListener('click', () => this.clearCompletedTasks());
        
        // 清除所有按钮
        this.clearAllBtn.addEventListener('click', () => this.clearAllTasks());
    }
    
    /**
     * 从localStorage加载任务
     */
    loadTasks() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            this.tasks = saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('加载任务失败:', error);
            this.tasks = [];
        }
    }
    
    /**
     * 保存任务到localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.tasks));
        } catch (error) {
            console.error('保存任务失败:', error);
        }
    }
    
    /**
     * 添加新任务
     */
    addTask() {
        const content = this.taskInput.value.trim();
        
        if (!content) {
            this.showMessage('请输入任务内容', 'warning');
            return;
        }
        
        if (content.length > 100) {
            this.showMessage('任务内容不能超过100个字符', 'warning');
            return;
        }
        
        const newTask = {
            id: Date.now(), // 使用时间戳作为唯一ID
            content: content,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(newTask); // 添加到开头
        this.saveTasks();
        this.render();
        
        // 清空输入框并聚焦
        this.taskInput.value = '';
        this.taskInput.focus();
        
        this.showMessage('任务添加成功', 'success');
    }
    
    /**
     * 切换任务完成状态
     * @param {number} taskId - 任务ID
     */
    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            
            const message = task.completed ? '任务已完成' : '任务已标记为待完成';
            this.showMessage(message, 'info');
        }
    }
    
    /**
     * 删除任务
     * @param {number} taskId - 任务ID
     */
    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            // 添加移除动画
            const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
            if (taskElement) {
                taskElement.classList.add('removing');
                setTimeout(() => {
                    this.tasks.splice(taskIndex, 1);
                    this.saveTasks();
                    this.render();
                    this.showMessage('任务已删除', 'info');
                }, 300);
            } else {
                this.tasks.splice(taskIndex, 1);
                this.saveTasks();
                this.render();
                this.showMessage('任务已删除', 'info');
            }
        }
    }
    
    /**
     * 清除所有已完成的任务
     */
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        
        if (completedCount === 0) {
            this.showMessage('没有已完成的任务', 'info');
            return;
        }
        
        if (confirm(`确定要清除 ${completedCount} 个已完成的任务吗？`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
            this.showMessage(`已清除 ${completedCount} 个已完成的任务`, 'success');
        }
    }
    
    /**
     * 清除所有任务
     */
    clearAllTasks() {
        if (this.tasks.length === 0) {
            this.showMessage('没有任务可以清除', 'info');
            return;
        }
        
        if (confirm(`确定要清除所有 ${this.tasks.length} 个任务吗？`)) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.showMessage('所有任务已清除', 'success');
        }
    }
    
    /**
     * 更新统计信息
     */
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        this.totalCount.textContent = total;
        this.completedCount.textContent = completed;
        this.pendingCount.textContent = pending;
    }
    
    /**
     * 渲染任务列表
     */
    render() {
        this.updateStats();
        
        // 清空任务列表
        this.taskList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            this.taskList.appendChild(this.emptyState);
            this.emptyState.style.display = 'flex';
            return;
        }
        
        this.emptyState.style.display = 'none';
        
        // 渲染每个任务
        this.tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });
    }
    
    /**
     * 创建任务DOM元素
     * @param {Object} task - 任务对象
     * @returns {HTMLElement} 任务元素
     */
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.taskId = task.id;
        
        taskElement.innerHTML = `
            <input type="checkbox" 
                   class="task-checkbox" 
                   ${task.completed ? 'checked' : ''}>
            <div class="task-content">${this.escapeHtml(task.content)}</div>
            <div class="task-actions">
                <button class="delete-btn" title="删除任务">×</button>
            </div>
        `;
        
        // 绑定事件
        const checkbox = taskElement.querySelector('.task-checkbox');
        const deleteBtn = taskElement.querySelector('.delete-btn');
        
        checkbox.addEventListener('change', () => this.toggleTask(task.id));
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        
        return taskElement;
    }
    
    /**
     * 显示临时消息
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型: success, error, warning, info
     */
    showMessage(message, type = 'info') {
        // 移除现有的消息
        const existingMessage = document.querySelector('.temp-message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // 创建消息元素
        const messageElement = document.createElement('div');
        messageElement.className = `temp-message ${type}`;
        messageElement.textContent = message;
        
        // 样式
        messageElement.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${this.getMessageColor(type)};
            color: white;
            border-radius: 6px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(messageElement);
        
        // 3秒后自动移除
        setTimeout(() => {
            messageElement.style.animation = 'slideInRight 0.3s ease reverse';
            setTimeout(() => messageElement.remove(), 300);
        }, 3000);
    }
    
    /**
     * 获取消息颜色
     * @param {string} type - 消息类型
     * @returns {string} 颜色值
     */
    getMessageColor(type) {
        const colors = {
            success: '#48bb78',
            error: '#f56565',
            warning: '#ed8936',
            info: '#4299e1'
        };
        return colors[type] || colors.info;
    }
    
    /**
     * HTML转义，防止XSS攻击
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});