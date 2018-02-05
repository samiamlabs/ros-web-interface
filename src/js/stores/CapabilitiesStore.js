import { EventEmitter } from 'events';
import dispatcher from '../dispatcher';

import Immutable from 'immutable';

class CapabilitiesStore extends EventEmitter {
  constructor() {
    super();

    // this.state = Immutable.Map({capabilities: Immutable.List()});
    this.state = Immutable.fromJS(CapabilitiesStore.defaultState);

    this.capabilityBuffer = [];

  }

  handleActions(action) {
    switch(action.type) {
      case "CLEAR_CAPABILITY_BUFFER": {
        this.capabilityBuffer = [];
        break;
      }
      case "ADD_CAPABILITY_TO_BUFFER": {
        action.providers.forEach( (provider) => {
          this.capabilityBuffer.push({interface_name: action.interface_name, provider});
        });
        break;
      }
      case "SYNC_CAPABILITY_BUFFER": {
        this.state = this.state.set('available', Immutable.fromJS(this.capabilityBuffer));
        this.emit("change");
        break;
      }
      case "RUNNING_CAPABILITIES": {
        this.state = this.state.set('running', Immutable.fromJS(action.running));
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
