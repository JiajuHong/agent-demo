"""
棋盘类 - 管理棋盘状态和数据
"""
from constants import BOARD_SIZE, EMPTY, BLACK, WHITE
from exceptions import InvalidMoveError, OutOfBoardError


class Board:
    """棋盘类，管理棋盘状态和落子记录"""
    
    def __init__(self, size=BOARD_SIZE):
        """
        初始化棋盘
        
        Args:
            size: 棋盘大小，默认为15
        """
        self.size = size
        self.grid = [[EMPTY for _ in range(size)] for _ in range(size)]
        self.move_history = []  # 落子历史记录 [(x, y, player), ...]
    
    def is_valid_position(self, x, y):
        """
        检查坐标是否有效
        
        Args:
            x: 横坐标
            y: 纵坐标
            
        Returns:
            bool: 坐标是否有效
        """
        return 0 <= x < self.size and 0 <= y < self.size
    
    def is_empty(self, x, y):
        """
        检查指定位置是否为空
        
        Args:
            x: 横坐标
            y: 纵坐标
            
        Returns:
            bool: 位置是否为空
        """
        if not self.is_valid_position(x, y):
            raise OutOfBoardError(x, y, self.size)
        return self.grid[x][y] == EMPTY
    
    def place_stone(self, x, y, player):
        """
        在指定位置放置棋子
        
        Args:
            x: 横坐标
            y: 纵坐标
            player: 玩家标识 (BLACK或WHITE)
            
        Returns:
            bool: 是否成功放置
            
        Raises:
            InvalidMoveError: 位置无效或已有棋子
            OutOfBoardError: 超出棋盘范围
        """
        # 检查坐标有效性
        if not self.is_valid_position(x, y):
            raise OutOfBoardError(x, y, self.size)
        
        # 检查位置是否为空
        if not self.is_empty(x, y):
            raise InvalidMoveError(x, y)
        
        # 放置棋子
        self.grid[x][y] = player
        self.move_history.append((x, y, player))
        return True
    
    def get_cell(self, x, y):
        """
        获取指定位置的棋子状态
        
        Args:
            x: 横坐标
            y: 纵坐标
            
        Returns:
            int: 棋子状态 (EMPTY, BLACK, WHITE)
            
        Raises:
            OutOfBoardError: 超出棋盘范围
        """
        if not self.is_valid_position(x, y):
            raise OutOfBoardError(x, y, self.size)
        return self.grid[x][y]
    
    def reset(self):
        """重置棋盘"""
        self.grid = [[EMPTY for _ in range(self.size)] for _ in range(self.size)]
        self.move_history = []
    
    def get_last_move(self):
        """
        获取最后一步棋
        
        Returns:
            tuple: (x, y, player) 或 None
        """
        if not self.move_history:
            return None
        return self.move_history[-1]
    
    def get_move_count(self):
        """
        获取总落子数
        
        Returns:
            int: 落子总数
        """
        return len(self.move_history)
    
    def is_full(self):
        """
        检查棋盘是否已满
        
        Returns:
            bool: 棋盘是否已满
        """
        return self.get_move_count() == self.size * self.size
    
    def __str__(self):
        """棋盘字符串表示"""
        result = []
        for y in range(self.size):
            row = []
            for x in range(self.size):
                cell = self.grid[x][y]
                if cell == EMPTY:
                    row.append('.')
                elif cell == BLACK:
                    row.append('B')
                else:
                    row.append('W')
            result.append(' '.join(row))
        return '\n'.join(result)