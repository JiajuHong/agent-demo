/**
 * 事件总线模块
 * 提供模块间通信的事件发布/订阅机制
 */

class EventBus {
    constructor() {
        this.events = new Map();
        this.maxListeners = 50;
    }

    /**
     * 订阅事件
     * @param {string} eventName - 事件名称
     * @param {Function} listener - 事件监听器
     * @param {Object} options - 选项
     * @returns {Function} 取消订阅函数
     */
    on(eventName, listener, options = {}) {
        if (typeof listener !== 'function') {
            throw new Error('监听器必须是一个函数');
        }

        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const listeners = this.events.get(eventName);
        
        // 检查监听器数量限制
        if (listeners.length >= this.maxListeners) {
            console.warn(`事件 "${eventName}" 的监听器数量已达到限制 (${this.maxListeners})`);
        }

        const listenerWrapper = {
            fn: listener,
            once: options.once || false,
            context: options.context || null
        };

        listeners.push(listenerWrapper);

        // 返回取消订阅函数
        return () => {
            this.off(eventName, listener);
        };
    }

    /**
     * 订阅一次性事件
     * @param {string} eventName - 事件名称
     * @param {Function} listener - 事件监听器
     * @param {Object} options - 选项
     * @returns {Function} 取消订阅函数
     */
    once(eventName, listener, options = {}) {
        return this.on(eventName, listener, { ...options, once: true });
    }

    /**
     * 取消订阅事件
     * @param {string} eventName - 事件名称
     * @param {Function} listener - 要移除的监听器
     */
    off(eventName, listener) {
        if (!this.events.has(eventName)) {
            return;
        }

        const listeners = this.events.get(eventName);
        const index = listeners.findIndex(l => l.fn === listener);

        if (index !== -1) {
            listeners.splice(index, 1);
        }

        // 如果没有监听器了，删除事件
        if (listeners.length === 0) {
            this.events.delete(eventName);
        }
    }

    /**
     * 触发事件
     * @param {string} eventName - 事件名称
     * @param {*} data - 事件数据
     * @param {Object} options - 选项
     * @returns {boolean} 是否有监听器处理了事件
     */
    emit(eventName, data = null, options = {}) {
        if (!this.events.has(eventName)) {
            return false;
        }

        const listeners = this.events.get(eventName);
        const event = {
            type: eventName,
            data,
            timestamp: Date.now(),
            ...options
        };

        // 复制监听器数组，防止在遍历过程中修改
        const listenersToCall = [...listeners];

        let hasListener = false;

        for (const listenerWrapper of listenersToCall) {
            try {
                // 调用监听器
                listenerWrapper.fn.call(listenerWrapper.context, event);
                hasListener = true;

                // 如果是一次性监听器，移除它
                if (listenerWrapper.once) {
                    this.off(eventName, listenerWrapper.fn);
                }
            } catch (error) {
                console.error(`事件 "${eventName}" 的监听器执行出错:`, error);
                // 继续执行其他监听器
            }
        }

        return hasListener;
    }

    /**
     * 获取指定事件的所有监听器
     * @param {string} eventName - 事件名称
     * @returns {Array} 监听器数组
     */
    getListeners(eventName) {
        return this.events.has(eventName) 
            ? this.events.get(eventName).map(l => l.fn)
            : [];
    }

    /**
     * 获取所有事件名称
     * @returns {Array} 事件名称数组
     */
    getEventNames() {
        return Array.from(this.events.keys());
    }

    /**
     * 清空所有事件监听器
     */
    clear() {
        this.events.clear();
    }

    /**
     * 清空指定事件的所有监听器
     * @param {string} eventName - 事件名称
     */
    clearEvent(eventName) {
        this.events.delete(eventName);
    }

    /**
     * 设置最大监听器数量
     * @param {number} max - 最大监听器数量
     */
    setMaxListeners(max) {
        if (typeof max !== 'number' || max < 0) {
            throw new Error('最大监听器数量必须是一个非负数');
        }
        this.maxListeners = max;
    }

    /**
     * 获取事件数量
     * @returns {number} 事件数量
     */
    getEventCount() {
        return this.events.size;
    }

    /**
     * 获取监听器总数
     * @returns {number} 监听器总数
     */
    getListenerCount() {
        let total = 0;
        for (const listeners of this.events.values()) {
            total += listeners.length;
        }
        return total;
    }

    /**
     * 检查是否有指定事件的监听器
     * @param {string} eventName - 事件名称
     * @returns {boolean} 是否有监听器
     */
    hasListeners(eventName) {
        return this.events.has(eventName) && this.events.get(eventName).length > 0;
    }

    /**
     * 等待指定事件
     * @param {string} eventName - 事件名称
     * @param {number} timeout - 超时时间（毫秒）
     * @returns {Promise} 返回事件数据的Promise
     */
    waitFor(eventName, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const timer = timeout > 0 ? setTimeout(() => {
                this.off(eventName, handler);
                reject(new Error(`等待事件 "${eventName}" 超时`));
            }, timeout) : null;

            const handler = (event) => {
                if (timer) clearTimeout(timer);
                resolve(event.data);
            };

            this.once(eventName, handler);
        });
    }
}

// 创建全局事件总线实例
const eventBus = new EventBus();

// 定义常用事件类型
const EventTypes = {
    // 计时器事件
    TIMER_START: 'timer:start',
    TIMER_STOP: 'timer:stop',
    TIMER_PAUSE: 'timer:pause',
    TIMER_RESET: 'timer:reset',
    TIMER_RECORD: 'timer:record',
    TIMER_TICK: 'timer:tick',
    TIMER_UPDATE: 'timer:update',
    
    // 数据事件
    DATA_UPDATE: 'data:update',
    DATA_RECORD_ADDED: 'data:record_added',
    DATA_RECORD_REMOVED: 'data:record_removed',
    DATA_STATS_UPDATED: 'data:stats_updated',
    DATA_CLEARED: 'data:cleared',
    DATA_EXPORTED: 'data:exported',
    DATA_IMPORTED: 'data:imported',
    
    // 设置事件
    SETTINGS_CHANGED: 'settings:changed',
    SETTINGS_SAVED: 'settings:saved',
    SETTINGS_LOADED: 'settings:loaded',
    
    // 健康事件
    HEALTH_UPDATED: 'health:updated',
    HEALTH_PROGRESS_CHANGED: 'health:progress_changed',
    HEALTH_TIP_CHANGED: 'health:tip_changed',
    
    // UI事件
    UI_THEME_CHANGED: 'ui:theme_changed',
    UI_NOTIFICATION_SHOW: 'ui:notification_show',
    UI_NOTIFICATION_HIDE: 'ui:notification_hide',
    UI_MODAL_SHOW: 'ui:modal_show',
    UI_MODAL_HIDE: 'ui:modal_hide',
    UI_CONFIRM_SHOW: 'ui:confirm_show',
    UI_CONFIRM_HIDE: 'ui:confirm_hide',
    
    // 应用事件
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error',
    APP_WARNING: 'app:warning',
    APP_INFO: 'app:info'
};

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.EventBus = eventBus;
    window.EventTypes = EventTypes;
}

export { eventBus, EventTypes };
export default eventBus;