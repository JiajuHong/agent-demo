package com.cybersnake.view;

import com.cybersnake.model.*;
import javax.swing.*;
import java.awt.*;

/**
 * 游戏主面板，负责绘制游戏区域
 */
public class GamePanel extends JPanel {
    
    private Snake snake;
    private Food food;
    private GameState gameState;
    
    // 赛博朋克风格颜色
    private final Color BACKGROUND_COLOR = new Color(10, 10, 20); // 深色背景
    private final Color GRID_COLOR = new Color(30, 30, 60);       // 网格颜色
    private final Color BORDER_COLOR = new Color(0, 255, 255);    // 青色边框
    private final Color TEXT_COLOR = new Color(255, 255, 255);    // 白色文字
    
    // 字体
    private Font gameFont;
    
    /**
     * 构造函数
     */
    public GamePanel() {
        initPanel();
        initGameObjects();
    }
    
    /**
     * 初始化面板
     */
    private void initPanel() {
        setPreferredSize(new Dimension(
            GameState.GRID_WIDTH * GameState.CELL_SIZE,
            GameState.GRID_HEIGHT * GameState.CELL_SIZE
        ));
        
        setBackground(BACKGROUND_COLOR);
        setBorder(BorderFactory.createLineBorder(BORDER_COLOR, 3));
        
        // 设置字体
        try {
            gameFont = new Font("Monospaced", Font.BOLD, 14);
        } catch (Exception e) {
            gameFont = new Font(Font.MONOSPACED, Font.BOLD, 14);
        }
    }
    
    /**
     * 初始化游戏对象
     */
    private void initGameObjects() {
        this.snake = new Snake();
        this.food = new Food();
        this.gameState = new GameState();
    }
    
    /**
     * 绘制组件
     */
    @Override
    protected void paintComponent(Graphics g) {
        super.paintComponent(g);
        
        Graphics2D g2d = (Graphics2D) g;
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // 绘制网格
        drawGrid(g2d);
        
        // 绘制食物
        drawFood(g2d);
        
        // 绘制蛇
        drawSnake(g2d);
        
        // 绘制游戏状态信息
        drawGameInfo(g2d);
        
        // 如果游戏结束，绘制游戏结束画面
        if (gameState.isGameOver()) {
            drawGameOver(g2d);
        } else if (gameState.isPaused()) {
            drawPaused(g2d);
        } else if (gameState.isReady()) {
            drawReady(g2d);
        }
    }
    
    /**
     * 绘制网格
     */
    private void drawGrid(Graphics2D g2d) {
        g2d.setColor(GRID_COLOR);
        
        int cellSize = GameState.CELL_SIZE;
        int width = GameState.GRID_WIDTH * cellSize;
        int height = GameState.GRID_HEIGHT * cellSize;
        
        // 绘制垂直线
        for (int x = 0; x <= GameState.GRID_WIDTH; x++) {
            g2d.drawLine(x * cellSize, 0, x * cellSize, height);
        }
        
        // 绘制水平线
        for (int y = 0; y <= GameState.GRID_HEIGHT; y++) {
            g2d.drawLine(0, y * cellSize, width, y * cellSize);
        }
    }
    
    /**
     * 绘制食物
     */
    private void drawFood(Graphics2D g2d) {
        if (food.isActive()) {
            int cellSize = GameState.CELL_SIZE;
            int x = food.getX() * cellSize;
            int y = food.getY() * cellSize;
            
            // 设置食物颜色
            Snake.Color foodColor = food.getColor();
            g2d.setColor(new java.awt.Color(foodColor.r, foodColor.g, foodColor.b));
            
            // 绘制食物（圆形）
            int padding = 4;
            g2d.fillOval(x + padding, y + padding, cellSize - 2 * padding, cellSize - 2 * padding);
            
            // 添加发光效果
            g2d.setColor(new java.awt.Color(foodColor.r, foodColor.g, foodColor.b, 100));
            g2d.fillOval(x + padding - 2, y + padding - 2, cellSize - 2 * padding + 4, cellSize - 2 * padding + 4);
            
            // 如果是特殊食物，添加星形效果
            if (food.getType().equals("特殊")) {
                g2d.setColor(Color.WHITE);
                g2d.setFont(new Font("Arial", Font.BOLD, 12));
                g2d.drawString("★", x + cellSize/2 - 4, y + cellSize/2 + 4);
            }
        }
    }
    
    /**
     * 绘制蛇
     */
    private void drawSnake(Graphics2D g2d) {
        int cellSize = GameState.CELL_SIZE;
        
        // 绘制蛇身
        Snake.Color bodyColor = snake.getColor();
        g2d.setColor(new java.awt.Color(bodyColor.r, bodyColor.g, bodyColor.b));
        
        for (int i = 0; i < snake.getBody().size(); i++) {
            Snake.Point point = snake.getBody().get(i);
            int x = point.x * cellSize;
            int y = point.y * cellSize;
            
            // 蛇身绘制为圆角矩形
            int padding = 2;
            if (i == 0) {
                // 蛇头：更大的圆角矩形
                padding = 1;
                g2d.fillRoundRect(x + padding, y + padding, 
                                 cellSize - 2 * padding, cellSize - 2 * padding, 
                                 10, 10);
                
                // 蛇头使用不同颜色
                Snake.Color headColor = snake.getHeadColor();
                g2d.setColor(new java.awt.Color(headColor.r, headColor.g, headColor.b));
                g2d.fillRoundRect(x + padding + 2, y + padding + 2, 
                                 cellSize - 2 * padding - 4, cellSize - 2 * padding - 4, 
                                 8, 8);
                
                // 绘制眼睛
                g2d.setColor(Color.WHITE);
                int eyeSize = 4;
                int eyeOffset = 6;
                
                // 根据方向绘制眼睛
                switch (snake.getDirection()) {
                    case RIGHT:
                        g2d.fillOval(x + cellSize - eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                        g2d.fillOval(x + cellSize - eyeOffset, y + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                        break;
                    case LEFT:
                        g2d.fillOval(x + eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                        g2d.fillOval(x + eyeOffset - eyeSize, y + cellSize - eyeOffset - eyeSize, eyeSize, eyeSize);
                        break;
                    case UP:
                        g2d.fillOval(x + eyeOffset, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                        g2d.fillOval(x + cellSize - eyeOffset - eyeSize, y + eyeOffset - eyeSize, eyeSize, eyeSize);
                        break;
                    case DOWN:
                        g2d.fillOval(x + eyeOffset, y + cellSize - eyeOffset, eyeSize, eyeSize);
                        g2d.fillOval(x + cellSize - eyeOffset - eyeSize, y + cellSize - eyeOffset, eyeSize, eyeSize);
                        break;
                }
                
                // 恢复身体颜色
                g2d.setColor(new java.awt.Color(bodyColor.r, bodyColor.g, bodyColor.b));
            } else {
                // 蛇身：普通圆角矩形
                g2d.fillRoundRect(x + padding, y + padding, 
                                 cellSize - 2 * padding, cellSize - 2 * padding, 
                                 6, 6);
                
                // 添加渐变效果（越靠近尾部颜色越暗）
                float alpha = 0.7f - (i * 0.05f);
                alpha = Math.max(0.3f, alpha);
                g2d.setColor(new java.awt.Color(bodyColor.r, bodyColor.g, bodyColor.b, (int)(alpha * 255)));
                g2d.fillRoundRect(x + padding + 1, y + padding + 1, 
                                 cellSize - 2 * padding - 2, cellSize - 2 * padding - 2, 
                                 5, 5);
                
                // 恢复颜色
                g2d.setColor(new java.awt.Color(bodyColor.r, bodyColor.g, bodyColor.b));
            }
        }
    }
    
    /**
     * 绘制游戏信息
     */
    private void drawGameInfo(Graphics2D g2d) {
        g2d.setColor(TEXT_COLOR);
        g2d.setFont(gameFont);
        
        // 在左上角显示游戏状态
        String stateText = gameState.getStateDescription();
        g2d.drawString(stateText, 10, 20);
        
        // 在右上角显示等级和速度
        String levelText = String.format("等级: %d (%s)", 
            gameState.getLevel(), gameState.getDifficultyDescription());
        g2d.drawString(levelText, getWidth() - 150, 20);
        
        // 在底部显示控制提示
        String controls = "方向键: 移动 | P: 暂停/继续 | R: 重新开始 | ESC: 退出";
        g2d.drawString(controls, getWidth()/2 - 200, getHeight() - 10);
    }
    
    /**
     * 绘制游戏结束画面
     */
    private void drawGameOver(Graphics2D g2d) {
        // 半透明黑色覆盖层
        g2d.setColor(new Color(0, 0, 0, 180));
        g2d.fillRect(0, 0, getWidth(), getHeight());
        
        // 游戏结束文字
        g2d.setFont(new Font("Monospaced", Font.BOLD, 48));
        g2d.setColor(new Color(255, 0, 0)); // 红色
        
        String gameOverText = "GAME OVER";
        FontMetrics fm = g2d.getFontMetrics();
        int x = (getWidth() - fm.stringWidth(gameOverText)) / 2;
        int y = getHeight() / 2 - 50;
        
        g2d.drawString(gameOverText, x, y);
        
        // 添加霓虹效果
        g2d.setColor(new Color(255, 0, 0, 100));
        g2d.drawString(gameOverText, x - 2, y - 2);
        g2d.drawString(gameOverText, x + 2, y + 2);
        
        // 提示文字
        g2d.setFont(new Font("Monospaced", Font.PLAIN, 20));
        g2d.setColor(Color.WHITE);
        String restartText = "按 R 键重新开始游戏";
        fm = g2d.getFontMetrics();
        x = (getWidth() - fm.stringWidth(restartText)) / 2;
        y = getHeight() / 2 + 20;
        g2d.drawString(restartText, x, y);
    }
    
    /**
     * 绘制暂停画面
     */
    private void drawPaused(Graphics2D g2d) {
        // 半透明黑色覆盖层
        g2d.setColor(new Color(0, 0, 0, 150));
        g2d.fillRect(0, 0, getWidth(), getHeight());
        
        // 暂停文字
        g2d.setFont(new Font("Monospaced", Font.BOLD, 48));
        g2d.setColor(new Color(0, 255, 255)); // 青色
        
        String pausedText = "PAUSED";
        FontMetrics fm = g2d.getFontMetrics();
        int x = (getWidth() - fm.stringWidth(pausedText)) / 2;
        int y = getHeight() / 2;
        
        g2d.drawString(pausedText, x, y);
        
        // 提示文字
        g2d.setFont(new Font("Monospaced", Font.PLAIN, 20));
        g2d.setColor(Color.WHITE);
        String continueText = "按 P 键继续游戏";
        fm = g2d.getFontMetrics();
        x = (getWidth() - fm.stringWidth(continueText)) / 2;
        y = getHeight() / 2 + 40;
        g2d.drawString(continueText, x, y);
    }
    
    /**
     * 绘制准备开始画面
     */
    private void drawReady(Graphics2D g2d) {
        // 半透明黑色覆盖层
        g2d.setColor(new Color(0, 0, 0, 150));
        g2d.fillRect(0, 0, getWidth(), getHeight());
        
        // 游戏标题
        g2d.setFont(new Font("Monospaced", Font.BOLD, 48));
        g2d.setColor(new Color(255, 0, 255)); // 品红色
        
        String titleText = "CYBER SNAKE";
        FontMetrics fm = g2d.getFontMetrics();
        int x = (getWidth() - fm.stringWidth(titleText)) / 2;
        int y = getHeight() / 2 - 50;
        
        g2d.drawString(titleText, x, y);
        
        // 添加霓虹效果
        g2d.setColor(new Color(255, 0, 255, 100));
        g2d.drawString(titleText, x - 2, y - 2);
        g2d.drawString(titleText, x + 2, y + 2);
        
        // 开始提示
        g2d.setFont(new Font("Monospaced", Font.PLAIN, 24));
        g2d.setColor(Color.WHITE);
        String startText = "按 空格键 开始游戏";
        fm = g2d.getFontMetrics();
        x = (getWidth() - fm.stringWidth(startText)) / 2;
        y = getHeight() / 2 + 20;
        g2d.drawString(startText, x, y);
        
        // 控制说明
        g2d.setFont(new Font("Monospaced", Font.PLAIN, 16));
        String controlsText = "方向键: 移动 | P: 暂停/继续 | R: 重新开始 | ESC: 退出";
        fm = g2d.getFontMetrics();
        x = (getWidth() - fm.stringWidth(controlsText)) / 2;
        y = getHeight() / 2 + 60;
        g2d.drawString(controlsText, x, y);
    }
    
    // Getter 和 Setter 方法
    
    public Snake getSnake() {
        return snake;
    }
    
    public void setSnake(Snake snake) {
        this.snake = snake;
    }
    
    public Food getFood() {
        return food;
    }
    
    public void setFood(Food food) {
        this.food = food;
    }
    
    public GameState getGameState() {
        return gameState;
    }
    
    public void setGameState(GameState gameState) {
        this.gameState = gameState;
    }
    
    /**
     * 更新游戏显示
     */
    public void updateGame() {
        repaint();
    }
}