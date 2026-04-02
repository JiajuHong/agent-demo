/**
 * 时间工具函数
 * 提供时间格式化、计算、转换等功能
 */

class TimeUtils {
    /**
     * 格式化秒数为 HH:MM:SS 格式
     * @param {number} seconds - 总秒数
     * @returns {string} 格式化后的时间字符串
     */
    static formatTime(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '00:00:00';
        }
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            secs.toString().padStart(2, '0')
        ].join(':');
    }
    
    /**
     * 格式化秒数为可读的时间描述
     * @param {number} seconds - 总秒数
     * @returns {string} 可读的时间描述
     */
    static formatTimeReadable(seconds) {
        if (isNaN(seconds) || seconds < 0) {
            return '0秒';
        }
        
        if (seconds < 60) {
            return `${Math.floor(seconds)}秒`;
        } else if (seconds < 3600) {
            const minutes = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return secs > 0 ? `${minutes}分钟${secs}秒` : `${minutes}分钟`;
        } else {
            const hours = Math.floor(seconds / 3600);
            const minutes = Math.floor((seconds % 3600) / 60);
            
            if (minutes === 0) {
                return `${hours}小时`;
            } else if (hours < 24) {
                return `${hours}小时${minutes}分钟`;
            } else {
                const days = Math.floor(hours / 24);
                const remainingHours = hours % 24;
                
                if (remainingHours === 0) {
                    return `${days}天`;
                } else {
                    return `${days}天${remainingHours}小时`;
                }
            }
        }
    }
    
    /**
     * 格式化时间戳为日期时间字符串
     * @param {number} timestamp - 时间戳（毫秒）
     * @param {boolean} includeTime - 是否包含时间部分
     * @returns {string} 格式化后的日期时间字符串
     */
    static formatDateTime(timestamp, includeTime = true) {
        if (!timestamp) return '未知时间';
        
        const date = new Date(timestamp);
        
        if (isNaN(date.getTime())) {
            return '无效时间';
        }
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        
        if (!includeTime) {
            return `${year}-${month}-${day}`;
        }
        
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * 格式化时间戳为相对时间描述
     * @param {number} timestamp - 时间戳（毫秒）
     * @returns {string} 相对时间描述
     */
    static formatRelativeTime(timestamp) {
        if (!timestamp) return '未知时间';
        
        const now = Date.now();
        const diff = now - timestamp;
        
        if (diff < 0) {
            return '未来时间';
        }
        
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) {
            return '刚刚';
        } else if (minutes < 60) {
            return `${minutes}分钟前`;
        } else if (hours < 24) {
            return `${hours}小时前`;
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return this.formatDateTime(timestamp, false);
        }
    }
    
    /**
     * 获取今天的开始时间戳（00:00:00）
     * @returns {number} 时间戳（毫秒）
     */
    static getTodayStart() {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        return now.getTime();
    }
    
    /**
     * 获取今天的结束时间戳（23:59:59.999）
     * @returns {number} 时间戳（毫秒）
     */
    static getTodayEnd() {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        return now.getTime();
    }
    
    /**
     * 检查两个时间戳是否在同一天
     * @param {number} timestamp1 - 第一个时间戳
     * @param {number} timestamp2 - 第二个时间戳
     * @returns {boolean} 是否在同一天
     */
    static isSameDay(timestamp1, timestamp2) {
        if (!timestamp1 || !timestamp2) return false;
        
        const date1 = new Date(timestamp1);
        const date2 = new Date(timestamp2);
        
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }
    
    /**
     * 获取本周的开始时间戳（周一 00:00:00）
     * @returns {number} 时间戳（毫秒）
     */
    static getWeekStart() {
        const now = new Date();
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1); // 调整到周一
        const monday = new Date(now.setDate(diff));
        monday.setHours(0, 0, 0, 0);
        return monday.getTime();
    }
    
    /**
     * 获取本月的开始时间戳（1号 00:00:00）
     * @returns {number} 时间戳（毫秒）
     */
    static getMonthStart() {
        const now = new Date();
        now.setDate(1);
        now.setHours(0, 0, 0, 0);
        return now.getTime();
    }
    
    /**
     * 计算两个时间戳之间的天数差
     * @param {number} timestamp1 - 第一个时间戳
     * @param {number} timestamp2 - 第二个时间戳
     * @returns {number} 天数差（取绝对值）
     */
    static getDaysBetween(timestamp1, timestamp2) {
        if (!timestamp1 || !timestamp2) return 0;
        
        const diff = Math.abs(timestamp1 - timestamp2);
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    }
    
    /**
     * 将小时转换为秒
     * @param {number} hours - 小时数
     * @returns {number} 秒数
     */
    static hoursToSeconds(hours) {
        return hours * 3600;
    }
    
    /**
     * 将分钟转换为秒
     * @param {number} minutes - 分钟数
     * @returns {number} 秒数
     */
    static minutesToSeconds(minutes) {
        return minutes * 60;
    }
    
    /**
     * 将秒转换为小时
     * @param {number} seconds - 秒数
     * @returns {number} 小时数（保留1位小数）
     */
    static secondsToHours(seconds) {
        return Math.round((seconds / 3600) * 10) / 10;
    }
    
    /**
     * 将秒转换为分钟
     * @param {number} seconds - 秒数
     * @returns {number} 分钟数（保留1位小数）
     */
    static secondsToMinutes(seconds) {
        return Math.round((seconds / 60) * 10) / 10;
    }
    
    /**
     * 获取当前时间戳
     * @returns {number} 当前时间戳（毫秒）
     */
    static getCurrentTimestamp() {
        return Date.now();
    }
    
    /**
     * 验证时间戳是否有效
     * @param {number} timestamp - 时间戳
     * @returns {boolean} 是否有效
     */
    static isValidTimestamp(timestamp) {
        if (typeof timestamp !== 'number' || isNaN(timestamp)) {
            return false;
        }
        
        const date = new Date(timestamp);
        return !isNaN(date.getTime());
    }
    
    /**
     * 获取时间段的描述
     * @param {string} period - 时间段类型（day/week/month）
     * @returns {string} 时间段描述
     */
    static getPeriodDescription(period) {
        const descriptions = {
            'day': '今日',
            'week': '本周',
            'month': '本月',
            'today': '今日',
            'yesterday': '昨日',
            'last7days': '最近7天',
            'last30days': '最近30天'
        };
        
        return descriptions[period] || period;
    }
    
    /**
     * 获取指定时间段的时间范围
     * @param {string} period - 时间段类型
     * @returns {Object} 包含start和end时间戳的对象
     */
    static getTimeRange(period) {
        const now = Date.now();
        
        switch (period) {
            case 'day':
            case 'today':
                return {
                    start: this.getTodayStart(),
                    end: now
                };
                
            case 'yesterday':
                const yesterday = new Date(now - 86400000);
                yesterday.setHours(0, 0, 0, 0);
                const yesterdayEnd = new Date(yesterday);
                yesterdayEnd.setHours(23, 59, 59, 999);
                return {
                    start: yesterday.getTime(),
                    end: yesterdayEnd.getTime()
                };
                
            case 'week':
                return {
                    start: this.getWeekStart(),
                    end: now
                };
                
            case 'month':
                return {
                    start: this.getMonthStart(),
                    end: now
                };
                
            case 'last7days':
                return {
                    start: now - (7 * 86400000),
                    end: now
                };
                
            case 'last30days':
                return {
                    start: now - (30 * 86400000),
                    end: now
                };
                
            default:
                return {
                    start: this.getTodayStart(),
                    end: now
                };
        }
    }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.TimeUtils = TimeUtils;
}

export default TimeUtils;