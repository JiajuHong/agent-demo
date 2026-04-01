#!/usr/bin/env python3
"""
五子棋游戏启动脚本
"""
import sys
import os

# 添加src目录到Python路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

try:
    from main import main
    main()
except ImportError as e:
    print(f"导入错误: {e}")
    print("请确保已安装依赖: pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"运行错误: {e}")
    sys.exit(1)