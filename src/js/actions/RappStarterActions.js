import dispatcher from '../dispatcher';

export default class RappStarterActions {

  init(rosClient) {
    this.rosClient = rosClient;

    this.rappListListener = this.rosClient.topic.subscribe(
      '/rocon/app_manager/rapp_list',
      'rocon_app_manager_msgs/RappList',
      message => {
        dispatcher.dispatch({
          type: "AVAILABLE_RAPPS",
          available_rapps: message.available_rapps});
    });

    this.rappStatusListener = this.rosClient.topic.subscribe(
      '/rocon/app_manager/status',
      'rocon_app_manager_msgs/Status',
      message => {
        dispatcher.dispatch({type: "RAPP_STATUS", rappStatus: message});
      }
    );

  }

  dispose = () => {
    this.rappListListener.dispose();
    this.rappStatusListener.dispose();
  }

  handleRappMenuChange = (event, index, value) => {
    dispatcher.dispatch({type: "SELECTED_RAPP", selectedRapp: value});
  }

  startRapp = (name) => {
    this.rosClient.service.call(
     '/rocon/app_manager/start_rapp',
     'rocon_app_manager_msgs/StartRapp',
      {
        name: name,
      }
    ).then( (result) => {
      if (result.started === false){
        // Stop running rapp
        this.rosClient.service.call(
         '/rocon/app_manager/stop_rapp',
         'rocon_app_manager_msgs/StopRapp',
          {},
        ).then( (result) => {
          // Start selected rapp
          this.rosClient.service.call(
           '/rocon/app_manager/start_rapp',
           'rocon_app_manager_msgs/StartRapp',
            {
              name: name,
            });
        });
      }
    });

  }

  stopRapp = () => {
    this.rosClient.service.call(
     '/rocon/app_manager/stop_rapp',
     'rocon_app_manager_msgs/StopRapp',
      {},
    ).then( (result) => {
      // Do nothing
    });
  }

}
