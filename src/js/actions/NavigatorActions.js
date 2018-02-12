import dispatcher from '../dispatcher';

export default class NavigatorActions {
  init = (rosClient) => {
    this.rosClient = rosClient;

    this.robotPoseListener = this.rosClient.topic.subscribe(
      '/robot_pose',
      'geometry_msgs/PoseStamped',
      (message) => {
        dispatcher.dispatch({type: "ROBOT_POSE", pose: message.pose});
    });

    // Throttle at 800ms
    this.mapListener = this.rosClient.topic.subscribe(
      '/map',
      'nav_msgs/OccupancyGrid',
      (message) => {
        dispatcher.dispatch({type: "MAP", mapInfo: message.info, mapData: message.data});
      },
      'png',
      800
    );
  }

  sendNavigationGoal = (pose) => {
    const header = {seq: 0, stamp: 0, frame_id: "map"}

    this.rosClient.topic.publish(
      '/move_base_simple/goal',
      'geometry_msgs/PoseStamped',
      {
        pose,
        header,
      }
    );

  }

  dispose = () => {
    this.robotPoseListener.dispose();
    this.mapListener.dispose();
  }
}
