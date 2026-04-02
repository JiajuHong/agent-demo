# 软件设计文档

## 1. 系统架构

### 1.1 整体架构
```
[发布者节点] --(消息)--> [ROS话题] --(消息)--> [订阅者节点]
```

技术栈：
- 操作系统：Ubuntu 20.04
- ROS版本：ROS Noetic
- 编程语言：C++11
- 构建系统：catkin_make
- 消息类型：std_msgs/String（标准消息）+ 自定义消息

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| demo_publisher | 发布者节点实现 | ROS C++客户端库 |
| demo_subscriber | 订阅者节点实现 | ROS C++客户端库 |
| msg | 自定义消息定义 | ROS消息生成器 |
| launch | 启动文件配置 | ROS启动系统 |

### 1.3 项目目录结构

```
ros_demo_package/
├── CMakeLists.txt
├── package.xml
├── include/
│   └── ros_demo_package/
├── src/
│   ├── publisher_node.cpp
│   └── subscriber_node.cpp
├── msg/
│   └── DemoMessage.msg
├── launch/
│   ├── demo.launch
│   └── separate.launch
└── README.md
```

## 2. API 设计

### 2.1 ROS节点接口

#### 2.1.1 发布者节点接口

**节点名称**: `demo_publisher`

**发布话题**: `/demo_topic`

**消息类型**: `ros_demo_package::DemoMessage`

**发布频率**: 1Hz

#### 2.1.2 订阅者节点接口

**节点名称**: `demo_subscriber`

**订阅话题**: `/demo_topic`

**消息类型**: `ros_demo_package::DemoMessage`

**回调函数**: `messageCallback`

## 3. 数据库设计

### 3.1 消息结构设计

#### 消息名：`DemoMessage`

消息定义：
```
uint32 id
string content
time timestamp
```

字段说明：
- `id`: 消息序列号，自增
- `content`: 消息内容，字符串格式
- `timestamp`: 消息时间戳，ROS时间类型

## 4. 核心模块设计

### 4.1 发布者节点（publisher_node.cpp）

**职责**：
- 初始化ROS节点
- 创建话题发布者
- 定期生成并发布消息
- 处理ROS关闭信号

**核心函数**：
- `main()`: 程序入口，初始化节点和发布者
- `publishMessage()`: 生成并发布消息

**流程**：
```
1. 初始化ROS节点
2. 创建发布者对象
3. 设置发布频率
4. 循环：
   a. 创建消息对象
   b. 填充消息内容
   c. 发布消息
   d. 休眠等待下一个周期
5. 处理ROS关闭
```

### 4.2 订阅者节点（subscriber_node.cpp）

**职责**：
- 初始化ROS节点
- 创建话题订阅者
- 注册消息回调函数
- 处理接收到的消息

**核心函数**：
- `main()`: 程序入口，初始化节点和订阅者
- `messageCallback()`: 消息接收回调函数

**流程**：
```
1. 初始化ROS节点
2. 创建订阅者对象
3. 注册回调函数
4. 进入ROS循环等待消息
5. 在回调函数中处理接收到的消息
```

### 4.3 自定义消息（DemoMessage.msg）

**职责**：
- 定义自定义消息结构
- 提供消息序列化/反序列化接口

**生成的文件**：
- `DemoMessage.h`: C++头文件
- `DemoMessage.cpp`: C++实现文件

## 5. 启动文件设计

### 5.1 demo.launch
同时启动发布者和订阅者节点

### 5.2 separate.launch
分别启动发布者和订阅者节点（用于分布式测试）

## 6. 构建配置

### 6.1 package.xml
定义ROS包元数据、依赖和构建配置

### 6.2 CMakeLists.txt
配置C++编译选项、依赖库和可执行文件生成