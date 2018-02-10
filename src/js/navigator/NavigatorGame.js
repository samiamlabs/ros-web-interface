import Phaser from 'phaser';

import MapScene from './scenes/MapScene';

export default class NavigatorGame {
  constructor({storeState = null, useDatGui = false}) {

    this.mapScene = new MapScene({useDatGui, storeState});

    var config = {
      type: Phaser.AUTO,
      parent: 'phaser-map',
      width: window.innerWidth * window.devicePixelRatio,
      height: window.innerHeight * window.devicePixelRatio,
      scene: [
        this.mapScene
      ]
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
