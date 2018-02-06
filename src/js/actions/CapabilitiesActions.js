import dispatcher from '../dispatcher';

import {Promise} from 'bluebird';

export default class CapabilitiesActions {
  init = (rosClient) =>{
    this.rosClient = rosClient;

    this.capabilityFetchLock = false;
    this.interface_counter = 0;

    this.capabilityEventListener = this.rosClient.topic.subscribe('/capability_server/events', 'capabilities/CapabilityEvent', (message) => {
      this.getCapabilities();
      this.getRunning();
    });

    this.getCapabilities();
    this.getRunning();
  }

  dispose = () => {
    this.capabilityEventListener.dispose();
  }

  startCapability = (interface_name, provider) => {
    this.rosClient.service.call(
      '/capability_server/start_capability',
      'capabilities/StartCapability',
      {
        capability: interface_name,
        preferred_provider: provider,
      }
    ).then( (result) => {
      // do nothing
    });
  }

  stopCapability = (interface_name) => {
    this.rosClient.service.call(
      '/capability_server/stop_capability',
      'capabilities/StopCapability',
      {
        capability: interface_name,
      }
    ).then( (result) => {
      // do nothing
    });
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
