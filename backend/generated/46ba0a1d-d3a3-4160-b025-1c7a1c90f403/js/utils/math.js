/**
 * 数学工具函数
 * 提供数学计算、统计、格式化等功能
 */

class MathUtils {
    /**
     * 计算数组的平均值
     * @param {number[]} numbers - 数字数组
     * @returns {number} 平均值
     */
    static average(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        
        const sum = numbers.reduce((acc, num) => {
            const value = Number(num);
            return isNaN(value) ? acc : acc + value;
        }, 0);
        
        return sum / numbers.length;
    }
    
    /**
     * 计算数组的中位数
     * @param {number[]} numbers - 数字数组
     * @returns {number} 中位数
     */
    static median(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        
        const validNumbers = numbers
            .map(num => Number(num))
            .filter(num => !isNaN(num))
            .sort((a, b) => a - b);
        
        if (validNumbers.length === 0) {
            return 0;
        }
        
        const mid = Math.floor(validNumbers.length / 2);
        
        if (validNumbers.length % 2 === 0) {
            return (validNumbers[mid - 1] + validNumbers[mid]) / 2;
        } else {
            return validNumbers[mid];
        }
    }
    
    /**
     * 计算数组的最大值
     * @param {number[]} numbers - 数字数组
     * @returns {number} 最大值
     */
    static max(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        
        const validNumbers = numbers
            .map(num => Number(num))
            .filter(num => !isNaN(num));
        
        if (validNumbers.length === 0) {
            return 0;
        }
        
        return Math.max(...validNumbers);
    }
    
    /**
     * 计算数组的最小值
     * @param {number[]} numbers - 数字数组
     * @returns {number} 最小值
     */
    static min(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        
        const validNumbers = numbers
            .map(num => Number(num))
            .filter(num => !isNaN(num));
        
        if (validNumbers.length === 0) {
            return 0;
        }
        
        return Math.min(...validNumbers);
    }
    
    /**
     * 计算数组的总和
     * @param {number[]} numbers - 数字数组
     * @returns {number} 总和
     */
    static sum(numbers) {
        if (!Array.isArray(numbers) || numbers.length === 0) {
            return 0;
        }
        
        return numbers.reduce((acc, num) => {
            const value = Number(num);
            return isNaN(value) ? acc : acc + value;
        }, 0);
    }
    
    /**
     * 计算数组的标准差
     * @param {number[]} numbers - 数字数组
     * @returns {number} 标准差
     */
    static standardDeviation(numbers) {
        if (!Array.isArray(numbers) || numbers.length < 2) {
            return 0;
        }
        
        const avg = this.average(numbers);
        const squareDiffs = numbers.map(num => {
            const value = Number(num);
            return isNaN(value) ? 0 : Math.pow(value - avg, 2);
        });
        
        const avgSquareDiff = this.average(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }
    
    /**
     * 限制数值在指定范围内
     * @param {number} value - 原始值
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @returns {number} 限制后的值
     */
    static clamp(value, min, max) {
        if (isNaN(value)) return min;
        return Math.max(min, Math.min(max, value));
    }
    
    /**
     * 线性插值
     * @param {number} start - 起始值
     * @param {number} end - 结束值
     * @param {number} t - 插值比例 (0-1)
     * @returns {number} 插值结果
     */
    static lerp(start, end, t) {
        t = this.clamp(t, 0, 1);
        return start + (end - start) * t;
    }
    
    /**
     * 将数值映射到新的范围
     * @param {number} value - 原始值
     * @param {number} inMin - 原始范围最小值
     * @param {number} inMax - 原始范围最大值
     * @param {number} outMin - 目标范围最小值
     * @param {number} outMax - 目标范围最大值
     * @returns {number} 映射后的值
     */
    static mapRange(value, inMin, inMax, outMin, outMax) {
        if (inMin === inMax) return outMin;
        
        const normalized = (value - inMin) / (inMax - inMin);
        return outMin + normalized * (outMax - outMin);
    }
    
    /**
     * 格式化数字为货币格式
     * @param {number} amount - 金额
     * @param {string} currency - 货币符号
     * @param {number} decimals - 小数位数
     * @returns {string} 格式化后的货币字符串
     */
    static formatCurrency(amount, currency = '¥', decimals = 2) {
        if (isNaN(amount)) {
            return `${currency}0.00`;
        }
        
        const fixedAmount = amount.toFixed(decimals);
        const parts = fixedAmount.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        
        return `${currency}${parts.join('.')}`;
    }
    
    /**
     * 格式化数字为百分比
     * @param {number} value - 原始值 (0-1)
     * @param {number} decimals - 小数位数
     * @returns {string} 百分比字符串
     */
    static formatPercent(value, decimals = 1) {
        if (isNaN(value)) {
            return '0%';
        }
        
        const percent = value * 100;
        return `${percent.toFixed(decimals)}%`;
    }
    
    /**
     * 计算节省的金额
     * @param {number} count - 抽烟次数
     * @param {number} pricePerPack - 每包烟价格
     * @param {number} cigarettesPerPack - 每包烟支数
     * @returns {number} 节省的金额
     */
    static calculateSavedMoney(count, pricePerPack = 15, cigarettesPerPack = 20) {
        if (isNaN(count) || count <= 0) {
            return 0;
        }
        
        const pricePerCigarette = pricePerPack / cigarettesPerPack;
        return count * pricePerCigarette;
    }
    
    /**
     * 计算健康改善进度
     * @param {number} currentInterval - 当前间隔（秒）
     * @param {number} targetInterval - 目标间隔（秒）
     * @returns {number} 进度百分比 (0-1)
     */
    static calculateHealthProgress(currentInterval, targetInterval) {
        if (isNaN(currentInterval) || isNaN(targetInterval) || targetInterval <= 0) {
            return 0;
        }
        
        const progress = currentInterval / targetInterval;
        return this.clamp(progress, 0, 1);
    }
    
    /**
     * 计算成就等级
     * @param {number} consecutiveDays - 连续达标天数
     * @returns {string} 成就等级
     */
    static calculateAchievementLevel(consecutiveDays) {
        if (consecutiveDays >= 90) {
            return 'diamond';
        } else if (consecutiveDays >= 30) {
            return 'gold';
        } else if (consecutiveDays >= 7) {
            return 'silver';
        } else if (consecutiveDays >= 3) {
            return 'bronze';
        } else {
            return 'none';
        }
    }
    
    /**
     * 生成随机整数
     * @param {number} min - 最小值（包含）
     * @param {number} max - 最大值（包含）
     * @returns {number} 随机整数
     */
    static randomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    /**
     * 生成随机浮点数
     * @param {number} min - 最小值
     * @param {number} max - 最大值
     * @param {number} decimals - 小数位数
     * @returns {number} 随机浮点数
     */
    static randomFloat(min, max, decimals = 2) {
        const random = Math.random() * (max - min) + min;
        return parseFloat(random.toFixed(decimals));
    }
    
    /**
     * 计算趋势（上升、下降、稳定）
     * @param {number[]} values - 数值序列
     * @returns {string} 趋势描述
     */
    static calculateTrend(values) {
        if (!Array.isArray(values) || values.length < 2) {
            return 'stable';
        }
        
        const validValues = values
            .map(v => Number(v))
            .filter(v => !isNaN(v));
        
        if (validValues.length < 2) {
            return 'stable';
        }
        
        // 计算简单线性回归的斜率
        const n = validValues.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
        
        for (let i = 0; i < n; i++) {
            sumX += i;
            sumY += validValues[i];
            sumXY += i * validValues[i];
            sumX2 += i * i;
        }
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        
        if (slope > 0.1) {
            return 'increasing';
        } else if (slope < -0.1) {
            return 'decreasing';
        } else {
            return 'stable';
        }
    }
    
    /**
     * 平滑数据（移动平均）
     * @param {number[]} data - 原始数据
     * @param {number} windowSize - 窗口大小
     * @returns {number[]} 平滑后的数据
     */
    static smoothData(data, windowSize = 3) {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }
        
        const smoothed = [];
        
        for (let i = 0; i < data.length; i++) {
            const start = Math.max(0, i - Math.floor(windowSize / 2));
            const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
            const window = data.slice(start, end);
            
            const avg = this.average(window);
            smoothed.push(avg);
        }
        
        return smoothed;
    }
    
    /**
     * 计算增长率
     * @param {number} current - 当前值
     * @param {number} previous - 之前的值
     * @returns {number} 增长率（百分比，0-1）
     */
    static calculateGrowthRate(current, previous) {
        if (isNaN(current) || isNaN(previous) || previous === 0) {
            return 0;
        }
        
        return (current - previous) / previous;
    }
    
    /**
     * 四舍五入到指定精度
     * @param {number} value - 原始值
     * @param {number} precision - 精度（小数位数）
     * @returns {number} 四舍五入后的值
     */
    static round(value, precision = 0) {
        if (isNaN(value)) return 0;
        
        const multiplier = Math.pow(10, precision);
        return Math.round(value * multiplier) / multiplier;
    }
    
    /**
     * 判断数值是否在误差范围内相等
     * @param {number} a - 第一个值
     * @param {number} b - 第二个值
     * @param {number} epsilon - 误差范围
     * @returns {boolean} 是否相等
     */
    static approximatelyEqual(a, b, epsilon = 0.0001) {
        return Math.abs(a - b) < epsilon;
    }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.MathUtils = MathUtils;
}

export default MathUtils;