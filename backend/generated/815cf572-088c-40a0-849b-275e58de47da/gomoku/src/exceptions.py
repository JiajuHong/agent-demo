"""
五子棋游戏异常类定义
"""

class GomokuError(Exception):
    """五子棋游戏基础异常"""
    pass


class InvalidMoveError(GomokuError):
    """无效落子异常"""
    def __init__(self, x, y):
        super().__init__(f"无效落子位置: ({x}, {y})")
        self.x = x
        self.y = y


class GameOverError(GomokuError):
    """游戏已结束异常"""
    def __init__(self):
        super().__init__("游戏已结束")


class OutOfBoardError(GomokuError):
    """超出棋盘范围异常"""
    def __init__(self, x, y, board_size):
        super().__init__(f"位置({x}, {y})超出棋盘范围(0-{board_size-1})")
        self.x = x
        self.y = y
        self.board_size = board_size