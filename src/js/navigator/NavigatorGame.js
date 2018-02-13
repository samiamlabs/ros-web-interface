import Phaser from 'phaser';

import MapScene from './scenes/MapScene';
import UiScene from './scenes/UiScene';

export default class NavigatorGame {
  constructor({storeState = null, useDatGui = false, actions = null}) {

    this.mapScene = new MapScene({useDatGui, storeState, actions});
    this.uiScene = new UiScene({zoomIn: this.mapScene.zoomIn, zoomOut: this.mapScene.zoomOut});


    var config = {
      type: Phaser.AUTO,
      parent: 'phaser-map',
      width: window.innerWidth, //* window.devicePixelRatio,
      height: window.innerHeight, //* window.devicePixelRatio,
      scene: [
        this.mapScene,
        this.uiScene,
      ],
    };

    this.game = new Phaser.Game(config);

  }

  destroy() {
    this.game.destroy(true);
    this.mapScene.destroy();
  }

  setStoreState (storeState) {
    this.storeState = storeState;
    this.mapScene.setStoreState(storeState);
  }

  update(time, delta) {


  }
}
