#!/usr/bin/env python3
"""
简单命令行计算器
支持基本的四则运算，提供安全可靠的计算环境
"""

import math
import re
from typing import Optional, Dict, Any


class CalculatorEngine:
    """计算引擎类，负责安全地计算数学表达式"""
    
    def __init__(self):
        """初始化计算引擎，创建安全的环境"""
        self.safe_globals = self._create_safe_environment()
        self.safe_locals = {}
    
    def _create_safe_environment(self) -> Dict[str, Any]:
        """创建安全的计算环境，只允许数学运算"""
        safe_env = {
            # 数学常量
            'pi': math.pi,
            'e': math.e,
            
            # 数学函数
            'abs': abs,
            'round': round,
            'pow': pow,
            'min': min,
            'max': max,
            'sqrt': math.sqrt,
            
            # 三角函数（可选）
            'sin': math.sin,
            'cos': math.cos,
            'tan': math.tan,
            'asin': math.asin,
            'acos': math.acos,
            'atan': math.atan,
            
            # 对数函数
            'log': math.log,
            'log10': math.log10,
            'exp': math.exp,
            
            # 其他数学函数
            'ceil': math.ceil,
            'floor': math.floor,
            'fabs': math.fabs,
        }
        return safe_env
    
    def calculate(self, expression: str) -> float:
        """
        计算数学表达式
        
        Args:
            expression: 数学表达式字符串
            
        Returns:
            计算结果
            
        Raises:
            ValueError: 表达式语法错误
            ZeroDivisionError: 除零错误
            TypeError: 类型错误
        """
        try:
            # 使用安全的环境计算表达式
            result = eval(expression, {"__builtins__": {}}, self.safe_globals)
            
            # 确保结果是数字
            if not isinstance(result, (int, float)):
                raise TypeError(f"计算结果不是数字: {type(result)}")
                
            return float(result)
            
        except SyntaxError as e:
            raise ValueError(f"表达式语法错误: {e}")
        except NameError as e:
            raise ValueError(f"使用了未定义的变量或函数: {e}")
        except ZeroDivisionError:
            raise ZeroDivisionError("不能除以零")
        except TypeError as e:
            raise TypeError(f"类型错误: {e}")
        except Exception as e:
            raise ValueError(f"计算错误: {e}")


class InputValidator:
    """输入验证类，负责验证用户输入的安全性"""
    
    def __init__(self):
        """初始化验证器"""
        # 允许的字符：数字、运算符、空格、括号、小数点、字母（用于函数名）
        self.allowed_chars_pattern = re.compile(r'^[0-9+\-*/().\s,a-zA-Z]+$')
        
        # 危险关键字黑名单
        self.dangerous_keywords = [
            'import', '__import__', 'eval', 'exec', 'compile',
            'open', 'file', 'execfile', 'reload', '__builtins__',
            '__globals__', '__locals__', '__dict__', '__class__'
        ]
    
    def validate_expression(self, expression: str) -> bool:
        """
        验证表达式是否安全有效
        
        Args:
            expression: 用户输入的表达式
            
        Returns:
            True如果表达式安全有效，否则False
        """
        # 检查是否为空
        if not expression or not expression.strip():
            return False
        
        expression = expression.strip()
        
        # 检查长度限制
        if len(expression) > 1000:
            return False
        
        # 检查是否包含危险关键字
        for keyword in self.dangerous_keywords:
            if keyword in expression.lower():
                return False
        
        # 检查字符是否合法
        if not self.allowed_chars_pattern.match(expression):
            return False
        
        # 检查括号匹配
        if not self._check_parentheses(expression):
            return False
        
        return True
    
    def _check_parentheses(self, expression: str) -> bool:
        """检查括号是否匹配"""
        stack = []
        for char in expression:
            if char == '(':
                stack.append(char)
            elif char == ')':
                if not stack:
                    return False
                stack.pop()
        return len(stack) == 0


class UserInterface:
    """用户界面类，负责显示信息和与用户交互"""
    
    @staticmethod
    def display_welcome() -> None:
        """显示欢迎信息"""
        print("=" * 40)
        print("        简单命令行计算器")
        print("=" * 40)
        print("支持的操作：")
        print("  - 基本运算：+  -  *  /")
        print("  - 括号：()")
        print("  - 指数：**")
        print("  - 取余：%")
        print("  - 数学函数：sqrt(), sin(), cos(), log() 等")
        print("  - 常量：pi, e")
        print("\n输入 'q' 或 'quit' 退出程序")
        print("=" * 40)
    
    @staticmethod
    def get_user_input() -> Optional[str]:
        """
        获取用户输入
        
        Returns:
            用户输入的表达式，如果用户要退出则返回None
        """
        try:
            expression = input("\n请输入数学表达式: ").strip()
            
            # 检查退出命令
            if expression.lower() in ['q', 'quit', 'exit']:
                return None
            
            return expression
        except (EOFError, KeyboardInterrupt):
            return None
    
    @staticmethod
    def display_result(result: float) -> None:
        """显示计算结果"""
        # 如果是整数，显示为整数格式
        if result.is_integer():
            print(f"结果: {int(result)}")
        else:
            # 显示6位小数
            print(f"结果: {result:.6f}")
    
    @staticmethod
    def display_error(error_msg: str) -> None:
        """显示错误信息"""
        print(f"错误: {error_msg}")
        print("请检查输入并重试")
    
    @staticmethod
    def ask_to_continue() -> bool:
        """询问用户是否继续计算"""
        while True:
            try:
                answer = input("\n是否继续计算？(y/n): ").strip().lower()
                
                if answer in ['y', 'yes', '是']:
                    return True
                elif answer in ['n', 'no', '否']:
                    return False
                else:
                    print("请输入 y/n 或 是/否")
            except (EOFError, KeyboardInterrupt):
                return False


def main():
    """主程序入口"""
    # 初始化各个模块
    calculator = CalculatorEngine()
    validator = InputValidator()
    ui = UserInterface()
    
    # 显示欢迎信息
    ui.display_welcome()
    
    while True:
        try:
            # 获取用户输入
            expression = ui.get_user_input()
            
            # 检查是否要退出
            if expression is None:
                print("\n感谢使用！")
                break
            
            # 验证输入
            if not validator.validate_expression(expression):
                ui.display_error("表达式无效或不安全")
                continue
            
            # 计算表达式
            try:
                result = calculator.calculate(expression)
                ui.display_result(result)
            except ZeroDivisionError as e:
                ui.display_error(str(e))
            except (ValueError, TypeError) as e:
                ui.display_error(str(e))
            
            # 询问是否继续
            if not ui.ask_to_continue():
                print("\n感谢使用！")
                break
                
        except (EOFError, KeyboardInterrupt):
            print("\n\n程序被中断，感谢使用！")
            break
        except Exception as e:
            print(f"\n发生未知错误: {e}")
            print("程序将退出")
            break


if __name__ == "__main__":
    main()