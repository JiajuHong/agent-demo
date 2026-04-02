#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简单五子棋游戏
使用Python Tkinter实现的15x15五子棋游戏
支持双人对战，包含胜负判断和重新开始功能
"""

import tkinter as tk
from tkinter import messagebox
from typing import List, Tuple, Optional


class GameModel:
    """游戏模型：管理游戏数据状态"""
    
    EMPTY = 0
    BLACK = 1
    WHITE = 2
    
    def __init__(self, board_size: int = 15):
        """初始化游戏模型
        
        Args:
            board_size: 棋盘大小，默认15x15
        """
        self.board_size = board_size
        self.board = [[self.EMPTY for _ in range(board_size)] for _ in range(board_size)]
        self.current_player = self.BLACK  # 黑棋先行
        self.game_over = False
        self.winner = self.EMPTY
        self.move_history = []  # 记录落子历史
        
    def reset(self) -> None:
        """重置游戏状态"""
        self.board = [[self.EMPTY for _ in range(self.board_size)] for _ in range(self.board_size)]
        self.current_player = self.BLACK
        self.game_over = False
        self.winner = self.EMPTY
        self.move_history = []
    
    def is_valid_move(self, row: int, col: int) -> bool:
        """检查落子位置是否有效
        
        Args:
            row: 行坐标 (0-14)
            col: 列坐标 (0-14)
            
        Returns:
            bool: 位置是否有效
        """
        if not (0 <= row < self.board_size and 0 <= col < self.board_size):
            return False
        return self.board[row][col] == self.EMPTY
    
    def place_stone(self, row: int, col: int) -> bool:
        """在指定位置落子
        
        Args:
            row: 行坐标
            col: 列坐标
            
        Returns:
            bool: 落子是否成功
        """
        if not self.is_valid_move(row, col) or self.game_over:
            return False
        
        # 落子
        self.board[row][col] = self.current_player
        self.move_history.append((row, col, self.current_player))
        
        # 检查是否获胜
        if self.check_win(row, col):
            self.game_over = True
            self.winner = self.current_player
        else:
            # 切换玩家
            self.current_player = self.WHITE if self.current_player == self.BLACK else self.BLACK
        
        return True
    
    def check_win(self, row: int, col: int) -> bool:
        """检查是否获胜
        
        Args:
            row: 最后落子的行坐标
            col: 最后落子的列坐标
            
        Returns:
            bool: 是否获胜
        """
        player = self.board[row][col]
        if player == self.EMPTY:
            return False
        
        # 四个检查方向：水平、垂直、右斜、左斜
        directions = [
            (0, 1),   # 水平 →
            (1, 0),   # 垂直 ↓
            (1, 1),   # 右斜 ↘
            (1, -1)   # 左斜 ↙
        ]
        
        for dx, dy in directions:
            count = 1  # 当前位置
            
            # 正向检查
            for i in range(1, 5):
                new_row = row + dx * i
                new_col = col + dy * i
                if (0 <= new_row < self.board_size and 
                    0 <= new_col < self.board_size and 
                    self.board[new_row][new_col] == player):
                    count += 1
                else:
                    break
            
            # 反向检查
            for i in range(1, 5):
                new_row = row - dx * i
                new_col = col - dy * i
                if (0 <= new_row < self.board_size and 
                    0 <= new_col < self.board_size and 
                    self.board[new_row][new_col] == player):
                    count += 1
                else:
                    break
            
            if count >= 5:
                return True
        
        return False
    
    def get_board(self) -> List[List[int]]:
        """获取当前棋盘状态
        
        Returns:
            List[List[int]]: 棋盘状态二维数组
        """
        return self.board
    
    def get_current_player(self) -> int:
        """获取当前玩家
        
        Returns:
            int: 当前玩家 (BLACK=1, WHITE=2)
        """
        return self.current_player
    
    def is_game_over(self) -> bool:
        """检查游戏是否结束
        
        Returns:
            bool: 游戏是否结束
        """
        return self.game_over
    
    def get_winner(self) -> int:
        """获取获胜方
        
        Returns:
            int: 获胜方 (EMPTY=0, BLACK=1, WHITE=2)
        """
        return self.winner


class GameController:
    """游戏控制器：处理游戏逻辑"""
    
    def __init__(self, model: GameModel):
        """初始化控制器
        
        Args:
            model: 游戏模型实例
        """
        self.model = model
    
    def handle_click(self, row: int, col: int) -> Tuple[bool, Optional[str]]:
        """处理棋盘点击事件
        
        Args:
            row: 点击的行坐标
            col: 点击的列坐标
            
        Returns:
            Tuple[bool, Optional[str]]: (是否成功, 错误信息或None)
        """
        if self.model.is_game_over():
            return False, "游戏已结束，请重新开始"
        
        if not self.model.is_valid_move(row, col):
            return False, "无效的落子位置"
        
        success = self.model.place_stone(row, col)
        if not success:
            return False, "落子失败"
        
        if self.model.is_game_over():
            winner = "黑棋" if self.model.get_winner() == GameModel.BLACK else "白棋"
            return True, f"{winner}获胜！"
        
        return True, None
    
    def restart_game(self) -> None:
        """重新开始游戏"""
        self.model.reset()
    
    def get_game_status(self) -> dict:
        """获取游戏状态
        
        Returns:
            dict: 游戏状态信息
        """
        return {
            "current_player": self.model.get_current_player(),
            "game_over": self.model.is_game_over(),
            "winner": self.model.get_winner(),
            "board": self.model.get_board()
        }


class GameView:
    """游戏视图：显示游戏界面"""
    
    def __init__(self, controller: GameController):
        """初始化游戏视图
        
        Args:
            controller: 游戏控制器实例
        """
        self.controller = controller
        self.window = tk.Tk()
        self.window.title("五子棋游戏")
        self.window.resizable(False, False)
        
        # 棋盘参数
        self.board_size = 15
        self.grid_size = 40  # 网格大小
        self.margin = 20     # 边距
        self.stone_radius = 18  # 棋子半径
        
        # 计算窗口大小
        self.canvas_width = 2 * self.margin + (self.board_size - 1) * self.grid_size
        self.canvas_height = 2 * self.margin + (self.board_size - 1) * self.grid_size
        
        # 创建界面组件
        self.setup_ui()
        
        # 绑定事件
        self.canvas.bind("<Button-1>", self.on_canvas_click)
    
    def setup_ui(self) -> None:
        """设置用户界面"""
        # 状态栏
        self.status_frame = tk.Frame(self.window)
        self.status_frame.pack(pady=5)
        
        self.status_label = tk.Label(
            self.status_frame, 
            text="当前回合：黑棋", 
            font=("Arial", 14)
        )
        self.status_label.pack()
        
        # 画布（棋盘）
        self.canvas = tk.Canvas(
            self.window,
            width=self.canvas_width,
            height=self.canvas_height,
            bg="#F5DEB3"  # 浅黄色背景
        )
        self.canvas.pack(pady=10)
        
        # 控制按钮
        self.button_frame = tk.Frame(self.window)
        self.button_frame.pack(pady=5)
        
        self.restart_button = tk.Button(
            self.button_frame,
            text="重新开始",
            command=self.on_restart_click,
            font=("Arial", 12),
            width=10
        )
        self.restart_button.pack()
        
        # 绘制棋盘
        self.draw_board()
    
    def draw_board(self) -> None:
        """绘制棋盘网格"""
        # 清除画布
        self.canvas.delete("all")
        
        # 绘制网格线
        for i in range(self.board_size):
            # 水平线
            x1 = self.margin
            y1 = self.margin + i * self.grid_size
            x2 = self.margin + (self.board_size - 1) * self.grid_size
            y2 = y1
            self.canvas.create_line(x1, y1, x2, y2, width=1, fill="black")
            
            # 垂直线
            x1 = self.margin + i * self.grid_size
            y1 = self.margin
            x2 = x1
            y2 = self.margin + (self.board_size - 1) * self.grid_size
            self.canvas.create_line(x1, y1, x2, y2, width=1, fill="black")
        
        # 绘制棋盘上的点（天元和星位）
        points = [
            (3, 3), (3, 11), (3, 7),
            (11, 3), (11, 11), (11, 7),
            (7, 3), (7, 11), (7, 7)
        ]
        
        for row, col in points:
            x = self.margin + col * self.grid_size
            y = self.margin + row * self.grid_size
            self.canvas.create_oval(
                x - 3, y - 3, x + 3, y + 3,
                fill="black", outline="black"
            )
    
    def draw_stone(self, row: int, col: int, player: int) -> None:
        """绘制棋子
        
        Args:
            row: 行坐标
            col: 列坐标
            player: 玩家 (BLACK=1, WHITE=2)
        """
        x = self.margin + col * self.grid_size
        y = self.margin + row * self.grid_size
        
        if player == GameModel.BLACK:
            # 黑棋
            self.canvas.create_oval(
                x - self.stone_radius, y - self.stone_radius,
                x + self.stone_radius, y + self.stone_radius,
                fill="black", outline="black", width=2
            )
        else:
            # 白棋
            self.canvas.create_oval(
                x - self.stone_radius, y - self.stone_radius,
                x + self.stone_radius, y + self.stone_radius,
                fill="white", outline="black", width=2
            )
    
    def update_board(self) -> None:
        """更新棋盘显示"""
        # 清除所有棋子
        self.canvas.delete("stone")
        
        # 获取当前棋盘状态
        board = self.controller.model.get_board()
        
        # 绘制所有棋子
        for row in range(self.board_size):
            for col in range(self.board_size):
                player = board[row][col]
                if player != GameModel.EMPTY:
                    self.draw_stone(row, col, player)
    
    def update_status(self) -> None:
        """更新状态栏显示"""
        status = self.controller.get_game_status()
        
        if status["game_over"]:
            winner = "黑棋" if status["winner"] == GameModel.BLACK else "白棋"
            self.status_label.config(text=f"游戏结束！{winner}获胜！", fg="red")
        else:
            current_player = "黑棋" if status["current_player"] == GameModel.BLACK else "白棋"
            self.status_label.config(text=f"当前回合：{current_player}", fg="black")
    
    def on_canvas_click(self, event) -> None:
        """画布点击事件处理
        
        Args:
            event: 鼠标事件
        """
        # 将屏幕坐标转换为棋盘坐标
        col = round((event.x - self.margin) / self.grid_size)
        row = round((event.y - self.margin) / self.grid_size)
        
        # 检查坐标是否在棋盘范围内
        if 0 <= row < self.board_size and 0 <= col < self.board_size:
            # 处理落子
            success, message = self.controller.handle_click(row, col)
            
            if success:
                # 更新界面
                self.update_board()
                self.update_status()
                
                # 如果有获胜消息，显示对话框
                if message and "获胜" in message:
                    messagebox.showinfo("游戏结束", message)
            elif message:
                # 显示错误信息
                messagebox.showwarning("提示", message)
    
    def on_restart_click(self) -> None:
        """重新开始按钮点击事件"""
        self.controller.restart_game()
        self.draw_board()  # 重新绘制棋盘（清除棋子）
        self.update_status()
    
    def run(self) -> None:
        """运行游戏"""
        self.window.mainloop()


def main():
    """主函数"""
    # 创建模型、控制器和视图
    model = GameModel()
    controller = GameController(model)
    view = GameView(controller)
    
    # 运行游戏
    view.run()


if __name__ == "__main__":
    main()