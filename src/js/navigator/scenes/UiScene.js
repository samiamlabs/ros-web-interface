import Phaser from 'phaser';

import ZoomInImage from '../assets/images/plus-circle-outline.png'
import ZoomOutImage from '../assets/images/minus-circle-outline.png'

export default class MapScene extends Phaser.Scene {
  constructor(config) {
    super({
      key: 'UiScene',
      active: true,
    });

    this.zoomIn = config.zoomIn;
    this.zoomOut = config.zoomOut;
  }

  preload() {
    this.load.image('zoomOut', ZoomOutImage);
    this.load.image('zoomIn', ZoomInImage);
  }


  create() {
    var miniMapBorderHorizontal = this.add.graphics();
    var miniMapBorderVertical = this.add.graphics();

    var color = 0x00BCD4;
    var alpha = 1.0;

    const {height, width} = this.sys.game.config;
    const miniMapHeight = Math.round(height/2.5)
    const miniMapWidth = miniMapHeight;
    const borderWidth = 5;
    const borderPositionX = 0;
    const borderPositionY = height - miniMapHeight - borderWidth;

    miniMapBorderHorizontal.fillStyle(color, alpha);
    miniMapBorderHorizontal.fillRect(
      borderPositionX,
      borderPositionY,
      miniMapWidth + borderWidth,
      borderWidth,
    );

    miniMapBorderVertical.fillStyle(color, alpha);
    miniMapBorderVertical.fillRect(
      miniMapWidth,
      borderPositionY,
      borderWidth,
      miniMapHeight + borderWidth,
    );


    const zoomIn = this.add.sprite(width - 60, height - 120, 'zoomIn').setScale(0.3).setInteractive();
    const zoomOut = this.add.sprite(width - 60, height - 50, 'zoomOut').setScale(0.3).setInteractive();

    zoomIn.on('pointerdown', (pointer) => {
      this.zoomIn();
    });

    zoomOut.on('pointerdown', (pointer) => {
      this.zoomOut();
    });

  }

  update() {

  }
}
