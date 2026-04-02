/**
 * UI组件模块
 * 管理用户界面组件和交互
 */

class UIComponents {
    constructor() {
        this.elements = {};
        this.modals = {};
        this.notifications = [];
        this.currentTipIndex = 0;
        
        // 初始化UI组件
        this.init();
    }

    /**
     * 初始化UI组件
     */
    init() {
        // 缓存DOM元素
        this.cacheElements();
        
        // 初始化事件监听器
        this.initEventListeners();
        
        // 初始化模态框
        this.initModals();
        
        // 初始化通知系统
        this.initNotifications();
        
        // 绑定事件处理器
        this.bindEvents();
        
        console.log('UI组件初始化完成');
    }

    /**
     * 缓存DOM元素
     */
    cacheElements() {
        // 计时器相关元素
        this.elements.timerDisplay = document.getElementById('timer-display');
        this.elements.timerStatus = document.getElementById('timer-status');
        this.elements.currentInterval = document.getElementById('current-interval');
        this.elements.targetInterval = document.getElementById('target-interval');
        this.elements.progressFill = document.getElementById('progress-fill');
        this.elements.progressText = document.getElementById('progress-text');
        
        // 控制按钮
        this.elements.startBtn = document.getElementById('start-btn');
        this.elements.pauseBtn = document.getElementById('pause-btn');
        this.elements.recordBtn = document.getElementById('record-btn');
        this.elements.resetBtn = document.getElementById('reset-btn');
        
        // 设置相关元素
        this.elements.targetSlider = document.getElementById('target-slider');
        this.elements.targetValue = document.getElementById('target-value');
        this.elements.soundToggle = document.getElementById('sound-toggle');
        this.elements.notificationToggle = document.getElementById('notification-toggle');
        this.elements.saveSettingsBtn = document.getElementById('save-settings');
        this.elements.themeToggle = document.getElementById('theme-toggle');
        
        // 统计相关元素
        this.elements.todayCount = document.getElementById('today-count');
        this.elements.avgInterval = document.getElementById('avg-interval');
        this.elements.maxInterval = document.getElementById('max-interval');
        this.elements.savedMoney = document.getElementById('saved-money');
        
        // 图表相关元素
        this.elements.chartDay = document.getElementById('chart-day');
        this.elements.chartWeek = document.getElementById('chart-week');
        this.elements.chartMonth = document.getElementById('chart-month');
        
        // 记录列表
        this.elements.recordsList = document.getElementById('records-list');
        
        // 健康相关元素
        this.elements.healthCircle = document.getElementById('health-circle');
        this.elements.healthPercent = document.getElementById('health-percent');
        this.elements.healthMessage = document.getElementById('health-message');
        this.elements.healthTip = document.getElementById('health-tip');
        
        // 成就状态
        this.elements.bronzeStatus = document.getElementById('bronze-status');
        this.elements.silverStatus = document.getElementById('silver-status');
        this.elements.goldStatus = document.getElementById('gold-status');
        this.elements.diamondStatus = document.getElementById('diamond-status');
        
        // 小贴士相关
        this.elements.prevTip = document.getElementById('prev-tip');
        this.elements.nextTip = document.getElementById('next-tip');
        
        // 底部按钮
        this.elements.exportBtn = document.getElementById('export-btn');
        this.elements.importBtn = document.getElementById('import-btn');
        this.elements.clearBtn = document.getElementById('clear-btn');
        this.elements.helpBtn = document.getElementById('help-btn');
        this.elements.importFile = document.getElementById('import-file');
        
        // 模态框
        this.elements.helpModal = document.getElementById('help-modal');
        this.elements.confirmModal = document.getElementById('confirm-modal');
    }

    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 计时器控制按钮
        if (this.elements.startBtn) {
            this.elements.startBtn.addEventListener('click', () => this.onStartClick());
        }
        
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => this.onPauseClick());
        }
        
        if (this.elements.recordBtn) {
            this.elements.recordBtn.addEventListener('click', () => this.onRecordClick());
        }
        
        if (this.elements.resetBtn) {
            this.elements.resetBtn.addEventListener('click', () => this.onResetClick());
        }
        
        // 设置相关
        if (this.elements.targetSlider) {
            this.elements.targetSlider.addEventListener('input', (e) => this.onTargetSliderChange(e));
        }
        
        if (this.elements.saveSettingsBtn) {
            this.elements.saveSettingsBtn.addEventListener('click', () => this.onSaveSettingsClick());
        }
        
        if (this.elements.themeToggle) {
            this.elements.themeToggle.addEventListener('click', () => this.onThemeToggleClick());
        }
        
        // 图表控制
        if (this.elements.chartDay) {
            this.elements.chartDay.addEventListener('click', () => this.onChartPeriodClick('day'));
        }
        
        if (this.elements.chartWeek) {
            this.elements.chartWeek.addEventListener('click', () => this.onChartPeriodClick('week'));
        }
        
        if (this.elements.chartMonth) {
            this.elements.chartMonth.addEventListener('click', () => this.onChartPeriodClick('month'));
        }
        
        // 小贴士控制
        if (this.elements.prevTip) {
            this.elements.prevTip.addEventListener('click', () => this.onPrevTipClick());
        }
        
        if (this.elements.nextTip) {
            this.elements.nextTip.addEventListener('click', () => this.onNextTipClick());
        }
        
        // 底部按钮
        if (this.elements.exportBtn) {
            this.elements.exportBtn.addEventListener('click', () => this.onExportClick());
        }
        
        if (this.elements.importBtn) {
            this.elements.importBtn.addEventListener('click', () => this.onImportClick());
        }
        
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.onClearClick());
        }
        
        if (this.elements.helpBtn) {
            this.elements.helpBtn.addEventListener('click', () => this.onHelpClick());
        }
        
        if (this.elements.importFile) {
            this.elements.importFile.addEventListener('change', (e) => this.onImportFileChange(e));
        }
        
        // 模态框关闭按钮
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAllModals();
                }
            });
        });
        
        // 确认对话框按钮
        const confirmCancel = document.getElementById('confirm-cancel');
        const confirmOk = document.getElementById('confirm-ok');
        
        if (confirmCancel) {
            confirmCancel.addEventListener('click', () => this.closeAllModals());
        }
        
        if (confirmOk) {
            confirmOk.addEventListener('click', () => this.onConfirmOkClick());
        }
    }

    /**
     * 初始化模态框
     */
    initModals() {
        this.modals.help = this.elements.helpModal;
        this.modals.confirm = this.elements.confirmModal;
    }

    /**
     * 初始化通知系统
     */
    initNotifications() {
        // 创建通知容器
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 350px;
        `;
        document.body.appendChild(notificationContainer);
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        if (!window.EventBus) return;
        
        // 监听计时器更新事件
        window.EventBus.on(window.EventTypes.TIMER_UPDATE, (event) => {
            this.updateTimerDisplay(event.data);
        });
        
        // 监听数据更新事件
        window.EventBus.on(window.EventTypes.DATA_UPDATE, (event) => {
            this.updateStatsDisplay(event.data);
            this.updateRecordsList();
        });
        
        // 监听健康更新事件
        window.EventBus.on(window.EventTypes.HEALTH_UPDATED, (event) => {
            this.updateHealthDisplay(event.data);
        });
        
        // 监听成就解锁事件
        window.EventBus.on('health:achievement_unlocked', (event) => {
            this.updateAchievementDisplay(event.data);
        });
        
        // 监听设置加载事件
        window.EventBus.on(window.EventTypes.SETTINGS_LOADED, (event) => {
            this.updateSettingsDisplay(event.data);
        });
        
        // 监听通知显示事件
        window.EventBus.on(window.EventTypes.UI_NOTIFICATION_SHOW, (event) => {
            this.showNotification(event.data);
        });
    }

    /**
     * 更新计时器显示
     * @param {Object} timerData - 计时器数据
     */
    updateTimerDisplay(timerData) {
        if (!timerData) return;
        
        // 更新时间显示
        if (this.elements.timerDisplay && timerData.formattedTime) {
            this.elements.timerDisplay.textContent = timerData.formattedTime;
        }
        
        // 更新状态显示
        if (this.elements.timerStatus) {
            let statusText = '已停止';
            if (timerData.isRunning && !timerData.isPaused) {
                statusText = '运行中';
            } else if (timerData.isPaused) {
                statusText = '已暂停';
            }
            this.elements.timerStatus.textContent = statusText;
        }
        
        // 更新当前间隔
        if (this.elements.currentInterval && timerData.elapsedTime !== undefined) {
            const minutes = Math.floor(timerData.elapsedTime / 60);
            this.elements.currentInterval.textContent = `${minutes}分钟`;
        }
        
        // 更新目标间隔
        if (this.elements.targetInterval && timerData.targetInterval !== undefined) {
            const hours = Math.floor(timerData.targetInterval / 3600);
            this.elements.targetInterval.textContent = `${hours}小时`;
        }
        
        // 更新进度条
        if (this.elements.progressFill && timerData.progress !== undefined) {
            const progressPercent = Math.min(timerData.progress * 100, 100);
            this.elements.progressFill.style.width = `${progressPercent}%`;
            
            if (this.elements.progressText) {
                this.elements.progressText.textContent = `${Math.round(progressPercent)}%`;
            }
        }
        
        // 更新按钮状态
        this.updateTimerButtons(timerData);
    }

    /**
     * 更新计时器按钮状态
     * @param {Object} timerData - 计时器数据
     */
    updateTimerButtons(timerData) {
        if (!timerData) return;
        
        if (this.elements.startBtn) {
            if (timerData.isRunning && !timerData.isPaused) {
                this.elements.startBtn.disabled = true;
                this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> 运行中';
            } else if (timerData.isPaused) {
                this.elements.startBtn.disabled = false;
                this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> 继续';
            } else {
                this.elements.startBtn.disabled = false;
                this.elements.startBtn.innerHTML = '<i class="fas fa-play"></i> 开始计时';
            }
        }
        
        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.disabled = !timerData.isRunning || timerData.isPaused;
        }
        
        if (this.elements.recordBtn) {
            this.elements.recordBtn.disabled = !timerData.isRunning;
        }
    }

    /**
     * 更新统计数据显示
     * @param {Object} statsData - 统计数据
     */
    updateStatsDisplay(statsData) {
        if (!statsData) return;
        
        // 更新今日次数
        if (this.elements.todayCount) {
            this.elements.todayCount.textContent = statsData.todayCount || 0;
        }
        
        // 更新平均间隔
        if (this.elements.avgInterval) {
            const minutes = Math.round((statsData.avgInterval || 0) / 60);
            this.elements.avgInterval.textContent = `${minutes}分钟`;
        }
        
        // 更新最长间隔
        if (this.elements.maxInterval) {
            const minutes = Math.round((statsData.maxInterval || 0) / 60);
            this.elements.maxInterval.textContent = `${minutes}分钟`;
        }
        
        // 更新节省金额
        if (this.elements.savedMoney) {
            this.elements.savedMoney.textContent = `¥${(statsData.savedMoney || 0).toFixed(2)}`;
        }
    }

    /**
     * 更新记录列表
     */
    updateRecordsList() {
        if (!this.elements.recordsList || !window.DataModule) return;
        
        const records = window.DataModule.getRecords({ limit: 10 });
        
        if (records.length === 0) {
            this.elements.recordsList.innerHTML = `
                <div class="empty-records">
                    <i class="fas fa-clock"></i>
                    <p>暂无抽烟记录</p>
                    <p class="small-text">点击"记录抽烟"按钮开始记录</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        records.forEach(record => {
            const time = new Date(record.timestamp);
            const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = time.toLocaleDateString();
            const intervalMinutes = Math.round(record.interval / 60);
            
            html += `
                <div class="record-item">
                    <div class="record-time">
                        <div class="record-time-main">${timeStr}</div>
                        <div class="record-time-relative">${dateStr}</div>
                    </div>
                    <div class="record-info">
                        <div class="record-interval">${intervalMinutes}分钟</div>
                        <div class="record-goal ${record.goalReached ? '' : 'missed'}">
                            ${record.goalReached ? '达标' : '未达标'}
                        </div>
                    </div>
                </div>
            `;
        });
        
        this.elements.recordsList.innerHTML = html;
    }

    /**
     * 更新健康显示
     * @param {Object} healthData - 健康数据
     */
    updateHealthDisplay(healthData) {
        if (!healthData) return;
        
        // 更新健康进度圆环
        if (this.elements.healthCircle && healthData.progress !== undefined) {
            const circumference = 2 * Math.PI * 54; // 半径54
            const offset = circumference - (healthData.progress / 100) * circumference;
            this.elements.healthCircle.style.strokeDashoffset = offset;
        }
        
        // 更新健康百分比
        if (this.elements.healthPercent) {
            this.elements.healthPercent.textContent = `${healthData.progress || 0}%`;
        }
        
        // 更新健康消息
        if (this.elements.healthMessage && window.Health) {
            this.elements.healthMessage.textContent = window.Health.getHealthProgressDescription();
        }
        
        // 更新健康小贴士
        if (this.elements.healthTip && window.Health) {
            this.elements.healthTip.textContent = window.Health.getCurrentTip();
        }
        
        // 更新成就显示
        this.updateAchievementsDisplay();
    }

    /**
     * 更新成就显示
     */
    updateAchievementsDisplay() {
        if (!window.Health) return;
        
        const achievements = window.Health.getAllAchievementStatus();
        
        // 更新每个成就的状态
        Object.entries(achievements).forEach(([level, achievement]) => {
            const element = this.elements[`${level}Status`];
            if (element) {
                if (achievement.unlocked) {
                    element.innerHTML = '<i class="fas fa-unlock"></i>';
                    element.style.color = achievement.color;
                    element.title = `${achievement.name} - 已解锁`;
                } else {
                    element.innerHTML = '<i class="fas fa-lock"></i>';
                    element.style.color = '';
                    element.title = `${achievement.name} - 还需${achievement.requiredDays - achievement.currentDays}天`;
                }
            }
        });
    }

    /**
     * 更新单个成就显示
     * @param {Object} achievementData - 成就数据
     */
    updateAchievementDisplay(achievementData) {
        if (!achievementData) return;
        
        const element = this.elements[`${achievementData.level}Status`];
        if (element) {
            element.innerHTML = '<i class="fas fa-unlock"></i>';
            element.style.color = achievementData.color;
            element.title = `${achievementData.name} - 已解锁`;
            
            // 添加解锁动画
            element.classList.add('unlocked');
            setTimeout(() => {
                element.classList.remove('unlocked');
            }, 1000);
        }
    }

    /**
     * 更新设置显示
     * @param {Object} settings - 设置数据
     */
    updateSettingsDisplay(settings) {
        if (!settings) return;
        
        // 更新目标间隔滑块
        if (this.elements.targetSlider && this.elements.targetValue) {
            const hours = Math.round(settings.targetInterval / 3600 * 2) / 2; // 以0.5小时为步长
            this.elements.targetSlider.value = hours;
            this.elements.targetValue.textContent = hours;
        }
        
        // 更新声音开关
        if (this.elements.soundToggle) {
            this.elements.soundToggle.checked = settings.enableSound || false;
        }
        
        // 更新通知开关
        if (this.elements.notificationToggle) {
            this.elements.notificationToggle.checked = settings.enableNotifications || false;
        }
        
        // 更新主题按钮图标
        if (this.elements.themeToggle) {
            const icon = this.elements.themeToggle.querySelector('i');
            if (icon) {
                if (settings.theme === 'dark') {
                    icon.className = 'fas fa-sun';
                    icon.title = '切换到浅色主题';
                } else if (settings.theme === 'health') {
                    icon.className = 'fas fa-heart';
                    icon.title = '切换到浅色主题';
                } else {
                    icon.className = 'fas fa-moon';
                    icon.title = '切换到深色主题';
                }
            }
        }
    }

    /**
     * 显示通知
     * @param {Object} notificationData - 通知数据
     */
    showNotification(notificationData) {
        if (!notificationData || !notificationData.message) return;
        
        const container = document.getElementById('notification-container');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = `notification ${notificationData.type || 'info'}`;
        
        const icon = notificationData.icon || 
            (notificationData.type === 'success' ? 'fas fa-check-circle' :
             notificationData.type === 'warning' ? 'fas fa-exclamation-triangle' :
             notificationData.type === 'error' ? 'fas fa-times-circle' :
             'fas fa-info-circle');
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="notification-message">${notificationData.message}</div>
                <button class="notification-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        container.appendChild(notification);
        
        // 添加关闭事件
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            });
        }
        
        // 显示通知
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // 自动关闭
        const duration = notificationData.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.parentNode.removeChild(notification);
                        }
                    }, 300);
                }
            }, duration);
        }
        
        // 限制通知数量
        const maxNotifications = 5;
        if (container.children.length > maxNotifications) {
            const oldest = container.children[0];
            oldest.classList.remove('show');
            setTimeout(() => {
                if (oldest.parentNode) {
                    oldest.parentNode.removeChild(oldest);
                }
            }, 300);
        }
    }

    /**
     * 显示模态框
     * @param {string} modalName - 模态框名称
     */
    showModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * 隐藏模态框
     * @param {string} modalName - 模态框名称
     */
    hideModal(modalName) {
        const modal = this.modals[modalName];
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    /**
     * 关闭所有模态框
     */
    closeAllModals() {
        Object.keys(this.modals).forEach(modalName => {
            this.hideModal(modalName);
        });
    }

    /**
     * 显示确认对话框
     * @param {Object} options - 确认选项
     */
    showConfirm(options = {}) {
        const title = document.getElementById('confirm-title');
        const message = document.getElementById('confirm-message');
        
        if (title) title.textContent = options.title || '确认操作';
        if (message) message.textContent = options.message || '您确定要执行此操作吗？';
        
        this.confirmCallback = options.callback;
        this.showModal('confirm');
    }

    /**
     * 按钮点击事件处理
     */
    onStartClick() {
        if (window.Timer) {
            window.Timer.start();
        }
    }

    onPauseClick() {
        if (window.Timer) {
            window.Timer.pause();
        }
    }

    onRecordClick() {
        if (window.Timer) {
            window.Timer.recordSmoking();
        }
    }

    onResetClick() {
        this.showConfirm({
            title: '重置计时器',
            message: '确定要重置计时器吗？当前计时进度将丢失。',
            callback: (confirmed) => {
                if (confirmed && window.Timer) {
                    window.Timer.reset();
                }
            }
        });
    }

    onTargetSliderChange(e) {
        if (this.elements.targetValue) {
            this.elements.targetValue.textContent = e.target.value;
        }
    }

    onSaveSettingsClick() {
        if (!window.Settings) return;
        
        const settings = {
            targetInterval: parseFloat(this.elements.targetSlider.value) * 3600,
            enableSound: this.elements.soundToggle.checked,
            enableNotifications: this.elements.notificationToggle.checked
        };
        
        window.Settings.updateSettings(settings);
        
        this.showNotification({
            type: 'success',
            message: '设置已保存',
            duration: 3000
        });
    }

    onThemeToggleClick() {
        if (window.EventBus) {
            window.EventBus.emit('ui:theme_toggle');
        }
    }

    onChartPeriodClick(period) {
        // 更新按钮状态
        ['day', 'week', 'month'].forEach(p => {
            const btn = this.elements[`chart${p.charAt(0).toUpperCase() + p.slice(1)}`];
            if (btn) {
                btn.classList.toggle('active', p === period);
            }
        });
        
        // 更新图表
        if (window.DataModule) {
            window.DataModule.updateChart(period);
        }
    }

    onPrevTipClick() {
        if (window.Health) {
            const tip = window.Health.getNextTip();
            if (this.elements.healthTip) {
                this.elements.healthTip.textContent = tip;
            }
        }
    }

    onNextTipClick() {
        if (window.Health) {
            const tip = window.Health.getNextTip();
            if (this.elements.healthTip) {
                this.elements.healthTip.textContent = tip;
            }
        }
    }

    onExportClick() {
        if (!window.DataModule) return;
        
        const data = window.DataModule.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `抽烟计时器数据_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        this.showNotification({
            type: 'success',
            message: '数据导出成功',
            duration: 3000
        });
    }

    onImportClick() {
        if (this.elements.importFile) {
            this.elements.importFile.click();
        }
    }

    onImportFileChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                
                this.showConfirm({
                    title: '导入数据',
                    message: `确定要导入数据吗？这将覆盖当前数据。`,
                    callback: (confirmed) => {
                        if (confirmed && window.DataModule) {
                            const result = window.DataModule.importData(data);
                            
                            if (result.success) {
                                this.showNotification({
                                    type: 'success',
                                    message: result.message,
                                    duration: 5000
                                });
                            } else {
                                this.showNotification({
                                    type: 'error',
                                    message: result.message,
                                    duration: 5000
                                });
                            }
                        }
                        
                        // 重置文件输入
                        e.target.value = '';
                    }
                });
            } catch (error) {
                this.showNotification({
                    type: 'error',
                    message: '文件格式错误，请选择正确的JSON文件',
                    duration: 5000
                });
                e.target.value = '';
            }
        };
        
        reader.readAsText(file);
    }

    onClearClick() {
        this.showConfirm({
            title: '清除数据',
            message: '确定要清除所有数据吗？此操作不可恢复。',
            callback: (confirmed) => {
                if (confirmed && window.DataModule) {
                    window.DataModule.clearData();
                    
                    this.showNotification({
                        type: 'success',
                        message: '所有数据已清除',
                        duration: 3000
                    });
                }
            }
        });
    }

    onHelpClick() {
        this.showModal('help');
    }

    onConfirmOkClick() {
        if (this.confirmCallback) {
            this.confirmCallback(true);
        }
        this.closeAllModals();
    }

    /**
     * 销毁UI组件
     */
    destroy() {
        // 移除事件监听器
        // 这里可以添加移除事件监听器的代码
        
        // 清除通知容器
        const container = document.getElementById('notification-container');
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
        
        console.log('UI组件已销毁');
    }
}

// 创建全局UI组件实例
const ui = new UIComponents();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.UI = ui;
}

export default ui;