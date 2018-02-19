import dispatcher from '../dispatcher';

class RappStarterActions {
  connect(rosClient) {
    this.rosClient = rosClient;

    this.rappListListener = this.rosClient.topic.subscribe(
      '/rocon/app_manager/rapp_list',
      'rocon_app_manager_msgs/RappList',
      message => {
        dispatcher.dispatch({
          type: 'AVAILABLE_RAPPS',
          availableRapps: message.available_rapps
        });
      }
    );
  }

  disconnect = () => {
    if (typeof this.rosClient !== 'undefined') {
      this.rappListListener.dispose();
    }
  };

  // handleRappMenuChange = (event, index, value) => {
  //   dispatcher.dispatch({type: 'SELECTED_RAPP', selectedRapp: value});
  // };

  startRapp = name => {
    dispatcher.dispatch({
      type: 'OPEN_LOADING_DIALOG',
      message: 'Starting Robot App'
    });
    this.rosClient.service
      .call(
        '/rocon/app_manager/start_rapp',
        'rocon_app_manager_msgs/StartRapp',
        {
          name: name
        }
      )
      .then(result => {
        if (result.started === false) {
          // Stop running rapp
          this.rosClient.service
            .call(
              '/rocon/app_manager/stop_rapp',
              'rocon_app_manager_msgs/StopRapp',
              {}
            )
            .then(result => {
              // Start selected rapp
              this.rosClient.service
                .call(
                  '/rocon/app_manager/start_rapp',
                  'rocon_app_manager_msgs/StartRapp',
                  {
                    name: name
                  }
                )
                .then(result => {
                  dispatcher.dispatch({type: 'CLOSE_LOADING_DIALOG'});
                });
            });
        } else {
          dispatcher.dispatch({type: 'CLOSE_LOADING_DIALOG'});
        }
      });
  };

  stopRapp = () => {
    dispatcher.dispatch({
      type: 'OPEN_LOADING_DIALOG',
      message: 'Stopping Robot App'
    });
    this.rosClient.service
      .call(
        '/rocon/app_manager/stop_rapp',
        'rocon_app_manager_msgs/StopRapp',
        {}
      )
      .then(result => {
        dispatcher.dispatch({type: 'CLOSE_LOADING_DIALOG'});
        // Do nothing
      });
  };

  closeLoadingDialog = () => {
    dispatcher.dispatch({type: 'CLOSE_LOADING_DIALOG'});
  };
}

const rappStarterActions = new RappStarterActions();
export default rappStarterActions;
