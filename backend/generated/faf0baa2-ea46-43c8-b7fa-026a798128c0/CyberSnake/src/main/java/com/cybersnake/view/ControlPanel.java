package com.cybersnake.view;

import javax.swing.*;
import java.awt.*;
import java.awt.event.ActionListener;

/**
 * 控制面板，包含游戏控制按钮
 */
public class ControlPanel extends JPanel {
    
    // 控制按钮
    private JButton startButton;
    private JButton pauseButton;
    private JButton restartButton;
    private JButton exitButton;
    
    // 设置选项
    private JCheckBox soundCheckBox;
    private JCheckBox specialFoodCheckBox;
    
    // 赛博朋克风格颜色
    private final Color BACKGROUND_COLOR = new Color(20, 20, 40);
    private final Color BUTTON_COLOR = new Color(0, 255, 255);
    private final Color BUTTON_HOVER_COLOR = new Color(255, 0, 255);
    private final Color TEXT_COLOR = new Color(255, 255, 255);
    
    /**
     * 构造函数
     */
    public ControlPanel() {
        initPanel();
        initComponents();
        layoutComponents();
        styleComponents();
    }
    
    /**
     * 初始化面板
     */
    private void initPanel() {
        setPreferredSize(new Dimension(800, 80));
        setBackground(BACKGROUND_COLOR);
        setBorder(BorderFactory.createLineBorder(new Color(0, 255, 255), 2));
    }
    
    /**
     * 初始化组件
     */
    private void initComponents() {
        // 创建按钮
        startButton = createStyledButton("开始游戏", 'S');
        pauseButton = createStyledButton("暂停游戏", 'P');
        restartButton = createStyledButton("重新开始", 'R');
        exitButton = createStyledButton("退出游戏", 'E');
        
        // 创建复选框
        soundCheckBox = createStyledCheckBox("开启音效", true);
        specialFoodCheckBox = createStyledCheckBox("特殊食物", false);
    }
    
    /**
     * 创建样式化按钮
     */
    private JButton createStyledButton(String text, char mnemonic) {
        JButton button = new JButton(text);
        button.setMnemonic(mnemonic);
        button.setFocusPainted(false);
        button.setBorderPainted(false);
        
        // 设置按钮样式
        button.setBackground(BUTTON_COLOR);
        button.setForeground(Color.BLACK);
        button.setFont(new Font("Monospaced", Font.BOLD, 14));
        
        // 添加鼠标悬停效果
        button.addMouseListener(new java.awt.event.MouseAdapter() {
            public void mouseEntered(java.awt.event.MouseEvent evt) {
                button.setBackground(BUTTON_HOVER_COLOR);
            }
            
            public void mouseExited(java.awt.event.MouseEvent evt) {
                button.setBackground(BUTTON_COLOR);
            }
        });
        
        return button;
    }
    
    /**
     * 创建样式化复选框
     */
    private JCheckBox createStyledCheckBox(String text, boolean selected) {
        JCheckBox checkBox = new JCheckBox(text, selected);
        checkBox.setForeground(TEXT_COLOR);
        checkBox.setBackground(BACKGROUND_COLOR);
        checkBox.setFont(new Font("Monospaced", Font.PLAIN, 12));
        checkBox.setFocusPainted(false);
        
        // 自定义复选框图标
        checkBox.setIcon(new javax.swing.ImageIcon(
            createCheckBoxIcon(false, new Color(100, 100, 150))
        ));
        checkBox.setSelectedIcon(new javax.swing.ImageIcon(
            createCheckBoxIcon(true, BUTTON_COLOR)
        ));
        
        return checkBox;
    }
    
    /**
     * 创建复选框图标
     */
    private Image createCheckBoxIcon(boolean selected, Color color) {
        int size = 16;
        Image image = new BufferedImage(size, size, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = (Graphics2D) image.getGraphics();
        
        g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        // 绘制边框
        g2d.setColor(color);
        g2d.drawRect(1, 1, size - 3, size - 3);
        
        // 如果选中，填充内部
        if (selected) {
            g2d.fillRect(4, 4, size - 8, size - 8);
            
            // 添加对勾
            g2d.setColor(Color.BLACK);
            g2d.setStroke(new BasicStroke(2));
            g2d.drawLine(5, 8, 7, 11);
            g2d.drawLine(7, 11, 11, 5);
        }
        
        g2d.dispose();
        return image;
    }
    
    /**
     * 布局组件
     */
    private void layoutComponents() {
        setLayout(new GridBagLayout());
        GridBagConstraints gbc = new GridBagConstraints();
        
        gbc.insets = new Insets(5, 10, 5, 10);
        gbc.fill = GridBagConstraints.HORIZONTAL;
        
        // 第一行：按钮
        gbc.gridy = 0;
        gbc.gridx = 0;
        gbc.weightx = 0.25;
        add(startButton, gbc);
        
        gbc.gridx = 1;
        add(pauseButton, gbc);
        
        gbc.gridx = 2;
        add(restartButton, gbc);
        
        gbc.gridx = 3;
        add(exitButton, gbc);
        
        // 第二行：设置选项
        gbc.gridy = 1;
        gbc.gridx = 0;
        gbc.gridwidth = 2;
        add(soundCheckBox, gbc);
        
        gbc.gridx = 2;
        gbc.gridwidth = 2;
        add(specialFoodCheckBox, gbc);
        
        // 添加分隔线
        JSeparator separator = new JSeparator(JSeparator.HORIZONTAL);
        separator.setForeground(new Color(0, 255, 255));
        separator.setBackground(new Color(0, 255, 255));
        
        gbc.gridy = 2;
        gbc.gridx = 0;
        gbc.gridwidth = 4;
        gbc.fill = GridBagConstraints.HORIZONTAL;
        gbc.insets = new Insets(10, 20, 5, 20);
        add(separator, gbc);
        
        // 第三行：提示文字
        JLabel hintLabel = new JLabel("提示：也可以使用键盘快捷键（空格开始，P暂停，R重新开始，ESC退出）");
        hintLabel.setForeground(new Color(200, 200, 255));
        hintLabel.setFont(new Font("Monospaced", Font.PLAIN, 10));
        
        gbc.gridy = 3;
        gbc.gridx = 0;
        gbc.gridwidth = 4;
        gbc.insets = new Insets(5, 20, 5, 20);
        add(hintLabel, gbc);
    }
    
    /**
     * 样式化组件
     */
    private void styleComponents() {
        // 设置按钮大小
        Dimension buttonSize = new Dimension(120, 30);
        startButton.setPreferredSize(buttonSize);
        pauseButton.setPreferredSize(buttonSize);
        restartButton.setPreferredSize(buttonSize);
        exitButton.setPreferredSize(buttonSize);
    }
    
    /**
     * 更新按钮状态
     */
    public void updateButtonStates(boolean gameRunning, boolean gamePaused) {
        if (gameRunning && !gamePaused) {
            // 游戏运行中
            startButton.setEnabled(false);
            pauseButton.setText("暂停游戏 (P)");
            pauseButton.setEnabled(true);
            restartButton.setEnabled(true);
        } else if (gamePaused) {
            // 游戏暂停
            startButton.setEnabled(false);
            pauseButton.setText("继续游戏 (P)");
            pauseButton.setEnabled(true);
            restartButton.setEnabled(true);
        } else {
            // 游戏未开始或已结束
            startButton.setEnabled(true);
            pauseButton.setText("暂停游戏 (P)");
            pauseButton.setEnabled(false);
            restartButton.setEnabled(true);
        }
    }
    
    // 添加事件监听器的方法
    
    public void addStartButtonListener(ActionListener listener) {
        startButton.addActionListener(listener);
    }
    
    public void addPauseButtonListener(ActionListener listener) {
        pauseButton.addActionListener(listener);
    }
    
    public void addRestartButtonListener(ActionListener listener) {
        restartButton.addActionListener(listener);
    }
    
    public void addExitButtonListener(ActionListener listener) {
        exitButton.addActionListener(listener);
    }
    
    public void addSoundCheckBoxListener(ActionListener listener) {
        soundCheckBox.addActionListener(listener);
    }
    
    public void addSpecialFoodCheckBoxListener(ActionListener listener) {
        specialFoodCheckBox.addActionListener(listener);
    }
    
    // Getter 方法
    
    public boolean isSoundEnabled() {
        return soundCheckBox.isSelected();
    }
    
    public boolean isSpecialFoodEnabled() {
        return specialFoodCheckBox.isSelected();
    }
    
    public void setSoundEnabled(boolean enabled) {
        soundCheckBox.setSelected(enabled);
    }
    
    public void setSpecialFoodEnabled(boolean enabled) {
        specialFoodCheckBox.setSelected(enabled);
    }
    
    /**
     * 设置所有按钮的提示文本
     */
    public void setButtonToolTips() {
        startButton.setToolTipText("开始新游戏（快捷键：空格键）");
        pauseButton.setToolTipText("暂停/继续游戏（快捷键：P键）");
        restartButton.setToolTipText("重新开始游戏（快捷键：R键）");
        exitButton.setToolTipText("退出游戏（快捷键：ESC键）");
        soundCheckBox.setToolTipText("开启或关闭游戏音效");
        specialFoodCheckBox.setToolTipText("开启特殊食物（分数更高）");
    }
}