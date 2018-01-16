import React, { Component } from 'react';
// import logo from './logo.svg';
import './App.css';

import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
// import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';

import AppBar from 'material-ui/AppBar';

import RappStarter from './js/components/RappStarter.js';

import ROSLIB from 'roslib';

class App extends Component {
  constructor(...args) {
    super(...args);
    this.state = {
      ros_status: "disconnected",
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
  render() {
    if (this.state.ros_status === "disconnected"){
      return (
        <h1>Not connected</h1>
      );
    } else {
    return (
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <div>
          <AppBar title="Control Center"/>
          <RappStarter ros={this.ros}/>
        </div>
      </MuiThemeProvider>
    );

    }
  }


}

export default App;
