import dispatcher from '../dispatcher';

class RuntimeMonitorActions {
  connect = rosClient => {
    this.rosClient = rosClient;

    this.diagnosticsListener = this.rosClient.topic.subscribe(
      '/diagnostics',
      'diagnostic_msgs/DiagnosticArray',
      message => {
        dispatcher.dispatch({
          type: 'DIAGNOSTIC_ITEMS',
          diagnosticItems: message.status
        });
      }
    );
  };
}

const runtimeMonitorActions = new RuntimeMonitorActions();

export default runtimeMonitorActions;
