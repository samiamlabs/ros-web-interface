import ROSLIB from 'roslib'

export default class {
  constructor () {
    this.ros = new ROSLIB.Ros({
      url : 'ws://localhost:9090'
    })

    // Data
    var position = {x: 0, y: 0, z: 0};
    var orientation = {x: 0, y: 0, z: 0, w: 1};
    var pose = {position, orientation}
    this.robot_pose = {position, orientation};

    this.map_info = {width: 200, height: 200, origin: pose, resolution: 0.05};
    this.map_data = []
    this.map_changed = false

    // Connection callbacks
    this.ros.on('connection', function() {
      console.log('Connected to websocket server.');
    });

    this.ros.on('error', function(error) {
      console.log('Error connecting to websocket server: ', error);
    });

    this.ros.on('close', function() {
      console.log('Connection to websocket server closed.');
    });

    // ROS Listeners
    this.map_listener = new ROSLIB.Topic({
      ros : this.ros,
      name : '/map',
      messageType : 'nav_msgs/OccupancyGrid',
      compression: 'png'
    })

    this.map_listener.subscribe((message) => {
      this.map_info = message.info
      this.map_data = message.data
      this.map_changed = true
    })

    this.robot_pose_sub = new ROSLIB.Topic({
      ros : this.ros,
      name : '/robot_pose',
      messageType : 'geometry_msgs/PoseStamped'
    })


    this.robot_pose_sub.subscribe((message) => {
      this.robot_pose = message.pose
    })


    // ROS publishers

    this.mushroom_angle_pub = new ROSLIB.Topic({
      ros : this.ros,
      name : '/mushroom_position',
      messageType : 'std_msgs/Float32'
    })

    this.mushroom_angle_data = new ROSLIB.Message({
      data : 2.0
    })

    this.navigation_goal_pub = new ROSLIB.Topic({
      ros : this.ros,
      name : '/move_base_simple/goal',
      messageType : 'geometry_msgs/PoseStamped'
    })

    var header = {seq: 0, stamp: 0, frame_id: "map"}

    this.navigation_goal_msg = new ROSLIB.Message({
      pose: pose,
      header: header
    })

  }

  send_navigation_goal(x, y) {

    var xDelta =  x - this.robot_pose.position.x
    var yDelta =  y - this.robot_pose.position.y

    var thetaRadians  = Math.atan2(xDelta,yDelta);

    if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
      thetaRadians += (3 * Math.PI / 2);
    } else {
      thetaRadians -= (Math.PI/2);
    }

    var qz =  Math.sin(-thetaRadians/2.0);
    var qw =  Math.cos(-thetaRadians/2.0);

    var orientation = new ROSLIB.Quaternion({x:0, y:0, z:qz, w:qw});

    this.navigation_goal_msg.pose.orientation = orientation

    this.navigation_goal_msg.pose.position.x = x
    this.navigation_goal_msg.pose.position.y = y

    this.navigation_goal_pub.publish(this.navigation_goal_msg)
    this.mushroom_angle_pub.publish(this.mushroom_angle_data)
  }

  update ()  {
  }

}
