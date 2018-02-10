import dispatcher from '../dispatcher';

export default class NavigatorActions {
  init = (rosClient) => {
    this.rosClient = rosClient;

    this.robotPoseListener = this.rosClient.topic.subscribe(
      '/robot_pose',
      'geometry_msgs/PoseStamped',
      (message) => {
        dispatcher.dispatch({type: "ROBOT_POSE", poseStamped: message});
    });
  }
}
