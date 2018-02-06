import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

import Immutable from 'immutable';

class CapabilitiesStore extends EventEmitter {
  constructor() {
    super();

    this.state = Immutable.fromJS(CapabilitiesStore.defaultState);

    this.capabilityBuffer = [];
  }

  handleActions(action) {
    switch(action.type) {
      case "RUNNING_CAPABILITIES": {
        this.state = this.state.set('running', Immutable.fromJS(action.running));
        this.emit("change");
        break;
      }
      case "AVAILABLE_CAPABILITIES": {
        this.state = this.state.set('available', Immutable.fromJS(action.available));
        this.emit("change");
        break;
      }
      default:
        // do nothing
    }
  }

  getState() {
    return this.state;
  }
}

// Default State
CapabilitiesStore.defaultState = {
  available: [],
  running: [],
}

const capabilitiesStore = new CapabilitiesStore();
dispatcher.register(capabilitiesStore.handleActions.bind(capabilitiesStore));

export default capabilitiesStore;
