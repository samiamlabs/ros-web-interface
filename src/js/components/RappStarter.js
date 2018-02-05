import React from 'react';

import {Toolbar, ToolbarGroup, ToolbarTitle} from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import RaisedButton from 'material-ui/RaisedButton';

import RappStarterActions from '../actions/RappStarterActions';
import RappStarterStore from '../stores/RappStarterStore';


export default class RappStarter extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      value: "no_rapp_selected",
      rapps: RappStarterStore.getRapps(),
      rappStatus: RappStarterStore.getRappStatus(),
      selectedRapp: RappStarterStore.getSelectedRapp(),
      rappButtonLabel: "Start",
      rappButtonPrimary: true,
    };

  }

  componentWillMount() {
    this.actions = new RappStarterActions();
    this.actions.init(this.props.ros);

    RappStarterStore.on("change", this.getAll);
  }

  componentWillUnmount() {
    RappStarterStore.removeListener("change", this.getAll);
  }

  getAll = () => {
    this.setState({
      rapps: RappStarterStore.getRapps(),
      rappStatus: RappStarterStore.getRappStatus(),
      selectedRapp: RappStarterStore.getSelectedRapp(),
    })
  }

  buttonClicked = () => {
    const rappRunning = (this.state.selectedRapp === this.state.rappStatus.rapp.name);

    if (rappRunning){
      this.actions.stopRapp();
    } else {
      this.actions.startRapp(this.state.selectedRapp);
    }
  }

  render() {
    if (this.state.rapps.length === 0){
      return (
        <Toolbar>
          <ToolbarGroup firstChild={true}>
            <ToolbarTitle text={"No robot apps found"} />
          </ToolbarGroup>
        </Toolbar>
      );
    } else {

      const rappButtonLabel = (this.state.selectedRapp === this.state.rappStatus.rapp.name) ? "Stop": "Start";

      return (
        <Toolbar>

          <ToolbarGroup firstChild={true}>
            <DropDownMenu value={this.state.selectedRapp} onChange={this.actions.handleRappMenuChange}>
              {this.state.rapps.map((rapp) => (
                <MenuItem key={rapp.name} value={rapp.name} primaryText={rapp.name} />
              ))}
            </DropDownMenu>
          </ToolbarGroup>

          <ToolbarGroup>
            <RaisedButton onClick={this.buttonClicked}
                          label={rappButtonLabel}
                          primary={rappButtonLabel === "Start"}
                          secondary={rappButtonLabel === "Stop"}/>
          </ToolbarGroup>
        </Toolbar>
      );
    }
  }
}
