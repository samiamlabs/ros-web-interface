import Phaser from 'phaser';

import {quaternionToTheta} from '../helpers/GeometryMath';

export default class Robot extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    config.scene.add.existing(this);

    this.storeState = config.storeState;
    this.map = config.map;

    this.scaleFactor = config.scaleFactor;

    this.updateScale();
  }

  updateScale() {
    this.setScale(this.scaleFactor*this.map.scaleX);
  }

  update(storeState) {
    this.storeState = storeState;
    const resolution = this.storeState.getIn(['mapInfo', 'resolution']);

    // TODO: Add support for rotatating map
    const mapPosX = this.storeState.getIn(['robotPose', 'position', 'x'])/resolution;
    const mapPosY = -this.storeState.getIn(['robotPose', 'position', 'y'])/resolution;
    const orientation = this.storeState.getIn(['robotPose', 'orientation']).toJS();

    this.x = this.map.x + this.map.scaleX*mapPosX;
    this.y = this.map.y + this.map.scaleY*mapPosY;

    this.angle = quaternionToTheta(orientation) + 90;

    this.updateScale();
  }
}
