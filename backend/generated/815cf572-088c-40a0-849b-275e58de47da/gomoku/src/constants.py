"""
五子棋游戏常量定义
"""

# 棋盘配置
BOARD_SIZE = 15          # 棋盘大小 (15×15)
CELL_SIZE = 40           # 每个格子的像素大小
MARGIN = 50              # 棋盘边距
BOARD_WIDTH = BOARD_SIZE * CELL_SIZE + 2 * MARGIN
BOARD_HEIGHT = BOARD_SIZE * CELL_SIZE + 2 * MARGIN

# 棋子状态
EMPTY = 0
BLACK = 1
WHITE = 2

# 玩家名称
PLAYER_NAMES = {
    EMPTY: "空",
    BLACK: "黑棋",
    WHITE: "白棋"
}

# 颜色定义 (PyQt颜色)
COLOR_BLACK = "black"
COLOR_WHITE = "white"
COLOR_BOARD = "#DCB35C"  # 木质棋盘色
COLOR_LINE = "black"
COLOR_TEXT = "black"
COLOR_STATUS_BG = "#F0F0F0"

# 游戏状态
GAME_ACTIVE = 0
GAME_OVER = 1

# 方向向量 (用于胜负判断)
DIRECTIONS = [
    (1, 0),   # 水平向右
    (0, 1),   # 垂直向下
    (1, 1),   # 右下对角线
    (1, -1),  # 右上对角线
]