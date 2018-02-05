import dispatcher from '../dispatcher';

import ROSLIB from 'roslib';

export default class CapabilitiesActions {
  init(ros) {
    this.ros = ros;

    this.interface_counter = 0;

    this.capabilityEventListener = new ROSLIB.Topic({
      ros : this.ros,
      name : '/capability_server/events',
      messageType : 'capabilities/CapabilityEvent'
    });

    this.capabilityEventListener.subscribe((message) => {
      this.getCapabilities();
      this.getRunning();
    });

    this.getRunningClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/capability_server/get_running_capabilities',
      serviceType: 'capabilities/GetRunningCapabilities',
    })

    this.getInterfacesClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/capability_server/get_interfaces',
      serviceType: 'capabilities/GetInterfaces',
    })

    this.getProvidersClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/capability_server/get_providers',
      serviceType: 'capabilities/GetProviders',
    })

    this.startCapabilityClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/capability_server/start_capability',
      serviceType: 'capabilities/StartCapability',
    })

    this.stopCapabilityClient = new ROSLIB.Service({
      ros: this.ros,
      name: '/capability_server/stop_capability',
      serviceType: 'capabilities/StopCapability',
    })

  }

  startCapability = (interface_name, provider) => {
    const request = new ROSLIB.ServiceRequest({
      capability: interface_name,
      preferred_provider: provider,
    });

    this.startCapabilityClient.callService(request, (result) => {
    })

  }

  stopCapability = (interface_name) => {
    const request = new ROSLIB.ServiceRequest({
      capability: interface_name,
    });

    this.stopCapabilityClient.callService(request, (result) => {
    })

  }

  getCapabilities = () => {
    const interfaceRequest = new ROSLIB.ServiceRequest();

    dispatcher.dispatch({type: "CLEAR_CAPABILITY_BUFFER"});

      if (this.interface_counter !== 0){ // if already fetching
        return;
      }

    // TODO: add failed callback
    this.getInterfacesClient.callService(interfaceRequest, (result) => {
      this.interface_counter = result.interfaces.length;
      result.interfaces.forEach( (interface_name) => {
        const providerRequest = new ROSLIB.ServiceRequest({
          interface: interface_name,
          include_semantic: false,
        });

        // callService does not block the thread here
        this.getProvidersClient.callService(providerRequest, (result) => {
          dispatcher.dispatch({type: "ADD_CAPABILITY_TO_BUFFER", interface_name, providers: result.providers});

          this.interface_counter--;
          if(this.interface_counter === 0){ // all interface providers received
              dispatcher.dispatch({type: "SYNC_CAPABILITY_BUFFER"});
          }
        });
      });
    });
  }

  getRunning = () => {
    const request = new ROSLIB.ServiceRequest();
    this.getRunningClient.callService(request, (result) => {
      dispatcher.dispatch({type: "RUNNING_CAPABILITIES", running: result.running_capabilities});
    });
  }
}
