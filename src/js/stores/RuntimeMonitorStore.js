import {EventEmitter} from 'events';
import dispatcher from '../dispatcher';

import Immutable from 'immutable';

class RuntimeMonitorStore extends EventEmitter {
  constructor() {
    super();

    this.state = Immutable.fromJS(RuntimeMonitorStore.defaultState);
  }

  getState() {
    return this.state;
  }

  handleActions(action) {
    switch (action.type) {
      case 'DIAGNOSTIC_ITEMS': {
        // this.state = this.state.set(
        //   'diagnosticItems',
        //   Immutable.fromJS(action.diagnosticItems)
        // );

        let diagnosticItemMap = {};
        action.diagnosticItems.forEach(diagnosticItem => {
          diagnosticItemMap[diagnosticItem.name] = diagnosticItem;
        });

        this.state = this.state.set(
          'diagnosticItems',
          this.state.get('diagnosticItems').mergeDeep(diagnosticItemMap)
        );

        this.emit('change');
        break;
      }
      default:
      // Do nothing
    }
  }
}

RuntimeMonitorStore.defaultState = {
  diagnosticItems: {}
};

const runtimeMonitorStore = new RuntimeMonitorStore();
dispatcher.register(
  runtimeMonitorStore.handleActions.bind(runtimeMonitorStore)
);

export default runtimeMonitorStore;
