"""
输入处理模块测试
"""

import unittest
from unittest.mock import patch
from src.input_handler import InputHandler


class TestInputHandler(unittest.TestCase):
    """输入处理器测试类"""
    
    def setUp(self):
        """测试前准备"""
        self.handler = InputHandler()
    
    def test_validate_number_valid(self):
        """测试有效数字验证"""
        self.assertTrue(self.handler.validate_number("123"))
        self.assertTrue(self.handler.validate_number("123.45"))
        self.assertTrue(self.handler.validate_number("-123.45"))
        self.assertTrue(self.handler.validate_number("0"))
    
    def test_validate_number_invalid(self):
        """测试无效数字验证"""
        self.assertFalse(self.handler.validate_number("abc"))
        self.assertFalse(self.handler.validate_number("123abc"))
        self.assertFalse(self.handler.validate_number(""))
        self.assertFalse(self.handler.validate_number("  "))
    
    def test_validate_operator_valid(self):
        """测试有效运算符验证"""
        self.assertTrue(self.handler.validate_operator("+"))
        self.assertTrue(self.handler.validate_operator("-"))
        self.assertTrue(self.handler.validate_operator("*"))
        self.assertTrue(self.handler.validate_operator("/"))
    
    def test_validate_operator_invalid(self):
        """测试无效运算符验证"""
        self.assertFalse(self.handler.validate_operator("%"))
        self.assertFalse(self.handler.validate_operator("++"))
        self.assertFalse(self.handler.validate_operator(""))
        self.assertFalse(self.handler.validate_operator("add"))
    
    def test_validate_yes_no_valid(self):
        """测试有效是/否验证"""
        # 测试是
        self.assertTrue(self.handler.validate_yes_no("y"))
        self.assertTrue(self.handler.validate_yes_no("Y"))
        self.assertTrue(self.handler.validate_yes_no("yes"))
        self.assertTrue(self.handler.validate_yes_no("YES"))
        self.assertTrue(self.handler.validate_yes_no("是"))
        self.assertTrue(self.handler.validate_yes_no("1"))
        
        # 测试否
        self.assertTrue(self.handler.validate_yes_no("n"))
        self.assertTrue(self.handler.validate_yes_no("N"))
        self.assertTrue(self.handler.validate_yes_no("no"))
        self.assertTrue(self.handler.validate_yes_no("NO"))
        self.assertTrue(self.handler.validate_yes_no("否"))
        self.assertTrue(self.handler.validate_yes_no("0"))
    
    def test_validate_yes_no_invalid(self):
        """测试无效是/否验证"""
        self.assertFalse(self.handler.validate_yes_no("maybe"))
        self.assertFalse(self.handler.validate_yes_no(""))
        self.assertFalse(self.handler.validate_yes_no("2"))
        self.assertFalse(self.handler.validate_yes_no("yess"))
    
    @patch('builtins.input', side_effect=['abc', '123'])
    def test_get_number_with_invalid_then_valid(self, mock_input):
        """测试先输入无效再输入有效的数字"""
        result = self.handler.get_number("请输入数字: ")
        self.assertEqual(result, 123.0)
        self.assertEqual(mock_input.call_count, 2)
    
    @patch('builtins.input', side_effect=['123.45'])
    def test_get_number_valid(self, mock_input):
        """测试输入有效数字"""
        result = self.handler.get_number("请输入数字: ")
        self.assertEqual(result, 123.45)
    
    @patch('builtins.input', side_effect=['%', '+'])
    def test_get_operator_with_invalid_then_valid(self, mock_input):
        """测试先输入无效再输入有效的运算符"""
        result = self.handler.get_operator("请输入运算符: ")
        self.assertEqual(result, '+')
        self.assertEqual(mock_input.call_count, 2)
    
    @patch('builtins.input', side_effect=['*'])
    def test_get_operator_valid(self, mock_input):
        """测试输入有效运算符"""
        result = self.handler.get_operator("请输入运算符: ")
        self.assertEqual(result, '*')
    
    @patch('builtins.input', side_effect=['maybe', 'y'])
    def test_get_yes_no_with_invalid_then_valid(self, mock_input):
        """测试先输入无效再输入有效的选择"""
        result = self.handler.get_yes_no("是否继续? (y/n): ")
        self.assertTrue(result)
        self.assertEqual(mock_input.call_count, 2)
    
    @patch('builtins.input', side_effect=['n'])
    def test_get_yes_no_no(self, mock_input):
        """测试输入否"""
        result = self.handler.get_yes_no("是否继续? (y/n): ")
        self.assertFalse(result)
    
    @patch('builtins.input', side_effect=['是'])
    def test_get_yes_no_yes_chinese(self, mock_input):
        """测试输入中文的是"""
        result = self.handler.get_yes_no("是否继续? (y/n): ")
        self.assertTrue(result)


if __name__ == '__main__':
    unittest.main()