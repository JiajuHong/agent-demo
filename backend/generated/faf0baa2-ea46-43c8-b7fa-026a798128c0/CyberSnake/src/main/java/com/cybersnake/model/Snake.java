package com.cybersnake.model;

import java.util.ArrayList;
import java.util.List;

/**
 * 蛇的数据模型
 */
public class Snake {
    
    // 蛇身节点列表
    private List<Point> body;
    
    // 蛇的移动方向
    private Direction direction;
    
    // 蛇是否活着
    private boolean alive;
    
    // 蛇的颜色
    private Color color;
    
    // 蛇头颜色
    private Color headColor;
    
    /**
     * 方向枚举
     */
    public enum Direction {
        UP, DOWN, LEFT, RIGHT
    }
    
    /**
     * 位置点类
     */
    public static class Point {
        public int x;
        public int y;
        
        public Point(int x, int y) {
            this.x = x;
            this.y = y;
        }
        
        @Override
        public boolean equals(Object obj) {
            if (this == obj) return true;
            if (obj == null || getClass() != obj.getClass()) return false;
            Point point = (Point) obj;
            return x == point.x && y == point.y;
        }
        
        @Override
        public int hashCode() {
            return 31 * x + y;
        }
    }
    
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
    public Snake() {
        this.body = new ArrayList<>();
        this.direction = Direction.RIGHT;
        this.alive = true;
        
        // 设置赛博朋克风格颜色
        this.color = new Color(0, 255, 255); // 青色
        this.headColor = new Color(255, 0, 255); // 品红色
        
        // 初始化蛇身（3个节点）
        initializeBody();
    }
    
    /**
     * 初始化蛇身
     */
    private void initializeBody() {
        // 初始位置在游戏区域中间
        int startX = 10;
        int startY = 10;
        
        // 创建3个节点，初始向右
        for (int i = 0; i < 3; i++) {
            body.add(new Point(startX - i, startY));
        }
    }
    
    /**
     * 移动蛇
     */
    public void move() {
        if (!alive) return;
        
        // 获取蛇头
        Point head = body.get(0);
        Point newHead = new Point(head.x, head.y);
        
        // 根据方向移动蛇头
        switch (direction) {
            case UP:
                newHead.y--;
                break;
            case DOWN:
                newHead.y++;
                break;
            case LEFT:
                newHead.x--;
                break;
            case RIGHT:
                newHead.x++;
                break;
        }
        
        // 在列表开头添加新蛇头
        body.add(0, newHead);
        
        // 移除蛇尾（除非刚刚吃了食物）
        // 注意：吃食物的逻辑在GameController中处理
    }
    
    /**
     * 增长蛇身（吃食物后调用）
     */
    public void grow() {
        // 移动时已经添加了新头，这里只需要不移除蛇尾
        // 实际增长逻辑在move()方法中控制
    }
    
    /**
     * 检查是否撞到自己
     */
    public boolean checkSelfCollision() {
        if (body.size() < 2) return false;
        
        Point head = body.get(0);
        
        // 检查蛇头是否与身体其他部分碰撞
        for (int i = 1; i < body.size(); i++) {
            if (head.equals(body.get(i))) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 检查是否撞到边界
     */
    public boolean checkWallCollision(int gridWidth, int gridHeight) {
        Point head = body.get(0);
        
        return head.x < 0 || head.x >= gridWidth || 
               head.y < 0 || head.y >= gridHeight;
    }
    
    /**
     * 检查是否吃到食物
     */
    public boolean checkFoodCollision(Food food) {
        Point head = body.get(0);
        return head.x == food.getX() && head.y == food.getY();
    }
    
    /**
     * 改变方向
     */
    public void changeDirection(Direction newDirection) {
        // 防止直接反向移动
        switch (direction) {
            case UP:
                if (newDirection != Direction.DOWN) {
                    this.direction = newDirection;
                }
                break;
            case DOWN:
                if (newDirection != Direction.UP) {
                    this.direction = newDirection;
                }
                break;
            case LEFT:
                if (newDirection != Direction.RIGHT) {
                    this.direction = newDirection;
                }
                break;
            case RIGHT:
                if (newDirection != Direction.LEFT) {
                    this.direction = newDirection;
                }
                break;
        }
    }
    
    // Getter 和 Setter 方法
    
    public List<Point> getBody() {
        return body;
    }
    
    public Direction getDirection() {
        return direction;
    }
    
    public void setDirection(Direction direction) {
        this.direction = direction;
    }
    
    public boolean isAlive() {
        return alive;
    }
    
    public void setAlive(boolean alive) {
        this.alive = alive;
    }
    
    public Color getColor() {
        return color;
    }
    
    public Color getHeadColor() {
        return headColor;
    }
    
    public int getLength() {
        return body.size();
    }
    
    public Point getHead() {
        return body.get(0);
    }
    
    /**
     * 移除蛇尾（用于移动时）
     */
    public void removeTail() {
        if (body.size() > 0) {
            body.remove(body.size() - 1);
        }
    }
}