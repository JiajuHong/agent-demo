"""
输出格式化模块 - 格式化所有输出信息
"""

import datetime


class OutputFormatter:
    """输出格式化类"""
    
    def show_welcome(self):
        """显示欢迎信息"""
        print("=" * 40)
        print("      命令行计算器 v1.0")
        print("=" * 40)
        print("\n欢迎使用命令行计算器！")
        print("支持的操作: 加法(+), 减法(-), 乘法(*), 除法(/)")
        print("输入 'Ctrl+C' 可随时退出程序")
        print("-" * 40)
    
    def show_result(self, expression, result):
        """
        显示计算结果
        
        Args:
            expression: 计算表达式
            result: 计算结果
        """
        print("\n" + "=" * 40)
        print(f"计算结果: {expression} = {result}")
        print("=" * 40)
        
        # 添加一些额外的格式化信息
        if isinstance(result, float) and result.is_integer():
            print(f"整数形式: {int(result)}")
        
        # 显示当前时间
        current_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"计算时间: {current_time}")
    
    def show_error(self, message):
        """
        显示错误信息
        
        Args:
            message: 错误信息
        """
        print("\n" + "!" * 40)
        print(f"错误: {message}")
        print("!" * 40)
        print("请检查输入并重试")
    
    def show_goodbye(self):
        """显示退出信息"""
        print("\n" + "=" * 40)
        print("感谢使用命令行计算器！")
        print("再见！")
        print("=" * 40)
    
    def show_help(self):
        """显示帮助信息"""
        print("\n" + "-" * 40)
        print("帮助信息:")
        print("-" * 40)
        print("1. 支持的基本运算:")
        print("   + : 加法")
        print("   - : 减法")
        print("   * : 乘法")
        print("   / : 除法")
        print("\n2. 使用说明:")
        print("   - 按照提示输入数字和运算符")
        print("   - 支持使用上一次计算结果")
        print("   - 支持连续计算")
        print("   - 输入 'y' 或 'n' 进行选择")
        print("\n3. 退出:")
        print("   - 输入 'n' 停止计算")
        print("   - 或按 'Ctrl+C' 强制退出")
        print("-" * 40)
    
    def format_number(self, number):
        """
        格式化数字显示
        
        Args:
            number: 要格式化的数字
            
        Returns:
            str: 格式化后的字符串
        """
        if isinstance(number, float) and number.is_integer():
            return str(int(number))
        return str(round(number, 10)).rstrip('0').rstrip('.')