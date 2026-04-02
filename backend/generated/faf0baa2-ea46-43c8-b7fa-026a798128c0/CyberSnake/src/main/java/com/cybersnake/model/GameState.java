package com.cybersnake.model;

/**
 * 游戏状态数据模型
 */
public class GameState {
    
    // 游戏状态枚举
    public enum State {
        READY,      // 准备开始
        RUNNING,    // 运行中
        PAUSED,     // 暂停
        GAME_OVER   // 游戏结束
    }
    
    private State currentState;
    private int level;
    private int speed; // 游戏速度（毫秒）
    private boolean soundEnabled;
    private boolean specialFoodEnabled;
    
    // 游戏配置常量
    public static final int GRID_WIDTH = 30;
    public static final int GRID_HEIGHT = 20;
    public static final int CELL_SIZE = 25;
    
    public static final int INITIAL_SPEED = 200; // 初始速度（毫秒）
    public static final int MIN_SPEED = 50;      // 最小速度（最快）
    public static final int SPEED_INCREMENT = 10; // 每级速度增加
    
    public static final int INITIAL_LEVEL = 1;
    public static final int MAX_LEVEL = 10;
    
    /**
     * 构造函数
     */
    public GameState() {
        this.currentState = State.READY;
        this.level = INITIAL_LEVEL;
        this.speed = INITIAL_SPEED;
        this.soundEnabled = true;
        this.specialFoodEnabled = false; // 默认关闭特殊食物
    }
    
    /**
     * 开始游戏
     */
    public void start() {
        this.currentState = State.RUNNING;
    }
    
    /**
     * 暂停游戏
     */
    public void pause() {
        if (currentState == State.RUNNING) {
            this.currentState = State.PAUSED;
        }
    }
    
    /**
     * 继续游戏
     */
    public void resume() {
        if (currentState == State.PAUSED) {
            this.currentState = State.RUNNING;
        }
    }
    
    /**
     * 游戏结束
     */
    public void gameOver() {
        this.currentState = State.GAME_OVER;
    }
    
    /**
     * 重新开始
     */
    public void restart() {
        this.currentState = State.READY;
        this.level = INITIAL_LEVEL;
        this.speed = INITIAL_SPEED;
    }
    
    /**
     * 升级
     */
    public void levelUp() {
        if (level < MAX_LEVEL) {
            level++;
            // 随着等级提高，速度加快
            speed = Math.max(MIN_SPEED, speed - SPEED_INCREMENT);
        }
    }
    
    /**
     * 检查游戏是否运行中
     */
    public boolean isRunning() {
        return currentState == State.RUNNING;
    }
    
    /**
     * 检查游戏是否暂停
     */
    public boolean isPaused() {
        return currentState == State.PAUSED;
    }
    
    /**
     * 检查游戏是否结束
     */
    public boolean isGameOver() {
        return currentState == State.GAME_OVER;
    }
    
    /**
     * 检查游戏是否准备开始
     */
    public boolean isReady() {
        return currentState == State.READY;
    }
    
    // Getter 和 Setter 方法
    
    public State getCurrentState() {
        return currentState;
    }
    
    public void setCurrentState(State currentState) {
        this.currentState = currentState;
    }
    
    public int getLevel() {
        return level;
    }
    
    public void setLevel(int level) {
        this.level = level;
    }
    
    public int getSpeed() {
        return speed;
    }
    
    public void setSpeed(int speed) {
        this.speed = speed;
    }
    
    public boolean isSoundEnabled() {
        return soundEnabled;
    }
    
    public void setSoundEnabled(boolean soundEnabled) {
        this.soundEnabled = soundEnabled;
    }
    
    public boolean isSpecialFoodEnabled() {
        return specialFoodEnabled;
    }
    
    public void setSpecialFoodEnabled(boolean specialFoodEnabled) {
        this.specialFoodEnabled = specialFoodEnabled;
    }
    
    /**
     * 获取游戏区域宽度（像素）
     */
    public int getGameWidth() {
        return GRID_WIDTH * CELL_SIZE;
    }
    
    /**
     * 获取游戏区域高度（像素）
     */
    public int getGameHeight() {
        return GRID_HEIGHT * CELL_SIZE;
    }
    
    /**
     * 获取当前状态描述
     */
    public String getStateDescription() {
        switch (currentState) {
            case READY:
                return "准备开始 - 按空格键开始游戏";
            case RUNNING:
                return "游戏中 - 按P键暂停";
            case PAUSED:
                return "已暂停 - 按P键继续";
            case GAME_OVER:
                return "游戏结束 - 按R键重新开始";
            default:
                return "未知状态";
        }
    }
    
    /**
     * 获取难度描述
     */
    public String getDifficultyDescription() {
        if (level <= 3) {
            return "简单";
        } else if (level <= 6) {
            return "中等";
        } else if (level <= 9) {
            return "困难";
        } else {
            return "专家";
        }
    }
}