# 软件设计文档

## 1. 系统架构

### 1.1 整体架构
```
[GUI层] ←→ [游戏逻辑层] ←→ [数据层]
    ↓           ↓           ↓
PyQt界面    游戏规则     棋盘状态
```

技术栈：
- 前端：PyQt5 (Python GUI框架)
- 后端：Python 3.6+
- 数据库：无（内存存储）
- 缓存：无

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| MainWindow | 主窗口界面，棋盘绘制 | GameLogic |
| GameLogic | 游戏规则逻辑，胜负判断 | - |
| Board | 棋盘数据管理 | - |
| Player | 玩家状态管理 | - |

### 1.3 项目目录结构

```
gomoku/
├── src/
│   ├── main.py              # 程序入口
│   ├── main_window.py       # 主窗口类
│   ├── game_logic.py        # 游戏逻辑类
│   ├── board.py             # 棋盘类
│   ├── player.py            # 玩家类
│   └── constants.py         # 常量定义
├── resources/
│   ├── icons/               # 图标资源
│   └── styles/              # 样式文件
├── tests/                   # 测试文件
├── requirements.txt         # 依赖列表
└── README.md               # 项目说明
```

## 2. API 设计

### 2.1 接口规范

本项目为桌面应用，无Web API，主要为类方法接口：

**通用规范**：
- 所有公开方法应有清晰的文档字符串
- 异常处理：使用自定义异常类
- 返回值：明确返回类型

### 2.2 核心类接口

#### 2.2.1 Board类

**方法**：`place_stone(x, y, player)`
- 描述：在指定位置放置棋子
- 参数：
  - x: int, 横坐标 (0-14)
  - y: int, 纵坐标 (0-14)
  - player: int, 玩家标识 (1=黑棋, 2=白棋)
- 返回值：bool, 是否成功放置
- 异常：InvalidMoveError（位置无效或已有棋子）

**方法**：`get_cell(x, y)`
- 描述：获取指定位置的棋子状态
- 参数：x, y (坐标)
- 返回值：int (0=空, 1=黑棋, 2=白棋)

**方法**：`reset()`
- 描述：重置棋盘
- 参数：无
- 返回值：无

#### 2.2.2 GameLogic类

**方法**：`check_win(x, y, player)`
- 描述：检查指定位置是否形成五子连珠
- 参数：
  - x, y: 最后落子位置
  - player: 玩家标识
- 返回值：bool, 是否获胜

**方法**：`check_direction(x, y, dx, dy, player)`
- 描述：检查指定方向上的连续棋子数
- 参数：
  - x, y: 起始位置
  - dx, dy: 方向向量
  - player: 玩家标识
- 返回值：int, 连续棋子数

## 3. 数据库设计

本项目无数据库，使用内存数据结构：

### 3.1 数据结构设计

#### Board类内部结构：
```python
class Board:
    def __init__(self, size=15):
        self.size = size
        self.grid = [[0 for _ in range(size)] for _ in range(size)]  # 0=空, 1=黑, 2=白
        self.move_history = []  # 落子历史记录
```

#### GameState类：
```python
class GameState:
    def __init__(self):
        self.current_player = 1  # 1=黑棋, 2=白棋
        self.game_over = False
        self.winner = None
        self.move_count = 0
```

## 4. 核心模块设计

### 4.1 MainWindow模块

**职责**：管理GUI界面，处理用户交互

**主要组件**：
1. QMainWindow：主窗口
2. QWidget：棋盘绘制区域
3. QLabel：状态显示
4. QPushButton：控制按钮

**关键方法**：
- `__init__()`：初始化界面
- `paintEvent()`：绘制棋盘和棋子
- `mousePressEvent()`：处理鼠标点击
- `update_status()`：更新游戏状态显示
- `reset_game()`：重置游戏

**界面布局**：
```
+-----------------------------------+
|           五子棋游戏              |
+-----------------------------------+
|                                   |
|           棋盘区域                |
|          (15×15网格)              |
|                                   |
+-----------------------------------+
| 当前玩家：黑棋  |  [重置游戏]     |
+-----------------------------------+
```

### 4.2 GameLogic模块

**职责**：实现游戏规则和胜负判断

**算法设计**：
1. 胜负判断算法：
   - 从最后落子位置向8个方向检查
   - 每个方向检查连续相同颜色的棋子
   - 如果任意方向连续棋子数≥5，则获胜

2. 检查方向：
   ```python
   def check_direction(self, x, y, dx, dy, player):
       count = 1  # 当前位置的棋子
       
       # 正向检查
       i, j = x + dx, y + dy
       while 0 <= i < self.size and 0 <= j < self.size:
           if self.grid[i][j] == player:
               count += 1
               i += dx
               j += dy
           else:
               break
       
       # 反向检查
       i, j = x - dx, y - dy
       while 0 <= i < self.size and 0 <= j < self.size:
           if self.grid[i][j] == player:
               count += 1
               i -= dx
               j -= dy
           else:
               break
       
       return count
   ```

### 4.3 Board模块

**职责**：管理棋盘状态和数据

**数据验证**：
1. 坐标有效性检查：
   ```python
   def is_valid_position(self, x, y):
       return 0 <= x < self.size and 0 <= y < self.size
   ```

2. 位置空置检查：
   ```python
   def is_empty(self, x, y):
       return self.grid[x][y] == 0
   ```

### 4.4 常量定义

```python
# constants.py
BOARD_SIZE = 15
CELL_SIZE = 40  # 每个格子的像素大小
MARGIN = 50     # 棋盘边距

# 颜色定义
BLACK = 1
WHITE = 2
EMPTY = 0

# 颜色值
COLOR_BLACK = Qt.black
COLOR_WHITE = Qt.white
COLOR_BOARD = QColor(220, 179, 92)  # 木质棋盘色
COLOR_LINE = Qt.black
```

## 5. 错误处理设计

### 5.1 自定义异常类

```python
class GomokuError(Exception):
    """五子棋游戏基础异常"""
    pass

class InvalidMoveError(GomokuError):
    """无效落子异常"""
    def __init__(self, x, y):
        super().__init__(f"无效落子位置: ({x}, {y})")

class GameOverError(GomokuError):
    """游戏已结束异常"""
    def __init__(self):
        super().__init__("游戏已结束")
```

### 5.2 错误处理策略

1. 用户输入错误：显示友好提示信息
2. 逻辑错误：记录日志，恢复游戏状态
3. 界面错误：尝试恢复，显示错误对话框

## 6. 测试设计

### 6.1 单元测试

```python
# test_board.py
def test_place_stone():
    board = Board()
    assert board.place_stone(7, 7, BLACK) == True
    assert board.get_cell(7, 7) == BLACK

def test_invalid_move():
    board = Board()
    board.place_stone(7, 7, BLACK)
    with pytest.raises(InvalidMoveError):
        board.place_stone(7, 7, WHITE)

# test_game_logic.py
def test_check_win_horizontal():
    board = Board()
    logic = GameLogic(board)
    
    # 放置5个连续黑棋
    for i in range(5):
        board.place_stone(7, 7 + i, BLACK)
    
    assert logic.check_win(7, 10, BLACK) == True
```

### 6.2 集成测试

1. 完整游戏流程测试
2. 界面交互测试
3. 边界条件测试

## 7. 部署配置

### 7.1 依赖管理

```txt
# requirements.txt
PyQt5>=5.15.0
```

### 7.2 安装脚本

```bash
# install.sh
pip install -r requirements.txt
```

### 7.3 打包配置（可选）

```python
# setup.py
from setuptools import setup, find_packages

setup(
    name="gomoku-game",
    version="1.0.0",
    packages=find_packages(),
    install_requires=["PyQt5>=5.15.0"],
    entry_points={
        "console_scripts": [
            "gomoku=src.main:main",
        ],
    },
)
```