import Phaser from 'phaser';

export default class MiniMap extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    config.scene.add.existing(this);

    this.storeState = config.storeState;
    this.scaleFactor = config.scaleFactor;

    this.updateMiniMapScale();
  }

  updateMiniMapScale() {
    this.setScale(this.scaleFactor);
  }

  update = (storeState) => {
    this.storeState = storeState;

  }

  updateMapOrigin() {
    // const resolution = this.storeState.getIn(['mapInfo', 'resolution']);
    // const mapOrigin = this.storeState.getIn(['mapInfo', 'origin', 'position']).toJS();
    //
    // const offsetX = (resolution*this.width/2 + mapOrigin.x)/resolution;
    // const offsetY = -(resolution*this.height/2 + mapOrigin.y)/resolution;
    //
    // this.setDisplayOrigin(this.width/2 - offsetX, this.height/2 - offsetY);
    //
  }

}
