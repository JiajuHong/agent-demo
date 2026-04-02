/**
 * @file publisher_node.cpp
 * @brief ROS publisher node for demo
 * 
 * This node publishes messages to the /demo_topic at 1Hz frequency.
 * Each message contains an ID, content, and timestamp.
 */

#include <ros/ros.h>
#include <ros_demo_package/DemoMessage.h>
#include <sstream>
#include <string>

int main(int argc, char **argv)
{
    // Initialize ROS node
    ros::init(argc, argv, "demo_publisher");
    ros::NodeHandle nh;
    
    // Create publisher
    // Topic: /demo_topic
    // Message type: DemoMessage
    // Queue size: 10 messages
    ros::Publisher pub = nh.advertise<ros_demo_package::DemoMessage>("demo_topic", 10);
    
    // Set publish rate (1Hz = 1 message per second)
    ros::Rate loop_rate(1);
    
    // Message counter
    int message_count = 0;
    
    ROS_INFO("Demo Publisher started. Publishing messages to /demo_topic at 1Hz");
    
    // Main loop
    while (ros::ok())
    {
        // Create message object
        ros_demo_package::DemoMessage msg;
        
        // Fill message fields
        msg.id = message_count;
        
        std::stringstream ss;
        ss << "Hello ROS! Message #" << message_count;
        msg.content = ss.str();
        
        msg.timestamp = ros::Time::now();
        
        // Publish the message
        pub.publish(msg);
        
        // Log the published message
        ROS_INFO("Published: [ID: %d] [Content: %s] [Time: %.6f]", 
                 msg.id, 
                 msg.content.c_str(), 
                 msg.timestamp.toSec());
        
        // Increment counter
        message_count++;
        
        // Process ROS callbacks and sleep
        ros::spinOnce();
        loop_rate.sleep();
    }
    
    ROS_INFO("Demo Publisher shutting down");
    return 0;
}