# ROS Demo 安装和配置指南

## 系统要求

### 硬件要求
- 任何支持Ubuntu 20.04的x86_64计算机
- 至少2GB RAM
- 至少10GB可用磁盘空间

### 软件要求
- Ubuntu 20.04 LTS
- ROS Noetic（完整桌面版推荐）

## 安装步骤

### 步骤1：安装Ubuntu 20.04
如果尚未安装Ubuntu，请从官网下载并安装：
https://releases.ubuntu.com/20.04/

### 步骤2：安装ROS Noetic

#### 2.1 设置软件源
```bash
sudo sh -c 'echo "deb http://packages.ros.org/ros/ubuntu $(lsb_release -sc) main" > /etc/apt/sources.list.d/ros-latest.list'
```

#### 2.2 设置密钥
```bash
sudo apt install curl
curl -s https://raw.githubusercontent.com/ros/rosdistro/master/ros.asc | sudo apt-key add -
```

#### 2.3 安装ROS
```bash
sudo apt update
sudo apt install ros-noetic-desktop-full
```

#### 2.4 设置环境变量
```bash
echo "source /opt/ros/noetic/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

#### 2.5 安装依赖
```bash
sudo apt install python3-rosdep python3-rosinstall python3-rosinstall-generator python3-wstool build-essential
sudo rosdep init
rosdep update
```

### 步骤3：创建catkin工作空间

#### 3.1 创建工作空间目录
```bash
mkdir -p ~/catkin_ws/src
cd ~/catkin_ws
```

#### 3.2 初始化工作空间
```bash
catkin_make
```

#### 3.3 设置环境变量
```bash
echo "source ~/catkin_ws/devel/setup.bash" >> ~/.bashrc
source ~/.bashrc
```

### 步骤4：安装Demo项目

#### 4.1 复制项目到工作空间
```bash
cd ~/catkin_ws/src
# 将ros_demo_package文件夹复制到此目录
```

#### 4.2 构建项目
```bash
cd ~/catkin_ws
catkin_make
```

#### 4.3 验证安装
```bash
source devel/setup.bash
rospack find ros_demo_package
# 应该输出：/home/你的用户名/catkin_ws/src/ros_demo_package
```

## 快速验证

### 验证1：检查ROS安装
```bash
# 打开新终端
printenv | grep ROS
# 应该看到ROS环境变量

roscore
# 按Ctrl+C停止
```

### 验证2：检查Demo包
```bash
cd ~/catkin_ws
source devel/setup.bash

# 检查包是否存在
rospack find ros_demo_package

# 检查消息是否生成
rosmsg show ros_demo_package/DemoMessage
```

### 验证3：运行测试脚本
```bash
cd ~/catkin_ws
chmod +x test_demo.sh
./test_demo.sh
```

## 常见问题解决

### 问题1：catkin_make失败
**错误信息**：CMake Error at ...

**解决方案**：
```bash
cd ~/catkin_ws
rm -rf build devel
catkin_make clean
catkin_make
```

### 问题2：找不到ROS命令
**错误信息**：Command 'roscore' not found

**解决方案**：
```bash
source /opt/ros/noetic/setup.bash
source ~/catkin_ws/devel/setup.bash
```

### 问题3：消息未生成
**错误信息**：Cannot locate message...

**解决方案**：
```bash
cd ~/catkin_ws
catkin_make
source devel/setup.bash
```

### 问题4：权限问题
**错误信息**：Permission denied

**解决方案**：
```bash
chmod +x ~/catkin_ws/devel/lib/ros_demo_package/*
```

## 卸载指南

### 完全卸载ROS
```bash
sudo apt remove --purge ros-noetic-*
sudo apt autoremove
```

### 删除工作空间
```bash
rm -rf ~/catkin_ws
```

### 清理环境变量
编辑 `~/.bashrc`，删除以下行：
```bash
source /opt/ros/noetic/setup.bash
source ~/catkin_ws/devel/setup.bash
```

## 下一步

### 学习资源
1. **ROS官方教程**：http://wiki.ros.org/ROS/Tutorials
2. **C++ ROS编程**：http://wiki.ros.org/roscpp/Overview
3. **话题通信**：http://wiki.ros.org/ROS/Tutorials/WritingPublisherSubscriber%28c%2B%2B%29

### 扩展练习
1. 修改发布频率为10Hz
2. 添加第二个订阅者节点
3. 创建新的自定义消息类型
4. 添加ROS参数配置
5. 使用rqt_graph可视化节点图

## 技术支持

如果遇到问题，请：
1. 检查ROS版本：`echo $ROS_DISTRO`
2. 检查环境变量：`printenv | grep ROS`
3. 查看构建日志：`catkin_make` 的输出
4. 参考ROS问答：https://answers.ros.org/

## 许可证

本项目使用MIT许可证。ROS是Open Robotics的商标。