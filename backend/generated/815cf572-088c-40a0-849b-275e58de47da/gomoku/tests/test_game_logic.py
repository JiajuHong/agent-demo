"""
游戏逻辑类测试
"""
import pytest
from src.board import Board
from src.game_logic import GameLogic
from src.constants import BLACK, WHITE
from src.exceptions import GameOverError


class TestGameLogic:
    """GameLogic类测试"""
    
    def setup_method(self):
        """每个测试方法前的设置"""
        self.board = Board()
        self.game_logic = GameLogic(self.board)
    
    def test_initialization(self):
        """测试初始化"""
        assert self.game_logic.current_player == BLACK  # 黑棋先行
        assert self.game_logic.game_over == False
        assert self.game_logic.winner is None
        assert self.game_logic.move_count == 0
    
    def test_make_move(self):
        """测试执行落子"""
        # 第一次落子
        is_win = self.game_logic.make_move(7, 7)
        assert is_win == False
        assert self.game_logic.current_player == WHITE  # 切换到白棋
        assert self.game_logic.move_count == 1
        assert self.board.get_cell(7, 7) == BLACK
        
        # 第二次落子
        is_win = self.game_logic.make_move(8, 8)
        assert is_win == False
        assert self.game_logic.current_player == BLACK  # 切换回黑棋
        assert self.game_logic.move_count == 2
        assert self.board.get_cell(8, 8) == WHITE
    
    def test_make_move_game_over(self):
        """测试游戏结束后的落子"""
        # 模拟游戏结束
        self.game_logic.game_over = True
        
        with pytest.raises(GameOverError):
            self.game_logic.make_move(7, 7)
    
    def test_check_win_horizontal(self):
        """测试水平方向获胜"""
        # 放置4个连续黑棋
        for i in range(4):
            self.game_logic.make_move(7, 7 + i)
            self.game_logic.make_move(8, 8)  # 白棋干扰
        
        # 放置第5个黑棋形成五子连珠
        is_win = self.game_logic.make_move(7, 11)
        assert is_win == True
        assert self.game_logic.game_over == True
        assert self.game_logic.winner == BLACK
    
    def test_check_win_vertical(self):
        """测试垂直方向获胜"""
        # 放置4个连续黑棋
        for i in range(4):
            self.game_logic.make_move(7 + i, 7)
            self.game_logic.make_move(8, 8)  # 白棋干扰
        
        # 放置第5个黑棋形成五子连珠
        is_win = self.game_logic.make_move(11, 7)
        assert is_win == True
        assert self.game_logic.game_over == True
        assert self.game_logic.winner == BLACK
    
    def test_check_win_diagonal_down_right(self):
        """测试右下对角线获胜"""
        # 放置4个连续黑棋
        for i in range(4):
            self.game_logic.make_move(7 + i, 7 + i)
            self.game_logic.make_move(8, 8)  # 白棋干扰
        
        # 放置第5个黑棋形成五子连珠
        is_win = self.game_logic.make_move(11, 11)
        assert is_win == True
        assert self.game_logic.game_over == True
        assert self.game_logic.winner == BLACK
    
    def test_check_win_diagonal_up_right(self):
        """测试右上对角线获胜"""
        # 放置4个连续黑棋
        for i in range(4):
            self.game_logic.make_move(7 + i, 7 - i)
            self.game_logic.make_move(8, 8)  # 白棋干扰
        
        # 放置第5个黑棋形成五子连珠
        is_win = self.game_logic.make_move(11, 3)
        assert is_win == True
        assert self.game_logic.game_over == True
        assert self.game_logic.winner == BLACK
    
    def test_check_win_not_enough(self):
        """测试不足五子不获胜"""
        # 放置4个连续黑棋
        for i in range(4):
            self.game_logic.make_move(7, 7 + i)
        
        # 检查是否获胜（应该不获胜）
        assert self.game_logic.check_win(7, 10, BLACK) == False
        assert self.game_logic.game_over == False
        assert self.game_logic.winner is None
    
    def test_get_current_player(self):
        """测试获取当前玩家"""
        assert self.game_logic.get_current_player() == BLACK
        
        self.game_logic.make_move(7, 7)
        assert self.game_logic.get_current_player() == WHITE
        
        self.game_logic.make_move(8, 8)
        assert self.game_logic.get_current_player() == BLACK
    
    def test_get_game_state(self):
        """测试获取游戏状态"""
        state = self.game_logic.get_game_state()
        
        assert state['current_player'] == BLACK
        assert state['game_over'] == False
        assert state['winner'] is None
        assert state['move_count'] == 0
        assert state['board_full'] == False
        
        # 执行一步后
        self.game_logic.make_move(7, 7)
        state = self.game_logic.get_game_state()
        assert state['move_count'] == 1
    
    def test_reset(self):
        """测试重置游戏"""
        # 执行一些操作
        self.game_logic.make_move(7, 7)
        self.game_logic.make_move(8, 8)
        
        # 重置
        self.game_logic.reset()
        
        # 检查是否重置
        assert self.game_logic.current_player == BLACK
        assert self.game_logic.game_over == False
        assert self.game_logic.winner is None
        assert self.game_logic.move_count == 0
        assert self.board.get_cell(7, 7) == 0  # 应为空
    
    def test_get_winner_name(self):
        """测试获取获胜者名称"""
        # 初始状态
        assert self.game_logic.get_winner_name() == "平局"
        
        # 黑棋获胜
        self.game_logic.winner = BLACK
        assert self.game_logic.get_winner_name() == "黑棋"
        
        # 白棋获胜
        self.game_logic.winner = WHITE
        assert self.game_logic.get_winner_name() == "白棋"
    
    def test_is_game_over(self):
        """测试检查游戏是否结束"""
        assert self.game_logic.is_game_over() == False
        
        self.game_logic.game_over = True
        assert self.game_logic.is_game_over() == True
    
    def test_draw_game(self):
        """测试平局情况"""
        # 使用小棋盘测试平局
        small_board = Board(size=3)
        game_logic = GameLogic(small_board)
        
        # 填满棋盘（不形成五子连珠）
        moves = [(0, 0), (0, 1), (0, 2),
                 (1, 0), (1, 1), (1, 2),
                 (2, 0), (2, 1), (2, 2)]
        
        for i, (x, y) in enumerate(moves):
            is_win = game_logic.make_move(x, y)
            if i < len(moves) - 1:
                assert is_win == False
        
        # 最后一步应该导致平局
        assert game_logic.game_over == True
        assert game_logic.winner is None
    
    def test_check_direction_method(self):
        """测试方向检查方法"""
        # 在棋盘上放置一些棋子
        self.board.place_stone(7, 7, BLACK)
        self.board.place_stone(8, 7, BLACK)
        self.board.place_stone(9, 7, BLACK)
        
        # 检查水平方向
        count = self.game_logic._check_direction(8, 7, 1, 0, BLACK)
        assert count == 3  # 包括当前位置
        
        # 检查垂直方向（应该只有1个）
        count = self.game_logic._check_direction(7, 7, 0, 1, BLACK)
        assert count == 1
    
    def test_check_win_edge_cases(self):
        """测试边界情况获胜"""
        # 测试棋盘边缘获胜
        board = Board(size=10)
        game_logic = GameLogic(board)
        
        # 在边缘放置5个连续棋子
        for i in range(5):
            game_logic.make_move(0, i)
            if i < 4:  # 前4步白棋干扰
                game_logic.make_move(1, 1)
        
        assert game_logic.game_over == True
        assert game_logic.winner == BLACK