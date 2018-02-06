import React from 'react';

import CapabilitiesActions from '../actions/CapabilitiesActions';
import CapabilitiesStore from '../stores/CapabilitiesStore';

import {Toggle, Paper, Subheader, Divider} from 'material-ui';

// import Immutable from 'immutable';
const styles = {
  paper: {
    maxWidth: 500,
    display: 'inline-block',
  },
  toggle: {
    marginBottom: 16,
  },
  h3: {
    marginTop: 20,
    fontWeight: 400,
    textAlign: 'center',
  },
  providerContainer: {
    marginLeft: 30,
    marginRight: 30,
  }
};

export default class Capabilities extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      store: CapabilitiesStore.getState(),
    };
  }

  componentWillMount() {
    CapabilitiesStore.on("change", this.getAll);

    this.actions = new CapabilitiesActions();
    this.actions.init(this.props.rosClient);
  }

  componentWillUnmount() {
    CapabilitiesStore.removeListener("change", this.getAll);

    this.actions.dispose();
  }

  getAll = () => {
    this.setState({
      store: CapabilitiesStore.getState(),
    });
  }

  handleToggle = (provider, event, isInputChecked) => {
    const available = this.state.store.get('available').toJS();

    available.forEach( (capability) => {
      if (capability.provider === provider) {
        if (isInputChecked) {
          this.actions.startCapability(capability.interface_name, provider);
        } else {
          this.actions.stopCapability(capability.interface_name);
        }
        return;
      }
    });
  }

  render () {
    const state = this.state.store;

    const running_providers = state.get('running').map( (capability) => {
      return capability.getIn(['capability', 'provider']);
    }).toJS();
    const available_capabilities = state.get('available').toJS();

    return (
      <div>
        <CapabilityTable
          available={available_capabilities}
          running={running_providers}
          handleToggle={this.handleToggle}
        />
      </div>
    )
  }
}

class CapabilityTable extends React.Component {
  render() {
    const rows = [];
    let lastInterfaceName = null;

    if (typeof this.props.available.length === 'undefined') {
      return <h2>No capabilities found!</h2>;
    }

    const availableSorted = this.props.available.sort( (a, b) => {
      if (a.interface_name < b.interface_name) {
        return -1;
      }
      if (a.interface_name > b.interface_name) {
        return 1;
      }

      // Interface name must be equal
      if (a.provider < b.provider) {
        return -1;
      }
      if (a.provider > b.provider) {
        return 1;
      }

      // Providers must be equal as well
      return 0;
    });

    availableSorted.forEach( (capability) => {
      // TODO: Check if capability is acive
      if (capability.interface_name !== lastInterfaceName) {
        rows.push(
          <Divider key={capability.interface_name + "_divider"}/>
        )
        rows.push(
          <CapabilityInterface
            key={capability.interface_name}
            name={capability.interface_name}
            show_pkg={false}
          />
        )
      }

      const running = this.props.running.includes(capability.provider);

      rows.push(
        <div key={capability.provider} style={styles.providerContainer}>
          <CapabilityProvider
            key={capability.provider}
            name={capability.provider}
            running={running}
            handleToggle={this.props.handleToggle}
            show_pkg={false}
          />
        </div>
      );

      lastInterfaceName = capability.interface_name;
    });

    return (
      <Paper zDepth={2} style={styles.paper}>
        <h3 style={styles.h3}>Capabilities</h3>
        {rows}
      </Paper>
    );
  }
}


class CapabilityInterface extends React.Component {
  render () {
    let name = this.props.name;
    if (!this.props.show_pkg) {
      const nameArray = name.split('/');
      name = nameArray[nameArray.length -1];
    }
    return (
      <Subheader>{name}</Subheader>
    )
  }
}

class CapabilityProvider extends React.Component {
  render () {
    let label = this.props.name;
    if (!this.props.show_pkg) {
      const nameArray = label.split('/');
      label = nameArray[nameArray.length -1];
    }

    label = label.replace(/_/g, ' ');

    return (
      <Toggle
        label={label}
        style={styles.toggle}
        labelPosition={'left'}
        toggled={this.props.running}
        onToggle={this.props.handleToggle.bind(this, this.props.name)}
      />
    )
  }
}
