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

    this.getTestString = this.getTestString.bind(this);
    this.getRapps = this.getRapps.bind(this);
    this.setDefaultRappSelection = this.setDefaultRappSelection.bind(this);

    this.state = {
      value: "no_rapp_selected",
      test_string: RappStarterStore.getTestString(),
      rapps: RappStarterStore.getRapps(),
    };

    this.actions = new RappStarterActions();
    this.actions.init(this.props.ros);
  }

  componentWillMount() {
    RappStarterStore.on("change", this.getTestString);
    RappStarterStore.on("change", this.getRapps);
    RappStarterStore.on("change", this.setDefaultRappSelection);
  }

  componentWillUnmount() {
    RappStarterStore.removeListener("change", this.getTestString);
    RappStarterStore.removeListener("change", this.getRapps);
    RappStarterStore.removeListener("change", this.setDefaultRappSelection);
  }

  getTestString() {
    this.setState({
      test_string: RappStarterStore.getTestString(),
    });
  }

  getRapps() {
      this.setState({
        rapps: RappStarterStore.getRapps(),
      });
  }

  setDefaultRappSelection() {
    if (this.state.value === "no_rapp_selected" && RappStarterStore.getRapps().length > 0){
      this.setState({
        value: RappStarterStore.getRapps()[0].name,
      });
    }
  }


  handleChange = (event, index, value) => this.setState({value});

  render() {
    if (this.state.rapps.length === 0){
      return (
        <Toolbar>
          <ToolbarTitle text={"No robot apps found"} />
        </Toolbar>
      );
    } else {
      return (
        <Toolbar>
          <DropDownMenu value={this.state.value} onChange={this.handleChange}>
            {this.state.rapps.map((rapp) => (
              <MenuItem value={rapp.name} primaryText={rapp.name} />
            ))}
          </DropDownMenu>
          <ToolbarGroup>
            <RaisedButton label={'Start'} primary={true} />
          </ToolbarGroup>
        </Toolbar>
      );
    }
  }
}
