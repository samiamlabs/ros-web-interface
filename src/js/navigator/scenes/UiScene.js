import Phaser from 'phaser';

export default class MapScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'UiScene',
      active: true,
    });
  }

  preload() {

  }

  create() {
    var miniMapBorderHorizontal = this.add.graphics();
    var miniMapBorderVertical = this.add.graphics();

    var color = 0x00BCD4;
    var alpha = 1.0;

    const {height} = this.sys.game.config;
    const miniMapHeight = Math.round(height/2.5)
    const miniMapWidth = miniMapHeight;
    const borderWidth = 10;

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
  }

  update() {

  }
}
