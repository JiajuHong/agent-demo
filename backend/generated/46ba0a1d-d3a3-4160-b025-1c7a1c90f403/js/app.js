/**
 * 智能抽烟计时器 - 主应用文件
 * 协调所有模块，初始化应用
 */

class SmokingTimerApp {
    constructor() {
        this.modules = {};
        this.isInitialized = false;
        this.isRunning = false;
    }

    /**
     * 初始化应用
     */
    async init() {
        if (this.isInitialized) {
            console.warn('应用已经初始化');
            return;
        }

        console.log('正在初始化智能抽烟计时器...');

        try {
            // 1. 初始化工具模块
            await this.initUtils();
            
            // 2. 初始化核心模块
            await this.initCoreModules();
            
            // 3. 初始化UI模块
            await this.initUIModules();
            
            // 4. 启动应用
            await this.start();
            
            this.isInitialized = true;
            console.log('智能抽烟计时器初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('应用初始化失败，请刷新页面重试');
        }
    }

    /**
     * 初始化工具模块
     */
    async initUtils() {
        console.log('初始化工具模块...');
        
        // 工具模块已经在各自的文件中初始化
        // 这里只需要确保它们已加载
        if (!window.TimeUtils || !window.MathUtils || !window.ValidationUtils) {
            console.warn('某些工具模块未正确加载');
        }
    }

    /**
     * 初始化核心模块
     */
    async initCoreModules() {
        console.log('初始化核心模块...');
        
        // 事件总线
        if (!window.EventBus) {
            throw new Error('事件总线模块未加载');
        }
        this.modules.eventBus = window.EventBus;
        
        // 存储模块
        if (!window.Storage) {
            throw new Error('存储模块未加载');
        }
        this.modules.storage = window.Storage;
        
        // 计时器模块
        if (!window.Timer) {
            throw new Error('计时器模块未加载');
        }
        this.modules.timer = window.Timer;
        
        // 数据模块
        if (!window.DataModule) {
            throw new Error('数据模块未加载');
        }
        this.modules.data = window.DataModule;
        
        // 设置模块
        if (!window.Settings) {
            throw new Error('设置模块未加载');
        }
        this.modules.settings = window.Settings;
        
        // 健康模块
        if (!window.Health) {
            throw new Error('健康模块未加载');
        }
        this.modules.health = window.Health;
    }

    /**
     * 初始化UI模块
     */
    async initUIModules() {
        console.log('初始化UI模块...');
        
        // UI组件
        if (!window.UI) {
            throw new Error('UI组件模块未加载');
        }
        this.modules.ui = window.UI;
        
        // 主题管理器
        if (!window.ThemeManager) {
            throw new Error('主题管理器模块未加载');
        }
        this.modules.themeManager = window.ThemeManager;
    }

    /**
     * 启动应用
     */
    async start() {
        if (this.isRunning) {
            console.warn('应用已经在运行中');
            return;
        }

        console.log('启动应用...');

        try {
            // 1. 检查浏览器兼容性
            this.checkBrowserCompatibility();
            
            // 2. 初始化事件监听
            this.initGlobalEventListeners();
            
            // 3. 恢复应用状态
            await this.restoreAppState();
            
            // 4. 触发应用就绪事件
            this.emitAppReady();
            
            // 5. 显示欢迎消息
            this.showWelcomeMessage();
            
            this.isRunning = true;
            console.log('应用启动完成');
            
        } catch (error) {
            console.error('应用启动失败:', error);
            this.showError('应用启动失败: ' + error.message);
        }
    }

    /**
     * 检查浏览器兼容性
     */
    checkBrowserCompatibility() {
        console.log('检查浏览器兼容性...');
        
        const requirements = {
            'localStorage': 'localStorage' in window && window.localStorage !== null,
            'JSON': 'JSON' in window,
            'requestAnimationFrame': 'requestAnimationFrame' in window,
            'classList': 'classList' in document.createElement('div'),
            'querySelector': 'querySelector' in document,
            'addEventListener': 'addEventListener' in window
        };
        
        const missingFeatures = Object.entries(requirements)
            .filter(([_, supported]) => !supported)
            .map(([feature]) => feature);
        
        if (missingFeatures.length > 0) {
            console.warn('缺少以下浏览器功能:', missingFeatures);
            this.showWarning('您的浏览器缺少一些功能，某些特性可能无法正常工作');
        }
        
        // 检查ES6+支持
        try {
            new Function('const test = () => {}; class Test {}');
        } catch (error) {
            console.warn('浏览器可能不支持ES6+语法');
            this.showWarning('您的浏览器版本较旧，建议升级以获得更好的体验');
        }
    }

    /**
     * 初始化全局事件监听
     */
    initGlobalEventListeners() {
        console.log('初始化全局事件监听...');
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // 页面卸载前保存状态
        window.addEventListener('beforeunload', (event) => {
            this.handleBeforeUnload(event);
        });
        
        // 在线状态变化
        window.addEventListener('online', () => {
            this.handleOnlineStatusChange(true);
        });
        
        window.addEventListener('offline', () => {
            this.handleOnlineStatusChange(false);
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
        
        // 错误处理
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });
        
        window.addEventListener('unhandledrejection', (event) => {
            this.handleUnhandledRejection(event);
        });
    }

    /**
     * 恢复应用状态
     */
    async restoreAppState() {
        console.log('恢复应用状态...');
        
        try {
            // 检查是否需要重置今日统计
            if (this.modules.storage.shouldResetTodayStats()) {
                console.log('检测到新的一天，重置今日统计');
                this.modules.data.resetTodayStats();
            }
            
            // 更新UI显示
            this.updateAllDisplays();
            
            // 请求通知权限（如果设置中启用了通知）
            const settings = this.modules.settings.getSettings();
            if (settings.enableNotifications) {
                await this.modules.timer.requestNotificationPermission();
            }
            
        } catch (error) {
            console.error('恢复应用状态失败:', error);
        }
    }

    /**
     * 更新所有显示
     */
    updateAllDisplays() {
        // 更新计时器显示
        if (this.modules.timer) {
            const timerStatus = this.modules.timer.getStatus();
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.TIMER_UPDATE, timerStatus);
            }
        }
        
        // 更新数据统计显示
        if (this.modules.data) {
            const stats = this.modules.data.getStats();
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.DATA_UPDATE, stats);
            }
        }
        
        // 更新健康显示
        if (this.modules.health) {
            const healthData = {
                progress: this.modules.health.getHealthProgress()
            };
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.HEALTH_UPDATED, healthData);
            }
        }
    }

    /**
     * 触发应用就绪事件
     */
    emitAppReady() {
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.APP_READY, {
                timestamp: Date.now(),
                version: '1.0.0',
                modules: Object.keys(this.modules)
            });
        }
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        // 检查是否是第一次使用
        const isFirstUse = !localStorage.getItem('smoking-timer-first-use');
        
        if (isFirstUse) {
            setTimeout(() => {
                if (window.EventBus) {
                    window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                        type: 'info',
                        message: '欢迎使用智能抽烟计时器！点击"帮助"按钮查看使用说明。',
                        duration: 8000
                    });
                }
                
                // 标记已使用
                try {
                    localStorage.setItem('smoking-timer-first-use', 'true');
                } catch (error) {
                    console.warn('无法保存首次使用标记:', error);
                }
            }, 1000);
        }
    }

    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        const isHidden = document.hidden;
        
        if (isHidden) {
            // 页面隐藏时暂停计时器（可选）
            // if (this.modules.timer && this.modules.timer.isRunning) {
            //     this.modules.timer.pause();
            // }
        } else {
            // 页面重新显示时恢复显示
            this.updateAllDisplays();
        }
    }

    /**
     * 处理页面卸载前
     */
    handleBeforeUnload(event) {
        // 保存当前状态
        this.saveAppState();
        
        // 如果计时器正在运行，提示用户
        if (this.modules.timer && this.modules.timer.isRunning) {
            event.preventDefault();
            event.returnValue = '计时器正在运行，确定要离开吗？';
            return event.returnValue;
        }
    }

    /**
     * 处理在线状态变化
     */
    handleOnlineStatusChange(isOnline) {
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                type: isOnline ? 'success' : 'warning',
                message: isOnline ? '网络连接已恢复' : '网络连接已断开',
                duration: 3000
            });
        }
    }

    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(event) {
        // 只在没有输入焦点时处理快捷键
        if (event.target.tagName === 'INPUT' || 
            event.target.tagName === 'TEXTAREA' ||
            event.target.isContentEditable) {
            return;
        }
        
        // 检查是否按下了Ctrl/Command键
        const isModifierKey = event.ctrlKey || event.metaKey;
        
        switch (event.key.toLowerCase()) {
            case ' ':
                // 空格键：开始/暂停计时器
                event.preventDefault();
                this.toggleTimer();
                break;
                
            case 'r':
                // R键：记录抽烟
                if (!isModifierKey) {
                    event.preventDefault();
                    this.recordSmoking();
                }
                break;
                
            case 't':
                // T键：切换主题
                if (!isModifierKey) {
                    event.preventDefault();
                    this.toggleTheme();
                }
                break;
                
            case 'h':
                // Ctrl+H：显示帮助
                if (isModifierKey) {
                    event.preventDefault();
                    this.showHelp();
                }
                break;
                
            case 'e':
                // Ctrl+E：导出数据
                if (isModifierKey) {
                    event.preventDefault();
                    this.exportData();
                }
                break;
        }
    }

    /**
     * 处理全局错误
     */
    handleGlobalError(event) {
        console.error('全局错误:', event.error);
        
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.APP_ERROR, {
                error: event.error,
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        }
    }

    /**
     * 处理未处理的Promise拒绝
     */
    handleUnhandledRejection(event) {
        console.error('未处理的Promise拒绝:', event.reason);
        
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.APP_ERROR, {
                error: event.reason,
                type: 'unhandled_rejection'
            });
        }
    }

    /**
     * 保存应用状态
     */
    saveAppState() {
        try {
            // 各模块已经自动保存数据到localStorage
            // 这里可以添加额外的状态保存逻辑
            console.log('应用状态已保存');
        } catch (error) {
            console.error('保存应用状态失败:', error);
        }
    }

    /**
     * 显示错误消息
     */
    showError(message) {
        console.error('应用错误:', message);
        
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                type: 'error',
                message: message,
                duration: 10000
            });
        }
    }

    /**
     * 显示警告消息
     */
    showWarning(message) {
        console.warn('应用警告:', message);
        
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                type: 'warning',
                message: message,
                duration: 8000
            });
        }
    }

    /**
     * 显示信息消息
     */
    showInfo(message) {
        console.info('应用信息:', message);
        
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                type: 'info',
                message: message,
                duration: 5000
            });
        }
    }

    /**
     * 工具方法：切换计时器状态
     */
    toggleTimer() {
        if (!this.modules.timer) return;
        
        if (this.modules.timer.isRunning && !this.modules.timer.isPaused) {
            this.modules.timer.pause();
        } else {
            this.modules.timer.start();
        }
    }

    /**
     * 工具方法：记录抽烟
     */
    recordSmoking() {
        if (!this.modules.timer) return;
        
        if (this.modules.timer.isRunning) {
            this.modules.timer.recordSmoking();
        } else {
            this.showInfo('请先启动计时器');
        }
    }

    /**
     * 工具方法：切换主题
     */
    toggleTheme() {
        if (!this.modules.themeManager) return;
        
        this.modules.themeManager.toggleTheme();
    }

    /**
     * 工具方法：显示帮助
     */
    showHelp() {
        if (this.modules.ui) {
            this.modules.ui.showModal('help');
        }
    }

    /**
     * 工具方法：导出数据
     */
    exportData() {
        if (!this.modules.data) return;
        
        this.modules.ui.onExportClick();
    }

    /**
     * 获取应用信息
     */
    getAppInfo() {
        return {
            name: '智能抽烟计时器',
            version: '1.0.0',
            description: '帮助控制抽烟频率的健康管理工具',
            author: '智能抽烟计时器团队',
            initialized: this.isInitialized,
            running: this.isRunning,
            modules: Object.keys(this.modules),
            browser: {
                userAgent: navigator.userAgent,
                language: navigator.language,
                online: navigator.onLine,
                storage: {
                    localStorage: 'localStorage' in window,
                    sessionStorage: 'sessionStorage' in window
                }
            }
        };
    }

    /**
     * 重置应用
     */
    async resetApp() {
        this.showConfirm({
            title: '重置应用',
            message: '确定要重置应用吗？这将清除所有数据并恢复默认设置。',
            callback: async (confirmed) => {
                if (confirmed) {
                    try {
                        // 停止所有模块
                        await this.stop();
                        
                        // 清除所有数据
                        if (this.modules.storage) {
                            this.modules.storage.clearAllData();
                        }
                        
                        // 清除本地存储
                        localStorage.clear();
                        
                        // 重新初始化
                        await this.init();
                        
                        this.showInfo('应用已重置并重新初始化');
                        
                    } catch (error) {
                        console.error('重置应用失败:', error);
                        this.showError('重置应用失败: ' + error.message);
                    }
                }
            }
        });
    }

    /**
     * 显示确认对话框
     */
    showConfirm(options) {
        if (this.modules.ui) {
            this.modules.ui.showConfirm(options);
        }
    }

    /**
     * 停止应用
     */
    async stop() {
        if (!this.isRunning) return;
        
        console.log('正在停止应用...');
        
        try {
            // 停止计时器
            if (this.modules.timer) {
                this.modules.timer.destroy();
            }
            
            // 保存状态
            this.saveAppState();
            
            this.isRunning = false;
            console.log('应用已停止');
            
        } catch (error) {
            console.error('停止应用失败:', error);
        }
    }

    /**
     * 销毁应用
     */
    async destroy() {
        console.log('正在销毁应用...');
        
        try {
            // 停止应用
            await this.stop();
            
            // 销毁所有模块
            Object.values(this.modules).forEach(module => {
                if (module && typeof module.destroy === 'function') {
                    try {
                        module.destroy();
                    } catch (error) {
                        console.error('销毁模块失败:', error);
                    }
                }
            });
            
            this.modules = {};
            this.isInitialized = false;
            
            console.log('应用已销毁');
            
        } catch (error) {
            console.error('销毁应用失败:', error);
        }
    }
}

// 创建全局应用实例
const app = new SmokingTimerApp();

// 当DOM加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM加载完成，开始初始化应用...');
    
    // 显示加载状态
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'app-loading';
    loadingIndicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: var(--bg-primary);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        transition: opacity 0.3s ease;
    `;
    
    loadingIndicator.innerHTML = `
        <div class="loader loader-large"></div>
        <p style="margin-top: 20px; color: var(--text-secondary);">正在加载智能抽烟计时器...</p>
    `;
    
    document.body.appendChild(loadingIndicator);
    
    // 初始化应用
    app.init().then(() => {
        // 隐藏加载指示器
        setTimeout(() => {
            loadingIndicator.style.opacity = '0';
            setTimeout(() => {
                if (loadingIndicator.parentNode) {
                    loadingIndicator.parentNode.removeChild(loadingIndicator);
                }
            }, 300);
        }, 500);
    }).catch(error => {
        console.error('应用初始化失败:', error);
        loadingIndicator.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <h3 style="color: var(--danger-color); margin-bottom: 20px;">应用加载失败</h3>
                <p style="color: var(--text-secondary); margin-bottom: 20px;">${error.message}</p>
                <button id="retry-load" class="btn btn-primary" style="margin-top: 20px;">
                    重试加载
                </button>
            </div>
        `;
        
        document.getElementById('retry-load')?.addEventListener('click', () => {
            location.reload();
        });
    });
});

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.SmokingTimerApp = app;
}

// 导出应用实例
export default app;