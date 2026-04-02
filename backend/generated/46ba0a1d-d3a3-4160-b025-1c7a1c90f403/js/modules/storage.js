/**
 * 存储模块
 * 提供数据持久化功能，使用LocalStorage存储数据
 */

class StorageModule {
    constructor() {
        this.storageKey = 'smoking_timer';
        this.defaultSettings = {
            targetInterval: 7200, // 2小时，单位：秒
            enableSound: true,
            enableNotifications: false,
            theme: 'light',
            cigarettePrice: 15, // 每包烟价格
            cigarettesPerPack: 20, // 每包烟支数
            lastResetDate: null
        };
        
        this.defaultStats = {
            todayCount: 0,
            avgInterval: 0,
            maxInterval: 0,
            savedMoney: 0,
            lastUpdated: Date.now()
        };
        
        this.init();
    }

    /**
     * 初始化存储
     */
    init() {
        // 检查LocalStorage是否可用
        if (!this.isLocalStorageAvailable()) {
            console.warn('LocalStorage不可用，将使用内存存储');
            this.useMemoryStorage = true;
            this.memoryStorage = {};
        } else {
            this.useMemoryStorage = false;
        }
        
        // 迁移旧版本数据（如果有）
        this.migrateOldData();
        
        // 确保默认数据存在
        this.ensureDefaultData();
    }

    /**
     * 检查LocalStorage是否可用
     * @returns {boolean} 是否可用
     */
    isLocalStorageAvailable() {
        try {
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 迁移旧版本数据
     */
    migrateOldData() {
        // 检查是否有旧版本的数据
        const oldKeys = [
            'smoking_timer_settings',
            'smoking_timer_records',
            'smoking_timer_stats'
        ];
        
        let hasOldData = false;
        const oldData = {};
        
        for (const key of oldKeys) {
            const data = this.getFromStorage(key);
            if (data) {
                oldData[key] = data;
                hasOldData = true;
            }
        }
        
        if (hasOldData) {
            console.log('检测到旧版本数据，开始迁移...');
            
            // 合并旧数据到新格式
            const currentData = this.getAllData();
            
            if (oldData['smoking_timer_settings']) {
                currentData.settings = {
                    ...currentData.settings,
                    ...oldData['smoking_timer_settings']
                };
            }
            
            if (oldData['smoking_timer_records']) {
                currentData.records = [
                    ...(currentData.records || []),
                    ...oldData['smoking_timer_records']
                ];
            }
            
            if (oldData['smoking_timer_stats']) {
                currentData.stats = {
                    ...currentData.stats,
                    ...oldData['smoking_timer_stats']
                };
            }
            
            // 保存合并后的数据
            this.saveToStorage(this.storageKey, currentData);
            
            // 清理旧数据
            for (const key of oldKeys) {
                this.removeFromStorage(key);
            }
            
            console.log('数据迁移完成');
        }
    }

    /**
     * 确保默认数据存在
     */
    ensureDefaultData() {
        const data = this.getAllData();
        
        if (!data.settings) {
            data.settings = { ...this.defaultSettings };
        }
        
        if (!data.records) {
            data.records = [];
        }
        
        if (!data.stats) {
            data.stats = { ...this.defaultStats };
        }
        
        // 合并默认设置，确保所有字段都存在
        data.settings = { ...this.defaultSettings, ...data.settings };
        data.stats = { ...this.defaultStats, ...data.stats };
        
        this.saveAllData(data);
    }

    /**
     * 从存储中获取数据
     * @param {string} key - 存储键
     * @returns {*} 存储的数据
     */
    getFromStorage(key) {
        if (this.useMemoryStorage) {
            return this.memoryStorage[key] || null;
        }
        
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('读取存储数据失败:', error);
            return null;
        }
    }

    /**
     * 保存数据到存储
     * @param {string} key - 存储键
     * @param {*} data - 要保存的数据
     */
    saveToStorage(key, data) {
        try {
            const jsonData = JSON.stringify(data);
            
            if (this.useMemoryStorage) {
                this.memoryStorage[key] = jsonData;
            } else {
                localStorage.setItem(key, jsonData);
            }
        } catch (error) {
            console.error('保存存储数据失败:', error);
            
            // 如果存储空间不足，尝试清理旧记录
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldRecords();
                // 重试保存
                try {
                    const jsonData = JSON.stringify(data);
                    if (!this.useMemoryStorage) {
                        localStorage.setItem(key, jsonData);
                    }
                } catch (retryError) {
                    console.error('重试保存仍然失败:', retryError);
                }
            }
        }
    }

    /**
     * 从存储中移除数据
     * @param {string} key - 存储键
     */
    removeFromStorage(key) {
        if (this.useMemoryStorage) {
            delete this.memoryStorage[key];
        } else {
            localStorage.removeItem(key);
        }
    }

    /**
     * 获取所有数据
     * @returns {Object} 所有数据
     */
    getAllData() {
        return this.getFromStorage(this.storageKey) || {
            settings: { ...this.defaultSettings },
            records: [],
            stats: { ...this.defaultStats }
        };
    }

    /**
     * 保存所有数据
     * @param {Object} data - 要保存的数据
     */
    saveAllData(data) {
        this.saveToStorage(this.storageKey, data);
    }

    /**
     * 获取用户设置
     * @returns {Object} 用户设置
     */
    getSettings() {
        const data = this.getAllData();
        return data.settings || { ...this.defaultSettings };
    }

    /**
     * 保存用户设置
     * @param {Object} settings - 用户设置
     */
    saveSettings(settings) {
        const data = this.getAllData();
        data.settings = { ...data.settings, ...settings };
        this.saveAllData(data);
    }

    /**
     * 获取抽烟记录
     * @param {Object} options - 选项
     * @returns {Array} 抽烟记录
     */
    getRecords(options = {}) {
        const data = this.getAllData();
        let records = data.records || [];
        
        // 应用过滤器
        if (options.filter) {
            records = records.filter(options.filter);
        }
        
        // 应用排序
        if (options.sort) {
            records.sort(options.sort);
        } else {
            // 默认按时间倒序排序
            records.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        // 应用分页
        if (options.limit) {
            records = records.slice(0, options.limit);
        }
        
        return records;
    }

    /**
     * 添加抽烟记录
     * @param {Object} record - 抽烟记录
     * @returns {Object} 添加的记录（包含生成的ID）
     */
    addRecord(record) {
        const data = this.getAllData();
        const records = data.records || [];
        
        // 生成新记录的ID
        const newId = records.length > 0 
            ? Math.max(...records.map(r => r.id)) + 1 
            : 1;
        
        const newRecord = {
            id: newId,
            timestamp: Date.now(),
            interval: 0,
            goalReached: false,
            ...record
        };
        
        records.unshift(newRecord); // 添加到开头
        
        // 限制记录数量，避免存储空间问题
        const maxRecords = 1000;
        if (records.length > maxRecords) {
            data.records = records.slice(0, maxRecords);
        } else {
            data.records = records;
        }
        
        this.saveAllData(data);
        return newRecord;
    }

    /**
     * 删除抽烟记录
     * @param {number} recordId - 记录ID
     * @returns {boolean} 是否删除成功
     */
    deleteRecord(recordId) {
        const data = this.getAllData();
        const records = data.records || [];
        
        const initialLength = records.length;
        data.records = records.filter(record => record.id !== recordId);
        
        if (data.records.length < initialLength) {
            this.saveAllData(data);
            return true;
        }
        
        return false;
    }

    /**
     * 清空所有抽烟记录
     */
    clearRecords() {
        const data = this.getAllData();
        data.records = [];
        this.saveAllData(data);
    }

    /**
     * 获取统计数据
     * @returns {Object} 统计数据
     */
    getStats() {
        const data = this.getAllData();
        return data.stats || { ...this.defaultStats };
    }

    /**
     * 更新统计数据
     * @param {Object} stats - 统计数据
     */
    updateStats(stats) {
        const data = this.getAllData();
        data.stats = { ...data.stats, ...stats, lastUpdated: Date.now() };
        this.saveAllData(data);
    }

    /**
     * 重置今日统计数据
     */
    resetTodayStats() {
        const data = this.getAllData();
        data.stats.todayCount = 0;
        data.stats.avgInterval = 0;
        data.stats.maxInterval = 0;
        data.stats.savedMoney = 0;
        data.stats.lastUpdated = Date.now();
        this.saveAllData(data);
    }

    /**
     * 检查是否需要重置今日统计数据
     * @returns {boolean} 是否需要重置
     */
    shouldResetTodayStats() {
        const data = this.getAllData();
        const stats = data.stats || this.defaultStats;
        const settings = data.settings || this.defaultSettings;
        
        if (!stats.lastUpdated) {
            return true;
        }
        
        const lastUpdated = new Date(stats.lastUpdated);
        const today = new Date();
        
        // 检查是否是同一天
        const isSameDay = lastUpdated.getFullYear() === today.getFullYear() &&
                         lastUpdated.getMonth() === today.getMonth() &&
                         lastUpdated.getDate() === today.getDate();
        
        // 如果设置了最后重置日期，检查是否需要重置
        if (settings.lastResetDate) {
            const lastReset = new Date(settings.lastResetDate);
            const daysSinceReset = Math.floor((today - lastReset) / (1000 * 60 * 60 * 24));
            
            if (daysSinceReset >= 1) {
                return true;
            }
        }
        
        return !isSameDay;
    }

    /**
     * 清理旧记录
     * @param {number} maxAgeDays - 最大保留天数
     */
    cleanupOldRecords(maxAgeDays = 30) {
        const data = this.getAllData();
        const records = data.records || [];
        
        const cutoffTime = Date.now() - (maxAgeDays * 24 * 60 * 60 * 1000);
        const oldCount = records.length;
        
        data.records = records.filter(record => record.timestamp >= cutoffTime);
        
        if (data.records.length < oldCount) {
            console.log(`清理了 ${oldCount - data.records.length} 条旧记录`);
            this.saveAllData(data);
        }
    }

    /**
     * 导出所有数据
     * @returns {Object} 导出的数据
     */
    exportData() {
        const data = this.getAllData();
        return {
            version: '1.0',
            exportedAt: Date.now(),
            ...data
        };
    }

    /**
     * 导入数据
     * @param {Object} importedData - 导入的数据
     * @returns {Object} 导入结果
     */
    importData(importedData) {
        try {
            // 验证导入的数据
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('导入的数据格式不正确');
            }
            
            // 合并数据
            const currentData = this.getAllData();
            const mergedData = {
                settings: { ...currentData.settings, ...importedData.settings },
                records: [...(importedData.records || [])],
                stats: { ...currentData.stats, ...importedData.stats }
            };
            
            // 保存合并后的数据
            this.saveAllData(mergedData);
            
            return {
                success: true,
                message: '数据导入成功',
                importedRecords: importedData.records ? importedData.records.length : 0
            };
        } catch (error) {
            console.error('导入数据失败:', error);
            return {
                success: false,
                message: `导入数据失败: ${error.message}`
            };
        }
    }

    /**
     * 清除所有数据
     * @returns {boolean} 是否清除成功
     */
    clearAllData() {
        try {
            this.removeFromStorage(this.storageKey);
            this.ensureDefaultData();
            return true;
        } catch (error) {
            console.error('清除数据失败:', error);
            return false;
        }
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储使用情况
     */
    getStorageUsage() {
        if (this.useMemoryStorage) {
            return {
                used: JSON.stringify(this.memoryStorage).length,
                total: null,
                percent: null
            };
        }
        
        try {
            let total = 0;
            let used = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                used += (key.length + value.length) * 2; // UTF-16编码
            }
            
            // 估算总容量（不同浏览器不同，这里使用典型值）
            total = 5 * 1024 * 1024; // 5MB
            
            return {
                used,
                total,
                percent: total > 0 ? (used / total) * 100 : 0
            };
        } catch (error) {
            return {
                used: 0,
                total: 0,
                percent: 0
            };
        }
    }
}

// 创建全局存储实例
const storage = new StorageModule();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.Storage = storage;
}

export default storage;