"""
计算器核心类 - 控制整体流程
"""

from input_handler import InputHandler
from calculator_engine import CalculatorEngine
from output_formatter import OutputFormatter


class Calculator:
    """计算器主类，控制整体流程"""
    
    def __init__(self):
        """初始化计算器"""
        self.input_handler = InputHandler()
        self.calculator_engine = CalculatorEngine()
        self.output_formatter = OutputFormatter()
        self.last_result = None
        self.is_running = True
        
    def run(self):
        """运行计算器主循环"""
        # 显示欢迎信息
        self.output_formatter.show_welcome()
        
        # 主循环
        while self.is_running:
            try:
                self._run_single_calculation()
                self._ask_to_continue()
            except KeyboardInterrupt:
                print("\n\n计算被中断")
                self.is_running = False
            except Exception as e:
                print(f"\n发生错误: {e}")
                self._ask_to_continue()
    
    def _run_single_calculation(self):
        """执行单次计算"""
        # 获取第一个数字
        if self.last_result is not None:
            use_last = self.input_handler.get_yes_no(
                f"使用上一次结果({self.last_result})作为第一个数字? (y/n): "
            )
            if use_last:
                num1 = self.last_result
                print(f"使用上一次结果: {num1}")
            else:
                num1 = self.input_handler.get_number("请输入第一个数字: ")
        else:
            num1 = self.input_handler.get_number("请输入第一个数字: ")
        
        # 获取运算符
        operator = self.input_handler.get_operator("请选择运算符 (+, -, *, /): ")
        
        # 获取第二个数字
        num2 = self.input_handler.get_number("请输入第二个数字: ")
        
        # 执行计算
        result = self.calculator_engine.calculate(num1, operator, num2)
        
        # 显示结果
        expression = f"{num1} {operator} {num2}"
        self.output_formatter.show_result(expression, result)
        
        # 保存结果
        self.last_result = result
        
    def _ask_to_continue(self):
        """询问是否继续计算"""
        continue_calc = self.input_handler.get_yes_no("\n是否继续计算? (y/n): ")
        if not continue_calc:
            self.is_running = False
            self.output_formatter.show_goodbye()
    
    def calculate(self, num1, operator, num2):
        """执行计算并返回结果"""
        return self.calculator_engine.calculate(num1, operator, num2)
    
    def get_last_result(self):
        """获取上一次计算结果"""
        return self.last_result