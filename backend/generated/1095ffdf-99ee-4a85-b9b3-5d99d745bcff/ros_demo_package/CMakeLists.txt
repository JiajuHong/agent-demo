cmake_minimum_required(VERSION 3.0.2)
project(ros_demo_package)

# 查找catkin构建系统
find_package(catkin REQUIRED COMPONENTS
  roscpp
  std_msgs
  message_generation
)

# 添加消息定义
add_message_files(
  FILES
  DemoMessage.msg
)

# 生成消息
generate_messages(
  DEPENDENCIES
  std_msgs
)

# 设置catkin包信息
catkin_package(
  CATKIN_DEPENDS 
  message_runtime 
  roscpp 
  std_msgs
  INCLUDE_DIRS 
  include
  LIBRARIES 
  ros_demo_package
)

# 包含目录
include_directories(
  include
  ${catkin_INCLUDE_DIRS}
)

# 发布者节点
add_executable(publisher_node src/publisher_node.cpp)
target_link_libraries(publisher_node ${catkin_LIBRARIES})
add_dependencies(publisher_node ${${PROJECT_NAME}_EXPORTED_TARGETS} ${catkin_EXPORTED_TARGETS})

# 订阅者节点
add_executable(subscriber_node src/subscriber_node.cpp)
target_link_libraries(subscriber_node ${catkin_LIBRARIES})
add_dependencies(subscriber_node ${${PROJECT_NAME}_EXPORTED_TARGETS} ${catkin_EXPORTED_TARGETS})

# 安装目标
install(TARGETS publisher_node subscriber_node
  RUNTIME DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION}
)

# 安装启动文件
install(DIRECTORY launch/
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/launch
)

# 安装消息文件
install(FILES msg/DemoMessage.msg
  DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION}/msg
)