"""
计算引擎模块 - 执行数学计算
"""


class CalculatorEngine:
    """计算引擎类"""
    
    def add(self, a, b):
        """
        加法运算
        
        Args:
            a: 第一个操作数
            b: 第二个操作数
            
        Returns:
            float: 和
        """
        return a + b
    
    def subtract(self, a, b):
        """
        减法运算
        
        Args:
            a: 第一个操作数
            b: 第二个操作数
            
        Returns:
            float: 差
        """
        return a - b
    
    def multiply(self, a, b):
        """
        乘法运算
        
        Args:
            a: 第一个操作数
            b: 第二个操作数
            
        Returns:
            float: 积
        """
        return a * b
    
    def divide(self, a, b):
        """
        除法运算
        
        Args:
            a: 被除数
            b: 除数
            
        Returns:
            float: 商
            
        Raises:
            ZeroDivisionError: 除数为0时抛出
        """
        if b == 0:
            raise ZeroDivisionError("除数不能为0")
        return a / b
    
    def calculate(self, a, operator, b):
        """
        根据运算符执行相应计算
        
        Args:
            a: 第一个操作数
            operator: 运算符 (+, -, *, /)
            b: 第二个操作数
            
        Returns:
            float: 计算结果
            
        Raises:
            ValueError: 运算符无效时抛出
            ZeroDivisionError: 除数为0时抛出
        """
        if operator == '+':
            return self.add(a, b)
        elif operator == '-':
            return self.subtract(a, b)
        elif operator == '*':
            return self.multiply(a, b)
        elif operator == '/':
            return self.divide(a, b)
        else:
            raise ValueError(f"无效的运算符: {operator}")
    
    def calculate_expression(self, expression):
        """
        计算表达式字符串
        
        Args:
            expression: 表达式字符串，如 "10 + 5"
            
        Returns:
            float: 计算结果
            
        Raises:
            ValueError: 表达式格式错误时抛出
        """
        try:
            # 简单的表达式解析（仅支持两个操作数）
            parts = expression.split()
            if len(parts) != 3:
                raise ValueError("表达式格式错误，应为: 数字 运算符 数字")
            
            a = float(parts[0])
            operator = parts[1]
            b = float(parts[2])
            
            return self.calculate(a, operator, b)
        except ValueError as e:
            raise ValueError(f"表达式解析错误: {e}")