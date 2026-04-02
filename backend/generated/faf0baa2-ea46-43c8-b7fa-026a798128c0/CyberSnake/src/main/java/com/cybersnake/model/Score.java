package com.cybersnake.model;

import java.io.*;
import java.util.prefs.Preferences;

/**
 * 分数数据模型
 */
public class Score {
    
    private int currentScore;
    private int highScore;
    private int levelScore; // 当前等级累计分数
    private int foodCount;  // 吃到的食物数量
    
    // 分数配置
    public static final int FOOD_SCORE = 10;
    public static final int SPECIAL_FOOD_SCORE = 50;
    public static final int LEVEL_UP_SCORE = 100; // 升级所需分数
    
    // 最高分存储键
    private static final String HIGH_SCORE_KEY = "cyber_snake_high_score";
    
    /**
     * 构造函数
     */
    public Score() {
        this.currentScore = 0;
        this.levelScore = 0;
        this.foodCount = 0;
        
        // 从系统偏好设置加载最高分
        loadHighScore();
    }
    
    /**
     * 增加分数（吃到普通食物）
     */
    public void addFoodScore() {
        currentScore += FOOD_SCORE;
        levelScore += FOOD_SCORE;
        foodCount++;
        
        checkHighScore();
    }
    
    /**
     * 增加分数（吃到特殊食物）
     */
    public void addSpecialFoodScore() {
        currentScore += SPECIAL_FOOD_SCORE;
        levelScore += SPECIAL_FOOD_SCORE;
        foodCount++;
        
        checkHighScore();
    }
    
    /**
     * 检查是否应该升级
     */
    public boolean shouldLevelUp() {
        return levelScore >= LEVEL_UP_SCORE;
    }
    
    /**
     * 重置等级分数（升级后调用）
     */
    public void resetLevelScore() {
        levelScore = 0;
    }
    
    /**
     * 重置所有分数（重新开始游戏时调用）
     */
    public void reset() {
        currentScore = 0;
        levelScore = 0;
        foodCount = 0;
    }
    
    /**
     * 检查并更新最高分
     */
    private void checkHighScore() {
        if (currentScore > highScore) {
            highScore = currentScore;
            saveHighScore();
        }
    }
    
    /**
     * 从系统偏好设置加载最高分
     */
    private void loadHighScore() {
        try {
            Preferences prefs = Preferences.userNodeForPackage(Score.class);
            highScore = prefs.getInt(HIGH_SCORE_KEY, 0);
        } catch (Exception e) {
            // 如果无法加载，使用默认值0
            highScore = 0;
            System.err.println("无法加载最高分: " + e.getMessage());
        }
    }
    
    /**
     * 保存最高分到系统偏好设置
     */
    private void saveHighScore() {
        try {
            Preferences prefs = Preferences.userNodeForPackage(Score.class);
            prefs.putInt(HIGH_SCORE_KEY, highScore);
            prefs.flush();
        } catch (Exception e) {
            System.err.println("无法保存最高分: " + e.getMessage());
        }
    }
    
    /**
     * 获取当前等级（基于分数计算）
     */
    public int calculateLevel() {
        int calculatedLevel = 1 + (currentScore / 100);
        return Math.min(calculatedLevel, 10); // 最高10级
    }
    
    /**
     * 获取进度百分比（用于进度条显示）
     */
    public int getLevelProgressPercentage() {
        if (LEVEL_UP_SCORE == 0) return 100;
        return Math.min(100, (levelScore * 100) / LEVEL_UP_SCORE);
    }
    
    /**
     * 获取分数统计信息
     */
    public String getStats() {
        return String.format("食物: %d | 等级: %d | 进度: %d%%", 
            foodCount, calculateLevel(), getLevelProgressPercentage());
    }
    
    // Getter 和 Setter 方法
    
    public int getCurrentScore() {
        return currentScore;
    }
    
    public int getHighScore() {
        return highScore;
    }
    
    public int getLevelScore() {
        return levelScore;
    }
    
    public int getFoodCount() {
        return foodCount;
    }
    
    public void setCurrentScore(int currentScore) {
        this.currentScore = currentScore;
        checkHighScore();
    }
    
    public void setHighScore(int highScore) {
        this.highScore = highScore;
        saveHighScore();
    }
    
    /**
     * 获取分数显示格式
     */
    public String getFormattedScore() {
        return String.format("%06d", currentScore);
    }
    
    /**
     * 获取最高分显示格式
     */
    public String getFormattedHighScore() {
        return String.format("%06d", highScore);
    }
    
    /**
     * 获取详细分数信息
     */
    public String getDetailedInfo() {
        return String.format(
            "当前分数: %s\n最高分数: %s\n食物数量: %d\n当前等级: %d\n等级进度: %d%%",
            getFormattedScore(),
            getFormattedHighScore(),
            foodCount,
            calculateLevel(),
            getLevelProgressPercentage()
        );
    }
}