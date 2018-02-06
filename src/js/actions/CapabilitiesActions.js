import dispatcher from '../dispatcher';

import ROSLIB from 'roslib';
import RosClient from 'roslib-client';
import {Promise} from 'bluebird';

export default class CapabilitiesActions {
  init(ros) {
    this.ros = ros;

    this.capabilityFetchLock = false;
    this.interface_counter = 0;

    this.rosClient = new RosClient({
      url: 'ws://localhost:9090',
    });


    this.rosClient.topic.subscribe('/capability_server/events', 'capabilities/CapabilityEvent', (message) => {
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

    this.getCapabilities();
    this.getRunning();
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

  getRunning = () => {
    this.rosClient.service.call(
      '/capability_server/get_running_capabilities',
      'capabilities/GetRunningCapabilities',
      {}
    ).then( (result) => {
      dispatcher.dispatch({type: "RUNNING_CAPABILITIES", running: result.running_capabilities});
    });
  }

  getCapabilities = () => {
    const getInterfaces = this.rosClient.service.call(
      '/capability_server/get_interfaces',
      'capabilities/GetInterfaces',
      {}
    );

    getInterfaces.then( result => {
      const interfaces = [];
      const providers = [];

      result.interfaces.forEach( interface_name => {
        const getProviders = this.rosClient.service.call(
          '/capability_server/get_providers',
          'capabilities/GetProviders',
          {
            interface: interface_name,
            include_semantic: false,
          }
        );

        providers.push(getProviders);
        interfaces.push(interface_name);
      });

      Promise.all(providers).then( (result) => {

        const capabilities = [];
        for (let index = 0; index < interfaces.length; index++) {
          result[index].providers.forEach( provider => {
            capabilities.push({interface_name: interfaces[index], provider: provider});
          });
        }

        dispatcher.dispatch({type: "AVAILABLE_CAPABILITIES", available: capabilities});

      });

    });
  }

}
