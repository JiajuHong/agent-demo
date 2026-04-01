"""
游戏逻辑类 - 实现游戏规则和胜负判断
"""
from constants import BOARD_SIZE, BLACK, WHITE
from exceptions import GameOverError


class GameLogic:
    """游戏逻辑类，负责胜负判断和游戏规则"""
    
    def __init__(self, board):
        """
        初始化游戏逻辑
        
        Args:
            board: Board对象
        """
        self.board = board
        self.current_player = BLACK  # 黑棋先行
        self.game_over = False
        self.winner = None
        self.move_count = 0
    
    def make_move(self, x, y):
        """
        执行落子操作
        
        Args:
            x: 横坐标
            y: 纵坐标
            
        Returns:
            bool: 是否获胜
            
        Raises:
            GameOverError: 游戏已结束
        """
        if self.game_over:
            raise GameOverError()
        
        # 放置棋子
        self.board.place_stone(x, y, self.current_player)
        self.move_count += 1
        
        # 检查是否获胜
        if self.check_win(x, y, self.current_player):
            self.game_over = True
            self.winner = self.current_player
            return True
        
        # 检查是否平局（棋盘已满）
        if self.board.is_full():
            self.game_over = True
            self.winner = None  # 平局
            return False
        
        # 切换玩家
        self.current_player = WHITE if self.current_player == BLACK else BLACK
        return False
    
    def check_win(self, x, y, player):
        """
        检查指定位置是否形成五子连珠
        
        Args:
            x: 最后落子的横坐标
            y: 最后落子的纵坐标
            player: 玩家标识
            
        Returns:
            bool: 是否获胜
        """
        from constants import DIRECTIONS
        
        # 检查四个方向：水平、垂直、两个对角线
        for dx, dy in DIRECTIONS:
            count = self._check_direction(x, y, dx, dy, player)
            if count >= 5:
                return True
        
        return False
    
    def _check_direction(self, x, y, dx, dy, player):
        """
        检查指定方向上的连续棋子数
        
        Args:
            x: 起始位置横坐标
            y: 起始位置纵坐标
            dx: x方向增量
            dy: y方向增量
            player: 玩家标识
            
        Returns:
            int: 连续棋子数
        """
        count = 1  # 当前位置的棋子
        
        # 正向检查
        i, j = x + dx, y + dy
        while 0 <= i < self.board.size and 0 <= j < self.board.size:
            if self.board.get_cell(i, j) == player:
                count += 1
                i += dx
                j += dy
            else:
                break
        
        # 反向检查
        i, j = x - dx, y - dy
        while 0 <= i < self.board.size and 0 <= j < self.board.size:
            if self.board.get_cell(i, j) == player:
                count += 1
                i -= dx
                j -= dy
            else:
                break
        
        return count
    
    def get_current_player(self):
        """
        获取当前玩家
        
        Returns:
            int: 当前玩家标识 (BLACK或WHITE)
        """
        return self.current_player
    
    def get_game_state(self):
        """
        获取游戏状态
        
        Returns:
            dict: 游戏状态信息
        """
        return {
            'current_player': self.current_player,
            'game_over': self.game_over,
            'winner': self.winner,
            'move_count': self.move_count,
            'board_full': self.board.is_full()
        }
    
    def reset(self):
        """重置游戏"""
        self.board.reset()
        self.current_player = BLACK
        self.game_over = False
        self.winner = None
        self.move_count = 0
    
    def get_winner_name(self):
        """
        获取获胜者名称
        
        Returns:
            str: 获胜者名称或"平局"
        """
        from constants import PLAYER_NAMES
        
        if self.winner is None:
            return "平局"
        return PLAYER_NAMES.get(self.winner, "未知")
    
    def is_game_over(self):
        """
        检查游戏是否结束
        
        Returns:
            bool: 游戏是否结束
        """
        return self.game_over