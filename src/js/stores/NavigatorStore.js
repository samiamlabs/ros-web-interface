import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';

import Pose from '../ros/msg/Pose';
import OccupancyGrid from '../ros/msg/OccupancyGrid';

import Immutable from 'immutable';

class NavigatorStore extends EventEmitter {
  constructor() {
    super();

    this.state = Immutable.fromJS(NavigatorStore.defaultState);
  }

  handleActions(action) {
    switch (action.type) {
      case 'ROBOT_POSE': {
        this.state = this.state.set('robotPose', Immutable.fromJS(action.pose));
        this.emit('change');
        break;
      }
      case 'MAP': {
        // NOTE: Coverting mapData to immutable takes to long
        this.state = this.state.set('mapData', action.mapData);
        this.state = this.state.set(
          'mapInfo',
          Immutable.fromJS(action.mapInfo)
        );
        this.emit('change');
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
  mapInfo: OccupancyGrid.info,
  mapData: []
};

const navigatorStore = new NavigatorStore();
dispatcher.register(navigatorStore.handleActions.bind(navigatorStore));

export default navigatorStore;
