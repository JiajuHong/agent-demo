/**
 * 设置模块
 * 管理用户设置和偏好
 */

class SettingsModule {
    constructor() {
        this.settings = {
            targetInterval: 7200, // 2小时，单位：秒
            enableSound: true,
            enableNotifications: false,
            theme: 'light',
            cigarettePrice: 15, // 每包烟价格
            cigarettesPerPack: 20, // 每包烟支数
            lastResetDate: null
        };
        
        this.defaultSettings = { ...this.settings };
        
        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化设置
        this.init();
    }

    /**
     * 初始化设置模块
     */
    async init() {
        await this.loadSettings();
        
        // 应用设置
        this.applySettings();
        
        // 触发设置加载完成事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.SETTINGS_LOADED, this.settings);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        if (!window.EventBus) return;
        
        // 监听UI设置变化
        window.EventBus.on('ui:settings_changed', (event) => {
            this.updateSettings(event.data);
        });
        
        // 监听主题切换
        window.EventBus.on('ui:theme_toggle', () => {
            this.toggleTheme();
        });
    }

    /**
     * 加载设置
     */
    async loadSettings() {
        if (!window.Storage) {
            console.warn('存储模块未加载，使用默认设置');
            return;
        }
        
        try {
            const savedSettings = window.Storage.getSettings();
            if (savedSettings) {
                this.settings = { ...this.defaultSettings, ...savedSettings };
                console.log('设置已加载:', this.settings);
            }
        } catch (error) {
            console.error('加载设置失败:', error);
        }
    }

    /**
     * 保存设置
     */
    saveSettings() {
        if (!window.Storage) return;
        
        try {
            window.Storage.saveSettings(this.settings);
            console.log('设置已保存:', this.settings);
        } catch (error) {
            console.error('保存设置失败:', error);
        }
    }

    /**
     * 更新设置
     * @param {Object} newSettings - 新的设置
     */
    updateSettings(newSettings) {
        if (!newSettings || typeof newSettings !== 'object') {
            console.error('无效的设置数据');
            return;
        }
        
        // 验证并更新设置
        const oldSettings = { ...this.settings };
        
        // 更新目标间隔
        if (newSettings.targetInterval !== undefined) {
            const targetInterval = Number(newSettings.targetInterval);
            if (!isNaN(targetInterval) && targetInterval >= 60) {
                this.settings.targetInterval = targetInterval;
            }
        }
        
        // 更新声音设置
        if (newSettings.enableSound !== undefined) {
            this.settings.enableSound = Boolean(newSettings.enableSound);
        }
        
        // 更新通知设置
        if (newSettings.enableNotifications !== undefined) {
            this.settings.enableNotifications = Boolean(newSettings.enableNotifications);
            
            // 如果启用通知，请求权限
            if (this.settings.enableNotifications && window.Notification) {
                this.requestNotificationPermission();
            }
        }
        
        // 更新主题
        if (newSettings.theme !== undefined && 
            ['light', 'dark', 'health'].includes(newSettings.theme)) {
            this.settings.theme = newSettings.theme;
        }
        
        // 更新香烟价格
        if (newSettings.cigarettePrice !== undefined) {
            const price = Number(newSettings.cigarettePrice);
            if (!isNaN(price) && price >= 0) {
                this.settings.cigarettePrice = price;
            }
        }
        
        // 更新每包支数
        if (newSettings.cigarettesPerPack !== undefined) {
            const count = Number(newSettings.cigarettesPerPack);
            if (!isNaN(count) && count > 0) {
                this.settings.cigarettesPerPack = count;
            }
        }
        
        // 检查设置是否有变化
        const hasChanged = !this.areSettingsEqual(oldSettings, this.settings);
        
        if (hasChanged) {
            // 保存设置
            this.saveSettings();
            
            // 应用设置
            this.applySettings();
            
            // 触发设置变化事件
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.SETTINGS_CHANGED, this.settings);
                window.EventBus.emit(window.EventTypes.SETTINGS_SAVED, this.settings);
            }
            
            console.log('设置已更新:', this.settings);
        }
    }

    /**
     * 比较两个设置对象是否相等
     * @param {Object} settings1 - 第一个设置
     * @param {Object} settings2 - 第二个设置
     * @returns {boolean} 是否相等
     */
    areSettingsEqual(settings1, settings2) {
        const keys1 = Object.keys(settings1);
        const keys2 = Object.keys(settings2);
        
        if (keys1.length !== keys2.length) {
            return false;
        }
        
        for (const key of keys1) {
            if (settings1[key] !== settings2[key]) {
                return false;
            }
        }
        
        return true;
    }

    /**
     * 应用设置
     */
    applySettings() {
        // 应用主题
        this.applyTheme();
        
        // 应用目标间隔到计时器
        if (window.Timer) {
            window.Timer.setTargetInterval(this.settings.targetInterval);
        }
        
        // 应用通知设置
        if (this.settings.enableNotifications && window.Notification) {
            this.requestNotificationPermission();
        }
        
        console.log('设置已应用');
    }

    /**
     * 应用主题
     */
    applyTheme() {
        // 设置文档主题属性
        document.documentElement.setAttribute('data-theme', this.settings.theme);
        
        // 保存主题到本地存储
        try {
            localStorage.setItem('smoking-timer-theme', this.settings.theme);
        } catch (error) {
            console.warn('保存主题到本地存储失败:', error);
        }
        
        // 触发主题变化事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.UI_THEME_CHANGED, {
                theme: this.settings.theme
            });
        }
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const themes = ['light', 'dark', 'health'];
        const currentIndex = themes.indexOf(this.settings.theme);
        const nextIndex = (currentIndex + 1) % themes.length;
        
        this.updateSettings({ theme: themes[nextIndex] });
    }

    /**
     * 获取设置
     * @returns {Object} 当前设置
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * 获取目标间隔（小时）
     * @returns {number} 目标间隔（小时）
     */
    getTargetIntervalHours() {
        return Math.round(this.settings.targetInterval / 3600 * 10) / 10;
    }

    /**
     * 设置目标间隔（小时）
     * @param {number} hours - 目标间隔（小时）
     */
    setTargetIntervalHours(hours) {
        const seconds = Math.round(hours * 3600);
        this.updateSettings({ targetInterval: seconds });
    }

    /**
     * 获取目标间隔（分钟）
     * @returns {number} 目标间隔（分钟）
     */
    getTargetIntervalMinutes() {
        return Math.round(this.settings.targetInterval / 60);
    }

    /**
     * 设置目标间隔（分钟）
     * @param {number} minutes - 目标间隔（分钟）
     */
    setTargetIntervalMinutes(minutes) {
        const seconds = minutes * 60;
        this.updateSettings({ targetInterval: seconds });
    }

    /**
     * 获取每支烟价格
     * @returns {number} 每支烟价格
     */
    getPricePerCigarette() {
        if (this.settings.cigarettesPerPack === 0) {
            return 0;
        }
        return this.settings.cigarettePrice / this.settings.cigarettesPerPack;
    }

    /**
     * 请求通知权限
     * @returns {Promise<boolean>} 是否获得权限
     */
    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            console.warn('浏览器不支持通知功能');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission === 'denied') {
            console.warn('通知权限已被拒绝');
            
            // 更新设置，禁用通知
            this.updateSettings({ enableNotifications: false });
            
            // 显示提示
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                    type: 'warning',
                    message: '通知权限已被拒绝，请在浏览器设置中启用',
                    duration: 5000
                });
            }
            
            return false;
        }
        
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                console.log('通知权限已获得');
                return true;
            } else {
                console.warn('通知权限被拒绝');
                
                // 更新设置，禁用通知
                this.updateSettings({ enableNotifications: false });
                
                return false;
            }
        } catch (error) {
            console.error('请求通知权限失败:', error);
            
            // 更新设置，禁用通知
            this.updateSettings({ enableNotifications: false });
            
            return false;
        }
    }

    /**
     * 重置为默认设置
     */
    resetToDefaults() {
        const oldSettings = { ...this.settings };
        this.settings = { ...this.defaultSettings };
        
        // 保存设置
        this.saveSettings();
        
        // 应用设置
        this.applySettings();
        
        // 触发设置变化事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.SETTINGS_CHANGED, this.settings);
            window.EventBus.emit(window.EventTypes.SETTINGS_SAVED, this.settings);
        }
        
        console.log('设置已重置为默认值');
        
        // 显示重置提示
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                type: 'success',
                message: '设置已重置为默认值',
                duration: 3000
            });
        }
    }

    /**
     * 导出设置
     * @returns {Object} 导出的设置
     */
    exportSettings() {
        return {
            version: '1.0',
            exportedAt: Date.now(),
            settings: this.settings
        };
    }

    /**
     * 导入设置
     * @param {Object} importedSettings - 导入的设置
     * @returns {Object} 导入结果
     */
    importSettings(importedSettings) {
        try {
            if (!importedSettings || typeof importedSettings !== 'object') {
                throw new Error('导入的设置格式不正确');
            }
            
            if (!importedSettings.settings || typeof importedSettings.settings !== 'object') {
                throw new Error('设置数据格式不正确');
            }
            
            // 验证设置
            const validation = this.validateSettings(importedSettings.settings);
            if (!validation.isValid) {
                throw new Error(`设置验证失败: ${validation.errors.join(', ')}`);
            }
            
            // 更新设置
            this.updateSettings(importedSettings.settings);
            
            return {
                success: true,
                message: '设置导入成功'
            };
            
        } catch (error) {
            console.error('导入设置失败:', error);
            
            return {
                success: false,
                message: `导入设置失败: ${error.message}`
            };
        }
    }

    /**
     * 验证设置
     * @param {Object} settings - 要验证的设置
     * @returns {Object} 验证结果
     */
    validateSettings(settings) {
        const errors = [];
        
        // 验证目标间隔
        if (settings.targetInterval !== undefined) {
            const targetInterval = Number(settings.targetInterval);
            if (isNaN(targetInterval) || targetInterval < 60 || targetInterval > 86400) {
                errors.push('目标间隔必须在60秒到24小时之间');
            }
        }
        
        // 验证香烟价格
        if (settings.cigarettePrice !== undefined) {
            const price = Number(settings.cigarettePrice);
            if (isNaN(price) || price < 0 || price > 1000) {
                errors.push('香烟价格必须在0到1000之间');
            }
        }
        
        // 验证每包支数
        if (settings.cigarettesPerPack !== undefined) {
            const count = Number(settings.cigarettesPerPack);
            if (isNaN(count) || count <= 0 || count > 100) {
                errors.push('每包支数必须是1到100之间的整数');
            }
        }
        
        // 验证主题
        if (settings.theme !== undefined && 
            !['light', 'dark', 'health'].includes(settings.theme)) {
            errors.push('主题必须是 light、dark 或 health');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * 获取设置摘要
     * @returns {Object} 设置摘要
     */
    getSettingsSummary() {
        return {
            目标间隔: `${this.getTargetIntervalHours()} 小时`,
            声音提醒: this.settings.enableSound ? '开启' : '关闭',
            桌面通知: this.settings.enableNotifications ? '开启' : '关闭',
            主题: this.settings.theme === 'light' ? '浅色' : 
                  this.settings.theme === 'dark' ? '深色' : '健康',
            香烟价格: `¥${this.settings.cigarettePrice} / 包`,
            每包支数: `${this.settings.cigarettesPerPack} 支`,
            每支价格: `¥${this.getPricePerCigarette().toFixed(2)}`
        };
    }

    /**
     * 检查设置是否需要更新
     * @returns {boolean} 是否需要更新
     */
    needsUpdate() {
        // 这里可以添加检查更新版本的逻辑
        return false;
    }

    /**
     * 销毁设置模块
     */
    destroy() {
        this.settings = { ...this.defaultSettings };
        console.log('设置模块已销毁');
    }
}

// 创建全局设置实例
const settings = new SettingsModule();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.Settings = settings;
}

export default settings;