import {EventEmitter} from 'events';

import dispatcher from '../dispatcher';
// import Status from '../ros/msg/Status';

import Immutable from 'immutable';

class RappStarterStore extends EventEmitter {
  constructor() {
    super();

    this.state = Immutable.fromJS(RappStarterStore.defaultState);
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

  getState() {
    return this.state;
  }

  handleActions(action) {
    switch (action.type) {
      case 'AVAILABLE_RAPPS': {
        action.availableRapps.forEach(rapp => {
          this.state = this.state.setIn(
            ['availableRapps', rapp.name],
            Immutable.fromJS(rapp)
          );
        });

        this.emit('change');
        break;
      }
      case 'SELECTED_RAPP': {
        this.selectedRapp = action.selectedRapp;
        this.emit('change');
        break;
      }
      case 'OPEN_LOADING_DIALOG': {
        this.state = this.state.set('loadingDialogOpen', true);
        this.state = this.state.set('loadingDialogMessage', action.message);
        this.emit('change');
        break;
      }
      case 'CLOSE_LOADING_DIALOG': {
        this.state = this.state.set('loadingDialogOpen', false);
        this.emit('change');
        break;
      }
      default:
      // do notihing
    }
  }
}

RappStarterStore.defaultState = {
  availableRapps: {},
  loadingDialogOpen: false,
  loadingDialogMessage: ''
};

const rappStarterStore = new RappStarterStore();
dispatcher.register(rappStarterStore.handleActions.bind(rappStarterStore));

export default rappStarterStore;
