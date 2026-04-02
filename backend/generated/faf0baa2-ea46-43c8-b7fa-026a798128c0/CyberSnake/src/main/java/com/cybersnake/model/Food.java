package com.cybersnake.model;

import java.util.Random;

/**
 * 食物数据模型
 */
public class Food {
    
    private int x;
    private int y;
    private Color color;
    private boolean active;
    private Random random;
    
    /**
     * 颜色类
     */
    public static class Color {
        public int r;
        public int g;
        public int b;
        
        public Color(int r, int g, int b) {
            this.r = r;
            this.g = g;
            this.b = b;
        }
        
        public java.awt.Color toAwtColor() {
            return new java.awt.Color(r, g, b);
        }
    }
    
    /**
     * 构造函数
     */
    public Food() {
        this.random = new Random();
        this.active = false;
        
        // 设置赛博朋克风格颜色（亮黄色）
        this.color = new Color(255, 255, 0);
    }
    
    /**
     * 在指定区域内生成食物
     */
    public void generate(int gridWidth, int gridHeight, Snake snake) {
        boolean validPosition = false;
        int attempts = 0;
        int maxAttempts = gridWidth * gridHeight * 2; // 防止无限循环
        
        while (!validPosition && attempts < maxAttempts) {
            // 随机生成位置
            this.x = random.nextInt(gridWidth);
            this.y = random.nextInt(gridHeight);
            
            // 检查是否与蛇身重叠
            validPosition = true;
            for (Snake.Point point : snake.getBody()) {
                if (point.x == x && point.y == y) {
                    validPosition = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        if (validPosition) {
            this.active = true;
        } else {
            // 如果找不到合适位置，放在角落
            this.x = gridWidth - 1;
            this.y = gridHeight - 1;
            this.active = true;
        }
    }
    
    /**
     * 生成特殊食物（可选功能）
     */
    public void generateSpecial(int gridWidth, int gridHeight, Snake snake) {
        generate(gridWidth, gridHeight, snake);
        
        // 特殊食物使用不同颜色（粉色）
        this.color = new Color(255, 105, 180);
    }
    
    /**
     * 检查食物是否被吃
     */
    public boolean isEaten(Snake snake) {
        if (!active) return false;
        
        Snake.Point head = snake.getHead();
        return head.x == x && head.y == y;
    }
    
    /**
     * 重置食物状态
     */
    public void reset() {
        this.active = false;
        this.x = -1;
        this.y = -1;
    }
    
    // Getter 和 Setter 方法
    
    public int getX() {
        return x;
    }
    
    public int getY() {
        return y;
    }
    
    public Color getColor() {
        return color;
    }
    
    public boolean isActive() {
        return active;
    }
    
    public void setActive(boolean active) {
        this.active = active;
    }
    
    /**
     * 获取食物类型（普通/特殊）
     */
    public String getType() {
        // 根据颜色判断食物类型
        if (color.r == 255 && color.g == 255 && color.b == 0) {
            return "普通";
        } else if (color.r == 255 && color.g == 105 && color.b == 180) {
            return "特殊";
        }
        return "未知";
    }
    
    /**
     * 获取食物分数
     */
    public int getScoreValue() {
        String type = getType();
        switch (type) {
            case "特殊":
                return 50; // 特殊食物分数更高
            case "普通":
            default:
                return 10;
        }
    }
}