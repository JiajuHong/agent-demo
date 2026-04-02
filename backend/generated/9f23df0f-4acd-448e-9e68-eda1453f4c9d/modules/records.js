/**
 * 抽烟记录模块
 * 管理抽烟记录的增删改查操作
 */

const RecordsManager = {
    // 依赖注入
    storage: null,

    /**
     * 初始化记录管理器
     * @param {object} storage - 存储管理器实例
     */
    init(storage) {
        this.storage = storage;
        
        // 初始化时清理旧记录
        this.storage.cleanupOldRecords();
        
        // 确保有默认设置
        this.ensureDefaultSettings();
    },

    /**
     * 添加新的抽烟记录
     * @returns {object|null} 新创建的记录，失败返回null
     */
    addRecord() {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return null;
            }

            const timestamp = this.storage.getCurrentTimestamp();
            const today = this.storage.getTodayDate();
            
            const newRecord = {
                id: this.storage.generateUUID(),
                timestamp: timestamp,
                date: today
            };

            // 获取现有记录
            const allRecords = this.storage.loadData(this.storage.KEYS.RECORDS) || [];
            
            // 添加新记录
            allRecords.push(newRecord);
            
            // 保存更新后的记录
            const success = this.storage.saveData(this.storage.KEYS.RECORDS, allRecords);
            
            if (success) {
                console.log('记录添加成功:', newRecord);
                return newRecord;
            } else {
                console.error('保存记录失败');
                return null;
            }
        } catch (error) {
            console.error('添加记录失败:', error);
            return null;
        }
    },

    /**
     * 获取今日所有抽烟记录
     * @returns {Array} 今日记录数组
     */
    getTodayRecords() {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return [];
            }

            const today = this.storage.getTodayDate();
            const allRecords = this.storage.loadData(this.storage.KEYS.RECORDS) || [];
            
            // 过滤出今日记录
            const todayRecords = allRecords.filter(record => record.date === today);
            
            // 按时间倒序排序（最新的在前）
            return todayRecords.sort((a, b) => b.timestamp - a.timestamp);
        } catch (error) {
            console.error('获取今日记录失败:', error);
            return [];
        }
    },

    /**
     * 获取所有记录
     * @returns {Array} 所有记录数组
     */
    getAllRecords() {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return [];
            }

            return this.storage.loadData(this.storage.KEYS.RECORDS) || [];
        } catch (error) {
            console.error('获取所有记录失败:', error);
            return [];
        }
    },

    /**
     * 获取最近一次抽烟记录
     * @returns {object|null} 最近一次记录，没有则返回null
     */
    getLastRecord() {
        try {
            const todayRecords = this.getTodayRecords();
            return todayRecords.length > 0 ? todayRecords[0] : null;
        } catch (error) {
            console.error('获取最近记录失败:', error);
            return null;
        }
    },

    /**
     * 清空今日抽烟记录
     * @returns {boolean} 是否清空成功
     */
    clearTodayRecords() {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return false;
            }

            const today = this.storage.getTodayDate();
            const allRecords = this.storage.loadData(this.storage.KEYS.RECORDS) || [];
            
            // 过滤掉今日记录
            const remainingRecords = allRecords.filter(record => record.date !== today);
            
            // 保存更新后的记录
            const success = this.storage.saveData(this.storage.KEYS.RECORDS, remainingRecords);
            
            if (success) {
                console.log('今日记录已清空');
                return true;
            } else {
                console.error('清空今日记录失败');
                return false;
            }
        } catch (error) {
            console.error('清空今日记录失败:', error);
            return false;
        }
    },

    /**
     * 删除指定记录
     * @param {string} recordId - 记录ID
     * @returns {boolean} 是否删除成功
     */
    deleteRecord(recordId) {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return false;
            }

            const allRecords = this.storage.loadData(this.storage.KEYS.RECORDS) || [];
            const initialLength = allRecords.length;
            
            // 过滤掉指定ID的记录
            const updatedRecords = allRecords.filter(record => record.id !== recordId);
            
            if (updatedRecords.length === initialLength) {
                console.warn('未找到要删除的记录:', recordId);
                return false;
            }
            
            // 保存更新后的记录
            const success = this.storage.saveData(this.storage.KEYS.RECORDS, updatedRecords);
            
            if (success) {
                console.log('记录删除成功:', recordId);
                return true;
            } else {
                console.error('删除记录失败');
                return false;
            }
        } catch (error) {
            console.error('删除记录失败:', error);
            return false;
        }
    },

    /**
     * 获取记录统计信息
     * @returns {object} 统计信息
     */
    getRecordsStats() {
        try {
            const allRecords = this.getAllRecords();
            const todayRecords = this.getTodayRecords();
            
            // 按日期分组统计
            const recordsByDate = {};
            allRecords.forEach(record => {
                if (!recordsByDate[record.date]) {
                    recordsByDate[record.date] = 0;
                }
                recordsByDate[record.date]++;
            });
            
            // 计算每日平均
            const dates = Object.keys(recordsByDate);
            const totalDays = dates.length;
            const totalRecords = allRecords.length;
            const dailyAverage = totalDays > 0 ? (totalRecords / totalDays).toFixed(1) : 0;
            
            // 获取最高记录日
            let maxDate = null;
            let maxCount = 0;
            for (const [date, count] of Object.entries(recordsByDate)) {
                if (count > maxCount) {
                    maxCount = count;
                    maxDate = date;
                }
            }
            
            return {
                totalRecords: totalRecords,
                todayCount: todayRecords.length,
                totalDays: totalDays,
                dailyAverage: parseFloat(dailyAverage),
                maxDate: maxDate,
                maxCount: maxCount,
                dates: dates.sort().reverse() // 日期倒序排列
            };
        } catch (error) {
            console.error('获取记录统计失败:', error);
            return {
                totalRecords: 0,
                todayCount: 0,
                totalDays: 0,
                dailyAverage: 0,
                maxDate: null,
                maxCount: 0,
                dates: []
            };
        }
    },

    /**
     * 获取用户设置
     * @returns {object} 用户设置
     */
    getSettings() {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return this.storage.getDefaultSettings();
            }

            const settings = this.storage.loadData(this.storage.KEYS.SETTINGS);
            return settings || this.storage.getDefaultSettings();
        } catch (error) {
            console.error('获取设置失败:', error);
            return this.storage.getDefaultSettings();
        }
    },

    /**
     * 保存用户设置
     * @param {object} newSettings - 新设置
     * @returns {boolean} 是否保存成功
     */
    saveSettings(newSettings) {
        try {
            if (!this.storage) {
                console.error('存储管理器未初始化');
                return false;
            }

            // 获取当前设置并合并
            const currentSettings = this.getSettings();
            const updatedSettings = {
                ...currentSettings,
                ...newSettings
            };

            // 验证设置
            if (!this.validateSettings(updatedSettings)) {
                console.error('设置验证失败');
                return false;
            }

            // 保存设置
            const success = this.storage.saveData(this.storage.KEYS.SETTINGS, updatedSettings);
            
            if (success) {
                console.log('设置保存成功:', updatedSettings);
                return true;
            } else {
                console.error('保存设置失败');
                return false;
            }
        } catch (error) {
            console.error('保存设置失败:', error);
            return false;
        }
    },

    /**
     * 确保有默认设置
     * @private
     */
    ensureDefaultSettings() {
        try {
            const settings = this.getSettings();
            if (!settings) {
                const defaultSettings = this.storage.getDefaultSettings();
                this.storage.saveData(this.storage.KEYS.SETTINGS, defaultSettings);
            }
        } catch (error) {
            console.error('确保默认设置失败:', error);
        }
    },

    /**
     * 验证设置
     * @param {object} settings - 要验证的设置
     * @returns {boolean} 是否有效
     * @private
     */
    validateSettings(settings) {
        if (typeof settings !== 'object' || settings === null) {
            return false;
        }

        // 验证烟价
        if (typeof settings.cigarettePrice !== 'number' || 
            settings.cigarettePrice < 0 || 
            settings.cigarettePrice > 1000) {
            return false;
        }

        // 验证每日目标
        if (typeof settings.dailyGoal !== 'number' || 
            settings.dailyGoal < 1 || 
            settings.dailyGoal > 100) {
            return false;
        }

        // 验证货币符号
        if (typeof settings.currency !== 'string' || 
            settings.currency.trim().length === 0) {
            return false;
        }

        return true;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecordsManager;
}