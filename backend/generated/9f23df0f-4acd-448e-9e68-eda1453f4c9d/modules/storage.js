/**
 * 数据存储模块
 * 封装LocalStorage操作，提供统一的数据存取接口
 */

const StorageManager = {
    // LocalStorage键名常量
    KEYS: {
        RECORDS: 'smoking_records',
        SETTINGS: 'user_settings',
        LAST_UPDATED: 'app_last_updated'
    },

    /**
     * 保存数据到LocalStorage
     * @param {string} key - 存储键名
     * @param {any} data - 要存储的数据
     * @returns {boolean} 是否保存成功
     */
    saveData(key, data) {
        try {
            if (!this.validateKey(key)) {
                console.error('无效的存储键名:', key);
                return false;
            }

            const serializedData = this.serialize(data);
            localStorage.setItem(key, serializedData);
            
            // 更新最后修改时间
            localStorage.setItem(this.KEYS.LAST_UPDATED, new Date().toISOString());
            
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },

    /**
     * 从LocalStorage读取数据
     * @param {string} key - 存储键名
     * @returns {any} 读取的数据，失败返回null
     */
    loadData(key) {
        try {
            if (!this.validateKey(key)) {
                console.error('无效的存储键名:', key);
                return null;
            }

            const data = localStorage.getItem(key);
            if (data === null) {
                return null;
            }

            return this.deserialize(data);
        } catch (error) {
            console.error('读取数据失败:', error);
            return null;
        }
    },

    /**
     * 清空指定键的数据
     * @param {string} key - 存储键名
     * @returns {boolean} 是否清空成功
     */
    clearData(key) {
        try {
            if (!this.validateKey(key)) {
                console.error('无效的存储键名:', key);
                return false;
            }

            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('清空数据失败:', error);
            return false;
        }
    },

    /**
     * 获取今日日期字符串（YYYY-MM-DD格式）
     * @returns {string} 今日日期
     */
    getTodayDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    /**
     * 获取当前时间戳（毫秒）
     * @returns {number} 当前时间戳
     */
    getCurrentTimestamp() {
        return Date.now();
    },

    /**
     * 生成UUID
     * @returns {string} UUID字符串
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * 检查LocalStorage是否可用
     * @returns {boolean} 是否可用
     */
    isLocalStorageAvailable() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('LocalStorage不可用:', e);
            return false;
        }
    },

    /**
     * 清理过期记录（保留最近30天）
     * @returns {number} 清理的记录数量
     */
    cleanupOldRecords() {
        try {
            const records = this.loadData(this.KEYS.RECORDS) || [];
            if (records.length === 0) return 0;

            const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
            const validRecords = records.filter(record => record.timestamp >= thirtyDaysAgo);
            
            if (validRecords.length < records.length) {
                this.saveData(this.KEYS.RECORDS, validRecords);
                return records.length - validRecords.length;
            }
            
            return 0;
        } catch (error) {
            console.error('清理旧记录失败:', error);
            return 0;
        }
    },

    /**
     * 获取默认设置
     * @returns {object} 默认设置
     */
    getDefaultSettings() {
        return {
            cigarettePrice: 5,      // 每支烟价格（元）
            dailyGoal: 10,          // 每日目标（最多抽几支）
            currency: '¥',          // 货币符号
            enableNotifications: true
        };
    },

    // 私有方法
    validateKey(key) {
        return typeof key === 'string' && key.trim().length > 0;
    },

    serialize(data) {
        return JSON.stringify(data);
    },

    deserialize(data) {
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error('解析JSON失败:', error);
            return null;
        }
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}