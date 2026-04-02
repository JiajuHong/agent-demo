# 软件设计文档

## 1. 系统架构

### 1.1 整体架构
```
┌─────────────────────────────────────┐
│           游戏主窗口 (MainFrame)     │
├─────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  │
│  │  游戏面板   │  │  控制面板    │  │
│  │ (GamePanel) │  │ (ControlPanel)│  │
│  └─────────────┘  └──────────────┘  │
├─────────────────────────────────────┤
│         游戏逻辑 (GameLogic)         │
├─────────────────────────────────────┤
│         数据模型 (Models)           │
└─────────────────────────────────────┘
```

技术栈：
- 前端：Java Swing (GUI框架)
- 图形：Java 2D (绘图)
- 数据存储：文件系统 (保存最高分)
- 游戏循环：Swing Timer (定时器)

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| MainFrame | 主窗口，整合所有组件 | GamePanel, ControlPanel |
| GamePanel | 游戏区域绘制，键盘事件处理 | GameLogic, Snake, Food |
| ControlPanel | 控制按钮和分数显示 | GameLogic |
| GameLogic | 游戏逻辑控制，碰撞检测 | Snake, Food, GameState |
| Snake | 蛇的数据模型和移动逻辑 | Direction, Point |
| Food | 食物的数据模型 | Point |
| GameState | 游戏状态管理 | Score |
| Score | 分数管理 | 无 |

### 1.3 项目目录结构

```
CyberSnake/
├── src/
│   ├── main/
│   │   └── java/
│   │       └── com/
│   │           └── cybersnake/
│   │               ├── Main.java
│   │               ├── MainFrame.java
│   │               ├── panel/
│   │               │   ├── GamePanel.java
│   │               │   └── ControlPanel.java
│   │               ├── logic/
│   │               │   ├── GameLogic.java
│   │               │   └── Direction.java
│   │               ├── model/
│   │               │   ├── Snake.java
│   │               │   ├── Food.java
│   │               │   ├── GameState.java
│   │               │   └── Score.java
│   │               ├── util/
│   │               │   ├── Point.java
│   │               │   └── FileUtil.java
│   │               └── style/
│   │                   ├── Colors.java
│   │                   └── Fonts.java
│   └── resources/
│       └── highscores.txt
├── lib/
├── build/
├── README.md
└── pom.xml
```

## 2. API 设计

### 2.1 接口规范

**游戏逻辑接口**：

#### GameLogic 类接口
```java
public class GameLogic {
    // 游戏控制
    public void startGame();
    public void pauseGame();
    public void resumeGame();
    public void restartGame();
    public void gameOver();
    
    // 蛇控制
    public void changeDirection(Direction direction);
    
    // 状态获取
    public boolean isRunning();
    public boolean isPaused();
    public boolean isGameOver();
    
    // 数据获取
    public Snake getSnake();
    public Food getFood();
    public Score getScore();
    public GameState getGameState();
}
```

#### GamePanel 类接口
```java
public class GamePanel extends JPanel {
    // 绘制方法
    @Override
    protected void paintComponent(Graphics g);
    
    // 键盘事件处理
    @Override
    protected void processKeyEvent(KeyEvent e);
    
    // 更新游戏状态
    public void updateGame();
}
```

## 3. 数据库设计

### 3.1 数据存储设计

由于是本地单机游戏，使用文件系统存储最高分。

#### 文件结构
```
highscores.txt
格式：最高分数值（整数）
示例：250
```

#### 数据操作接口
```java
public class FileUtil {
    // 读取最高分
    public static int readHighScore();
    
    // 保存最高分
    public static void saveHighScore(int score);
}
```

### 3.2 数据模型设计

#### Point 类（坐标点）
```java
public class Point {
    private int x;
    private int y;
    
    // 构造函数、getter/setter、equals、hashCode
}
```

#### Snake 类（蛇）
```java
public class Snake {
    private List<Point> body;  // 蛇身体坐标
    private Direction direction; // 当前方向
    private int length;         // 蛇长度
    
    // 移动方法
    public void move();
    public void grow();
    
    // 碰撞检测
    public boolean checkSelfCollision();
    public boolean checkWallCollision(int width, int height);
}
```

#### Food 类（食物）
```java
public class Food {
    private Point position;     // 食物位置
    private boolean eaten;      // 是否被吃
    
    // 生成新食物
    public void generateNewPosition(int width, int height, List<Point> snakeBody);
}
```

#### Score 类（分数）
```java
public class Score {
    private int currentScore;   // 当前分数
    private int highScore;      // 最高分
    
    // 分数操作
    public void increase(int points);
    public void reset();
    public void updateHighScore();
}
```

## 4. 核心模块设计

### 4.1 GameLogic（游戏逻辑模块）

**职责**：控制游戏流程，协调各个模块

**核心方法**：
- `update()`：更新游戏状态（每帧调用）
- `checkCollisions()`：检测碰撞
- `processFood()`：处理食物逻辑

**流程**：
```
游戏循环开始
    ↓
更新蛇位置
    ↓
检测碰撞（墙壁、自身）
    ↓
如果碰撞 → 游戏结束
    ↓
检测是否吃到食物
    ↓
如果吃到 → 蛇增长 + 加分 + 生成新食物
    ↓
重绘界面
    ↓
等待下一帧
```

### 4.2 GamePanel（游戏面板模块）

**职责**：绘制游戏界面，处理用户输入

**绘制流程**：
```
绘制背景（赛博朋克网格）
    ↓
绘制蛇身体（青色霓虹灯效果）
    ↓
绘制蛇头（亮青色，发光效果）
    ↓
绘制食物（粉色霓虹灯效果）
    ↓
绘制网格线（淡蓝色半透明）
    ↓
如果游戏结束 → 绘制结束界面
```

**键盘事件处理**：
- UP: 向上移动（不能从向下直接变为向上）
- DOWN: 向下移动（不能从向上直接变为向下）
- LEFT: 向左移动（不能从向右直接变为向左）
- RIGHT: 向右移动（不能从左向右直接变为向右）

### 4.3 赛博朋克风格设计

#### 颜色方案
```java
public class Colors {
    // 背景色
    public static final Color BACKGROUND = new Color(10, 10, 20); // 深蓝黑
    
    // 网格色
    public static final Color GRID = new Color(30, 30, 60, 100); // 半透明蓝
    
    // 蛇颜色
    public static final Color SNAKE_BODY = new Color(0, 255, 255); // 青色
    public static final Color SNAKE_HEAD = new Color(0, 200, 255); // 亮青色
    public static final Color SNAKE_GLOW = new Color(0, 255, 255, 50); // 发光效果
    
    // 食物颜色
    public static final Color FOOD = new Color(255, 0, 255); // 粉色
    public static final Color FOOD_GLOW = new Color(255, 0, 255, 50); // 发光效果
    
    // UI颜色
    public static final Color UI_BACKGROUND = new Color(20, 20, 40); // 深紫黑
    public static final Color UI_TEXT = new Color(0, 255, 0); // 绿色
    public static final Color UI_HIGHLIGHT = new Color(255, 255, 0); // 黄色
}
```

#### 字体方案
```java
public class Fonts {
    // 分数字体
    public static final Font SCORE_FONT = new Font("Consolas", Font.BOLD, 24);
    
    // 游戏结束字体
    public static final Font GAME_OVER_FONT = new Font("Arial", Font.BOLD, 48);
    
    // 按钮字体
    public static final Font BUTTON_FONT = new Font("Segoe UI", Font.BOLD, 14);
}
```

## 5. 游戏参数配置

### 5.1 游戏区域
- 网格大小：20x20 单元格
- 单元格大小：25x25 像素
- 游戏区域：500x500 像素

### 5.2 游戏速度
- 初始速度：150ms/帧（约6.6 FPS）
- 每吃5个食物速度增加：减少10ms
- 最大速度：50ms/帧（20 FPS）

### 5.3 分数规则
- 每个食物：10分
- 每吃5个食物：额外奖励50分
- 最高分：持久化保存

## 6. 异常处理

### 6.1 文件操作异常
- 最高分文件不存在时：创建新文件，最高分为0
- 文件读取失败时：使用默认值0

### 6.2 游戏逻辑异常
- 蛇移动方向无效时：保持原方向
- 食物生成位置无效时：重新生成

### 6.3 界面渲染异常
- 图形上下文无效时：跳过当前帧
- 资源加载失败时：使用默认颜色和字体

## 7. 性能优化

### 7.1 内存优化
- 使用对象池管理Point对象
- 避免频繁创建新对象
- 及时释放不再使用的资源

### 7.2 渲染优化
- 只重绘变化区域
- 使用双缓冲避免闪烁
- 优化图形绘制操作

### 7.3 响应性优化
- 使用SwingWorker处理耗时操作
- 确保UI线程不被阻塞
- 合理设置游戏帧率