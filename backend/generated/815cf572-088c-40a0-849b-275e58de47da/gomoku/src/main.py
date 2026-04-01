"""
五子棋游戏主程序入口
"""
import sys
from PyQt5.QtWidgets import QApplication

from main_window import MainWindow


def main():
    """主函数"""
    # 创建应用实例
    app = QApplication(sys.argv)
    app.setApplicationName("五子棋游戏")
    
    # 创建主窗口
    window = MainWindow()
    window.show()
    
    # 运行应用
    sys.exit(app.exec_())


if __name__ == "__main__":
    main()