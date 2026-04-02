#!/usr/bin/env python3
"""
命令行计算器主程序入口
"""

from calculator import Calculator


def main():
    """主函数"""
    print("启动命令行计算器...")
    
    # 创建计算器实例
    calculator = Calculator()
    
    try:
        # 运行计算器
        calculator.run()
    except KeyboardInterrupt:
        print("\n\n程序被用户中断")
    except Exception as e:
        print(f"\n程序发生错误: {e}")
        print("请检查输入或联系开发者")
    finally:
        print("\n感谢使用命令行计算器！")


if __name__ == "__main__":
    main()