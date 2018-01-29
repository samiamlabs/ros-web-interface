import dispatcher from '../dispatcher';

import ROSLIB from 'roslib';

export default class RappStarterActions {

  init(ros) {
    this.ros = ros;

    this.rappListListener = new ROSLIB.Topic({
      ros : this.ros,
      name : '/rocon/app_manager/rapp_list',
      messageType : 'rocon_app_manager_msgs/RappList'
    });

    this.rappListListener.subscribe(function(message) {
      dispatcher.dispatch({type: "AVAILABLE_RAPPS", available_rapps: message.available_rapps
      });
    });

    this.rappStatusListener = new ROSLIB.Topic({
      ros : this.ros,
      name : '/rocon/app_manager/status',
      messageType : 'rocon_app_manager_msgs/Status'
    });

    this.rappStatusListener.subscribe(function(message) {
      dispatcher.dispatch({type: "RAPP_STATUS", rappStatus: message
      });
    });

    this.stopRappClient = new ROSLIB.Service({
       ros : ros,
       name : '/rocon/app_manager/stop_rapp',
       serviceType : 'rocon_app_manager_msgs/StopRapp'
     });

    this.startRappClient = new ROSLIB.Service({
       ros : ros,
       name : '/rocon/app_manager/start_rapp',
       serviceType : 'rocon_app_manager_msgs/StartRapp'
     });

     // this.stopRappClient.callService(this.request, function(result) {
     //    console.log('Stopping rapp');
     //  });

  }

  handleRappMenuChange = (event, index, value) => {
    console.log(value)
    dispatcher.dispatch({type: "SELECTED_RAPP", selectedRapp: value});
  }

  startRapp = (name) => {
    console.log("starting rapp")
    this.request = new ROSLIB.ServiceRequest({
      name: name,
    });
    this.startRappClient.callService(this.request, function(result) {
      // console.log('Starting rapp', name);
    });
  }

  stopRapp = (name) => {
    console.log("stopping rapp");
    this.stopRappClient.callService();
  }
}
