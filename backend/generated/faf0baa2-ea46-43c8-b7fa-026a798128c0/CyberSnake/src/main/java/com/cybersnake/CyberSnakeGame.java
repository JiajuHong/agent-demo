package com.cybersnake;

import com.cybersnake.view.GamePanel;
import com.cybersnake.view.ControlPanel;
import com.cybersnake.view.ScorePanel;
import com.cybersnake.controller.GameController;
import javax.swing.*;
import java.awt.*;

/**
 * 赛博朋克贪吃蛇游戏主类
 */
public class CyberSnakeGame extends JFrame {
    
    private GamePanel gamePanel;
    private ControlPanel controlPanel;
    private ScorePanel scorePanel;
    private GameController gameController;
    
    public CyberSnakeGame() {
        initUI();
        initGameController();
    }
    
    private void initUI() {
        // 设置窗口属性
        setTitle("赛博朋克贪吃蛇 - CyberSnake");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);
        
        // 设置赛博朋克风格颜色
        Color backgroundColor = new Color(10, 10, 20); // 深色背景
        Color borderColor = new Color(0, 255, 255); // 青色边框
        
        // 创建主面板
        JPanel mainPanel = new JPanel(new BorderLayout());
        mainPanel.setBackground(backgroundColor);
        mainPanel.setBorder(BorderFactory.createLineBorder(borderColor, 2));
        
        // 创建游戏面板
        gamePanel = new GamePanel();
        
        // 创建控制面板
        controlPanel = new ControlPanel();
        
        // 创建分数面板
        scorePanel = new ScorePanel();
        
        // 添加组件到主面板
        mainPanel.add(gamePanel, BorderLayout.CENTER);
        mainPanel.add(controlPanel, BorderLayout.SOUTH);
        mainPanel.add(scorePanel, BorderLayout.NORTH);
        
        // 设置内容面板
        setContentPane(mainPanel);
        
        // 设置窗口大小
        pack();
        
        // 居中显示
        setLocationRelativeTo(null);
    }
    
    private void initGameController() {
        gameController = new GameController(gamePanel, controlPanel, scorePanel);
        gameController.startGame();
    }
    
    public static void main(String[] args) {
        // 使用SwingUtilities确保线程安全
        SwingUtilities.invokeLater(() -> {
            try {
                // 设置赛博朋克风格外观
                UIManager.setLookAndFeel(UIManager.getCrossPlatformLookAndFeelClassName());
                
                CyberSnakeGame game = new CyberSnakeGame();
                game.setVisible(true);
                
                // 游戏启动音效（可选）
                System.out.println("赛博朋克贪吃蛇启动！");
                System.out.println("控制说明：方向键移动，P键暂停/继续，R键重新开始");
                
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
    }
}