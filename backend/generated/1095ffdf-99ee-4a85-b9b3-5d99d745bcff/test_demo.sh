#!/bin/bash

# ROS Demo Test Script
# This script helps test the ROS publisher/subscriber demo

echo "=========================================="
echo "ROS话题发布订阅Demo测试脚本"
echo "=========================================="

# 检查是否在catkin工作空间
if [ ! -d "src" ] && [ ! -d "../src" ]; then
    echo "错误：请在catkin工作空间目录下运行此脚本"
    echo "或者将脚本复制到catkin工作空间目录"
    exit 1
fi

# 检查ROS环境
if [ -z "$ROS_DISTRO" ]; then
    echo "警告：ROS环境未设置"
    echo "请先运行: source /opt/ros/noetic/setup.bash"
    echo "或对应ROS版本的环境设置"
    read -p "是否继续？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "1. 检查项目结构..."
if [ -d "ros_demo_package" ]; then
    echo "✓ 找到ros_demo_package目录"
else
    echo "✗ 未找到ros_demo_package目录"
    echo "请确保项目已复制到当前目录"
    exit 1
fi

echo ""
echo "2. 构建项目..."
echo "运行: catkin_make"
catkin_make

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    exit 1
fi

echo ""
echo "3. 设置环境..."
source devel/setup.bash
echo "✓ 环境设置完成"

echo ""
echo "4. 测试选项："
echo "   a) 完整测试（启动所有节点）"
echo "   b) 分别测试发布者和订阅者"
echo "   c) 检查话题和节点"
echo "   d) 退出"
echo ""

read -p "请选择测试选项 (a/b/c/d): " choice

case $choice in
    a|A)
        echo ""
        echo "启动完整测试..."
        echo "请在新终端中运行以下命令查看roscore状态："
        echo "  rostopic list"
        echo ""
        echo "启动demo（按Ctrl+C停止）..."
        roslaunch ros_demo_package demo.launch
        ;;
    b|B)
        echo ""
        echo "分别测试："
        echo "1) 先启动发布者（终端1）"
        echo "2) 再启动订阅者（终端2）"
        echo ""
        echo "请打开两个终端，分别运行："
        echo "终端1: rosrun ros_demo_package publisher_node"
        echo "终端2: rosrun ros_demo_package subscriber_node"
        ;;
    c|C)
        echo ""
        echo "检查ROS环境..."
        echo ""
        echo "1. 检查roscore是否运行："
        if pgrep -x "roscore" > /dev/null; then
            echo "✓ roscore正在运行"
        else
            echo "✗ rocore未运行"
            echo "请先运行: roscore &"
        fi
        
        echo ""
        echo "2. 检查包是否可用："
        rospack find ros_demo_package
        
        echo ""
        echo "3. 检查消息是否生成："
        rosmsg show ros_demo_package/DemoMessage
        
        echo ""
        echo "4. 检查节点是否可执行："
        if [ -f "devel/lib/ros_demo_package/publisher_node" ]; then
            echo "✓ publisher_node可执行文件存在"
        else
            echo "✗ publisher_node未找到"
        fi
        
        if [ -f "devel/lib/ros_demo_package/subscriber_node" ]; then
            echo "✓ subscriber_node可执行文件存在"
        else
            echo "✗ subscriber_node未找到"
        fi
        ;;
    d|D)
        echo "退出测试"
        exit 0
        ;;
    *)
        echo "无效选项"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
echo "测试完成"
echo "=========================================="