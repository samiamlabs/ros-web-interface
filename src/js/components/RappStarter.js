import React from 'react';

import {Toolbar, ToolbarGroup, ToolbarTitle, ToolbarSeparator} from 'material-ui/Toolbar';
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
    this.actions.init(this.props.rosClient);

    RappStarterStore.on("change", this.getAll);
  }

  componentWillUnmount() {
    this.actions.dispose();

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

      const rapps = this.state.rapps.map( rapp => {
        const rappArray = rapp.name.split('/');
        return { text: rappArray[rappArray.length -1], value: rapp.name };
      });


      return (
        <Toolbar>

          <ToolbarGroup firstChild={true}>
            <DropDownMenu
              value={this.state.selectedRapp}
              onChange={this.actions.handleRappMenuChange}
              >
              {rapps.map((rapp) => (
                <MenuItem key={rapp.value} value={rapp.value} primaryText={rapp.text} />
              ))}
            </DropDownMenu>
          </ToolbarGroup>

          <ToolbarGroup lastChild={true}>
            <ToolbarSeparator/>
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
