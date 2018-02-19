import dispatcher from '../dispatcher';

import {all, coroutine} from 'bluebird';

export default class CapabilitiesActions {
  init = rosClient => {
    this.rosClient = rosClient;

    this.capabilityEventListener = this.rosClient.topic.subscribe(
      '/capability_server/events',
      'capabilities/CapabilityEvent',
      message => {
        this.getCapabilities();
        this.getRunning();
      }
    );

    this.getCapabilities();
    this.getRunning();
  };

  dispose = () => {
    this.capabilityEventListener.dispose();
  };

  startCapability = (interface_name, provider) => {
    this.rosClient.service
      .call(
        '/capability_server/start_capability',
        'capabilities/StartCapability',
        {
          capability: interface_name,
          preferred_provider: provider
        }
      )
      .then(result => {
        // do nothing
      });
  };

  stopCapability = interface_name => {
    this.rosClient.service
      .call(
        '/capability_server/stop_capability',
        'capabilities/StopCapability',
        {
          capability: interface_name
        }
      )
      .then(result => {
        // do nothing
      });
  };

  getRunning = () => {
    this.rosClient.service
      .call(
        '/capability_server/get_running_capabilities',
        'capabilities/GetRunningCapabilities',
        {}
      )
      .then(result => {
        dispatcher.dispatch({
          type: 'RUNNING_CAPABILITIES',
          running: result.running_capabilities
        });
      });
  };

  getCapabilities = coroutine(function*() {
    const interfaceResponse = yield this.rosClient.service.call(
      '/capability_server/get_interfaces',
      'capabilities/GetInterfaces',
      {}
    );

    const interfaces = interfaceResponse.interfaces;

    const providerPromises = interfaces.map(interface_name =>
      this.rosClient.service.call(
        '/capability_server/get_providers',
        'capabilities/GetProviders',
        {
          interface: interface_name,
          include_semantic: false
        }
      )
    );

    const providerResponses = yield all(providerPromises);

    const capabilities = [];
    for (let index = 0; index < interfaces.length; index++) {
      providerResponses[index].providers.forEach(provider => {
        capabilities.push({interface_name: interfaces[index], provider});
      });
    }

    dispatcher.dispatch({
      type: 'AVAILABLE_CAPABILITIES',
      available: capabilities
    });
  });
}
