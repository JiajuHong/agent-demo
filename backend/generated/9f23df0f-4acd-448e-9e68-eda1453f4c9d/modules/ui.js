/**
 * 用户界面模块
 * 管理DOM操作和事件处理
 */

const UIManager = {
    // 依赖注入
    recordsManager: null,
    statsCalculator: null,
    
    // DOM元素引用
    elements: {},
    
    // 状态
    state: {
        isLoading: false,
        lastUpdate: null
    },

    /**
     * 初始化UI管理器
     * @param {object} recordsManager - 记录管理器实例
     * @param {object} statsCalculator - 统计计算器实例
     */
    init(recordsManager, statsCalculator) {
        this.recordsManager = recordsManager;
        this.statsCalculator = statsCalculator;
        
        // 初始化DOM元素引用
        this.initElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 初始加载数据
        this.loadData();
        
        // 检查LocalStorage可用性
        this.checkLocalStorage();
    },

    /**
     * 初始化DOM元素引用
     */
    initElements() {
        // 统计显示元素
        this.elements.todayCount = document.getElementById('today-count');
        this.elements.spentMoney = document.getElementById('spent-money');
        this.elements.lastTime = document.getElementById('last-time');
        this.elements.avgInterval = document.getElementById('avg-interval');
        this.elements.progressPercent = document.getElementById('progress-percent');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.progressText = document.getElementById('progress-text');
        this.elements.historyCount = document.getElementById('history-count');
        
        // 输入元素
        this.elements.cigarettePrice = document.getElementById('cigarette-price');
        this.elements.dailyGoal = document.getElementById('daily-goal');
        
        // 按钮元素
        this.elements.recordBtn = document.getElementById('record-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        this.elements.saveSettingsBtn = document.getElementById('save-settings');
        
        // 容器元素
        this.elements.historyList = document.getElementById('history-list');
        
        // 对话框元素
        this.elements.confirmDialog = document.getElementById('confirm-dialog');
        this.elements.confirmMessage = document.getElementById('confirm-message');
        this.elements.confirmCancel = document.getElementById('confirm-cancel');
        this.elements.confirmOk = document.getElementById('confirm-ok');
        
        // 提示信息元素
        this.elements.messageToast = document.getElementById('message-toast');
        this.elements.toastMessage = document.getElementById('toast-message');
    },

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 记录抽烟按钮
        if (this.elements.recordBtn) {
            this.elements.recordBtn.addEventListener('click', () => this.handleRecordClick());
        }
        
        // 重置按钮
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.handleResetClick());
        }
        
        // 保存设置按钮
        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => this.handleSaveSettings());
        }
        
        // 设置输入框实时保存
        if (this.elements.cigarettePrice) {
            this.elements.cigarettePrice.addEventListener('change', () => this.handleSettingsChange());
        }
        
        if (this.elements.dailyGoal) {
            this.elements.dailyGoal.addEventListener('change', () => this.handleSettingsChange());
        }
        
        // 对话框按钮
        if (this.elements.confirmCancel) {
            this.elements.confirmCancel.addEventListener('click', () => this.hideConfirmDialog());
        }
        
        if (this.elements.confirmOk) {
            this.elements.confirmOk.addEventListener('click', () => this.handleConfirmOk());
        }
        
        // 点击对话框背景关闭
        if (this.elements.confirmDialog) {
            this.elements.confirmDialog.addEventListener('click', (e) => {
                if (e.target === this.elements.confirmDialog) {
                    this.hideConfirmDialog();
                }
            });
        }
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideConfirmDialog();
            }
            
            // 快捷键：空格键记录抽烟
            if (e.key === ' ' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                this.handleRecordClick();
            }
        });
    },

    /**
     * 加载数据并更新界面
     */
    loadData() {
        this.setStateLoading(true);
        
        try {
            // 加载设置
            const settings = this.recordsManager.getSettings();
            this.updateSettingsInputs(settings);
            
            // 计算统计数据
            const stats = this.statsCalculator.calculateAllStats();
            
            // 更新界面
            this.updateStatsDisplay(stats);
            this.updateHistoryList();
            this.updateProgressBar(stats);
            
            // 更新状态
            this.state.lastUpdate = new Date();
            
        } catch (error) {
            console.error('加载数据失败:', error);
            this.showMessage('加载数据失败，请刷新页面', 'error');
        } finally {
            this.setStateLoading(false);
        }
    },

    /**
     * 更新统计数据展示
     * @param {object} stats - 统计信息
     */
    updateStatsDisplay(stats) {
        if (!stats) return;
        
        // 更新今日抽烟次数
        if (this.elements.todayCount) {
            this.elements.todayCount.textContent = stats.todayCount;
            this.elements.todayCount.classList.add('pulse');
            setTimeout(() => {
                this.elements.todayCount.classList.remove('pulse');
            }, 500);
        }
        
        // 更新花费金额
        if (this.elements.spentMoney) {
            const settings = this.recordsManager.getSettings();
            this.elements.spentMoney.textContent = `${settings.currency}${stats.spentMoney.toFixed(2)}`;
        }
        
        // 更新最近一次时间
        if (this.elements.lastTime) {
            this.elements.lastTime.textContent = stats.lastTime;
        }
        
        // 更新平均间隔
        if (this.elements.avgInterval) {
            this.elements.avgInterval.textContent = stats.avgInterval;
        }
        
        // 更新历史记录计数
        if (this.elements.historyCount) {
            this.elements.historyCount.textContent = `${stats.todayCount} 条记录`;
        }
    },

    /**
     * 更新进度条
     * @param {object} stats - 统计信息
     */
    updateProgressBar(stats) {
        if (!stats || !this.elements.progressFill || !this.elements.progressPercent || !this.elements.progressText) {
            return;
        }
        
        const progress = stats.dailyGoalProgress;
        const settings = this.recordsManager.getSettings();
        
        // 更新进度条宽度
        this.elements.progressFill.style.width = `${progress}%`;
        
        // 更新百分比文本
        this.elements.progressPercent.textContent = `${Math.round(progress)}%`;
        
        // 更新进度文本
        this.elements.progressText.textContent = `${stats.todayCount} / ${settings.dailyGoal} 支`;
        
        // 根据进度改变颜色
        if (progress >= 100) {
            this.elements.progressFill.style.background = 'linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)';
            this.elements.progressPercent.classList.add('danger');
        } else if (progress >= 80) {
            this.elements.progressFill.style.background = 'linear-gradient(90deg, #ff9966 0%, #ff5e62 100%)';
            this.elements.progressPercent.classList.add('warning');
        } else {
            this.elements.progressFill.style.background = 'linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)';
            this.elements.progressPercent.classList.remove('warning', 'danger');
        }
    },

    /**
     * 更新历史记录列表
     */
    updateHistoryList() {
        if (!this.elements.historyList) return;
        
        const todayRecords = this.recordsManager.getTodayRecords();
        
        if (todayRecords.length === 0) {
            // 显示空状态
            this.elements.historyList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-smoking-ban"></i>
                    <p>今天还没有抽烟记录</p>
                    <p class="empty-hint">点击"记录抽烟"按钮开始记录</p>
                </div>
            `;
            return;
        }
        
        // 构建历史记录HTML
        let historyHTML = '';
        
        todayRecords.forEach((record, index) => {
            const time = new Date(record.timestamp);
            const timeStr = time.toLocaleTimeString('zh-CN', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            // 计算与上一条记录的时间间隔
            let intervalText = '';
            if (index < todayRecords.length - 1) {
                const prevRecord = todayRecords[index + 1];
                const interval = record.timestamp - prevRecord.timestamp;
                intervalText = this.formatIntervalForDisplay(interval);
            }
            
            historyHTML += `
                <div class="history-item">
                    <div class="history-time">
                        <i class="fas fa-smoking"></i>
                        <span>${timeStr}</span>
                    </div>
                    ${intervalText ? `<div class="history-duration">${intervalText}</div>` : ''}
                </div>
            `;
        });
        
        this.elements.historyList.innerHTML = historyHTML;
    },

    /**
     * 更新设置输入框
     * @param {object} settings - 用户设置
     */
    updateSettingsInputs(settings) {
        if (!settings) return;
        
        if (this.elements.cigarettePrice) {
            this.elements.cigarettePrice.value = settings.cigarettePrice;
        }
        
        if (this.elements.dailyGoal) {
            this.elements.dailyGoal.value = settings.dailyGoal;
        }
    },

    /**
     * 处理记录抽烟按钮点击
     */
    handleRecordClick() {
        // 添加动画效果
        this.elements.recordBtn.classList.add('pulse');
        
        // 添加记录
        const newRecord = this.recordsManager.addRecord();
        
        if (newRecord) {
            // 更新界面
            this.loadData();
            
            // 显示成功消息
            this.showMessage('抽烟记录已添加', 'success');
            
            // 播放成功音效（如果有）
            this.playSuccessSound();
        } else {
            this.showMessage('记录失败，请重试', 'error');
        }
        
        // 移除动画效果
        setTimeout(() => {
            this.elements.recordBtn.classList.remove('pulse');
        }, 500);
    },

    /**
     * 处理重置按钮点击
     */
    handleResetClick() {
        const todayRecords = this.recordsManager.getTodayRecords();
        
        if (todayRecords.length === 0) {
            this.showMessage('今天还没有记录可重置', 'info');
            return;
        }
        
        this.showConfirmDialog(
            '确定要重置今日数据吗？此操作不可撤销。',
            () => {
                const success = this.recordsManager.clearTodayRecords();
                if (success) {
                    this.loadData();
                    this.showMessage('今日数据已重置', 'success');
                } else {
                    this.showMessage('重置失败，请重试', 'error');
                }
            }
        );
    },

    /**
     * 处理保存设置
     */
    handleSaveSettings() {
        const settings = this.getSettingsFromInputs();
        
        if (!this.validateSettings(settings)) {
            this.showMessage('设置无效，请检查输入', 'error');
            return;
        }
        
        const success = this.recordsManager.saveSettings(settings);
        
        if (success) {
            this.loadData(); // 重新加载数据以更新显示
            this.showMessage('设置已保存', 'success');
            
            // 添加保存动画
            this.elements.saveSettingsBtn.classList.add('pulse');
            setTimeout(() => {
                this.elements.saveSettingsBtn.classList.remove('pulse');
            }, 500);
        } else {
            this.showMessage('保存失败，请重试', 'error');
        }
    },

    /**
     * 处理设置变更（实时保存）
     */
    handleSettingsChange() {
        const settings = this.getSettingsFromInputs();
        
        if (this.validateSettings(settings)) {
            // 延迟保存，避免频繁操作
            clearTimeout(this.settingsSaveTimeout);
            this.settingsSaveTimeout = setTimeout(() => {
                this.recordsManager.saveSettings(settings);
                this.loadData(); // 更新显示
            }, 1000);
        }
    },

    /**
     * 显示确认对话框
     * @param {string} message - 确认消息
     * @param {Function} callback - 确认后的回调函数
     */
    showConfirmDialog(message, callback) {
        if (this.elements.confirmMessage) {
            this.elements.confirmMessage.textContent = message;
        }
        
        if (this.elements.confirmDialog) {
            this.elements.confirmDialog.style.display = 'flex';
            this.confirmCallback = callback;
        }
    },

    /**
     * 隐藏确认对话框
     */
    hideConfirmDialog() {
        if (this.elements.confirmDialog) {
            this.elements.confirmDialog.style.display = 'none';
        }
        this.confirmCallback = null;
    },

    /**
     * 处理确认对话框确定按钮
     */
    handleConfirmOk() {
        if (this.confirmCallback) {
            this.confirmCallback();
        }
        this.hideConfirmDialog();
    },

    /**
     * 显示消息提示
     * @param {string} message - 消息内容
     * @param {string} type - 消息类型：success, error, info, warning
     */
    showMessage(message, type = 'info') {
        if (!this.elements.messageToast || !this.elements.toastMessage) {
            return;
        }
        
        // 设置消息内容和图标
        this.elements.toastMessage.textContent = message;
        
        const icon = this.elements.messageToast.querySelector('i');
        if (icon) {
            switch (type) {
                case 'success':
                    icon.className = 'fas fa-check-circle success';
                    break;
                case 'error':
                    icon.className = 'fas fa-exclamation-circle danger';
                    break;
                case 'warning':
                    icon.className = 'fas fa-exclamation-triangle warning';
                    break;
                default:
                    icon.className = 'fas fa-info-circle';
            }
        }
        
        // 显示提示
        this.elements.messageToast.style.display = 'flex';
        
        // 3秒后自动隐藏
        clearTimeout(this.toastTimeout);
        this.toastTimeout = setTimeout(() => {
            this.elements.messageToast.style.display = 'none';
        }, 3000);
    },

    /**
     * 检查LocalStorage可用性
     */
    checkLocalStorage() {
        if (!this.recordsManager.storage.isLocalStorageAvailable()) {
            this.showMessage('LocalStorage不可用，数据将无法保存', 'warning');
        }
    },

    /**
     * 设置加载状态
     * @param {boolean} isLoading - 是否正在加载
     */
    setStateLoading(isLoading) {
        this.state.isLoading = isLoading;
        
        if (isLoading) {
            document.body.classList.add('loading');
        } else {
            document.body.classList.remove('loading');
        }
    },

    // 辅助方法

    /**
     * 从输入框获取设置
     * @returns {object} 设置对象
     */
    getSettingsFromInputs() {
        return {
            cigarettePrice: parseFloat(this.elements.cigarettePrice?.value) || 5,
            dailyGoal: parseInt(this.elements.dailyGoal?.value) || 10,
            currency: '¥'
        };
    },

    /**
     * 验证设置
     * @param {object} settings - 设置对象
     * @returns {boolean} 是否有效
     */
    validateSettings(settings) {
        if (!settings) return false;
        
        if (typeof settings.cigarettePrice !== 'number' || 
            settings.cigarettePrice < 0 || 
            settings.cigarettePrice > 1000) {
            return false;
        }
        
        if (typeof settings.dailyGoal !== 'number' || 
            settings.dailyGoal < 1 || 
            settings.dailyGoal > 100) {
            return false;
        }
        
        return true;
    },

    /**
     * 格式化时间间隔用于显示
     * @param {number} intervalMs - 间隔毫秒数
     * @returns {string} 格式化后的间隔
     */
    formatIntervalForDisplay(intervalMs) {
        const minutes = Math.floor(intervalMs / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            const remainingMinutes = minutes % 60;
            return `${hours}小时${remainingMinutes}分钟后`;
        }
        
        if (minutes > 0) {
            return `${minutes}分钟后`;
        }
        
        const seconds = Math.floor(intervalMs / 1000);
        return `${seconds}秒后`;
    },

    /**
     * 播放成功音效
     */
    playSuccessSound() {
        try {
            // 创建简单的音效
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } catch (error) {
            // 音效播放失败不影响主要功能
            console.log('音效播放失败:', error);
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIManager;
}