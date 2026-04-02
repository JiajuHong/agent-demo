# 软件设计文档

## 1. 系统架构

### 1.1 整体架构

系统采用ROS1标准架构，包含两个独立的节点通过ROS Master进行通信：

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Publisher     │────▶│    Topic        │────▶│   Subscriber    │
│   Node          │     │  /demo_topic    │     │   Node          │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ROS Master                               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

技术栈：
- **ROS版本**：ROS Noetic (ROS1)
- **编程语言**：C++11
- **消息类型**：std_msgs/String
- **构建系统**：catkin_make + CMake
- **开发环境**：Ubuntu 20.04

### 1.2 模块划分

| 模块名称 | 职责 | 依赖模块 |
|----------|------|----------|
| PublisherNode | 发布消息到话题 | ROS C++客户端库、std_msgs |
| SubscriberNode | 从话题接收消息 | ROS C++客户端库、std_msgs |
| DemoMessages | 定义消息格式 | std_msgs |
| LaunchSystem | 启动和管理节点 | roslaunch |

### 1.3 项目目录结构

```
ros_demo_package/
├── CMakeLists.txt
├── package.xml
├── launch/
│   └── demo.launch
├── src/
│   ├── publisher_node.cpp
│   └── subscriber_node.cpp
├── include/
│   └── ros_demo_package/
│       └── config.h
└── README.md
```

## 2. API 设计

### 2.1 接口规范

**ROS节点规范**：
- 节点命名：`publisher_node`, `subscriber_node`
- 话题名称：`/demo_topic`
- 消息类型：`std_msgs/String`
- 发布频率：10Hz (100ms间隔)

### 2.2 节点接口

#### 2.2.1 PublisherNode

**节点名称**：`publisher_node`

**功能**：定时发布消息到`/demo_topic`

**参数配置**：
| 参数名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| ~rate | double | 10.0 | 发布频率(Hz) |
| ~message | string | "Hello ROS!" | 发布的消息内容 |

**发布话题**：
- 话题：`/demo_topic`
- 类型：`std_msgs/String`
- 队列大小：10

#### 2.2.2 SubscriberNode

**节点名称**：`subscriber_node`

**功能**：订阅`/demo_topic`并打印接收到的消息

**订阅话题**：
- 话题：`/demo_topic`
- 类型：`std_msgs/String`
- 队列大小：10

**回调函数**：`messageCallback(const std_msgs::String::ConstPtr& msg)`

## 3. 数据库设计

本项目不涉及数据库，使用ROS内置的消息传递机制。

### 3.1 消息结构设计

使用ROS标准消息类型`std_msgs/String`：

```cpp
// std_msgs/String 消息结构
std_msgs::String msg;
msg.data = "Hello ROS!";  // 字符串数据
```

### 3.2 话题配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 话题名称 | /demo_topic | 演示话题 |
| 消息类型 | std_msgs/String | 字符串消息 |
| QoS策略 | 默认 | 可靠传输 |
| 队列大小 | 10 | 消息队列容量 |

## 4. 核心模块设计

### 4.1 PublisherNode模块

**职责**：创建发布者节点，定时发布消息

**接口**：
- `PublisherNode(ros::NodeHandle nh)` - 构造函数
- `void publishMessage()` - 发布消息
- `void run()` - 主循环

**流程**：
```
1. 初始化ROS节点
2. 创建发布者对象
3. 设置发布频率
4. 循环执行：
   - 创建消息
   - 发布消息
   - 睡眠等待下一个周期
```

### 4.2 SubscriberNode模块

**职责**：创建订阅者节点，接收并处理消息

**接口**：
- `SubscriberNode(ros::NodeHandle nh)` - 构造函数
- `void messageCallback(const std_msgs::String::ConstPtr& msg)` - 消息回调函数
- `void run()` - 主循环

**流程**：
```
1. 初始化ROS节点
2. 创建订阅者对象
3. 注册回调函数
4. 进入ROS自旋循环
```

### 4.3 配置文件设计

#### package.xml
```xml
<?xml version="1.0"?>
<package format="2">
  <name>ros_demo_package</name>
  <version>0.1.0</version>
  <description>A simple ROS publisher-subscriber demo</description>
  <maintainer email="user@example.com">User</maintainer>
  <license>BSD</license>
  <buildtool_depend>catkin</buildtool_depend>
  <build_depend>roscpp</build_depend>
  <build_depend>std_msgs</build_depend>
  <exec_depend>roscpp</exec_depend>
  <exec_depend>std_msgs</exec_depend>
</package>
```

#### CMakeLists.txt 关键配置
```cmake
find_package(catkin REQUIRED COMPONENTS
  roscpp
  std_msgs
)

catkin_package(
  INCLUDE_DIRS include
  LIBRARIES ros_demo_package
  CATKIN_DEPENDS roscpp std_msgs
)

add_executable(publisher_node src/publisher_node.cpp)
target_link_libraries(publisher_node ${catkin_LIBRARIES})

add_executable(subscriber_node src/subscriber_node.cpp)
target_link_libraries(subscriber_node ${catkin_LIBRARIES})
```

## 5. 部署设计

### 5.1 构建流程
```
cd ~/catkin_ws/src
git clone [repository]
cd ~/catkin_ws
catkin_make
source devel/setup.bash
```

### 5.2 运行流程

**方式一：单独运行**
```bash
# 终端1：启动ROS Master
roscore

# 终端2：运行发布者
rosrun ros_demo_package publisher_node

# 终端3：运行订阅者
rosrun ros_demo_package subscriber_node
```

**方式二：使用launch文件**
```bash
roslaunch ros_demo_package demo.launch
```

### 5.3 监控工具
- `rostopic echo /demo_topic` - 查看话题消息
- `rqt_graph` - 查看节点拓扑图
- `rosnode list` - 查看运行中的节点
- `rostopic list` - 查看所有话题

## 6. 错误处理设计

### 6.1 常见错误及处理

| 错误类型 | 检测方法 | 处理策略 |
|----------|----------|----------|
| ROS Master未启动 | ros::ok()返回false | 输出错误信息并退出 |
| 话题连接失败 | 发布者/订阅者初始化失败 | 重试机制，最多3次 |
| 消息发送失败 | publish()返回false | 记录日志，继续下一次发送 |
| 参数解析失败 | 参数不存在或格式错误 | 使用默认值并输出警告 |

### 6.2 日志设计
- INFO级别：节点启动、消息发布/接收
- WARN级别：参数使用默认值、连接重试
- ERROR级别：初始化失败、无法恢复的错误
- DEBUG级别：详细的消息处理过程