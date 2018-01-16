import { EventEmitter } from 'events';

import dispatcher from '../dispatcher';

class RappStarterStore extends EventEmitter {
  constructor() {
    super();
    this.test_string = "unchanged";
    this.rapps = [];
  }


  getTestString() {
    return this.test_string;
  }

  getRapps() {
    return this.rapps;
  }

  handleActions(action) {
    switch(action.type) {
      case "TEST": {
        this.test_string = action.available_rapps[0].name;
        this.rapps = action.available_rapps;
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
