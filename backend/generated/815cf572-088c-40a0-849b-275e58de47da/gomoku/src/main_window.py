"""
主窗口类 - 管理GUI界面
"""
from PyQt5.QtWidgets import (
    QMainWindow, QWidget, QLabel, QPushButton, 
    QVBoxLayout, QHBoxLayout, QMessageBox
)
from PyQt5.QtCore import Qt, QRect, QPoint
from PyQt5.QtGui import QPainter, QPen, QBrush, QFont, QColor

from constants import (
    BOARD_SIZE, CELL_SIZE, MARGIN, BOARD_WIDTH, BOARD_HEIGHT,
    BLACK, WHITE, EMPTY, PLAYER_NAMES,
    COLOR_BLACK, COLOR_WHITE, COLOR_BOARD, COLOR_LINE,
    COLOR_TEXT, COLOR_STATUS_BG
)
from board import Board
from game_logic import GameLogic
from exceptions import InvalidMoveError, OutOfBoardError, GameOverError


class BoardWidget(QWidget):
    """棋盘绘制组件"""
    
    def __init__(self, parent=None):
        super().__init__(parent)
        self.setFixedSize(BOARD_WIDTH, BOARD_HEIGHT)
        
        # 初始化游戏组件
        self.board = Board()
        self.game_logic = GameLogic(self.board)
        
        # 设置鼠标跟踪
        self.setMouseTracking(True)
    
    def paintEvent(self, event):
        """绘制棋盘和棋子"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.Antialiasing)
        
        # 绘制棋盘背景
        painter.fillRect(self.rect(), QColor(COLOR_BOARD))
        
        # 绘制棋盘网格线
        pen = QPen(QColor(COLOR_LINE))
        pen.setWidth(2)
        painter.setPen(pen)
        
        # 绘制横线
        for i in range(BOARD_SIZE):
            y = MARGIN + i * CELL_SIZE
            painter.drawLine(MARGIN, y, MARGIN + (BOARD_SIZE - 1) * CELL_SIZE, y)
        
        # 绘制竖线
        for i in range(BOARD_SIZE):
            x = MARGIN + i * CELL_SIZE
            painter.drawLine(x, MARGIN, x, MARGIN + (BOARD_SIZE - 1) * CELL_SIZE)
        
        # 绘制棋盘上的五个点（传统五子棋棋盘标记）
        dot_positions = [(3, 3), (3, 11), (7, 7), (11, 3), (11, 11)]
        painter.setBrush(QBrush(QColor(COLOR_BLACK)))
        for x, y in dot_positions:
            center_x = MARGIN + x * CELL_SIZE
            center_y = MARGIN + y * CELL_SIZE
            painter.drawEllipse(QPoint(center_x, center_y), 4, 4)
        
        # 绘制棋子
        for x in range(BOARD_SIZE):
            for y in range(BOARD_SIZE):
                cell = self.board.get_cell(x, y)
                if cell != EMPTY:
                    self._draw_stone(painter, x, y, cell)
    
    def _draw_stone(self, painter, x, y, player):
        """绘制棋子"""
        center_x = MARGIN + x * CELL_SIZE
        center_y = MARGIN + y * CELL_SIZE
        radius = CELL_SIZE // 2 - 2
        
        # 设置棋子颜色
        if player == BLACK:
            brush_color = QColor(COLOR_BLACK)
        else:
            brush_color = QColor(COLOR_WHITE)
        
        # 绘制棋子
        painter.setBrush(QBrush(brush_color))
        painter.setPen(Qt.NoPen)
        painter.drawEllipse(QPoint(center_x, center_y), radius, radius)
        
        # 为白棋添加边框
        if player == WHITE:
            pen = QPen(QColor(COLOR_BLACK))
            pen.setWidth(1)
            painter.setPen(pen)
            painter.setBrush(Qt.NoBrush)
            painter.drawEllipse(QPoint(center_x, center_y), radius, radius)
    
    def mousePressEvent(self, event):
        """处理鼠标点击事件"""
        if event.button() == Qt.LeftButton:
            # 将鼠标坐标转换为棋盘坐标
            pos = event.pos()
            x = (pos.x() - MARGIN + CELL_SIZE // 2) // CELL_SIZE
            y = (pos.y() - MARGIN + CELL_SIZE // 2) // CELL_SIZE
            
            # 检查坐标是否在棋盘范围内
            if 0 <= x < BOARD_SIZE and 0 <= y < BOARD_SIZE:
                try:
                    # 执行落子
                    is_win = self.game_logic.make_move(x, y)
                    
                    # 重绘棋盘
                    self.update()
                    
                    # 检查游戏是否结束
                    if is_win:
                        winner = self.game_logic.get_winner_name()
                        QMessageBox.information(self, "游戏结束", f"{winner}获胜！")
                    elif self.game_logic.is_game_over() and self.game_logic.winner is None:
                        QMessageBox.information(self, "游戏结束", "平局！")
                    
                    # 通知父窗口更新状态
                    if self.parent():
                        self.parent().update_status()
                        
                except (InvalidMoveError, OutOfBoardError) as e:
                    QMessageBox.warning(self, "无效操作", str(e))
                except GameOverError:
                    QMessageBox.warning(self, "游戏已结束", "游戏已经结束，请重新开始新游戏")
    
    def reset_game(self):
        """重置游戏"""
        self.game_logic.reset()
        self.update()
    
    def get_game_logic(self):
        """获取游戏逻辑对象"""
        return self.game_logic


class MainWindow(QMainWindow):
    """主窗口"""
    
    def __init__(self):
        super().__init__()
        self.init_ui()
    
    def init_ui(self):
        """初始化用户界面"""
        self.setWindowTitle("五子棋游戏")
        self.setFixedSize(BOARD_WIDTH + 20, BOARD_HEIGHT + 100)
        
        # 创建中央部件
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 创建主布局
        main_layout = QVBoxLayout(central_widget)
        main_layout.setSpacing(10)
        
        # 创建标题标签
        title_label = QLabel("五子棋游戏")
        title_font = QFont("Arial", 16, QFont.Bold)
        title_label.setFont(title_font)
        title_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(title_label)
        
        # 创建棋盘部件
        self.board_widget = BoardWidget()
        main_layout.addWidget(self.board_widget, 1, Qt.AlignCenter)
        
        # 创建状态栏区域
        status_layout = QHBoxLayout()
        
        # 当前玩家状态标签
        self.status_label = QLabel("当前玩家：黑棋")
        self.status_label.setStyleSheet(f"background-color: {COLOR_STATUS_BG}; padding: 5px;")
        status_layout.addWidget(self.status_label)
        
        # 重置按钮
        reset_button = QPushButton("重置游戏")
        reset_button.clicked.connect(self.reset_game)
        reset_button.setFixedSize(100, 30)
        status_layout.addWidget(reset_button)
        
        main_layout.addLayout(status_layout)
    
    def update_status(self):
        """更新状态显示"""
        game_logic = self.board_widget.get_game_logic()
        
        if game_logic.is_game_over():
            if game_logic.winner:
                winner_name = game_logic.get_winner_name()
                self.status_label.setText(f"游戏结束：{winner_name}获胜！")
            else:
                self.status_label.setText("游戏结束：平局！")
        else:
            current_player = game_logic.get_current_player()
            player_name = PLAYER_NAMES.get(current_player, "未知")
            self.status_label.setText(f"当前玩家：{player_name}")
    
    def reset_game(self):
        """重置游戏"""
        self.board_widget.reset_game()
        self.update_status()
    
    def closeEvent(self, event):
        """关闭窗口事件"""
        reply = QMessageBox.question(
            self, '确认退出',
            '确定要退出游戏吗？',
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )
        
        if reply == QMessageBox.Yes:
            event.accept()
        else:
            event.ignore()