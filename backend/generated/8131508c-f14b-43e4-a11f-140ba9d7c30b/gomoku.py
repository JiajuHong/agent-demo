#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单五子棋游戏
一个基于控制台字符界面的双人对战五子棋游戏
"""

import os
import sys

# 游戏常量
BOARD_SIZE = 15  # 棋盘大小 15x15
EMPTY = 0        # 空位置
BLACK = 1        # 黑棋
WHITE = 2        # 白棋

# 棋子显示字符
PIECE_SYMBOLS = {
    EMPTY: '.',
    BLACK: '●',  # 黑棋使用实心圆
    WHITE: '○'   # 白棋使用空心圆
}

# 玩家名称
PLAYER_NAMES = {
    BLACK: "黑棋",
    WHITE: "白棋"
}

# 列标题字母
COL_LETTERS = "ABCDEFGHIJKLMNO"


def init_board():
    """
    初始化空棋盘
    
    Returns:
        list: 15x15的二维列表，所有位置初始为EMPTY
    """
    return [[EMPTY for _ in range(BOARD_SIZE)] for _ in range(BOARD_SIZE)]


def print_board(board):
    """
    在控制台显示棋盘
    
    Args:
        board (list): 棋盘状态
    """
    # 清屏
    os.system('cls' if os.name == 'nt' else 'clear')
    
    print("\n" + "=" * 50)
    print(" " * 10 + "五子棋游戏")
    print("=" * 50)
    
    # 打印列标题
    print("   " + " ".join(COL_LETTERS))
    
    # 打印棋盘内容
    for i in range(BOARD_SIZE):
        # 打印行号（右对齐，宽度为2）
        row_num = str(i + 1).rjust(2)
        row_str = f"{row_num} "
        
        for j in range(BOARD_SIZE):
            piece = board[i][j]
            row_str += PIECE_SYMBOLS[piece] + " "
        
        print(row_str)
    
    print()


def parse_input(input_str):
    """
    解析玩家输入的坐标
    
    Args:
        input_str (str): 玩家输入的坐标字符串，如"A1", "B15"等
        
    Returns:
        tuple: (row, col) 坐标，如果输入无效返回None
    """
    if not input_str or len(input_str) < 2:
        return None
    
    # 转换为大写
    input_str = input_str.upper().strip()
    
    # 提取字母部分和数字部分
    col_part = ""
    row_part = ""
    
    for char in input_str:
        if char.isalpha():
            col_part += char
        elif char.isdigit():
            row_part += char
    
    if not col_part or not row_part:
        return None
    
    # 解析列（字母转数字）
    col = -1
    for i, letter in enumerate(COL_LETTERS):
        if col_part == letter:
            col = i
            break
    
    if col == -1:
        return None
    
    # 解析行（数字）
    try:
        row = int(row_part) - 1  # 转换为0-based索引
    except ValueError:
        return None
    
    # 检查范围
    if 0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE:
        return (row, col)
    else:
        return None


def is_valid_move(board, row, col):
    """
    验证落子位置是否有效
    
    Args:
        board (list): 棋盘状态
        row (int): 行坐标
        col (int): 列坐标
        
    Returns:
        bool: True表示有效，False表示无效
    """
    # 检查坐标是否在棋盘范围内
    if not (0 <= row < BOARD_SIZE and 0 <= col < BOARD_SIZE):
        return False
    
    # 检查位置是否为空
    if board[row][col] != EMPTY:
        return False
    
    return True


def place_stone(board, row, col, player):
    """
    在指定位置放置棋子
    
    Args:
        board (list): 棋盘状态
        row (int): 行坐标
        col (int): 列坐标
        player (int): 玩家（BLACK或WHITE）
        
    Returns:
        list: 更新后的棋盘状态
    """
    board[row][col] = player
    return board


def check_direction(board, row, col, dx, dy, player):
    """
    检查指定方向上的连续棋子数
    
    Args:
        board (list): 棋盘状态
        row (int): 起始行坐标
        col (int): 起始列坐标
        dx (int): 行方向增量(-1,0,1)
        dy (int): 列方向增量(-1,0,1)
        player (int): 玩家（BLACK或WHITE）
        
    Returns:
        int: 连续棋子数
    """
    count = 0
    
    # 检查正方向
    r, c = row, col
    while 0 <= r < BOARD_SIZE and 0 <= c < BOARD_SIZE and board[r][c] == player:
        count += 1
        r += dx
        c += dy
    
    return count


def check_win(board, row, col, player):
    """
    检查指定位置落子后是否获胜
    
    Args:
        board (list): 棋盘状态
        row (int): 行坐标
        col (int): 列坐标
        player (int): 玩家（BLACK或WHITE）
        
    Returns:
        bool: True表示获胜，False表示未获胜
    """
    # 四个检查方向：水平、垂直、左上右下、右上左下
    directions = [
        (0, 1),   # 水平 →
        (1, 0),   # 垂直 ↓
        (1, 1),   # 左上右下 ↘
        (1, -1)   # 右上左下 ↙
    ]
    
    for dx, dy in directions:
        # 检查正方向
        forward_count = check_direction(board, row, col, dx, dy, player)
        # 检查反方向
        backward_count = check_direction(board, row, col, -dx, -dy, player)
        
        # 总连续数 = 正方向 + 反方向 - 1（因为起始点被计算了两次）
        total_count = forward_count + backward_count - 1
        
        if total_count >= 5:
            return True
    
    return False


def get_player_input(board, current_player):
    """
    获取玩家输入并处理
    
    Args:
        board (list): 棋盘状态
        current_player (int): 当前玩家
        
    Returns:
        tuple: (row, col) 坐标，如果玩家想退出返回None
    """
    while True:
        try:
            print(f"当前玩家：{PLAYER_NAMES[current_player]} ({PIECE_SYMBOLS[current_player]})")
            input_str = input("请输入落子位置（如A1），输入'quit'退出：").strip()
            
            if input_str.lower() == 'quit':
                return None
            
            # 解析坐标
            result = parse_input(input_str)
            
            if result is None:
                print("错误：坐标格式不正确！请使用字母+数字格式，如'A1'")
                continue
            
            row, col = result
            
            # 验证落子位置
            if not is_valid_move(board, row, col):
                print("错误：该位置已有棋子或超出棋盘范围！")
                continue
            
            return (row, col)
            
        except KeyboardInterrupt:
            print("\n游戏已中断")
            return None
        except Exception as e:
            print(f"输入错误：{e}")
            continue


def play_game():
    """
    主游戏函数
    """
    print("欢迎来到五子棋游戏！")
    print("游戏规则：")
    print("1. 黑棋(●)和白棋(○)交替落子")
    print("2. 输入坐标格式：字母+数字，如'A1'")
    print("3. 先在横、竖、斜任意方向连成五子者获胜")
    print("4. 输入'quit'可以退出游戏")
    print("\n按Enter键开始游戏...")
    input()
    
    while True:
        # 初始化游戏
        board = init_board()
        current_player = BLACK
        game_over = False
        winner = None
        
        # 游戏主循环
        while not game_over:
            # 显示棋盘
            print_board(board)
            
            # 获取玩家输入
            move = get_player_input(board, current_player)
            
            if move is None:
                print("游戏结束")
                return
            
            row, col = move
            
            # 放置棋子
            board = place_stone(board, row, col, current_player)
            
            # 检查是否获胜
            if check_win(board, row, col, current_player):
                game_over = True
                winner = current_player
            else:
                # 切换玩家
                current_player = WHITE if current_player == BLACK else BLACK
        
        # 游戏结束，显示结果
        print_board(board)
        print("=" * 50)
        print(f"恭喜！{PLAYER_NAMES[winner]} ({PIECE_SYMBOLS[winner]}) 获胜！")
        print("=" * 50)
        
        # 询问是否重新开始
        while True:
            choice = input("\n是否重新开始游戏？(y/n): ").strip().lower()
            if choice in ['y', 'yes', '是']:
                break
            elif choice in ['n', 'no', '否']:
                print("感谢游玩，再见！")
                return
            else:
                print("请输入 y/n 或 是/否")


def main():
    """
    程序入口点
    """
    try:
        play_game()
    except KeyboardInterrupt:
        print("\n\n游戏已退出")
    except Exception as e:
        print(f"程序出现错误：{e}")
        print("请检查代码或重新运行程序")


if __name__ == "__main__":
    main()