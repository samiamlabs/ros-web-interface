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

    this.rosPositionX = 0.1;
    this.rosPositionY = 0.1;

    this.useTween = config.useTween;
    this.useLowPass = config.useLowPass;

    this.lowpassTrans = 0.01;
    this.lowpassAngle = 0.0001;

    this.positionTween = this.scene.tweens.add({
      targets: this,
      x: this.x,
      y: this.y,
      angle: this.angle,
      ease: 'Sine.easeIn',
      duration: 5000,
      paused: false
    });
  }

  updateScale = () => {
    this.setScale(this.scaleFactor * this.map.scaleX);
  };

  updateRosPosition = () => {
    const position = this.storeState.getIn(['robotPose', 'position']).toJS();
    this.rosPositionX = position.x;
    this.rosPositionY = position.y;
  };

  update = (storeState, delta) => {
    this.storeState = storeState;
    const resolution = this.storeState.getIn(['mapInfo', 'resolution']);

    // TODO: Add support for rotatating map
    const mapPosX =
      this.storeState.getIn(['robotPose', 'position', 'x']) / resolution;
    const mapPosY =
      -this.storeState.getIn(['robotPose', 'position', 'y']) / resolution;
    const orientation = this.storeState
      .getIn(['robotPose', 'orientation'])
      .toJS();

    const adjustedMapPosX = this.map.x + this.map.scaleX * mapPosX;
    const adjustedMapPosY = this.map.y + this.map.scaleY * mapPosY;

    const angle = quaternionToTheta(orientation) + 90;

    if (this.useTween) {
      if (this.positionTween.isPlaying()) {
        this.positionTween.updateTo('x', adjustedMapPosX, true);
        this.positionTween.updateTo('y', adjustedMapPosY, true);
        this.positionTween.updateTo('angle', angle, true);
      } else {
        this.positionTween.play();
      }
    } else if (this.useLowPass) {
      if (Math.abs(this.x - adjustedMapPosX) < 100) {
        this.x += this.lowpassTrans * delta * (adjustedMapPosX - this.x);
      } else {
        this.x = adjustedMapPosX;
      }

      if (Math.abs(this.y - adjustedMapPosY) < 100) {
        this.y += this.lowpassTrans * delta * (adjustedMapPosY - this.y);
      } else {
        this.y = adjustedMapPosY;
      }

      this.angle = angle;
    } else {
      this.x = adjustedMapPosX;
      this.y = adjustedMapPosY;
      this.angle = angle;
    }

    this.updateScale();
    this.updateRosPosition();
  };
}
