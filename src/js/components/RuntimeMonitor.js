import React from 'react';

import RuntimeMonitorStore from '../stores/RuntimeMonitorStore';
import RuntimeMonitorActions from '../actions/RuntimeMonitorActions';

import CheckCircle from 'material-ui/svg-icons/action/check-circle';
import Warning from 'material-ui/svg-icons/alert/warning';
import ErrorIcon from 'material-ui/svg-icons/alert/error';
import Hourglass from 'material-ui/svg-icons/action/hourglass-empty';

import {
  pinkA200,
  orangeA200,
  lightBlueA200,
  deepPurpleA200
} from 'material-ui/styles/colors';

import {List, ListItem, Paper, Subheader} from 'material-ui';

const style = {
  margin: 18,
  width: '90%',
  display: 'inline-block'
};

export default class RuntimeMonitor extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.state = {store: RuntimeMonitorStore.getState()};
  }

  componentWillMount() {
    RuntimeMonitorStore.on('change', this.getStateFromStore);

    if (typeof this.props.rosClient !== 'undefined') {
      RuntimeMonitorActions.connect(this.props.rosClient);
    }
  }

  componentWillUnmount() {
    RuntimeMonitorStore.removeListener('change', this.getStateFromStore);
  }

  getStateFromStore = () => {
    this.setState({store: RuntimeMonitorStore.getState()});
  };

  render() {
    const sortedDiagnosticItems = this.state.store
      .get('diagnosticItems')
      .sort((a, b) => a.get('name').localeCompare(b.get('name')));

    let lastSourceNode = null;
    const diagnosticsList = [];

    sortedDiagnosticItems.forEach(diagnosticItem => {
      let icon;
      switch (diagnosticItem.get('level')) {
        case 0: {
          icon = <CheckCircle color={lightBlueA200} />;
          break;
        }
        case 1: {
          icon = <Warning color={orangeA200} />;
          break;
        }
        case 2: {
          icon = <ErrorIcon color={pinkA200} />;
          break;
        }
        case 3: {
          icon = <Hourglass color={deepPurpleA200} />;
          break;
        }
        default:
        // Do nothing
      }

      const name = diagnosticItem.get('name');
      const nameArray = name.split(': ');
      const noPrefixName = nameArray[nameArray.length - 1];

      const sourceNode = nameArray[0];
      if (sourceNode !== lastSourceNode) {
        diagnosticsList.push(<Subheader key={sourceNode}>{sourceNode}</Subheader>);
      }
      lastSourceNode = sourceNode;

      const values = diagnosticItem
        .get('values')
        .map(keyValuePair => {
          const value = keyValuePair.get('value');
          const key = keyValuePair.get('key');
          return <ListItem key={key} primaryText={value} secondaryText={key} />;
        })
        .toArray();

      diagnosticsList.push(
        <ListItem
          key={name}
          primaryText={noPrefixName}
          leftIcon={icon}
          nestedItems={values}
        />
      );
    });

    return (
      <Paper style={style}>
        <List>{diagnosticsList}</List>
      </Paper>
    );
  }
}
