# ROS话题发布订阅Demo程序

一个简单的ROS1（Noetic）C++程序，演示话题发布者和订阅者的基本用法。

## 项目结构

```
ros_demo_package/
├── CMakeLists.txt          # 构建配置文件
├── package.xml            # ROS包配置文件
├── src/
│   ├── publisher_node.cpp  # 发布者节点
│   └── subscriber_node.cpp # 订阅者节点
├── msg/
│   └── DemoMessage.msg    # 自定义消息定义
├── launch/
│   ├── demo.launch        # 同时启动发布者和订阅者
│   └── separate.launch    # 分别启动节点
└── README.md              # 本文档
```

## 功能说明

### 发布者节点 (publisher_node)
- 节点名称：`demo_publisher`
- 发布话题：`/demo_topic`
- 消息类型：`ros_demo_package/DemoMessage`
- 发布频率：1Hz（每秒1条消息）
- 消息内容：包含ID、内容和时间戳

### 订阅者节点 (subscriber_node)
- 节点名称：`demo_subscriber`
- 订阅话题：`/demo_topic`
- 消息类型：`ros_demo_package/DemoMessage`
- 功能：接收并显示消息，计算消息延迟

### 自定义消息 (DemoMessage)
```msg
uint32 id          # 消息序列号
string content     # 消息内容
time timestamp     # 消息时间戳
```

## 快速开始

### 前提条件
- Ubuntu 20.04
- ROS Noetic（已安装并配置）
- catkin工作空间已创建

### 1. 复制项目到工作空间
```bash
cd ~/catkin_ws/src
# 将ros_demo_package文件夹复制到此处
```

### 2. 构建项目
```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash
```

### 3. 运行Demo

#### 方法一：使用启动文件（推荐）
```bash
# 启动roscore（如果未运行）
roscore &

# 在新终端中运行demo
roslaunch ros_demo_package demo.launch
```

#### 方法二：分别运行节点
```bash
# 终端1：启动发布者
rosrun ros_demo_package publisher_node

# 终端2：启动订阅者
rosrun ros_demo_package subscriber_node
```

## 预期输出

### 发布者输出
```
[ INFO] [时间戳]: Demo Publisher started. Publishing messages to /demo_topic at 1Hz
[ INFO] [时间戳]: Published: [ID: 0] [Content: Hello ROS! Message #0] [Time: 1234567890.123456]
[ INFO] [时间戳]: Published: [ID: 1] [Content: Hello ROS! Message #1] [Time: 1234567891.123456]
...
```

### 订阅者输出
```
[ INFO] [时间戳]: Demo Subscriber started. Listening to /demo_topic
[ INFO] [时间戳]: Press Ctrl+C to exit
[ INFO] [时间戳]: Received: [ID: 0] [Content: Hello ROS! Message #0] [Age: 0.001 seconds]
[ INFO] [时间戳]: Received: [ID: 1] [Content: Hello ROS! Message #1] [Age: 0.002 seconds]
...
```

## 测试和验证

### 1. 检查话题列表
```bash
rostopic list
# 应该能看到 /demo_topic
```

### 2. 查看话题信息
```bash
rostopic info /demo_topic
# 显示发布者和订阅者信息
```

### 3. 手动查看消息
```bash
rostopic echo /demo_topic
# 实时显示话题上的消息
```

### 4. 查看节点图
```bash
rqt_graph
# 图形化显示节点和话题关系
```

## 自定义修改

### 修改发布频率
在 `src/publisher_node.cpp` 中修改：
```cpp
ros::Rate loop_rate(1);  // 1Hz，修改为其他值如10表示10Hz
```

### 修改话题名称
在两个节点的代码中修改话题名称：
```cpp
// 发布者
ros::Publisher pub = nh.advertise<ros_demo_package::DemoMessage>("demo_topic", 10);

// 订阅者
ros::Subscriber sub = nh.subscribe("demo_topic", 10, messageCallback);
```

### 添加更多消息字段
在 `msg/DemoMessage.msg` 中添加字段，然后重新构建：
```msg
uint32 id
string content
time timestamp
float32 priority  # 新增字段
```

## 故障排除

### 1. 构建错误
```bash
# 清理并重新构建
cd ~/catkin_ws
rm -rf build devel
catkin_make
```

### 2. 找不到包
```bash
# 重新source环境
source ~/catkin_ws/devel/setup.bash
```

### 3. 消息未生成
```bash
# 确保在CMakeLists.txt中正确配置了消息生成
# 重新构建
catkin_make
```

### 4. 节点无法通信
```bash
# 检查roscore是否运行
ps aux | grep roscore

# 检查话题是否存在
rostopic list
```

## 扩展功能建议

1. **添加参数配置**：使用ROS参数服务器配置发布频率
2. **添加服务调用**：实现节点间的服务通信
3. **添加动作服务器**：实现长时间运行的任务
4. **添加TF变换**：演示坐标变换
5. **添加RViz可视化**：可视化消息数据

## 许可证

MIT License