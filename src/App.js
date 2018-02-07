import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import {AppBar, Drawer, MenuItem, IconMenu, IconButton} from 'material-ui';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

import RappStarter from './js/components/RappStarter.js';
import Capabilities from './js/components/Capabilities.js';

import RosClient from 'roslib-client';

const Logged = (props) => (
  <IconMenu
    {...props}
    iconButtonElement={
      <IconButton><MoreVertIcon /></IconButton>
    }
    targetOrigin={{horizontal: 'right', vertical: 'top'}}
    anchorOrigin={{horizontal: 'right', vertical: 'top'}}
  >
    <MenuItem primaryText="Refresh" />
    <MenuItem primaryText="Change ROS url" />
  </IconMenu>
);

class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      ros_status: "disconnected",
      drawer_open: false,
      active_section: 'capabilities',
    };

    this.rosUrl = 'ws://localhost:9090'

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

  render() {
    if (this.state.ros_status === "disconnected"){
      return (
        <h1>Not connected</h1>
      );
    } else {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div>
          <AppBar
            title="Control Center"
            onLeftIconButtonClick={this.handleToggle}
            iconElementRight={<Logged/>}
            />
          <Drawer
            docked={false}
            width={200}
            open={this.state.drawer_open}
            onRequestChange={(drawer_open) => this.setState({drawer_open})}
          >
            <MenuItem
              onClick={ (event) =>
                this.setState({active_section: 'rapps'})}>
              Rapps
            </MenuItem>

            <MenuItem
            onClick={ (event) =>
              this.setState({active_section: 'capabilities'})}>
              Capabilities
            </MenuItem>

          </Drawer>

          {this.state.active_section === 'rapps' &&
            <RappStarter rosClient={this.rosClient}/>
          }
          {this.state.active_section === 'capabilities' &&
            <Capabilities rosClient={this.rosClient}/>
          }

        </div>
      </MuiThemeProvider>
    );

    }
  }

}

export default App;
