"""
计算引擎模块测试
"""

import unittest
from src.calculator_engine import CalculatorEngine


class TestCalculatorEngine(unittest.TestCase):
    """计算引擎测试类"""
    
    def setUp(self):
        """测试前准备"""
        self.calculator = CalculatorEngine()
    
    def test_add(self):
        """测试加法"""
        self.assertEqual(self.calculator.add(5, 3), 8)
        self.assertEqual(self.calculator.add(-5, 3), -2)
        self.assertEqual(self.calculator.add(5.5, 2.5), 8.0)
    
    def test_subtract(self):
        """测试减法"""
        self.assertEqual(self.calculator.subtract(10, 3), 7)
        self.assertEqual(self.calculator.subtract(3, 10), -7)
        self.assertEqual(self.calculator.subtract(5.5, 2.5), 3.0)
    
    def test_multiply(self):
        """测试乘法"""
        self.assertEqual(self.calculator.multiply(4, 3), 12)
        self.assertEqual(self.calculator.multiply(-4, 3), -12)
        self.assertEqual(self.calculator.multiply(4, 0), 0)
        self.assertEqual(self.calculator.multiply(2.5, 4), 10.0)
    
    def test_divide(self):
        """测试除法"""
        self.assertEqual(self.calculator.divide(10, 2), 5)
        self.assertEqual(self.calculator.divide(10, 4), 2.5)
        self.assertEqual(self.calculator.divide(-10, 2), -5)
    
    def test_divide_by_zero(self):
        """测试除零错误"""
        with self.assertRaises(ZeroDivisionError):
            self.calculator.divide(10, 0)
    
    def test_calculate_addition(self):
        """测试加法计算"""
        self.assertEqual(self.calculator.calculate(5, '+', 3), 8)
    
    def test_calculate_subtraction(self):
        """测试减法计算"""
        self.assertEqual(self.calculator.calculate(10, '-', 3), 7)
    
    def test_calculate_multiplication(self):
        """测试乘法计算"""
        self.assertEqual(self.calculator.calculate(4, '*', 3), 12)
    
    def test_calculate_division(self):
        """测试除法计算"""
        self.assertEqual(self.calculator.calculate(10, '/', 2), 5)
    
    def test_calculate_invalid_operator(self):
        """测试无效运算符"""
        with self.assertRaises(ValueError):
            self.calculator.calculate(10, '%', 2)
    
    def test_calculate_expression(self):
        """测试表达式计算"""
        self.assertEqual(self.calculator.calculate_expression("10 + 5"), 15)
        self.assertEqual(self.calculator.calculate_expression("10 - 5"), 5)
        self.assertEqual(self.calculator.calculate_expression("10 * 5"), 50)
        self.assertEqual(self.calculator.calculate_expression("10 / 5"), 2)
    
    def test_calculate_expression_invalid_format(self):
        """测试无效表达式格式"""
        with self.assertRaises(ValueError):
            self.calculator.calculate_expression("10 +")
        
        with self.assertRaises(ValueError):
            self.calculator.calculate_expression("10 + 5 + 2")
        
        with self.assertRaises(ValueError):
            self.calculator.calculate_expression("abc + def")


if __name__ == '__main__':
    unittest.main()