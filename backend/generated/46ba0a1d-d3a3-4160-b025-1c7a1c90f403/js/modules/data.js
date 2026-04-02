/**
 * 数据模块
 * 管理抽烟记录和统计数据
 */

class DataModule {
    constructor() {
        this.records = [];
        this.stats = {
            todayCount: 0,
            avgInterval: 0,
            maxInterval: 0,
            savedMoney: 0,
            lastUpdated: Date.now()
        };
        
        this.chart = null;
        this.chartData = {
            labels: [],
            datasets: []
        };
        
        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化数据
        this.init();
    }

    /**
     * 初始化数据模块
     */
    async init() {
        // 加载数据
        await this.loadData();
        
        // 计算统计数据
        this.calculateStats();
        
        // 初始化图表
        this.initChart();
        
        // 触发数据加载完成事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.DATA_UPDATE, this.stats);
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        if (!window.EventBus) return;
        
        // 监听计时器记录事件
        window.EventBus.on(window.EventTypes.TIMER_RECORD, (event) => {
            this.addRecord(event.data);
        });
        
        // 监听数据清除事件
        window.EventBus.on(window.EventTypes.DATA_CLEARED, () => {
            this.clearData();
        });
        
        // 监听设置变化事件
        window.EventBus.on(window.EventTypes.SETTINGS_CHANGED, (event) => {
            if (event.data.cigarettePrice || event.data.cigarettesPerPack) {
                this.calculateStats();
            }
        });
    }

    /**
     * 加载数据
     */
    async loadData() {
        if (!window.Storage) {
            console.warn('存储模块未加载，使用内存数据');
            return;
        }
        
        try {
            // 加载记录
            this.records = window.Storage.getRecords() || [];
            
            // 加载统计数据
            const savedStats = window.Storage.getStats();
            if (savedStats) {
                this.stats = { ...this.stats, ...savedStats };
            }
            
            // 检查是否需要重置今日统计
            if (window.Storage.shouldResetTodayStats()) {
                this.resetTodayStats();
            }
            
            console.log(`加载了 ${this.records.length} 条记录`);
        } catch (error) {
            console.error('加载数据失败:', error);
        }
    }

    /**
     * 保存数据
     */
    saveData() {
        if (!window.Storage) return;
        
        try {
            // 更新最后更新时间
            this.stats.lastUpdated = Date.now();
            
            // 保存统计数据
            window.Storage.updateStats(this.stats);
            
            console.log('数据已保存');
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }

    /**
     * 添加抽烟记录
     * @param {Object} recordData - 记录数据
     * @returns {Object} 添加的记录
     */
    addRecord(recordData) {
        if (!recordData || !recordData.timestamp) {
            console.error('无效的记录数据');
            return null;
        }
        
        // 创建完整记录
        const record = {
            id: this.generateRecordId(),
            timestamp: recordData.timestamp,
            interval: recordData.interval || 0,
            goalReached: recordData.goalReached || false,
            date: new Date(recordData.timestamp).toISOString().split('T')[0]
        };
        
        // 添加到记录列表
        this.records.unshift(record);
        
        // 保存到存储
        if (window.Storage) {
            window.Storage.addRecord(record);
        }
        
        // 更新统计数据
        this.calculateStats();
        
        // 更新图表
        this.updateChart();
        
        // 触发记录添加事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.DATA_RECORD_ADDED, record);
            window.EventBus.emit(window.EventTypes.DATA_UPDATE, this.stats);
        }
        
        console.log(`添加记录: ID=${record.id}, 间隔=${record.interval}秒`);
        
        return record;
    }

    /**
     * 生成记录ID
     * @returns {number} 记录ID
     */
    generateRecordId() {
        if (this.records.length === 0) {
            return 1;
        }
        
        const maxId = Math.max(...this.records.map(r => r.id));
        return maxId + 1;
    }

    /**
     * 获取记录
     * @param {Object} options - 选项
     * @returns {Array} 记录数组
     */
    getRecords(options = {}) {
        let records = [...this.records];
        
        // 应用过滤器
        if (options.filter) {
            records = records.filter(options.filter);
        }
        
        // 应用排序
        if (options.sort) {
            records.sort(options.sort);
        } else {
            // 默认按时间倒序
            records.sort((a, b) => b.timestamp - a.timestamp);
        }
        
        // 应用分页
        if (options.limit) {
            records = records.slice(0, options.limit);
        }
        
        return records;
    }

    /**
     * 获取今日记录
     * @returns {Array} 今日记录
     */
    getTodayRecords() {
        const today = new Date().toISOString().split('T')[0];
        return this.records.filter(record => record.date === today);
    }

    /**
     * 获取本周记录
     * @returns {Array} 本周记录
     */
    getWeekRecords() {
        const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        return this.records.filter(record => record.timestamp >= oneWeekAgo);
    }

    /**
     * 获取本月记录
     * @returns {Array} 本月记录
     */
    getMonthRecords() {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return this.records.filter(record => record.timestamp >= oneMonthAgo);
    }

    /**
     * 删除记录
     * @param {number} recordId - 记录ID
     * @returns {boolean} 是否删除成功
     */
    deleteRecord(recordId) {
        const initialLength = this.records.length;
        this.records = this.records.filter(record => record.id !== recordId);
        
        if (this.records.length < initialLength) {
            // 从存储中删除
            if (window.Storage) {
                window.Storage.deleteRecord(recordId);
            }
            
            // 更新统计数据
            this.calculateStats();
            
            // 更新图表
            this.updateChart();
            
            // 触发记录删除事件
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.DATA_RECORD_REMOVED, { recordId });
                window.EventBus.emit(window.EventTypes.DATA_UPDATE, this.stats);
            }
            
            console.log(`删除记录: ID=${recordId}`);
            return true;
        }
        
        return false;
    }

    /**
     * 清除所有数据
     */
    clearData() {
        this.records = [];
        this.resetTodayStats();
        
        // 清除存储
        if (window.Storage) {
            window.Storage.clearRecords();
            window.Storage.resetTodayStats();
        }
        
        // 更新图表
        this.updateChart();
        
        // 触发数据清除事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.DATA_UPDATE, this.stats);
        }
        
        console.log('所有数据已清除');
    }

    /**
     * 重置今日统计数据
     */
    resetTodayStats() {
        this.stats.todayCount = 0;
        this.stats.avgInterval = 0;
        this.stats.maxInterval = 0;
        this.stats.savedMoney = 0;
        this.stats.lastUpdated = Date.now();
        
        this.saveData();
    }

    /**
     * 计算统计数据
     */
    calculateStats() {
        const todayRecords = this.getTodayRecords();
        const todayIntervals = todayRecords.map(r => r.interval).filter(i => i > 0);
        
        // 今日次数
        this.stats.todayCount = todayRecords.length;
        
        // 平均间隔
        if (todayIntervals.length > 0) {
            const sum = todayIntervals.reduce((a, b) => a + b, 0);
            this.stats.avgInterval = Math.round(sum / todayIntervals.length);
        } else {
            this.stats.avgInterval = 0;
        }
        
        // 最长间隔
        if (todayIntervals.length > 0) {
            this.stats.maxInterval = Math.max(...todayIntervals);
        } else {
            this.stats.maxInterval = 0;
        }
        
        // 节省金额
        if (window.Storage) {
            const settings = window.Storage.getSettings();
            const pricePerCigarette = settings.cigarettePrice / settings.cigarettesPerPack;
            this.stats.savedMoney = todayRecords.length * pricePerCigarette;
        } else {
            // 默认计算：每支烟0.75元
            this.stats.savedMoney = todayRecords.length * 0.75;
        }
        
        // 保存数据
        this.saveData();
        
        // 触发统计更新事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.DATA_STATS_UPDATED, this.stats);
        }
    }

    /**
     * 获取统计数据
     * @returns {Object} 统计数据
     */
    getStats() {
        return { ...this.stats };
    }

    /**
     * 初始化图表
     */
    initChart() {
        if (!window.Chart) {
            console.warn('Chart.js 未加载，无法初始化图表');
            return;
        }
        
        const ctx = document.getElementById('smoking-chart');
        if (!ctx) {
            console.warn('未找到图表canvas元素');
            return;
        }
        
        // 准备图表数据
        this.prepareChartData('day');
        
        // 创建图表
        this.chart = new Chart(ctx, {
            type: 'line',
            data: this.chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                    }
                },
                scales: {
                    x: {
                        display: true,
                        title: {
                            display: true,
                            text: '时间'
                        }
                    },
                    y: {
                        display: true,
                        title: {
                            display: true,
                            text: '间隔时间（分钟）'
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }

    /**
     * 准备图表数据
     * @param {string} period - 时间段（day/week/month）
     */
    prepareChartData(period = 'day') {
        let records = [];
        
        switch (period) {
            case 'day':
                records = this.getTodayRecords();
                break;
            case 'week':
                records = this.getWeekRecords();
                break;
            case 'month':
                records = this.getMonthRecords();
                break;
            default:
                records = this.getTodayRecords();
        }
        
        // 按时间排序
        records.sort((a, b) => a.timestamp - b.timestamp);
        
        // 准备标签和数据
        const labels = [];
        const intervals = [];
        const goals = [];
        
        records.forEach(record => {
            const time = new Date(record.timestamp);
            let label;
            
            if (period === 'day') {
                label = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else if (period === 'week') {
                label = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
            } else {
                label = time.toLocaleDateString([], { month: 'short', day: 'numeric' });
            }
            
            labels.push(label);
            intervals.push(Math.round(record.interval / 60)); // 转换为分钟
            goals.push(record.goalReached ? 1 : 0);
        });
        
        // 如果没有数据，添加默认数据
        if (labels.length === 0) {
            labels.push('暂无数据');
            intervals.push(0);
            goals.push(0);
        }
        
        // 获取目标间隔
        let targetInterval = 120; // 默认2小时
        if (window.Storage) {
            const settings = window.Storage.getSettings();
            targetInterval = Math.round(settings.targetInterval / 60);
        }
        
        // 创建目标线数据
        const targetLine = new Array(labels.length).fill(targetInterval);
        
        // 更新图表数据
        this.chartData.labels = labels;
        this.chartData.datasets = [
            {
                label: '抽烟间隔',
                data: intervals,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true
            },
            {
                label: '目标间隔',
                data: targetLine,
                borderColor: 'rgb(255, 99, 132)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 0
            }
        ];
    }

    /**
     * 更新图表
     * @param {string} period - 时间段
     */
    updateChart(period = 'day') {
        if (!this.chart) {
            this.initChart();
            return;
        }
        
        this.prepareChartData(period);
        
        if (this.chart) {
            this.chart.data = this.chartData;
            this.chart.update('none');
        }
    }

    /**
     * 导出数据
     * @returns {Object} 导出的数据
     */
    exportData() {
        const exportData = {
            version: '1.0',
            exportedAt: Date.now(),
            records: this.records,
            stats: this.stats
        };
        
        if (window.Storage) {
            const settings = window.Storage.getSettings();
            exportData.settings = settings;
        }
        
        // 触发数据导出事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.DATA_EXPORTED, exportData);
        }
        
        return exportData;
    }

    /**
     * 导入数据
     * @param {Object} importedData - 导入的数据
     * @returns {Object} 导入结果
     */
    importData(importedData) {
        try {
            if (!importedData || typeof importedData !== 'object') {
                throw new Error('导入的数据格式不正确');
            }
            
            // 验证数据
            if (!Array.isArray(importedData.records)) {
                throw new Error('记录数据必须是数组');
            }
            
            // 清空现有数据
            this.records = [];
            
            // 导入记录
            importedData.records.forEach(record => {
                if (record && record.timestamp) {
                    this.records.push({
                        ...record,
                        date: new Date(record.timestamp).toISOString().split('T')[0]
                    });
                }
            });
            
            // 导入统计
            if (importedData.stats) {
                this.stats = { ...this.stats, ...importedData.stats };
            }
            
            // 保存到存储
            if (window.Storage) {
                // 保存记录
                this.records.forEach(record => {
                    window.Storage.addRecord(record);
                });
                
                // 保存统计
                window.Storage.updateStats(this.stats);
                
                // 保存设置
                if (importedData.settings) {
                    window.Storage.saveSettings(importedData.settings);
                }
            }
            
            // 更新图表
            this.updateChart();
            
            // 触发数据导入事件
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.DATA_IMPORTED, {
                    recordCount: this.records.length,
                    importedData
                });
                window.EventBus.emit(window.EventTypes.DATA_UPDATE, this.stats);
            }
            
            return {
                success: true,
                message: `成功导入 ${this.records.length} 条记录`,
                recordCount: this.records.length
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
     * 获取连续达标天数
     * @returns {number} 连续达标天数
     */
    getConsecutiveGoalDays() {
        if (this.records.length === 0) {
            return 0;
        }
        
        // 按日期分组记录
        const recordsByDate = {};
        this.records.forEach(record => {
            if (!recordsByDate[record.date]) {
                recordsByDate[record.date] = [];
            }
            recordsByDate[record.date].push(record);
        });
        
        // 按日期排序
        const dates = Object.keys(recordsByDate).sort((a, b) => b.localeCompare(a));
        
        let consecutiveDays = 0;
        const today = new Date().toISOString().split('T')[0];
        
        // 检查从今天开始的连续达标天数
        for (let i = 0; i < dates.length; i++) {
            const date = dates[i];
            const records = recordsByDate[date];
            
            // 检查该天是否有达到目标的记录
            const hasGoalReached = records.some(record => record.goalReached);
            
            if (hasGoalReached) {
                // 如果是今天，直接计数
                if (date === today) {
                    consecutiveDays++;
                } else {
                    // 检查是否是连续的天
                    const prevDate = i > 0 ? dates[i - 1] : null;
                    if (prevDate) {
                        const date1 = new Date(date);
                        const date2 = new Date(prevDate);
                        const diffDays = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
                        
                        if (diffDays === 1) {
                            consecutiveDays++;
                        } else {
                            break; // 不连续，停止计数
                        }
                    } else {
                        consecutiveDays++;
                    }
                }
            } else {
                break; // 该天没有达标，停止计数
            }
        }
        
        return consecutiveDays;
    }

    /**
     * 销毁数据模块
     */
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        this.records = [];
        this.stats = {
            todayCount: 0,
            avgInterval: 0,
            maxInterval: 0,
            savedMoney: 0,
            lastUpdated: Date.now()
        };
        
        console.log('数据模块已销毁');
    }
}

// 创建全局数据实例
const dataModule = new DataModule();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.DataModule = dataModule;
}

export default dataModule;