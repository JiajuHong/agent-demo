/**
 * 验证工具函数
 * 提供数据验证、类型检查、格式验证等功能
 */

class ValidationUtils {
    /**
     * 验证是否为有效数字
     * @param {*} value - 要验证的值
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否为有效数字
     */
    static isValidNumber(value, options = {}) {
        if (value === null || value === undefined || value === '') {
            return false;
        }
        
        const num = Number(value);
        
        if (isNaN(num)) {
            return false;
        }
        
        // 检查最小值
        if (options.min !== undefined && num < options.min) {
            return false;
        }
        
        // 检查最大值
        if (options.max !== undefined && num > options.max) {
            return false;
        }
        
        // 检查是否为整数
        if (options.integer && !Number.isInteger(num)) {
            return false;
        }
        
        // 检查是否为正数
        if (options.positive && num <= 0) {
            return false;
        }
        
        // 检查是否为非负数
        if (options.nonNegative && num < 0) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 验证是否为有效字符串
     * @param {*} value - 要验证的值
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否为有效字符串
     */
    static isValidString(value, options = {}) {
        if (typeof value !== 'string') {
            return false;
        }
        
        const trimmed = value.trim();
        
        // 检查是否为空
        if (options.required && trimmed.length === 0) {
            return false;
        }
        
        // 检查最小长度
        if (options.minLength !== undefined && trimmed.length < options.minLength) {
            return false;
        }
        
        // 检查最大长度
        if (options.maxLength !== undefined && trimmed.length > options.maxLength) {
            return false;
        }
        
        // 检查正则表达式
        if (options.pattern && !options.pattern.test(trimmed)) {
            return false;
        }
        
        // 检查是否包含特定字符
        if (options.contains && !trimmed.includes(options.contains)) {
            return false;
        }
        
        // 检查是否不包含特定字符
        if (options.notContains && trimmed.includes(options.notContains)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 验证是否为有效日期
     * @param {*} value - 要验证的值
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否为有效日期
     */
    static isValidDate(value, options = {}) {
        if (!value) {
            return false;
        }
        
        let date;
        
        if (value instanceof Date) {
            date = value;
        } else if (typeof value === 'number') {
            date = new Date(value);
        } else if (typeof value === 'string') {
            date = new Date(value);
        } else {
            return false;
        }
        
        if (isNaN(date.getTime())) {
            return false;
        }
        
        // 检查最小日期
        if (options.minDate) {
            const minDate = options.minDate instanceof Date ? options.minDate : new Date(options.minDate);
            if (date < minDate) {
                return false;
            }
        }
        
        // 检查最大日期
        if (options.maxDate) {
            const maxDate = options.maxDate instanceof Date ? options.maxDate : new Date(options.maxDate);
            if (date > maxDate) {
                return false;
            }
        }
        
        // 检查是否在未来
        if (options.future && date <= new Date()) {
            return false;
        }
        
        // 检查是否在过去
        if (options.past && date >= new Date()) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 验证是否为有效时间戳
     * @param {*} value - 要验证的值
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否为有效时间戳
     */
    static isValidTimestamp(value, options = {}) {
        if (!this.isValidNumber(value, { positive: true })) {
            return false;
        }
        
        const timestamp = Number(value);
        
        // 检查是否为合理的时间戳（1970年之后）
        if (timestamp < 0) {
            return false;
        }
        
        // 检查是否在未来（如果允许）
        if (options.notFuture && timestamp > Date.now()) {
            return false;
        }
        
        // 检查是否在过去（如果允许）
        if (options.notPast && timestamp < Date.now()) {
            return false;
        }
        
        // 检查最小时间戳
        if (options.minTimestamp !== undefined && timestamp < options.minTimestamp) {
            return false;
        }
        
        // 检查最大时间戳
        if (options.maxTimestamp !== undefined && timestamp > options.maxTimestamp) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 验证是否为有效数组
     * @param {*} value - 要验证的值
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否为有效数组
     */
    static isValidArray(value, options = {}) {
        if (!Array.isArray(value)) {
            return false;
        }
        
        // 检查是否为空
        if (options.required && value.length === 0) {
            return false;
        }
        
        // 检查最小长度
        if (options.minLength !== undefined && value.length < options.minLength) {
            return false;
        }
        
        // 检查最大长度
        if (options.maxLength !== undefined && value.length > options.maxLength) {
            return false;
        }
        
        // 检查元素类型
        if (options.elementType) {
            for (const element of value) {
                if (typeof element !== options.elementType) {
                    return false;
                }
            }
        }
        
        // 检查元素验证函数
        if (options.elementValidator) {
            for (const element of value) {
                if (!options.elementValidator(element)) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * 验证是否为有效对象
     * @param {*} value - 要验证的值
     * @param {Object} options - 验证选项
     * @returns {boolean} 是否为有效对象
     */
    static isValidObject(value, options = {}) {
        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            return false;
        }
        
        // 检查必需字段
        if (options.requiredFields) {
            for (const field of options.requiredFields) {
                if (!(field in value)) {
                    return false;
                }
            }
        }
        
        // 检查字段验证
        if (options.fieldValidators) {
            for (const [field, validator] of Object.entries(options.fieldValidators)) {
                if (field in value && !validator(value[field])) {
                    return false;
                }
            }
        }
        
        // 检查不允许的字段
        if (options.disallowedFields) {
            for (const field of options.disallowedFields) {
                if (field in value) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    /**
     * 验证是否为有效邮箱
     * @param {string} email - 邮箱地址
     * @returns {boolean} 是否为有效邮箱
     */
    static isValidEmail(email) {
        if (!this.isValidString(email, { required: true })) {
            return false;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email.trim());
    }
    
    /**
     * 验证是否为有效URL
     * @param {string} url - URL地址
     * @returns {boolean} 是否为有效URL
     */
    static isValidUrl(url) {
        if (!this.isValidString(url, { required: true })) {
            return false;
        }
        
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
    
    /**
     * 验证是否为有效手机号（中国）
     * @param {string} phone - 手机号
     * @returns {boolean} 是否为有效手机号
     */
    static isValidChinesePhone(phone) {
        if (!this.isValidString(phone, { required: true })) {
            return false;
        }
        
        const phoneRegex = /^1[3-9]\d{9}$/;
        return phoneRegex.test(phone.trim());
    }
    
    /**
     * 验证抽烟记录对象
     * @param {Object} record - 抽烟记录
     * @returns {Object} 验证结果 { isValid: boolean, errors: string[] }
     */
    static validateSmokingRecord(record) {
        const errors = [];
        
        if (!this.isValidObject(record)) {
            errors.push('记录必须是一个对象');
            return { isValid: false, errors };
        }
        
        // 验证id
        if (!this.isValidNumber(record.id, { integer: true, positive: true })) {
            errors.push('ID必须是正整数');
        }
        
        // 验证时间戳
        if (!this.isValidTimestamp(record.timestamp, { notFuture: true })) {
            errors.push('时间戳必须是有效的过去时间');
        }
        
        // 验证间隔时间
        if (!this.isValidNumber(record.interval, { min: 0 })) {
            errors.push('间隔时间必须是非负数');
        }
        
        // 验证是否达到目标
        if (typeof record.goalReached !== 'boolean') {
            errors.push('goalReached必须是布尔值');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 验证用户设置对象
     * @param {Object} settings - 用户设置
     * @returns {Object} 验证结果 { isValid: boolean, errors: string[] }
     */
    static validateUserSettings(settings) {
        const errors = [];
        
        if (!this.isValidObject(settings)) {
            errors.push('设置必须是一个对象');
            return { isValid: false, errors };
        }
        
        // 验证目标间隔
        if (!this.isValidNumber(settings.targetInterval, { min: 60, max: 86400 })) {
            errors.push('目标间隔必须在60秒到24小时之间');
        }
        
        // 验证声音开关
        if (typeof settings.enableSound !== 'boolean') {
            errors.push('enableSound必须是布尔值');
        }
        
        // 验证通知开关
        if (typeof settings.enableNotifications !== 'boolean') {
            errors.push('enableNotifications必须是布尔值');
        }
        
        // 验证主题
        const validThemes = ['light', 'dark', 'health'];
        if (!validThemes.includes(settings.theme)) {
            errors.push(`主题必须是以下之一: ${validThemes.join(', ')}`);
        }
        
        // 验证香烟价格
        if (!this.isValidNumber(settings.cigarettePrice, { min: 0, max: 1000 })) {
            errors.push('香烟价格必须在0到1000之间');
        }
        
        // 验证每包支数
        if (!this.isValidNumber(settings.cigarettesPerPack, { integer: true, min: 1, max: 100 })) {
            errors.push('每包支数必须是1到100之间的整数');
        }
        
        // 验证最后重置日期
        if (settings.lastResetDate && !this.isValidDate(settings.lastResetDate)) {
            errors.push('最后重置日期必须是有效日期');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 验证统计数据对象
     * @param {Object} stats - 统计数据
     * @returns {Object} 验证结果 { isValid: boolean, errors: string[] }
     */
    static validateStatistics(stats) {
        const errors = [];
        
        if (!this.isValidObject(stats)) {
            errors.push('统计数据必须是一个对象');
            return { isValid: false, errors };
        }
        
        // 验证今日次数
        if (!this.isValidNumber(stats.todayCount, { integer: true, min: 0 })) {
            errors.push('今日次数必须是非负整数');
        }
        
        // 验证平均间隔
        if (!this.isValidNumber(stats.avgInterval, { min: 0 })) {
            errors.push('平均间隔必须是非负数');
        }
        
        // 验证最长间隔
        if (!this.isValidNumber(stats.maxInterval, { min: 0 })) {
            errors.push('最长间隔必须是非负数');
        }
        
        // 验证节省金额
        if (!this.isValidNumber(stats.savedMoney, { min: 0 })) {
            errors.push('节省金额必须是非负数');
        }
        
        // 验证最后更新时间
        if (!this.isValidTimestamp(stats.lastUpdated, { notFuture: true })) {
            errors.push('最后更新时间必须是有效的过去时间');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * 验证导入的数据
     * @param {Object} data - 导入的数据
     * @returns {Object} 验证结果 { isValid: boolean, errors: string[], warnings: string[] }
     */
    static validateImportData(data) {
        const errors = [];
        const warnings = [];
        
        if (!this.isValidObject(data)) {
            errors.push('导入数据必须是一个对象');
            return { isValid: false, errors, warnings };
        }
        
        // 验证版本
        if (data.version && data.version !== '1.0') {
            warnings.push(`数据版本(${data.version})与当前版本(1.0)不匹配`);
        }
        
        // 验证设置
        if (data.settings) {
            const settingsValidation = this.validateUserSettings(data.settings);
            if (!settingsValidation.isValid) {
                errors.push(...settingsValidation.errors.map(e => `设置: ${e}`));
            }
        } else {
            warnings.push('导入数据缺少设置信息');
        }
        
        // 验证记录
        if (data.records) {
            if (!this.isValidArray(data.records, { minLength: 0 })) {
                errors.push('记录必须是一个数组');
            } else {
                for (let i = 0; i < data.records.length; i++) {
                    const recordValidation = this.validateSmokingRecord(data.records[i]);
                    if (!recordValidation.isValid) {
                        errors.push(`记录[${i}]: ${recordValidation.errors.join(', ')}`);
                    }
                }
            }
        } else {
            warnings.push('导入数据缺少记录信息');
        }
        
        // 验证统计
        if (data.stats) {
            const statsValidation = this.validateStatistics(data.stats);
            if (!statsValidation.isValid) {
                errors.push(...statsValidation.errors.map(e => `统计: ${e}`));
            }
        } else {
            warnings.push('导入数据缺少统计信息');
        }
        
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    
    /**
     * 清理和规范化数据
     * @param {Object} data - 原始数据
     * @returns {Object} 清理后的数据
     */
    static sanitizeData(data) {
        if (!data || typeof data !== 'object') {
            return {};
        }
        
        const sanitized = { ...data };
        
        // 清理数字字段
        const numberFields = ['id', 'timestamp', 'interval', 'targetInterval', 'cigarettePrice', 
                            'cigarettesPerPack', 'todayCount', 'avgInterval', 'maxInterval', 'savedMoney'];
        
        numberFields.forEach(field => {
            if (field in sanitized) {
                const num = Number(sanitized[field]);
                sanitized[field] = isNaN(num) ? 0 : num;
            }
        });
        
        // 清理布尔字段
        const booleanFields = ['goalReached', 'enableSound', 'enableNotifications'];
        
        booleanFields.forEach(field => {
            if (field in sanitized) {
                sanitized[field] = Boolean(sanitized[field]);
            }
        });
        
        // 清理字符串字段
        const stringFields = ['theme', 'lastResetDate'];
        
        stringFields.forEach(field => {
            if (field in sanitized) {
                sanitized[field] = String(sanitized[field]).trim();
            }
        });
        
        // 确保数组字段
        if (sanitized.records && !Array.isArray(sanitized.records)) {
            sanitized.records = [];
        }
        
        return sanitized;
    }
    
    /**
     * 获取验证错误消息
     * @param {Object} validationResult - 验证结果
     * @returns {string} 错误消息
     */
    static getValidationErrorMessage(validationResult) {
        if (!validationResult || !validationResult.errors) {
            return '验证失败';
        }
        
        if (validationResult.errors.length === 0) {
            return '验证通过';
        }
        
        return validationResult.errors.join('\n');
    }
    
    /**
     * 深度比较两个对象是否相等
     * @param {*} a - 第一个值
     * @param {*} b - 第二个值
     * @returns {boolean} 是否相等
     */
    static deepEqual(a, b) {
        if (a === b) return true;
        
        if (typeof a !== typeof b) return false;
        
        if (a === null || b === null) return a === b;
        
        if (typeof a === 'object') {
            if (Array.isArray(a) !== Array.isArray(b)) return false;
            
            if (Array.isArray(a)) {
                if (a.length !== b.length) return false;
                for (let i = 0; i < a.length; i++) {
                    if (!this.deepEqual(a[i], b[i])) return false;
                }
                return true;
            }
            
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            
            if (keysA.length !== keysB.length) return false;
            
            for (const key of keysA) {
                if (!keysB.includes(key)) return false;
                if (!this.deepEqual(a[key], b[key])) return false;
            }
            
            return true;
        }
        
        return a === b;
    }
}

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.ValidationUtils = ValidationUtils;
}

export default ValidationUtils;