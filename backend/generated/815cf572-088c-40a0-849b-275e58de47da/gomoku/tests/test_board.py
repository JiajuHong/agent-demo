"""
棋盘类测试
"""
import pytest
from src.board import Board
from src.constants import EMPTY, BLACK, WHITE
from src.exceptions import InvalidMoveError, OutOfBoardError


class TestBoard:
    """Board类测试"""
    
    def test_initialization(self):
        """测试初始化"""
        board = Board()
        assert board.size == 15
        assert len(board.grid) == 15
        assert len(board.grid[0]) == 15
        assert board.move_history == []
    
    def test_is_valid_position(self):
        """测试坐标有效性检查"""
        board = Board()
        
        # 有效坐标
        assert board.is_valid_position(0, 0) == True
        assert board.is_valid_position(7, 7) == True
        assert board.is_valid_position(14, 14) == True
        
        # 无效坐标
        assert board.is_valid_position(-1, 0) == False
        assert board.is_valid_position(0, -1) == False
        assert board.is_valid_position(15, 0) == False
        assert board.is_valid_position(0, 15) == False
    
    def test_is_empty(self):
        """测试位置空置检查"""
        board = Board()
        
        # 初始位置应为空
        assert board.is_empty(7, 7) == True
        
        # 放置棋子后不应为空
        board.place_stone(7, 7, BLACK)
        assert board.is_empty(7, 7) == False
    
    def test_place_stone(self):
        """测试放置棋子"""
        board = Board()
        
        # 正常放置
        assert board.place_stone(7, 7, BLACK) == True
        assert board.get_cell(7, 7) == BLACK
        
        # 放置白棋
        assert board.place_stone(8, 8, WHITE) == True
        assert board.get_cell(8, 8) == WHITE
        
        # 记录落子历史
        assert len(board.move_history) == 2
        assert board.move_history[0] == (7, 7, BLACK)
        assert board.move_history[1] == (8, 8, WHITE)
    
    def test_place_stone_invalid_position(self):
        """测试无效位置放置棋子"""
        board = Board()
        
        # 超出棋盘范围
        with pytest.raises(OutOfBoardError):
            board.place_stone(-1, 0, BLACK)
        
        with pytest.raises(OutOfBoardError):
            board.place_stone(15, 0, BLACK)
    
    def test_place_stone_occupied(self):
        """测试在已有棋子的位置放置"""
        board = Board()
        board.place_stone(7, 7, BLACK)
        
        # 尝试在已有棋子的位置放置
        with pytest.raises(InvalidMoveError):
            board.place_stone(7, 7, WHITE)
    
    def test_get_cell(self):
        """测试获取棋子状态"""
        board = Board()
        
        # 获取空位置
        assert board.get_cell(7, 7) == EMPTY
        
        # 放置后获取
        board.place_stone(7, 7, BLACK)
        assert board.get_cell(7, 7) == BLACK
    
    def test_reset(self):
        """测试重置棋盘"""
        board = Board()
        
        # 放置一些棋子
        board.place_stone(7, 7, BLACK)
        board.place_stone(8, 8, WHITE)
        
        # 重置
        board.reset()
        
        # 检查是否重置
        assert board.get_cell(7, 7) == EMPTY
        assert board.get_cell(8, 8) == EMPTY
        assert board.move_history == []
    
    def test_get_last_move(self):
        """测试获取最后一步棋"""
        board = Board()
        
        # 初始状态
        assert board.get_last_move() is None
        
        # 放置棋子后
        board.place_stone(7, 7, BLACK)
        assert board.get_last_move() == (7, 7, BLACK)
        
        board.place_stone(8, 8, WHITE)
        assert board.get_last_move() == (8, 8, WHITE)
    
    def test_get_move_count(self):
        """测试获取落子数"""
        board = Board()
        
        assert board.get_move_count() == 0
        
        board.place_stone(7, 7, BLACK)
        assert board.get_move_count() == 1
        
        board.place_stone(8, 8, WHITE)
        assert board.get_move_count() == 2
    
    def test_is_full(self):
        """测试棋盘是否已满"""
        board = Board(size=3)  # 使用小棋盘测试
        
        # 初始状态
        assert board.is_full() == False
        
        # 填满棋盘
        moves = [(0, 0), (0, 1), (0, 2),
                 (1, 0), (1, 1), (1, 2),
                 (2, 0), (2, 1), (2, 2)]
        
        for i, (x, y) in enumerate(moves):
            player = BLACK if i % 2 == 0 else WHITE
            board.place_stone(x, y, player)
        
        assert board.is_full() == True
    
    def test_str_representation(self):
        """测试字符串表示"""
        board = Board(size=3)
        
        # 空棋盘
        expected = ". . .\n. . .\n. . ."
        assert str(board) == expected
        
        # 放置棋子
        board.place_stone(0, 0, BLACK)
        board.place_stone(1, 1, WHITE)
        
        expected = "B . .\n. W .\n. . ."
        assert str(board) == expected