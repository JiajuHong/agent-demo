/**
 * @file subscriber_node.cpp
 * @brief ROS subscriber node for demo
 * 
 * This node subscribes to the /demo_topic and prints received messages.
 */

#include <ros/ros.h>
#include <ros_demo_package/DemoMessage.h>

/**
 * @brief Callback function for received messages
 * 
 * This function is called whenever a new message is received on the subscribed topic.
 * 
 * @param msg The received message
 */
void messageCallback(const ros_demo_package::DemoMessage::ConstPtr& msg)
{
    // Extract message data
    uint32_t id = msg->id;
    std::string content = msg->content;
    ros::Time timestamp = msg->timestamp;
    
    // Calculate message age (in seconds)
    ros::Time now = ros::Time::now();
    double age = (now - timestamp).toSec();
    
    // Print received message
    ROS_INFO("Received: [ID: %d] [Content: %s] [Age: %.3f seconds]", 
             id, 
             content.c_str(), 
             age);
}

int main(int argc, char **argv)
{
    // Initialize ROS node
    ros::init(argc, argv, "demo_subscriber");
    ros::NodeHandle nh;
    
    // Create subscriber
    // Topic: /demo_topic
    // Message type: DemoMessage
    // Queue size: 10 messages
    // Callback function: messageCallback
    ros::Subscriber sub = nh.subscribe("demo_topic", 10, messageCallback);
    
    ROS_INFO("Demo Subscriber started. Listening to /demo_topic");
    ROS_INFO("Press Ctrl+C to exit");
    
    // Keep the node running and process callbacks
    // ros::spin() will exit when ROS is shutdown (e.g., Ctrl+C)
    ros::spin();
    
    ROS_INFO("Demo Subscriber shutting down");
    return 0;
}