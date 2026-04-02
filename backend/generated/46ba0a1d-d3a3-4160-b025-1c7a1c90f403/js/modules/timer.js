/**
 * 计时器模块
 * 管理抽烟计时器的核心逻辑
 */

class TimerModule {
    constructor() {
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.pauseTime = null;
        this.elapsedTime = 0;
        this.lastRecordTime = null;
        this.animationFrameId = null;
        
        this.targetInterval = 7200; // 默认2小时，单位：秒
        this.minInterval = 60; // 最小间隔1分钟
        
        // 绑定事件处理器
        this.bindEvents();
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 监听设置变化
        if (window.EventBus) {
            window.EventBus.on(window.EventTypes.SETTINGS_CHANGED, (event) => {
                if (event.data.targetInterval) {
                    this.setTargetInterval(event.data.targetInterval);
                }
            });
            
            window.EventBus.on(window.EventTypes.SETTINGS_LOADED, (event) => {
                if (event.data.targetInterval) {
                    this.setTargetInterval(event.data.targetInterval);
                }
            });
        }
    }

    /**
     * 设置目标间隔
     * @param {number} seconds - 目标间隔（秒）
     */
    setTargetInterval(seconds) {
        if (typeof seconds !== 'number' || seconds < this.minInterval) {
            console.warn(`目标间隔必须大于等于 ${this.minInterval} 秒`);
            return;
        }
        
        this.targetInterval = seconds;
        
        // 触发目标间隔更新事件
        if (window.EventBus) {
            window.EventBus.emit('timer:target_updated', {
                targetInterval: this.targetInterval
            });
        }
    }

    /**
     * 开始计时
     */
    start() {
        if (this.isRunning && !this.isPaused) {
            console.warn('计时器已经在运行中');
            return;
        }
        
        if (this.isPaused) {
            // 从暂停状态恢复
            const pauseDuration = Date.now() - this.pauseTime;
            this.startTime += pauseDuration;
            this.isPaused = false;
        } else {
            // 重新开始计时
            this.startTime = Date.now();
            this.elapsedTime = 0;
            this.isRunning = true;
        }
        
        // 启动动画循环
        this.startAnimationLoop();
        
        // 触发计时器开始事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.TIMER_START, {
                startTime: this.startTime,
                targetInterval: this.targetInterval,
                isResumed: this.isPaused
            });
        }
        
        console.log('计时器开始运行');
    }

    /**
     * 暂停计时
     */
    pause() {
        if (!this.isRunning || this.isPaused) {
            console.warn('计时器未运行或已暂停');
            return;
        }
        
        this.isPaused = true;
        this.pauseTime = Date.now();
        
        // 停止动画循环
        this.stopAnimationLoop();
        
        // 触发计时器暂停事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.TIMER_PAUSE, {
                elapsedTime: this.getElapsedTime(),
                pauseTime: this.pauseTime
            });
        }
        
        console.log('计时器已暂停');
    }

    /**
     * 重置计时器
     */
    reset() {
        const wasRunning = this.isRunning;
        const elapsedTime = this.getElapsedTime();
        
        // 停止动画循环
        this.stopAnimationLoop();
        
        // 重置状态
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.pauseTime = null;
        this.elapsedTime = 0;
        
        // 触发计时器重置事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.TIMER_RESET, {
                wasRunning,
                elapsedTime,
                wasPaused: this.isPaused
            });
        }
        
        // 触发计时器更新事件，显示重置后的状态
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.TIMER_UPDATE, {
                elapsedTime: 0,
                formattedTime: '00:00:00',
                progress: 0,
                isRunning: false,
                isPaused: false
            });
        }
        
        console.log('计时器已重置');
    }

    /**
     * 记录一次抽烟
     * @returns {Object} 抽烟记录
     */
    recordSmoking() {
        if (!this.isRunning) {
            console.warn('计时器未运行，无法记录');
            return null;
        }
        
        const currentTime = Date.now();
        const elapsedTime = this.getElapsedTime();
        
        // 计算距离上次记录的时间间隔
        const interval = this.lastRecordTime 
            ? Math.floor((currentTime - this.lastRecordTime) / 1000)
            : elapsedTime;
        
        // 检查是否达到目标间隔
        const isGoalReached = interval >= this.targetInterval;
        
        // 创建记录对象
        const record = {
            timestamp: currentTime,
            interval: interval,
            goalReached: isGoalReached,
            elapsedTime: elapsedTime
        };
        
        // 更新最后记录时间
        this.lastRecordTime = currentTime;
        
        // 重置计时器开始新的周期
        this.startTime = currentTime;
        this.elapsedTime = 0;
        
        // 触发记录事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.TIMER_RECORD, record);
        }
        
        console.log(`记录抽烟: 间隔 ${interval} 秒, 目标${isGoalReached ? '达成' : '未达成'}`);
        
        return record;
    }

    /**
     * 获取经过的时间
     * @returns {number} 经过的时间（秒）
     */
    getElapsedTime() {
        if (!this.isRunning) {
            return this.elapsedTime;
        }
        
        if (this.isPaused) {
            return Math.floor((this.pauseTime - this.startTime) / 1000);
        }
        
        const currentTime = Date.now();
        return Math.floor((currentTime - this.startTime) / 1000);
    }

    /**
     * 获取格式化时间
     * @returns {string} 格式化后的时间字符串 (HH:MM:SS)
     */
    getFormattedTime() {
        const elapsedTime = this.getElapsedTime();
        
        if (window.TimeUtils) {
            return window.TimeUtils.formatTime(elapsedTime);
        }
        
        // 备用实现
        const hours = Math.floor(elapsedTime / 3600);
        const minutes = Math.floor((elapsedTime % 3600) / 60);
        const seconds = elapsedTime % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }

    /**
     * 获取进度百分比
     * @returns {number} 进度百分比 (0-1)
     */
    getProgress() {
        const elapsedTime = this.getElapsedTime();
        
        if (this.targetInterval <= 0) {
            return 0;
        }
        
        const progress = elapsedTime / this.targetInterval;
        return Math.min(progress, 1); // 限制最大为1
    }

    /**
     * 获取当前状态
     * @returns {Object} 计时器状态
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            elapsedTime: this.getElapsedTime(),
            formattedTime: this.getFormattedTime(),
            progress: this.getProgress(),
            targetInterval: this.targetInterval,
            startTime: this.startTime,
            lastRecordTime: this.lastRecordTime
        };
    }

    /**
     * 检查是否达到目标间隔
     * @returns {boolean} 是否达到目标
     */
    isGoalReached() {
        return this.getElapsedTime() >= this.targetInterval;
    }

    /**
     * 获取距离目标还有多少时间
     * @returns {number} 距离目标的秒数
     */
    getTimeToGoal() {
        const elapsedTime = this.getElapsedTime();
        return Math.max(0, this.targetInterval - elapsedTime);
    }

    /**
     * 启动动画循环
     */
    startAnimationLoop() {
        if (this.animationFrameId) {
            return; // 已经在运行
        }
        
        const update = () => {
            if (!this.isRunning || this.isPaused) {
                return;
            }
            
            // 更新UI
            this.updateDisplay();
            
            // 检查是否达到目标间隔
            if (this.isGoalReached()) {
                this.handleGoalReached();
            }
            
            // 继续下一帧
            this.animationFrameId = requestAnimationFrame(update);
        };
        
        // 启动循环
        this.animationFrameId = requestAnimationFrame(update);
    }

    /**
     * 停止动画循环
     */
    stopAnimationLoop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    /**
     * 更新显示
     */
    updateDisplay() {
        const status = this.getStatus();
        
        // 触发计时器更新事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.TIMER_UPDATE, status);
        }
        
        // 每秒触发一次tick事件
        const currentSecond = Math.floor(status.elapsedTime);
        if (currentSecond !== this.lastTickSecond) {
            this.lastTickSecond = currentSecond;
            
            if (window.EventBus) {
                window.EventBus.emit(window.EventTypes.TIMER_TICK, {
                    second: currentSecond,
                    ...status
                });
            }
        }
    }

    /**
     * 处理达到目标间隔
     */
    handleGoalReached() {
        // 触发目标达成事件
        if (window.EventBus) {
            window.EventBus.emit('timer:goal_reached', {
                elapsedTime: this.getElapsedTime(),
                targetInterval: this.targetInterval,
                timestamp: Date.now()
            });
        }
        
        // 如果启用了声音提醒，播放声音
        if (window.Storage) {
            const settings = window.Storage.getSettings();
            if (settings.enableSound) {
                this.playGoalSound();
            }
        }
        
        // 如果启用了通知，显示通知
        if (window.Notification && Notification.permission === 'granted') {
            if (window.Storage) {
                const settings = window.Storage.getSettings();
                if (settings.enableNotifications) {
                    this.showGoalNotification();
                }
            }
        }
    }

    /**
     * 播放目标达成声音
     */
    playGoalSound() {
        try {
            // 创建音频上下文
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            // 设置声音参数
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
            
            // 清理音频上下文
            setTimeout(() => {
                audioContext.close();
            }, 1000);
        } catch (error) {
            console.warn('播放声音失败:', error);
        }
    }

    /**
     * 显示目标达成通知
     */
    showGoalNotification() {
        try {
            const notification = new Notification('抽烟计时器', {
                body: `恭喜！您已经达到目标间隔 ${Math.floor(this.targetInterval / 60)} 分钟`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚭</text></svg>',
                tag: 'smoking-timer-goal'
            });
            
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
            
            // 5秒后自动关闭
            setTimeout(() => {
                notification.close();
            }, 5000);
        } catch (error) {
            console.warn('显示通知失败:', error);
        }
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
            return false;
        }
        
        try {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        } catch (error) {
            console.error('请求通知权限失败:', error);
            return false;
        }
    }

    /**
     * 销毁计时器
     */
    destroy() {
        // 停止动画循环
        this.stopAnimationLoop();
        
        // 重置状态
        this.isRunning = false;
        this.isPaused = false;
        this.startTime = null;
        this.pauseTime = null;
        this.elapsedTime = 0;
        this.lastRecordTime = null;
        
        console.log('计时器已销毁');
    }
}

// 创建全局计时器实例
const timer = new TimerModule();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.Timer = timer;
}

export default timer;