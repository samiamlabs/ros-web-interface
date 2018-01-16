import dispatcher from '../dispatcher';

import ROSLIB from 'roslib';

export default class RappStarterActions {

  init(ros){
    this.ros = ros;

    this.rapp_list_listener = new ROSLIB.Topic({
      ros : this.ros,
      name : '/rocon/app_manager/rapp_list',
      messageType : 'rocon_app_manager_msgs/RappList'
    });


    this.rapp_list_listener.subscribe(function(message) {
      dispatcher.dispatch({type: "TEST", available_rapps: message.available_rapps
      });
    });



  }

}
