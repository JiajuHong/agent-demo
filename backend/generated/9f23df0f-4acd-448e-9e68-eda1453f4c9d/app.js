/**
 * 抽烟小助手 - 主应用文件
 * 初始化所有模块并启动应用
 */

// 应用主类
class SmokingAssistantApp {
    constructor() {
        this.storageManager = null;
        this.recordsManager = null;
        this.statsCalculator = null;
        this.uiManager = null;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        console.log('抽烟小助手正在启动...');
        
        // 检查浏览器兼容性
        if (!this.checkBrowserCompatibility()) {
            this.showCompatibilityWarning();
            return;
        }
        
        // 初始化模块
        this.initModules();
        
        // 启动应用
        this.start();
        
        console.log('抽烟小助手启动完成');
    }

    /**
     * 检查浏览器兼容性
     * @returns {boolean} 是否兼容
     */
    checkBrowserCompatibility() {
        // 检查LocalStorage
        try {
            localStorage.setItem('test', 'test');
            localStorage.removeItem('test');
        } catch (e) {
            console.error('LocalStorage不可用:', e);
            return false;
        }
        
        // 检查ES6特性
        if (typeof Promise === 'undefined') {
            console.error('Promise不可用');
            return false;
        }
        
        // 检查现代JavaScript特性
        if (typeof Object.assign === 'undefined') {
            console.error('Object.assign不可用');
            return false;
        }
        
        return true;
    }

    /**
     * 显示浏览器兼容性警告
     */
    showCompatibilityWarning() {
        const warningHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                text-align: center;
            ">
                <div style="max-width: 500px;">
                    <h2 style="color: #ff6b6b; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle"></i> 浏览器不兼容
                    </h2>
                    <p style="margin-bottom: 20px; line-height: 1.6;">
                        您的浏览器版本过旧，无法正常运行抽烟小助手。
                        请升级到最新版本的 Chrome、Firefox、Safari 或 Edge。
                    </p>
                    <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                        <a href="https://www.google.com/chrome/" 
                           target="_blank"
                           style="
                               background: #4285f4;
                               color: white;
                               padding: 10px 20px;
                               border-radius: 5px;
                               text-decoration: none;
                               display: flex;
                               align-items: center;
                               gap: 8px;
                           ">
                            <i class="fab fa-chrome"></i> Chrome
                        </a>
                        <a href="https://www.mozilla.org/firefox/" 
                           target="_blank"
                           style="
                               background: #ff7139;
                               color: white;
                               padding: 10px 20px;
                               border-radius: 5px;
                               text-decoration: none;
                               display: flex;
                               align-items: center;
                               gap: 8px;
                           ">
                            <i class="fab fa-firefox"></i> Firefox
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        document.body.innerHTML = warningHTML;
    }

    /**
     * 初始化所有模块
     */
    initModules() {
        try {
            // 初始化存储管理器
            this.storageManager = StorageManager;
            
            // 初始化记录管理器
            this.recordsManager = RecordsManager;
            this.recordsManager.init(this.storageManager);
            
            // 初始化统计计算器
            this.statsCalculator = StatsCalculator;
            this.statsCalculator.init(this.recordsManager);
            
            // 初始化UI管理器
            this.uiManager = UIManager;
            
        } catch (error) {
            console.error('初始化模块失败:', error);
            throw new Error('应用初始化失败');
        }
    }

    /**
     * 启动应用
     */
    start() {
        try {
            // 初始化UI管理器
            this.uiManager.init(this.recordsManager, this.statsCalculator);
            
            // 添加启动动画
            this.addStartupAnimation();
            
            // 显示欢迎消息
            setTimeout(() => {
                this.showWelcomeMessage();
            }, 1000);
            
            // 添加页面可见性变化监听
            this.addVisibilityChangeListener();
            
            // 添加离线检测
            this.addOfflineDetection();
            
            // 添加服务工作者（如果支持）
            this.registerServiceWorker();
            
        } catch (error) {
            console.error('启动应用失败:', error);
            this.showErrorMessage('应用启动失败，请刷新页面重试');
        }
    }

    /**
     * 添加启动动画
     */
    addStartupAnimation() {
        // 为统计卡片添加渐入动画
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        // 为按钮添加渐入动画
        const buttons = document.querySelectorAll('.btn-primary, .btn-secondary');
        buttons.forEach((button, index) => {
            button.style.opacity = '0';
            
            setTimeout(() => {
                button.style.transition = 'opacity 0.5s ease';
                button.style.opacity = '1';
            }, 500 + (index * 100));
        });
    }

    /**
     * 显示欢迎消息
     */
    showWelcomeMessage() {
        const todayRecords = this.recordsManager.getTodayRecords();
        
        if (todayRecords.length === 0) {
            this.uiManager.showMessage('欢迎使用抽烟小助手！点击"记录抽烟"按钮开始记录。', 'info');
        } else {
            const stats = this.statsCalculator.calculateAllStats();
            const message = `欢迎回来！今天已抽烟 ${stats.todayCount} 次，花费了 ${stats.spentMoney} 元。`;
            this.uiManager.showMessage(message, 'info');
        }
    }

    /**
     * 添加页面可见性变化监听
     */
    addVisibilityChangeListener() {
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                // 页面重新可见时刷新数据
                console.log('页面重新可见，刷新数据...');
                this.uiManager.loadData();
            }
        });
    }

    /**
     * 添加离线检测
     */
    addOfflineDetection() {
        window.addEventListener('online', () => {
            this.uiManager.showMessage('网络已恢复', 'success');
        });
        
        window.addEventListener('offline', () => {
            this.uiManager.showMessage('网络已断开，数据将保存在本地', 'warning');
        });
    }

    /**
     * 注册Service Worker（如果支持）
     */
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => {
                        console.log('ServiceWorker注册成功:', registration.scope);
                    })
                    .catch(error => {
                        console.log('ServiceWorker注册失败:', error);
                    });
            });
        }
    }

    /**
     * 显示错误消息
     * @param {string} message - 错误消息
     */
    showErrorMessage(message) {
        const errorHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                padding: 20px;
                text-align: center;
            ">
                <div style="max-width: 500px;">
                    <div style="font-size: 4rem; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-circle"></i>
                    </div>
                    <h2 style="margin-bottom: 20px;">应用出错</h2>
                    <p style="margin-bottom: 30px; line-height: 1.6;">${message}</p>
                    <button onclick="window.location.reload()" 
                            style="
                                background: white;
                                color: #667eea;
                                border: none;
                                padding: 12px 30px;
                                border-radius: 25px;
                                font-size: 1rem;
                                font-weight: 600;
                                cursor: pointer;
                                transition: transform 0.3s ease;
                            "
                            onmouseover="this.style.transform='scale(1.05)'"
                            onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-redo"></i> 刷新页面
                    </button>
                </div>
            </div>
        `;
        
        document.body.innerHTML = errorHTML;
    }

    /**
     * 导出数据
     * @returns {string} JSON格式的数据
     */
    exportData() {
        try {
            const allRecords = this.recordsManager.getAllRecords();
            const settings = this.recordsManager.getSettings();
            const stats = this.recordsManager.getRecordsStats();
            
            const exportData = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                records: allRecords,
                settings: settings,
                stats: stats,
                metadata: {
                    totalRecords: allRecords.length,
                    exportTimestamp: Date.now()
                }
            };
            
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('导出数据失败:', error);
            return null;
        }
    }

    /**
     * 导入数据
     * @param {string} jsonData - JSON格式的数据
     * @returns {boolean} 是否导入成功
     */
    importData(jsonData) {
        try {
            const importData = JSON.parse(jsonData);
            
            // 验证数据格式
            if (!importData.records || !Array.isArray(importData.records)) {
                throw new Error('数据格式无效');
            }
            
            // 保存记录
            this.storageManager.saveData(this.storageManager.KEYS.RECORDS, importData.records);
            
            // 保存设置（如果有）
            if (importData.settings) {
                this.storageManager.saveData(this.storageManager.KEYS.SETTINGS, importData.settings);
            }
            
            // 刷新界面
            this.uiManager.loadData();
            
            return true;
        } catch (error) {
            console.error('导入数据失败:', error);
            return false;
        }
    }

    /**
     * 获取应用信息
     * @returns {object} 应用信息
     */
    getAppInfo() {
        return {
            version: '1.0.0',
            name: '抽烟小助手',
            description: '帮助记录和控制抽烟习惯的工具',
            author: '抽烟小助手团队',
            lastUpdate: this.uiManager.state.lastUpdate,
            storageStatus: this.storageManager.isLocalStorageAvailable() ? '正常' : '不可用',
            recordCount: this.recordsManager.getAllRecords().length,
            todayCount: this.recordsManager.getTodayRecords().length
        };
    }

    /**
     * 重置所有数据
     * @returns {boolean} 是否重置成功
     */
    resetAllData() {
        try {
            // 清空所有LocalStorage数据
            localStorage.clear();
            
            // 重新初始化
            this.initModules();
            this.uiManager.loadData();
            
            return true;
        } catch (error) {
            console.error('重置所有数据失败:', error);
            return false;
        }
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    try {
        // 创建应用实例
        window.smokingAssistantApp = new SmokingAssistantApp();
        
        // 将应用实例暴露给全局，方便调试
        console.log('抽烟小助手应用已启动，可通过 window.smokingAssistantApp 访问');
        
        // 添加调试快捷键
        document.addEventListener('keydown', (e) => {
            // Ctrl+Shift+D 显示调试信息
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                const appInfo = window.smokingAssistantApp.getAppInfo();
                console.log('应用调试信息:', appInfo);
                alert(`应用信息：
版本: ${appInfo.version}
总记录数: ${appInfo.recordCount}
今日记录: ${appInfo.todayCount}
存储状态: ${appInfo.storageStatus}`);
            }
            
            // Ctrl+Shift+E 导出数据
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                const exportData = window.smokingAssistantApp.exportData();
                if (exportData) {
                    const blob = new Blob([exportData], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `smoking-assistant-backup-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    window.smokingAssistantApp.uiManager.showMessage('数据已导出', 'success');
                }
            }
            
            // Ctrl+Shift+R 重置所有数据
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                if (confirm('确定要重置所有数据吗？此操作不可撤销！')) {
                    const success = window.smokingAssistantApp.resetAllData();
                    if (success) {
                        window.smokingAssistantApp.uiManager.showMessage('所有数据已重置', 'success');
                    } else {
                        window.smokingAssistantApp.uiManager.showMessage('重置失败', 'error');
                    }
                }
            }
        });
        
    } catch (error) {
        console.error('应用启动失败:', error);
        
        // 显示启动失败消息
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #f8f9fa;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            padding: 20px;
            text-align: center;
        `;
        
        errorDiv.innerHTML = `
            <div>
                <h2 style="color: #dc3545; margin-bottom: 20px;">
                    <i class="fas fa-exclamation-triangle"></i> 应用启动失败
                </h2>
                <p style="margin-bottom: 20px; color: #666;">
                    抱歉，抽烟小助手启动时出现错误。请尝试刷新页面。
                </p>
                <button onclick="window.location.reload()" 
                        style="
                            background: #007bff;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 5px;
                            cursor: pointer;
                            font-size: 1rem;
                        ">
                    <i class="fas fa-redo"></i> 刷新页面
                </button>
                <p style="margin-top: 20px; font-size: 0.9rem; color: #999;">
                    如果问题持续存在，请检查浏览器控制台获取更多信息。
                </p>
            </div>
        `;
        
        document.body.appendChild(errorDiv);
    }
});

// 添加全局错误处理
window.addEventListener('error', (event) => {
    console.error('全局错误:', event.error);
    
    // 显示用户友好的错误消息
    if (window.smokingAssistantApp && window.smokingAssistantApp.uiManager) {
        window.smokingAssistantApp.uiManager.showMessage('应用出现错误，部分功能可能受影响', 'error');
    }
});

// 添加未处理的Promise拒绝处理
window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise拒绝:', event.reason);
});