/**
 * 简单待办事项应用 - 主应用逻辑
 * 遵循设计文档中的架构设计
 */

// ==================== 数据服务模块 ====================
class TodoService {
    constructor() {
        this.STORAGE_KEY = 'simple_todo_app_tasks';
        this.tasks = this.loadTasks();
    }

    /**
     * 从localStorage加载任务
     */
    loadTasks() {
        try {
            const tasksJson = localStorage.getItem(this.STORAGE_KEY);
            return tasksJson ? JSON.parse(tasksJson) : [];
        } catch (error) {
            console.error('加载任务失败:', error);
            return [];
        }
    }

    /**
     * 保存任务到localStorage
     */
    saveTasks() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.tasks));
            return true;
        } catch (error) {
            console.error('保存任务失败:', error);
            return false;
        }
    }

    /**
     * 获取所有任务
     */
    getAllTasks() {
        return [...this.tasks];
    }

    /**
     * 添加新任务
     * @param {string} text - 任务文本
     * @returns {Object|null} 新任务对象或null
     */
    addTask(text) {
        if (!text || text.trim() === '') {
            return null;
        }

        const newTask = {
            id: Date.now().toString(),
            text: text.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.tasks.unshift(newTask);
        const success = this.saveTasks();
        return success ? newTask : null;
    }

    /**
     * 更新任务状态
     * @param {string} taskId - 任务ID
     * @param {boolean} completed - 完成状态
     * @returns {boolean} 是否成功
     */
    updateTaskStatus(taskId, completed) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return false;

        task.completed = completed;
        task.updatedAt = new Date().toISOString();
        return this.saveTasks();
    }

    /**
     * 删除任务
     * @param {string} taskId - 任务ID
     * @returns {boolean} 是否成功
     */
    deleteTask(taskId) {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(t => t.id !== taskId);
        
        if (this.tasks.length !== initialLength) {
            return this.saveTasks();
        }
        return false;
    }

    /**
     * 删除所有已完成任务
     * @returns {boolean} 是否成功
     */
    deleteCompletedTasks() {
        const initialLength = this.tasks.length;
        this.tasks = this.tasks.filter(t => !t.completed);
        
        if (this.tasks.length !== initialLength) {
            return this.saveTasks();
        }
        return false;
    }

    /**
     * 删除所有任务
     * @returns {boolean} 是否成功
     */
    deleteAllTasks() {
        this.tasks = [];
        return this.saveTasks();
    }

    /**
     * 获取任务统计
     */
    getStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        
        return { total, completed, pending };
    }
}

// ==================== UI管理模块 ====================
class UIManager {
    constructor() {
        this.taskService = new TodoService();
        this.confirmAction = null;
        this.confirmCallback = null;
        
        this.initElements();
        this.bindEvents();
        this.render();
    }

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        // 输入相关
        this.taskInput = document.getElementById('taskInput');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.inputError = document.getElementById('inputError');
        
        // 统计相关
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.pendingTasks = document.getElementById('pendingTasks');
        
        // 列表相关
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        
        // 操作按钮
        this.clearCompletedBtn = document.getElementById('clearCompletedBtn');
        this.clearAllBtn = document.getElementById('clearAllBtn');
        
        // 对话框
        this.confirmDialog = document.getElementById('confirmDialog');
        this.dialogTitle = document.getElementById('dialogTitle');
        this.dialogMessage = document.getElementById('dialogMessage');
        this.dialogCancelBtn = document.getElementById('dialogCancelBtn');
        this.dialogConfirmBtn = document.getElementById('dialogConfirmBtn');
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 添加任务事件
        this.addTaskBtn.addEventListener('click', () => this.handleAddTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleAddTask();
            }
        });

        // 清除任务事件
        this.clearCompletedBtn.addEventListener('click', () => this.handleClearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.handleClearAll());

        // 对话框事件
        this.dialogCancelBtn.addEventListener('click', () => this.hideDialog());
        this.dialogConfirmBtn.addEventListener('click', () => this.executeConfirmAction());

        // 输入验证
        this.taskInput.addEventListener('input', () => this.validateInput());
    }

    /**
     * 验证输入
     */
    validateInput() {
        const value = this.taskInput.value.trim();
        
        if (value.length > 100) {
            this.showError('任务内容不能超过100个字符');
            return false;
        }
        
        this.clearError();
        return true;
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        this.inputError.textContent = message;
        this.inputError.style.display = 'block';
    }

    /**
     * 清除错误信息
     */
    clearError() {
        this.inputError.textContent = '';
        this.inputError.style.display = 'none';
    }

    /**
     * 处理添加任务
     */
    handleAddTask() {
        const text = this.taskInput.value.trim();
        
        if (!this.validateInput()) {
            return;
        }
        
        if (!text) {
            this.showError('请输入任务内容');
            this.taskInput.focus();
            return;
        }
        
        const newTask = this.taskService.addTask(text);
        if (newTask) {
            this.taskInput.value = '';
            this.clearError();
            this.render();
            this.showNotification('任务添加成功');
        } else {
            this.showError('添加任务失败，请重试');
        }
    }

    /**
     * 处理清除已完成任务
     */
    handleClearCompleted() {
        const stats = this.taskService.getStats();
        if (stats.completed === 0) {
            this.showNotification('没有已完成的任务');
            return;
        }
        
        this.showConfirmDialog(
            '清除已完成任务',
            `确定要清除 ${stats.completed} 个已完成的任务吗？`,
            () => {
                const success = this.taskService.deleteCompletedTasks();
                if (success) {
                    this.render();
                    this.showNotification('已清除所有已完成任务');
                } else {
                    this.showNotification('清除失败，请重试');
                }
            }
        );
    }

    /**
     * 处理清除所有任务
     */
    handleClearAll() {
        const stats = this.taskService.getStats();
        if (stats.total === 0) {
            this.showNotification('没有任务可清除');
            return;
        }
        
        this.showConfirmDialog(
            '清除所有任务',
            `确定要清除所有 ${stats.total} 个任务吗？此操作不可撤销。`,
            () => {
                const success = this.taskService.deleteAllTasks();
                if (success) {
                    this.render();
                    this.showNotification('已清除所有任务');
                } else {
                    this.showNotification('清除失败，请重试');
                }
            }
        );
    }

    /**
     * 显示确认对话框
     */
    showConfirmDialog(title, message, callback) {
        this.dialogTitle.textContent = title;
        this.dialogMessage.textContent = message;
        this.confirmCallback = callback;
        this.confirmDialog.style.display = 'flex';
    }

    /**
     * 隐藏对话框
     */
    hideDialog() {
        this.confirmDialog.style.display = 'none';
        this.confirmCallback = null;
    }

    /**
     * 执行确认操作
     */
    executeConfirmAction() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideDialog();
    }

    /**
     * 显示通知
     */
    showNotification(message) {
        // 创建临时通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 1001;
            animation: slideIn 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // 3秒后移除
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * 格式化日期时间
     */
    formatDateTime(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 渲染任务列表
     */
    renderTaskList() {
        const tasks = this.taskService.getAllTasks();
        
        if (tasks.length === 0) {
            this.emptyState.style.display = 'block';
            this.taskList.innerHTML = '';
            this.taskList.appendChild(this.emptyState);
            return;
        }
        
        this.emptyState.style.display = 'none';
        
        const fragment = document.createDocumentFragment();
        
        tasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            fragment.appendChild(taskElement);
        });
        
        this.taskList.innerHTML = '';
        this.taskList.appendChild(fragment);
    }

    /**
     * 创建任务元素
     */
    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        
        taskElement.innerHTML = `
            <input 
                type="checkbox" 
                class="task-checkbox" 
                ${task.completed ? 'checked' : ''}
                aria-label="${task.completed ? '标记为未完成' : '标记为完成'}"
            >
            <div class="task-content">
                <div class="task-text">${this.escapeHtml(task.text)}</div>
                <div class="task-time">
                    创建时间: ${this.formatDateTime(task.createdAt)}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn delete" aria-label="删除任务">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        // 绑定事件
        const checkbox = taskElement.querySelector('.task-checkbox');
        const deleteBtn = taskElement.querySelector('.task-btn.delete');
        
        checkbox.addEventListener('change', (e) => {
            const completed = e.target.checked;
            const success = this.taskService.updateTaskStatus(task.id, completed);
            
            if (success) {
                taskElement.classList.toggle('completed', completed);
                this.updateStats();
                this.showNotification(completed ? '任务已完成' : '任务已恢复为未完成');
            } else {
                e.target.checked = !completed; // 恢复状态
                this.showNotification('更新失败，请重试');
            }
        });
        
        deleteBtn.addEventListener('click', () => {
            this.showConfirmDialog(
                '删除任务',
                `确定要删除任务 "${task.text}" 吗？`,
                () => {
                    const success = this.taskService.deleteTask(task.id);
                    if (success) {
                        taskElement.style.animation = 'fadeOut 0.3s ease-out';
                        setTimeout(() => {
                            this.render();
                            this.showNotification('任务已删除');
                        }, 300);
                    } else {
                        this.showNotification('删除失败，请重试');
                    }
                }
            );
        });
        
        return taskElement;
    }

    /**
     * 更新统计信息
     */
    updateStats() {
        const stats = this.taskService.getStats();
        this.totalTasks.textContent = stats.total;
        this.completedTasks.textContent = stats.completed;
        this.pendingTasks.textContent = stats.pending;
    }

    /**
     * 渲染整个应用
     */
    render() {
        this.renderTaskList();
        this.updateStats();
    }

    /**
     * HTML转义，防止XSS攻击
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ==================== 应用初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 添加CSS动画
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            @keyframes fadeOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-20px);
                }
            }
        `;
        document.head.appendChild(style);
        
        // 初始化应用
        const app = new UIManager();
        
        // 全局点击事件，点击对话框外部关闭对话框
        document.addEventListener('click', (e) => {
            const dialog = document.getElementById('confirmDialog');
            if (dialog.style.display === 'flex' && e.target === dialog) {
                app.hideDialog();
            }
        });
        
        // 全局键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const dialog = document.getElementById('confirmDialog');
                if (dialog.style.display === 'flex') {
                    app.hideDialog();
                }
            }
        });
        
        console.log('待办事项应用初始化完成');
        
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败，请刷新页面重试');
    }
});