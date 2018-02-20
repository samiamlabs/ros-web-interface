import React from 'react';

// import RaisedButton from 'material-ui/RaisedButton';

import RappStarterActions from '../actions/RappStarterActions';
import RappStarterStore from '../stores/RappStarterStore';

import {List, ListItem, Paper, Dialog, CircularProgress} from 'material-ui';

import PowerIcon from 'material-ui/svg-icons/action/power-settings-new';
import {redA400} from 'material-ui/styles/colors';

const styles = {
  paper: {
    marginTop: 20,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: 20,
    width: '90%',
    maxWidth: 1000,
    display: 'block'
  },
  headerPaper: {
    height: 60,
    width: '100%',
    display: 'inline-block'
  },
  h3: {
    marginTop: 20,
    fontWeight: 400,
    textAlign: 'center'
  },
  progress: {
    margin: 'auto',
    display: 'block',
  }
};

export default class RappStarter extends React.PureComponent {
  constructor(...args) {
    super(...args);

    this.state = {store: RappStarterStore.getState()};
  }

  componentWillMount() {
    if (typeof this.props.rosClient !== 'undefined') {
      RappStarterActions.connect(this.props.rosClient);
    }

    RappStarterStore.on('change', this.getStateFromStore);
  }

  componentWillUnmount() {
    RappStarterActions.disconnect();

    RappStarterStore.removeListener('change', this.getStateFromStore);
  }

  getStateFromStore = () => {
    this.setState({store: RappStarterStore.getState()});
  };

  getRunningRapp = () => {
    const rappList = this.state.store.get('availableRapps');

    let runningRapp = null;
    rappList.forEach(rapp => {
      if (rapp.get('status') === 'Running') {
        runningRapp = rapp.get('name');
      }
    });

    return runningRapp;
  };

  handleRappClick = (rappName, clickEvent) => {
    const runningRapp = this.getRunningRapp();

    if (rappName === runningRapp) {
      RappStarterActions.stopRapp();
    } else {
      RappStarterActions.startRapp(rappName);
    }
  };

  handleLoadingDialogClose = buttonClicked => {
    RappStarterActions.closeLoadingDialog();
  }

  render() {
    const state = this.state.store;
    const availableRapps = state.get('availableRapps');

    const rappList = [];

    availableRapps.forEach(rapp => {
      const name = rapp.get('name');
      const displayName = rapp.get('display_name');
      const status = rapp.get('status');

      let powerIcon;
      if (status === 'Running') {
        powerIcon = <PowerIcon color={redA400} />;
      } else {
        powerIcon = <PowerIcon />;
      }

      rappList.push(
        <ListItem
          key={name}
          primaryText={displayName}
          rightIcon={powerIcon}
          onClick={this.handleRappClick.bind(this, name)}
        />
      );
    });

    return (
      <Paper style={styles.paper}>
        <Paper style={styles.headerPaper}>
          <h3 style={styles.h3}>Robot App Manager</h3>
        </Paper>
        <List>{rappList}</List>
        <Dialog
          open={state.get('loadingDialogOpen')}
          modal={false}
          onRequestClose={this.handleLoadingDialogClose}
        >
          <h3 style={styles.h3}>{state.get('loadingDialogMessage')}</h3>
          <CircularProgress size={80} thickness={5} style={styles.progress}/>
        </Dialog>
      </Paper>
    );
  }
}
// this.state = {
//   value: 'no_rapp_selected',
//   // rapps: RappStarterStore.getRapps(),
//   // rappStatus: RappStarterStore.getRappStatus(),
//   // selectedRapp: RappStarterStore.getSelectedRapp(),
//   rappButtonLabel: 'Start',
//   rappButtonPrimary: true
// };

// getAll = () => {
//   this.setState({
//     rapps: RappStarterStore.getRapps(),
//     rappStatus: RappStarterStore.getRappStatus(),
//     selectedRapp: RappStarterStore.getSelectedRapp()
//   });
// };

// buttonClicked = () => {
//   const rappRunning =
//     this.state.selectedRapp === this.state.rappStatus.rapp.name;
//
//   if (rappRunning) {
//     this.actions.stopRapp();
//   } else {
//     this.actions.startRapp(this.state.selectedRapp);
//   }
// };

// if (this.state.rapps.length === 0) {
//   return (
//     <Toolbar>
//       <ToolbarGroup firstChild={true}>
//         <ToolbarTitle text={'No robot apps found'} />
//       </ToolbarGroup>
//     </Toolbar>
//   );
// } else {
//   const rappButtonLabel =
//     this.state.selectedRapp === this.state.rappStatus.rapp.name
//       ? 'Stop'
//       : 'Start';
//
//   const rapps = this.state.rapps.map(rapp => {
//     const rappArray = rapp.name.split('/');
//     return {text: rappArray[rappArray.length - 1], value: rapp.name};
//   });
//
//   return (
//     <Toolbar>
//       <ToolbarGroup firstChild={true}>
//         <DropDownMenu
//           value={this.state.selectedRapp}
//           onChange={this.actions.handleRappMenuChange}
//         >
//           {rapps.map(rapp => (
//             <MenuItem
//               key={rapp.value}
//               value={rapp.value}
//               primaryText={rapp.text}
//             />
//           ))}
//         </DropDownMenu>
//       </ToolbarGroup>
//
//       <ToolbarGroup lastChild={true}>
//         <ToolbarSeparator />
//         <RaisedButton
//           onClick={this.buttonClicked}
//           label={rappButtonLabel}
//           primary={rappButtonLabel === 'Start'}
//           secondary={rappButtonLabel === 'Stop'}
//         />
//       </ToolbarGroup>
//     </Toolbar>
//   );
// }
