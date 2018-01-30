import { EventEmitter } from 'events';

import dispatcher from '../dispatcher';
import Status from '../ros/msg/Status';

class RappStarterStore extends EventEmitter {
  constructor() {
    super();
    this.rapps = [];
    this.rappStatus = {...Status};
    this.selectedRapp = "No rapps available";
  }

  getTestString() {
    return this.test_string;
  }

  getRapps() {
    return this.rapps;
  }

  getRappStatus() {
    return this.rappStatus;
  }

  getSelectedRapp() {
    return this.selectedRapp;
  }

  handleActions(action) {
    switch(action.type) {
      case "AVAILABLE_RAPPS": {
        this.rapps = action.available_rapps;

        if (this.selectedRapp === "No rapps available" && this.rapps.length > 0) {
          this.selectedRapp = this.rapps[0].name;
        }

        this.emit("change");
        break;
      }
      case "RAPP_STATUS": {
        this.rappStatus = action.rappStatus;
        this.emit("change");
        break;
      }
      case "SELECTED_RAPP": {
        this.selectedRapp =action.selectedRapp;
        this.emit("change");
        break;
      }
      default:
        // do notihing
    }
  }
}

const rappStarterStore = new RappStarterStore();
dispatcher.register(rappStarterStore.handleActions.bind(rappStarterStore));

export default rappStarterStore;
