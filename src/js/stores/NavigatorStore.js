import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

import Pose from '../ros/msg/Pose';

import Immutable from 'immutable';

class NavigatorStore extends EventEmitter {
  constructor() {
    super();

    this.state = Immutable.fromJS(NavigatorStore.defaultState);
  }

  handleActions(action) {
    switch(action.type) {
      case "ROBOT_POSE": {
        this.state = this.state.set('robotPoseStamped', Immutable.fromJS(action.poseStamped.pose));
        this.emit("change");
        break;
      }
      default:
        // Do nothing
    }
  }

  getState() {
    return this.state;
  }

}

NavigatorStore.defaultState = {
  robotPose: Pose,
}

const navigatorStore = new NavigatorStore();
dispatcher.register(navigatorStore.handleActions.bind(navigatorStore));

export default navigatorStore;
