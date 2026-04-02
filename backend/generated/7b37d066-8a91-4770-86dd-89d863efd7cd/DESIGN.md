# 软件设计文档

## 1. 系统架构

### 1.1 整体架构
```
[用户输入层] → [输入验证层] → [计算引擎层] → [结果显示层]
      ↓              ↓              ↓             ↓
   用户界面      输入处理       业务逻辑      输出格式化
```

技术栈：
- 语言：Python 3.6+
- 数据库：无需数据库，使用内存存储
- 缓存：无需缓存
- 依赖：无外部依赖

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| Calculator | 主程序入口，控制流程 | InputHandler, CalculatorEngine, OutputFormatter |
| InputHandler | 处理用户输入，验证数据 | - |
| CalculatorEngine | 执行数学计算 | - |
| OutputFormatter | 格式化输出结果 | - |

### 1.3 项目目录结构

```
calculator/
├── src/
│   ├── main.py              # 主程序入口
│   ├── calculator.py        # 计算器核心类
│   ├── input_handler.py     # 输入处理模块
│   ├── calculator_engine.py # 计算引擎模块
│   └── output_formatter.py  # 输出格式化模块
├── tests/
│   ├── test_calculator.py
│   ├── test_input_handler.py
│   └── test_calculator_engine.py
├── requirements.txt         # 依赖文件（空）
├── README.md               # 项目说明
└── .gitignore              # Git忽略文件
```

## 2. API 设计

### 2.1 接口规范

**说明**：由于这是命令行程序，没有HTTP API，这里定义的是程序内部的函数接口。

### 2.2 接口列表

#### 2.2.1 Calculator 类

**类名**：`Calculator`

方法列表：
1. `run()` - 启动计算器主循环
2. `calculate(num1, operator, num2)` - 执行单次计算
3. `get_last_result()` - 获取上一次计算结果

#### 2.2.2 InputHandler 类

**类名**：`InputHandler`

方法列表：
1. `get_number(prompt)` - 获取有效的数字输入
2. `get_operator(prompt)` - 获取有效的运算符输入
3. `get_yes_no(prompt)` - 获取是/否选择
4. `validate_number(input_str)` - 验证数字输入
5. `validate_operator(input_str)` - 验证运算符输入

#### 2.2.3 CalculatorEngine 类

**类名**：`CalculatorEngine`

方法列表：
1. `add(a, b)` - 加法运算
2. `subtract(a, b)` - 减法运算
3. `multiply(a, b)` - 乘法运算
4. `divide(a, b)` - 除法运算
5. `calculate(a, operator, b)` - 根据运算符调用相应方法

#### 2.2.4 OutputFormatter 类

**类名**：`OutputFormatter`

方法列表：
1. `show_welcome()` - 显示欢迎信息
2. `show_result(expression, result)` - 显示计算结果
3. `show_error(message)` - 显示错误信息
4. `show_goodbye()` - 显示退出信息

## 3. 数据库设计

### 3.1 数据结构

由于是简单的命令行程序，不需要数据库。使用内存数据结构：

```python
# 计算历史记录
calculation_history = [
    {
        "expression": "10 + 5",
        "result": 15,
        "timestamp": "2024-01-15 10:30:00"
    }
]

# 当前计算状态
current_state = {
    "last_result": None,
    "is_running": True
}
```

## 4. 核心模块设计

### 4.1 Calculator 模块

**职责**：控制计算器的整体流程

**流程**：
```
开始
↓
显示欢迎信息
↓
循环开始
├─ 获取第一个数字
├─ 获取运算符
├─ 获取第二个数字
├─ 执行计算
├─ 显示结果
├─ 询问是否继续
└─ 根据用户选择继续或退出
↓
显示退出信息
结束
```

### 4.2 InputHandler 模块

**职责**：处理所有用户输入，确保输入有效性

**接口**：
- `get_number(prompt) -> float`: 获取并验证数字输入
- `get_operator(prompt) -> str`: 获取并验证运算符
- `get_yes_no(prompt) -> bool`: 获取是/否选择

**流程**：
```
获取输入
↓
验证输入
├─ 有效 → 返回处理后的值
└─ 无效 → 显示错误，重新获取
```

### 4.3 CalculatorEngine 模块

**职责**：执行数学计算

**接口**：
- `calculate(a, operator, b) -> float`: 根据运算符执行相应计算

**支持的运算符**：
- `+`: 加法
- `-`: 减法
- `*`: 乘法
- `/`: 除法（需检查除数不为0）

### 4.4 OutputFormatter 模块

**职责**：格式化所有输出信息

**接口**：
- `show_result(expression, result)`: 显示格式化的计算结果
- `show_error(message)`: 显示格式化的错误信息

## 5. 错误处理设计

### 5.1 输入错误
- 非数字输入：提示重新输入
- 无效运算符：提示重新选择
- 除零错误：提示数学错误

### 5.2 程序错误
- 使用 try-except 捕获异常
- 提供友好的错误信息
- 程序不会因输入错误而崩溃

## 6. 测试设计

### 6.1 单元测试
- 测试 CalculatorEngine 的计算功能
- 测试 InputHandler 的验证功能
- 测试边界情况和错误情况

### 6.2 集成测试
- 测试完整的计算流程
- 测试连续计算功能
- 测试错误处理流程