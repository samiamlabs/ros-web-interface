import React from 'react';

import NavigatorActions from '../actions/NavigatorActions';
import NavigatorStore from '../stores/NavigatorStore';

import NavigatorGame from '../navigator/NavigatorGame';

export default class Navigator extends React.Component {

  componentDidMount() {
    NavigatorStore.on("change", this.updateStoreState);

    this.actions = new NavigatorActions();
    this.actions.init(this.props.rosClient);

    this.storeState = NavigatorStore.getState();

    this.navigatorGame = new NavigatorGame(
      {
        storeState: this.storeState,
        useDatGui: this.props.useDatGui,
        actions: this.actions,
      });
  }

  componentWillUnmount() {
    this.actions.dispose();

    NavigatorStore.removeListener("change", this.updateStoreState);
    this.navigatorGame.destroy();
  }

  updateStoreState = () => {
    this.storeState = NavigatorStore.getState();
    this.navigatorGame.setStoreState(this.storeState);
  }

  render() {
    const datGuiStyle = {
      position: 'absolute',
      top: '90px',
      right: '100px',
    };

    return (
        <div id='phaser-map'>
          <div id='phaser-map-dat-gui' style={datGuiStyle}/>
        </div>
    );
  }
}

Map.defaultProps = { useDatGui: false };
