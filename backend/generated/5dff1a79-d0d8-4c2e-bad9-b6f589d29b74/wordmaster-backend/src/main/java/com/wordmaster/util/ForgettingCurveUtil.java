package com.wordmaster.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class ForgettingCurveUtil {
    
    /**
     * 根据掌握程度和复习次数计算下次复习时间间隔（小时）
     * 
     * @param masteryLevel 掌握程度（1-5）
     * @param reviewCount 复习次数
     * @return 下次复习时间间隔（小时）
     */
    public int calculateNextReviewInterval(int masteryLevel, int reviewCount) {
        // 基础间隔（小时）
        int baseInterval;
        
        switch (masteryLevel) {
            case 1: // 完全不会
                baseInterval = 1;  // 1小时后复习
                break;
            case 2: // 有点印象
                baseInterval = 6;  // 6小时后复习
                break;
            case 3: // 基本掌握
                baseInterval = 24; // 1天后复习
                break;
            case 4: // 熟练掌握
                baseInterval = 72; // 3天后复习
                break;
            case 5: // 完全掌握
                baseInterval = 168; // 7天后复习
                break;
            default:
                baseInterval = 24;
        }
        
        // 根据复习次数调整间隔（复习次数越多，间隔越长）
        // 使用指数增长，但设置上限
        double factor = Math.pow(1.5, Math.min(reviewCount, 10));
        return (int) (baseInterval * factor);
    }
    
    /**
     * 计算下次复习时间
     * 
     * @param lastReviewTime 上次复习时间
     * @param masteryLevel 掌握程度
     * @param reviewCount 复习次数
     * @return 下次复习时间
     */
    public LocalDateTime calculateNextReviewTime(LocalDateTime lastReviewTime, 
                                                int masteryLevel, 
                                                int reviewCount) {
        int intervalHours = calculateNextReviewInterval(masteryLevel, reviewCount);
        return lastReviewTime.plusHours(intervalHours);
    }
    
    /**
     * 根据用户回答情况计算掌握程度
     * 
     * @param isCorrect 是否回答正确
     * @param currentMastery 当前掌握程度
     * @param responseTime 响应时间（秒）
     * @return 新的掌握程度
     */
    public int calculateMasteryLevel(boolean isCorrect, int currentMastery, double responseTime) {
        if (!isCorrect) {
            // 回答错误，掌握程度下降
            return Math.max(1, currentMastery - 1);
        }
        
        // 回答正确，根据响应时间调整掌握程度
        if (responseTime < 2.0) {
            // 快速回答，掌握程度上升
            return Math.min(5, currentMastery + 1);
        } else if (responseTime < 5.0) {
            // 中等速度回答，掌握程度可能上升
            return Math.min(5, currentMastery + (Math.random() > 0.3 ? 1 : 0));
        } else {
            // 慢速回答，掌握程度不变或下降
            return Math.max(1, currentMastery - (Math.random() > 0.7 ? 1 : 0));
        }
    }
    
    /**
     * 计算记忆强度（0-100）
     * 
     * @param masteryLevel 掌握程度
     * @param reviewCount 复习次数
     * @param hoursSinceLastReview 距离上次复习的小时数
     * @return 记忆强度（0-100）
     */
    public double calculateMemoryStrength(int masteryLevel, int reviewCount, double hoursSinceLastReview) {
        // 基础记忆强度
        double baseStrength = masteryLevel * 20;
        
        // 复习次数加成
        double reviewBonus = Math.min(reviewCount * 2, 20);
        
        // 遗忘曲线衰减
        double forgettingFactor = Math.exp(-hoursSinceLastReview / (24.0 * Math.pow(2, reviewCount)));
        
        return Math.min(100, (baseStrength + reviewBonus) * forgettingFactor);
    }
    
    /**
     * 判断是否需要复习
     * 
     * @param memoryStrength 记忆强度
     * @param threshold 阈值（默认30）
     * @return 是否需要复习
     */
    public boolean needsReview(double memoryStrength, double threshold) {
        return memoryStrength < threshold;
    }
    
    /**
     * 判断是否需要复习（使用默认阈值30）
     */
    public boolean needsReview(double memoryStrength) {
        return needsReview(memoryStrength, 30.0);
    }
}