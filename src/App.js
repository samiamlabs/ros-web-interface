import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {AppBar, Drawer, MenuItem, IconMenu, IconButton, TextField, Dialog, FlatButton} from 'material-ui';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import RappStarter from './js/components/RappStarter.js';
import Capabilities from './js/components/Capabilities.js';
import Navigator from './js/components/Navigator.js';

import RosClient from 'roslib-client';

import Cookies from 'universal-cookie';

const Logged = (props) => (
  <IconMenu
    iconButtonElement={
      <IconButton><MoreVertIcon /></IconButton>
    }
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <MenuItem primaryText='Refresh' />
    <MenuItem primaryText='Change hostname' onClick={props.handleHostnameClick}/>
  </IconMenu>
);

class App extends Component {
  constructor(...args) {
    super(...args);

    this.cookies = new Cookies();

    let hostname = this.cookies.get('hostname');
    if(typeof(hostname) === 'undefined'){
      hostname = 'localhost';
    }

    let active_section = this.cookies.get('active_section');
    if(typeof(active_section) === 'undefined'){
      active_section = 'rapps';
    }

    this.setRosClient(hostname);

    this.state = {
      ros_status: "disconnected",
      drawer_open: false,
      rosHostnameOpen: false,
      active_section: active_section,
      hostnameText: hostname,
    };

  }

  setRosClient = hostname => {
    this.rosUrl = 'ws://' + hostname + ':9090';

    this.rosClient = new RosClient({
      url: this.rosUrl,
    });

    this.rosClient.on('connected', () => {
      console.log('Connected to websocket server.');
      this.setState({
        ros_status: "connected",
      });
    });

    this.rosClient.on('disconnected', () => {
      console.log('Disconnected from websocket server.');
      this.setState({
        ros_status: "disconnected",
      });
    });
  }

  handleToggle = () => this.setState({drawer_open: !this.state.drawer_open});
  handleClose = () => this.setState({drawer_open: false});

  handleHostnameOpen = () => this.setState({rosHostnameOpen: true});
  handleHostnameClose = () => this.setState({rosHostnameOpen: false});

  handleHostnameUpdate = () => {
    this.setState({ros_status: 'disconnected'});
    this.setRosClient(this.state.hostnameText);

    this.cookies.set('hostname', this.state.hostnameText, {path: '/'});
    this.handleHostnameClose();
  }

  updateHostnameText = (event, newValue) => {
    this.setState({hostnameText: newValue});
  }

  setActiveSection = (active_section, event) => {
    this.cookies.set('active_section', active_section, {path: '/'});
    this.setState({active_section});
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleHostnameClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={this.state.hostnameText === ''}
        onClick={this.handleHostnameUpdate}
      />,
    ];

    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div>
          <AppBar
            title={this.state.ros_status === 'connected' ? 'Control Center' : 'Control Center - Disconnected'}
            onLeftIconButtonClick={this.handleToggle}
            iconElementRight={<Logged handleHostnameClick={this.handleHostnameOpen}/>}
            />
          <Dialog
            title="Change hostname"
            actions={actions}
            modal={false}
            open={this.state.rosHostnameOpen}
            onRequestClose={this.handleHostnameClose}
          >
            <TextField floatingLabelText="Hostname" floatingLabelFixed={true} value={this.state.hostnameText} onChange={this.updateHostnameText}/>
          </Dialog>

          <Drawer
            docked={false}
            width={200}
            open={this.state.drawer_open}
            onRequestChange={(drawer_open) => this.setState({drawer_open})}
          >
            <MenuItem
              onClick={this.setActiveSection.bind(this, 'rapps')}>
              Rapps
            </MenuItem>

            <MenuItem
              onClick={this.setActiveSection.bind(this, 'capabilities')}>
              Capabilities
            </MenuItem>

            <MenuItem
              onClick={this.setActiveSection.bind(this, 'navigator')}>
              Navigator
            </MenuItem>

          </Drawer>

          {this.state.active_section === 'navigator' && this.state.ros_status === 'connected' &&
            <Navigator useDatGui={true} rosClient={this.rosClient}/>
          }

          {this.state.active_section === 'rapps' && this.state.ros_status === 'connected' &&
            <RappStarter rosClient={this.rosClient}/>
          }
          {this.state.active_section === 'capabilities' && this.state.ros_status === 'connected' &&
            <Capabilities rosClient={this.rosClient}/>
          }


        </div>
      </MuiThemeProvider>
    );
  }

}

export default App;
