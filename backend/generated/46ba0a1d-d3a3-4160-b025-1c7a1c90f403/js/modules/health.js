/**
 * 健康模块
 * 计算健康改善信息，提供戒烟鼓励和进度跟踪
 */

class HealthModule {
    constructor() {
        this.healthTips = [
            "戒烟20分钟后，心率和血压会恢复正常水平。",
            "戒烟12小时后，血液中的一氧化碳水平会恢复正常。",
            "戒烟2-12周后，血液循环改善，肺功能增强。",
            "戒烟1-9个月后，咳嗽和气短症状减少。",
            "戒烟1年后，冠心病风险降低到吸烟者的一半。",
            "戒烟5年后，中风风险降低到与非吸烟者相同。",
            "戒烟10年后，肺癌死亡率降低到吸烟者的一半。",
            "戒烟15年后，冠心病风险降低到与非吸烟者相同。",
            "多喝水可以帮助清除体内的尼古丁。",
            "深呼吸练习可以帮助缓解戒烟时的焦虑。",
            "适当的运动可以减轻戒烟时的压力。",
            "保持忙碌可以分散对香烟的注意力。",
            "记录戒烟进度可以增强动力。",
            "与朋友分享戒烟目标可以获得支持。",
            "避免触发吸烟欲望的环境和情境。"
        ];
        
        this.achievements = {
            bronze: {
                name: '青铜',
                description: '连续3天达到目标间隔',
                daysRequired: 3,
                icon: '🥉',
                color: '#CD7F32'
            },
            silver: {
                name: '白银',
                description: '连续7天达到目标间隔',
                daysRequired: 7,
                icon: '🥈',
                color: '#C0C0C0'
            },
            gold: {
                name: '黄金',
                description: '连续30天达到目标间隔',
                daysRequired: 30,
                icon: '🥇',
                color: '#FFD700'
            },
            diamond: {
                name: '钻石',
                description: '连续90天达到目标间隔',
                daysRequired: 90,
                icon: '💎',
                color: '#B9F2FF'
            }
        };
        
        this.healthProgress = 0;
        this.currentTipIndex = 0;
        this.unlockedAchievements = new Set();
        
        // 绑定事件处理器
        this.bindEvents();
        
        // 初始化健康模块
        this.init();
    }

    /**
     * 初始化健康模块
     */
    async init() {
        // 加载成就状态
        await this.loadAchievements();
        
        // 计算健康进度
        this.calculateHealthProgress();
        
        // 触发健康更新事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.HEALTH_UPDATED, {
                progress: this.healthProgress,
                achievements: this.getUnlockedAchievements()
            });
        }
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        if (!window.EventBus) return;
        
        // 监听数据更新事件
        window.EventBus.on(window.EventTypes.DATA_UPDATE, (event) => {
            this.calculateHealthProgress();
            this.checkAchievements();
        });
        
        // 监听设置变化事件
        window.EventBus.on(window.EventTypes.SETTINGS_CHANGED, (event) => {
            if (event.data.targetInterval) {
                this.calculateHealthProgress();
            }
        });
        
        // 监听计时器记录事件
        window.EventBus.on(window.EventTypes.TIMER_RECORD, (event) => {
            if (event.data.goalReached) {
                this.checkAchievements();
            }
        });
    }

    /**
     * 计算健康进度
     */
    calculateHealthProgress() {
        if (!window.DataModule || !window.Settings) {
            this.healthProgress = 0;
            return;
        }
        
        const stats = window.DataModule.getStats();
        const settings = window.Settings.getSettings();
        
        // 如果没有记录，进度为0
        if (stats.todayCount === 0) {
            this.healthProgress = 0;
            return;
        }
        
        // 计算平均间隔与目标间隔的比例
        let intervalProgress = 0;
        if (stats.avgInterval > 0 && settings.targetInterval > 0) {
            intervalProgress = Math.min(stats.avgInterval / settings.targetInterval, 1);
        }
        
        // 计算减少抽烟次数的进度
        // 假设正常情况下一包烟抽2天（每天10支）
        const normalDailyCount = 10;
        const reductionProgress = Math.max(0, 1 - (stats.todayCount / normalDailyCount));
        
        // 计算连续达标天数进度
        const consecutiveDays = this.getConsecutiveGoalDays();
        const daysProgress = Math.min(consecutiveDays / 30, 1); // 30天为满分
        
        // 综合计算健康进度（加权平均）
        this.healthProgress = Math.round((
            intervalProgress * 0.4 +      // 间隔时间权重40%
            reductionProgress * 0.3 +     // 减少次数权重30%
            daysProgress * 0.3            // 连续天数权重30%
        ) * 100);
        
        // 触发进度变化事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.HEALTH_PROGRESS_CHANGED, {
                progress: this.healthProgress,
                intervalProgress,
                reductionProgress,
                daysProgress
            });
        }
    }

    /**
     * 获取连续达标天数
     * @returns {number} 连续达标天数
     */
    getConsecutiveGoalDays() {
        if (!window.DataModule) {
            return 0;
        }
        
        return window.DataModule.getConsecutiveGoalDays();
    }

    /**
     * 获取健康进度
     * @returns {number} 健康进度百分比
     */
    getHealthProgress() {
        return this.healthProgress;
    }

    /**
     * 获取健康进度描述
     * @returns {string} 健康进度描述
     */
    getHealthProgressDescription() {
        if (this.healthProgress >= 90) {
            return "优秀！您的健康改善非常显著，继续保持！";
        } else if (this.healthProgress >= 70) {
            return "良好！您正在有效地控制抽烟频率。";
        } else if (this.healthProgress >= 50) {
            return "中等！您已经取得了一些进步，继续努力。";
        } else if (this.healthProgress >= 30) {
            return "起步！您已经开始关注健康，坚持下去。";
        } else {
            return "开始记录抽烟间隔，关注健康改善。";
        }
    }

    /**
     * 获取下一个健康小贴士
     * @returns {string} 健康小贴士
     */
    getNextTip() {
        if (this.healthTips.length === 0) {
            return "保持健康的生活方式很重要。";
        }
        
        this.currentTipIndex = (this.currentTipIndex + 1) % this.healthTips.length;
        const tip = this.healthTips[this.currentTipIndex];
        
        // 触发小贴士变化事件
        if (window.EventBus) {
            window.EventBus.emit(window.EventTypes.HEALTH_TIP_CHANGED, {
                tip,
                index: this.currentTipIndex,
                total: this.healthTips.length
            });
        }
        
        return tip;
    }

    /**
     * 获取当前健康小贴士
     * @returns {string} 当前健康小贴士
     */
    getCurrentTip() {
        if (this.healthTips.length === 0) {
            return "保持健康的生活方式很重要。";
        }
        
        return this.healthTips[this.currentTipIndex];
    }

    /**
     * 获取所有健康小贴士
     * @returns {Array} 健康小贴士数组
     */
    getAllTips() {
        return [...this.healthTips];
    }

    /**
     * 检查成就
     */
    checkAchievements() {
        const consecutiveDays = this.getConsecutiveGoalDays();
        
        // 检查每个成就
        Object.entries(this.achievements).forEach(([level, achievement]) => {
            if (consecutiveDays >= achievement.daysRequired) {
                this.unlockAchievement(level);
            }
        });
        
        // 保存成就状态
        this.saveAchievements();
    }

    /**
     * 解锁成就
     * @param {string} achievementLevel - 成就等级
     */
    unlockAchievement(achievementLevel) {
        if (!this.achievements[achievementLevel]) {
            console.warn(`未知的成就等级: ${achievementLevel}`);
            return;
        }
        
        if (!this.unlockedAchievements.has(achievementLevel)) {
            this.unlockedAchievements.add(achievementLevel);
            
            const achievement = this.achievements[achievementLevel];
            
            console.log(`成就解锁: ${achievement.name} - ${achievement.description}`);
            
            // 触发成就解锁事件
            if (window.EventBus) {
                window.EventBus.emit('health:achievement_unlocked', {
                    level: achievementLevel,
                    name: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon,
                    color: achievement.color
                });
                
                // 显示通知
                window.EventBus.emit(window.EventTypes.UI_NOTIFICATION_SHOW, {
                    type: 'success',
                    message: `成就解锁：${achievement.name}！${achievement.description}`,
                    duration: 5000,
                    icon: achievement.icon
                });
            }
        }
    }

    /**
     * 获取已解锁的成就
     * @returns {Array} 已解锁的成就列表
     */
    getUnlockedAchievements() {
        return Array.from(this.unlockedAchievements).map(level => ({
            level,
            ...this.achievements[level]
        }));
    }

    /**
     * 获取所有成就状态
     * @returns {Object} 成就状态
     */
    getAllAchievementStatus() {
        const consecutiveDays = this.getConsecutiveGoalDays();
        const status = {};
        
        Object.entries(this.achievements).forEach(([level, achievement]) => {
            const unlocked = this.unlockedAchievements.has(level);
            const progress = Math.min(consecutiveDays / achievement.daysRequired, 1);
            
            status[level] = {
                ...achievement,
                unlocked,
                progress,
                currentDays: consecutiveDays,
                requiredDays: achievement.daysRequired
            };
        });
        
        return status;
    }

    /**
     * 加载成就状态
     */
    async loadAchievements() {
        try {
            const saved = localStorage.getItem('smoking-timer-achievements');
            if (saved) {
                const achievements = JSON.parse(saved);
                if (Array.isArray(achievements)) {
                    this.unlockedAchievements = new Set(achievements);
                }
            }
        } catch (error) {
            console.warn('加载成就状态失败:', error);
        }
    }

    /**
     * 保存成就状态
     */
    saveAchievements() {
        try {
            const achievements = Array.from(this.unlockedAchievements);
            localStorage.setItem('smoking-timer-achievements', JSON.stringify(achievements));
        } catch (error) {
            console.warn('保存成就状态失败:', error);
        }
    }

    /**
     * 重置成就
     */
    resetAchievements() {
        this.unlockedAchievements.clear();
        this.saveAchievements();
        
        // 触发成就重置事件
        if (window.EventBus) {
            window.EventBus.emit('health:achievements_reset');
        }
        
        console.log('成就已重置');
    }

    /**
     * 计算节省的金额
     * @param {number} cigaretteCount - 抽烟次数
     * @returns {number} 节省的金额
     */
    calculateSavedMoney(cigaretteCount) {
        if (!window.Settings) {
            // 默认计算：每支烟0.75元
            return cigaretteCount * 0.75;
        }
        
        const settings = window.Settings.getSettings();
        const pricePerCigarette = settings.cigarettePrice / settings.cigarettesPerPack;
        return cigaretteCount * pricePerCigarette;
    }

    /**
     * 获取健康改善时间线
     * @returns {Array} 健康改善时间线
     */
    getHealthTimeline() {
        const timeline = [
            { time: '20分钟', improvement: '心率和血压恢复正常' },
            { time: '12小时', improvement: '血液一氧化碳水平正常' },
            { time: '2-12周', improvement: '血液循环改善，肺功能增强' },
            { time: '1-9个月', improvement: '咳嗽和气短症状减少' },
            { time: '1年', improvement: '冠心病风险降低50%' },
            { time: '5年', improvement: '中风风险恢复正常' },
            { time: '10年', improvement: '肺癌死亡率降低50%' },
            { time: '15年', improvement: '冠心病风险恢复正常' }
        ];
        
        return timeline;
    }

    /**
     * 获取当前健康改善阶段
     * @returns {Object} 当前阶段信息
     */
    getCurrentHealthStage() {
        const consecutiveDays = this.getConsecutiveGoalDays();
        const stages = [
            { days: 0, name: '开始阶段', description: '刚开始控制抽烟' },
            { days: 3, name: '适应阶段', description: '逐渐适应新的抽烟间隔' },
            { days: 7, name: '稳定阶段', description: '抽烟频率基本稳定' },
            { days: 30, name: '改善阶段', description: '健康明显改善' },
            { days: 90, name: '巩固阶段', description: '健康习惯已形成' }
        ];
        
        // 找到当前阶段
        let currentStage = stages[0];
        for (let i = stages.length - 1; i >= 0; i--) {
            if (consecutiveDays >= stages[i].days) {
                currentStage = stages[i];
                break;
            }
        }
        
        // 计算到下一阶段的天数
        const nextStageIndex = stages.findIndex(stage => stage.days > currentStage.days);
        const daysToNextStage = nextStageIndex !== -1 
            ? stages[nextStageIndex].days - consecutiveDays
            : 0;
        
        return {
            ...currentStage,
            consecutiveDays,
            daysToNextStage,
            nextStage: nextStageIndex !== -1 ? stages[nextStageIndex] : null
        };
    }

    /**
     * 获取健康报告
     * @returns {Object} 健康报告
     */
    getHealthReport() {
        if (!window.DataModule) {
            return {
                progress: 0,
                message: '数据未加载',
                recommendations: ['开始记录抽烟数据']
            };
        }
        
        const stats = window.DataModule.getStats();
        const progress = this.getHealthProgress();
        const stage = this.getCurrentHealthStage();
        const achievements = this.getUnlockedAchievements();
        
        // 生成个性化建议
        const recommendations = [];
        
        if (stats.todayCount === 0) {
            recommendations.push('今天还没有抽烟记录，继续保持！');
        } else if (stats.todayCount > 10) {
            recommendations.push('今天抽烟次数较多，尝试延长抽烟间隔');
        } else if (stats.avgInterval < 3600) {
            recommendations.push('平均间隔较短，尝试设定更长的时间目标');
        } else if (progress < 50) {
            recommendations.push('健康改善空间还很大，坚持就是胜利');
        } else {
            recommendations.push('继续保持良好的抽烟控制习惯');
        }
        
        // 根据成就添加建议
        if (achievements.length === 0) {
            recommendations.push('尝试连续3天达到目标间隔，解锁第一个成就');
        } else if (achievements.length < 3) {
            recommendations.push('继续坚持，解锁更多成就');
        }
        
        return {
            date: new Date().toLocaleDateString(),
            progress,
            progressDescription: this.getHealthProgressDescription(),
            todayCount: stats.todayCount,
            avgInterval: Math.round(stats.avgInterval / 60), // 转换为分钟
            maxInterval: Math.round(stats.maxInterval / 60), // 转换为分钟
            savedMoney: stats.savedMoney.toFixed(2),
            stage: stage.name,
            stageDescription: stage.description,
            consecutiveDays: stage.consecutiveDays,
            achievements: achievements.length,
            recommendations,
            tip: this.getCurrentTip()
        };
    }

    /**
     * 导出健康数据
     * @returns {Object} 健康数据
     */
    exportHealthData() {
        return {
            version: '1.0',
            exportedAt: Date.now(),
            progress: this.healthProgress,
            unlockedAchievements: Array.from(this.unlockedAchievements),
            currentTipIndex: this.currentTipIndex,
            healthReport: this.getHealthReport()
        };
    }

    /**
     * 导入健康数据
     * @param {Object} healthData - 健康数据
     * @returns {Object} 导入结果
     */
    importHealthData(healthData) {
        try {
            if (!healthData || typeof healthData !== 'object') {
                throw new Error('导入的健康数据格式不正确');
            }
            
            // 导入进度
            if (healthData.progress !== undefined) {
                this.healthProgress = Math.min(Math.max(Number(healthData.progress), 0), 100);
            }
            
            // 导入成就
            if (Array.isArray(healthData.unlockedAchievements)) {
                this.unlockedAchievements = new Set(healthData.unlockedAchievements);
            }
            
            // 导入小贴士索引
            if (healthData.currentTipIndex !== undefined) {
                this.currentTipIndex = Number(healthData.currentTipIndex) % this.healthTips.length;
            }
            
            // 保存成就状态
            this.saveAchievements();
            
            return {
                success: true,
                message: '健康数据导入成功'
            };
            
        } catch (error) {
            console.error('导入健康数据失败:', error);
            return {
                success: false,
                message: `导入健康数据失败: ${error.message}`
            };
        }
    }

    /**
     * 销毁健康模块
     */
    destroy() {
        this.healthProgress = 0;
        this.currentTipIndex = 0;
        this.unlockedAchievements.clear();
        
        console.log('健康模块已销毁');
    }
}

// 创建全局健康实例
const health = new HealthModule();

// 导出为全局对象
if (typeof window !== 'undefined') {
    window.Health = health;
}

export default health;