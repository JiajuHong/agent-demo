"""
输入处理模块 - 处理用户输入和验证
"""


class InputHandler:
    """输入处理器类"""
    
    VALID_OPERATORS = ['+', '-', '*', '/']
    YES_CHOICES = ['y', 'yes', '是', '1']
    NO_CHOICES = ['n', 'no', '否', '0']
    
    def get_number(self, prompt):
        """
        获取有效的数字输入
        
        Args:
            prompt: 提示信息
            
        Returns:
            float: 有效的数字
        """
        while True:
            try:
                user_input = input(prompt).strip()
                if not user_input:
                    print("输入不能为空，请重新输入")
                    continue
                    
                # 尝试转换为浮点数
                number = float(user_input)
                return number
            except ValueError:
                print(f"错误: '{user_input}' 不是有效的数字，请重新输入")
    
    def get_operator(self, prompt):
        """
        获取有效的运算符输入
        
        Args:
            prompt: 提示信息
            
        Returns:
            str: 有效的运算符
        """
        while True:
            user_input = input(prompt).strip()
            
            if self.validate_operator(user_input):
                return user_input
            else:
                print(f"错误: '{user_input}' 不是有效的运算符")
                print(f"有效的运算符: {', '.join(self.VALID_OPERATORS)}")
    
    def get_yes_no(self, prompt):
        """
        获取是/否选择
        
        Args:
            prompt: 提示信息
            
        Returns:
            bool: True 表示是，False 表示否
        """
        while True:
            user_input = input(prompt).strip().lower()
            
            if user_input in self.YES_CHOICES:
                return True
            elif user_input in self.NO_CHOICES:
                return False
            else:
                print(f"错误: 请输入 'y' 或 'n' (或 '是'/'否')")
    
    def validate_number(self, input_str):
        """
        验证输入是否为有效数字
        
        Args:
            input_str: 输入字符串
            
        Returns:
            bool: 是否为有效数字
        """
        try:
            float(input_str)
            return True
        except ValueError:
            return False
    
    def validate_operator(self, input_str):
        """
        验证输入是否为有效运算符
        
        Args:
            input_str: 输入字符串
            
        Returns:
            bool: 是否为有效运算符
        """
        return input_str in self.VALID_OPERATORS
    
    def validate_yes_no(self, input_str):
        """
        验证输入是否为有效的 yes/no 选择
        
        Args:
            input_str: 输入字符串
            
        Returns:
            bool: 是否为有效选择
        """
        lower_input = input_str.lower()
        return lower_input in self.YES_CHOICES or lower_input in self.NO_CHOICES