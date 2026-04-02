/**
 * 主题管理模块
 * 管理应用主题切换和样式
 */

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: '浅色主题',
                icon: 'fas fa-sun',
                description: '适合白天使用的明亮主题'
            },
            dark: {
                name: '深色主题',
                icon: 'fas fa-moon',
                description: '适合夜间使用的暗色主题，减少眼睛疲劳'
            },
            health: {
                name: '健康主题',
                icon: 'fas fa-heart',
                description: '绿色系主题，强调健康概念'
            }
        };
        
        this.currentTheme = 'light';
        this.themeChangeCallbacks = [];
        
        // 初始化主题
        this.init();
    }

    /**
     * 初始化主题管理器
     */
    init() {
        // 从本地存储加载保存的主题
        this.loadSavedTheme();
        
        // 监听系统主题变化
        this.watchSystemTheme();
        
        // 绑定事件处理器
        this.bindEvents();
        
        console.log('主题管理器初始化完成');
    }

    /**
     * 从本地存储加载保存的主题
     */
    loadSavedTheme() {
        try {
            const savedTheme = localStorage.getItem('smoking-timer-theme');
            if (savedTheme && this.themes[savedTheme]) {
                this.setTheme(savedTheme, false); // 不保存到本地存储
            } else {
                // 检查系统偏好
                this.setThemeBasedOnSystemPreference();
            }
        } catch (error) {
            console.warn('加载保存的主题失败:', error);
            this.setThemeBasedOnSystemPreference();
        }
    }

    /**
     * 根据系统偏好设置主题
     */
    setThemeBasedOnSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark', true);
        } else {
            this.setTheme('light', true);
        }
    }

    /**
     * 监听系统主题变化
     */
    watchSystemTheme() {
        if (!window.matchMedia) return;
        
        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        
        const handleChange = (e) => {
            // 只有在没有手动设置主题时才跟随系统
            const savedTheme = localStorage.getItem('smoking-timer-theme');
            if (!savedTheme) {
                this.setTheme(e.matches ? 'dark' : 'light', true);
            }
        };
        
        // 添加监听器
        darkModeMediaQuery.addEventListener('change', handleChange);
        
        // 保存移除函数以便后续清理
        this.removeSystemThemeListener = () => {
            darkModeMediaQuery.removeEventListener('change', handleChange);
        };
    }

    /**
     * 绑定事件处理器
     */
    bindEvents() {
        if (!window.EventBus) return;
        
        // 监听主题切换事件
        window.EventBus.on('ui:theme_toggle', () => {
            this.toggleTheme();
        });
        
        // 监听主题变化事件
        window.EventBus.on(window.EventTypes.UI_THEME_CHANGED, (event) => {
            if (event.data && event.data.theme) {
                this.setTheme(event.data.theme, false); // 不保存到本地存储
            }
        });
    }

    /**
     * 设置主题
     * @param {string} themeName - 主题名称
     * @param {boolean} saveToStorage - 是否保存到本地存储
     */
    setTheme(themeName, saveToStorage = true) {
        if (!this.themes[themeName]) {
            console.warn(`未知的主题: ${themeName}`);
            return;
        }
        
        if (this.currentTheme === themeName) {
            return; // 已经是当前主题
        }
        
        const oldTheme = this.currentTheme;
        this.currentTheme = themeName;
        
        // 应用主题到文档
        document.documentElement.setAttribute('data-theme', themeName);
        
        // 保存到本地存储
        if (saveToStorage) {
            try {
                localStorage.setItem('smoking-timer-theme', themeName);
            } catch (error) {
                console.warn('保存主题到本地存储失败:', error);
            }
        }
        
        // 更新主题按钮图标
        this.updateThemeButton();
        
        // 触发主题变化回调
        this.triggerThemeChange(themeName, oldTheme);
        
        console.log(`主题已切换: ${oldTheme} -> ${themeName}`);
    }

    /**
     * 切换主题
     */
    toggleTheme() {
        const themeNames = Object.keys(this.themes);
        const currentIndex = themeNames.indexOf(this.currentTheme);
        const nextIndex = (currentIndex + 1) % themeNames.length;
        const nextTheme = themeNames[nextIndex];
        
        this.setTheme(nextTheme, true);
    }

    /**
     * 更新主题按钮图标
     */
    updateThemeButton() {
        const themeButton = document.getElementById('theme-toggle');
        if (!themeButton) return;
        
        const theme = this.themes[this.currentTheme];
        const icon = themeButton.querySelector('i');
        
        if (icon && theme) {
            icon.className = theme.icon;
            
            // 更新工具提示
            const nextThemeNames = Object.keys(this.themes);
            const currentIndex = nextThemeNames.indexOf(this.currentTheme);
            const nextIndex = (currentIndex + 1) % nextThemeNames.length;
            const nextTheme = this.themes[nextThemeNames[nextIndex]];
            
            themeButton.title = `切换到${nextTheme.name}`;
        }
    }

    /**
     * 获取当前主题
     * @returns {Object} 当前主题信息
     */
    getCurrentTheme() {
        return {
            name: this.currentTheme,
            ...this.themes[this.currentTheme]
        };
    }

    /**
     * 获取所有主题
     * @returns {Object} 所有主题信息
     */
    getAllThemes() {
        return { ...this.themes };
    }

    /**
     * 添加主题变化回调
     * @param {Function} callback - 回调函数
     */
    addThemeChangeCallback(callback) {
        if (typeof callback === 'function') {
            this.themeChangeCallbacks.push(callback);
        }
    }

    /**
     * 移除主题变化回调
     * @param {Function} callback - 要移除的回调函数
     */
    removeThemeChangeCallback(callback) {
        const index = this.themeChangeCallbacks.indexOf(callback);
        if (index !== -1) {
            this.themeChangeCallbacks.splice(index, 1);
        }
    }

    /**
     * 触发主题变化
     * @param {string} newTheme - 新主题
     * @param {string} oldTheme - 旧主题
     */
    triggerThemeChange(newTheme, oldTheme) {
        // 调用所有回调函数
        this.themeChangeCallbacks.forEach(callback => {
            try {
                callback(newTheme, oldTheme);
            } catch (error) {
                console.error('主题变化回调执行出错:', error);
            }
        });
        
        // 触发事件总线事件
        if (window.EventBus) {
            window.EventBus.emit('theme:changed', {
                newTheme,
                oldTheme,
                themeInfo: this.themes[newTheme]
            });
        }
    }

    /**
     * 应用主题特定的样式
     */
    applyThemeStyles() {
        const theme = this.getCurrentTheme();
        
        // 这里可以添加主题特定的样式调整
        switch (theme.name) {
            case 'dark':
                this.applyDarkThemeStyles();
                break;
            case 'health':
                this.applyHealthThemeStyles();
                break;
            case 'light':
            default:
                this.applyLightThemeStyles();
                break;
        }
    }

    /**
     * 应用浅色主题样式
     */
    applyLightThemeStyles() {
        // 浅色主题的特定样式调整
        // 例如：调整某些元素的颜色、阴影等
    }

    /**
     * 应用深色主题样式
     */
    applyDarkThemeStyles() {
        // 深色主题的特定样式调整
        // 例如：调整某些元素的颜色、阴影等
    }

    /**
     * 应用健康主题样式
     */
    applyHealthThemeStyles() {
        // 健康主题的特定样式调整
        // 例如：调整某些元素的颜色、阴影等
    }

    /**
     * 创建主题切换器UI
     * @param {HTMLElement} container - 容器元素
     */
    createThemeSwitcher(container) {
        if (!container) return;
        
        const switcher = document.createElement('div');
        switcher.className = 'theme-switcher';
        
        const button = document.createElement('button');
        button.id = 'theme-toggle';
        button.className = 'theme-btn';
        button.title = '切换主题';
        
        const theme = this.getCurrentTheme();
        button.innerHTML = `<i class="${theme.icon}"></i>`;
        
        button.addEventListener('click', () => {
            this.toggleTheme();
        });
        
        switcher.appendChild(button);
        container.appendChild(switcher);
    }

    /**
     * 创建主题选择器
     * @param {HTMLElement} container - 容器元素
     */
    createThemeSelector(container) {
        if (!container) return;
        
        const selector = document.createElement('div');
        selector.className = 'theme-selector';
        
        const title = document.createElement('h3');
        title.textContent = '选择主题';
        selector.appendChild(title);
        
        const themeList = document.createElement('div');
        themeList.className = 'theme-list';
        
        Object.entries(this.themes).forEach(([themeName, themeInfo]) => {
            const themeOption = document.createElement('div');
            themeOption.className = `theme-option ${this.currentTheme === themeName ? 'active' : ''}`;
            themeOption.dataset.theme = themeName;
            
            themeOption.innerHTML = `
                <div class="theme-preview" data-theme="${themeName}"></div>
                <div class="theme-info">
                    <div class="theme-name">${themeInfo.name}</div>
                    <div class="theme-description">${themeInfo.description}</div>
                </div>
                <div class="theme-check">
                    <i class="fas fa-check"></i>
                </div>
            `;
            
            themeOption.addEventListener('click', () => {
                this.setTheme(themeName, true);
                
                // 更新活动状态
                themeList.querySelectorAll('.theme-option').forEach(option => {
                    option.classList.remove('active');
                });
                themeOption.classList.add('active');
            });
            
            themeList.appendChild(themeOption);
        });
        
        selector.appendChild(themeList);
        container.appendChild(selector);
    }

    /**
     * 获取主题CSS变量
     * @param {string} themeName - 主题名称
     * @returns {Object} CSS变量对象
     */
    getThemeVariables(themeName = this.currentTheme) {
        const variables = {
            light: {
                '--primary-color': '#4CAF50',
                '--primary-dark': '#388E3C',
                '--primary-light': '#C8E6C9',
                '--text-primary': '#212121',
                '--text-secondary': '#757575',
                '--bg-primary': '#FFFFFF',
                '--bg-secondary': '#F5F5F5',
                '--bg-card': '#FFFFFF',
                '--border-color': '#E0E0E0'
            },
            dark: {
                '--primary-color': '#66BB6A',
                '--primary-dark': '#4CAF50',
                '--primary-light': '#1B5E20',
                '--text-primary': '#FFFFFF',
                '--text-secondary': '#B0BEC5',
                '--bg-primary': '#121212',
                '--bg-secondary': '#1E1E1E',
                '--bg-card': '#1E1E1E',
                '--border-color': '#424242'
            },
            health: {
                '--primary-color': '#2E7D32',
                '--primary-dark': '#1B5E20',
                '--primary-light': '#A5D6A7',
                '--text-primary': '#212121',
                '--text-secondary': '#757575',
                '--bg-primary': '#F1F8E9',
                '--bg-secondary': '#E8F5E9',
                '--bg-card': '#FFFFFF',
                '--border-color': '#C8E6C9'
            }
        };
        
        return variables[themeName] || variables.light;
    }

    /**
     * 动态应用CSS变量
     * @param {string} themeName - 主题名称
     */
    applyThemeVariables(themeName = this.currentTheme) {
        const variables = this.getThemeVariables(themeName);
        const root = document.documentElement;
        
        Object.entries(variables).forEach(([variable, value]) => {
            root.style.setProperty(variable, value);
        });
    }

    /**
     * 检查是否支持主题
     * @returns {boolean} 是否支持主题
     */
    isThemeSupported() {
        return CSS.supports('color', 'var(--test)');
    }

    /**
     * 获取系统主题偏好
     * @returns {string} 系统主题偏好（light/dark）
     */
    getSystemThemePreference() {
        if (!window.matchMedia) return 'light';
        
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }

    /**
     * 重置为主题默认值
     */
    resetToDefault() {
        localStorage.removeItem('smoking-timer-theme');
        this.setThemeBasedOnSystemPreference();
    }

    /**
     * 导出主题设置
     * @returns {Object} 主题设置
     */
    exportThemeSettings() {
        return {
            version: '1.0',
            exportedAt: Date.now(),
            currentTheme: this.currentTheme,
            themes: this.themes
        };
    }

    /**
     * 导入主题设置
     * @param {Object} themeSettings - 主题设置
     * @returns {Object} 导入结果
     */
    importThemeSettings(themeSettings) {
        try {
            if (!themeSettings || typeof themeSettings !== 'object') {
                throw new Error('导入的主题设置格式不正确');
            }
            
            if (themeSettings.currentTheme && this.themes[themeSettings.currentTheme]) {
                this.setTheme(themeSettings.currentTheme, true);
            }
            
            return {
                success: true,
                message: '主题设置导入成功'
            };
            
        } catch (error) {
            console.error('导入主题设置失败:', error);
            return {
                success: false,
                message: `导入主题设置失败: ${error.message}`
            };
        }
    }

    /**
     * 销毁主题管理器
     */
    destroy() {
        // 移除系统主题监听器
        if (this.removeSystemThemeListener) {
            this.removeSystemThemeListener();
        }
        
        // 清空回调函数
        this.themeChangeCallbacks = [];
        
        console.log('主题管理器已销毁');
    }
}

// 创建全局主题管理器实例
const themeManager = new ThemeManager();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.ThemeManager = themeManager;
}

export default themeManager;