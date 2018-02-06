import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';


import {AppBar, Drawer, MenuItem} from 'material-ui';

import RappStarter from './js/components/RappStarter.js';
import Capabilities from './js/components/Capabilities.js';

import ROSLIB from 'roslib';

class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      ros_status: "disconnected",
      drawer_open: false,
      active_section: 'capabilities',
    };

    this.ros = new ROSLIB.Ros();

    this.ros_url = 'ws://localhost:9090'
    this.ros.connect(this.ros_url);

    this.ros_status = "disconnected";

    this.ros.on('connection', () => {
      console.log('Connected to websocket server.');
      this.setState({
        ros_status: "connected",
      });
    });

    this.ros.on('error', () => {
      console.log('Websocket error (ROS).');
      this.setState({
        ros_status: "error",
      });
    });

    this.ros.on('close', () => {
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
            <RappStarter ros={this.ros}/>
          }
          {this.state.active_section === 'capabilities' &&
            <Capabilities ros={this.ros}/>
          }

        </div>
      </MuiThemeProvider>
    );

    }
  }

}

export default App;
