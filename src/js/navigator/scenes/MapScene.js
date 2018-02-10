import Phaser from 'phaser';
import dat from 'dat.gui';

import Logo from '../assets/images/logo.png';

export default class MapScene extends Phaser.Scene {
  constructor({useDatGui =  null, storeState = null}) {
    super({
      key: 'MapScene'
    });

    this.useDatGui = useDatGui;

    this.storeState = storeState;
    this.laseStoreState = storeState;

    if (this.useDatGui){
      this.datGui = new dat.GUI({autoPlace: false});
    }

  }

  destroy() {
    if (this.useDatGui){
      this.game.datGui.destroy(); // does not work properly...
    }
  }

  setStoreState(storeState) {
    this.lastStoreState = this.storeState;
    this.storeState = storeState;
  }

  preload() {
    this.load.image('logo', Logo);
  }

  create() {
    this.initCameraControl();
    this.initMapSprite();

    if(this.useDatGui) {
      this.initDatGui();
    }
  }

  update(time, delta) {
    this.controls.update(delta);

    this.updateRobotPose();

    if(this.useDatGui) {
      this.updateDatGui();
    }
  }

  updateDatGui() {
    const camera = this.cameras.main;
    const p = camera.getWorldPoint(this.input.x, this.input.y);

    this.conv.cx = p.x;
    this.conv.cy = p.y;

    const point = Phaser.Math.TransformXY(p.x, p.y, this.robot.x, this.robot.y, this.robot.rotation, this.robot.scaleX, this.robot.scaleY);
    this.conv.px = point.x;
    this.conv.py = point.y;
  }

  updateRobotPose() {
    this.robot.x = this.storeState.getIn(['robotPose', 'position', 'x']);
    this.robot.y = this.storeState.getIn(['robotPose', 'position', 'y']);
  }

  initMapSprite() {
    const mapTexture = this.textures.createCanvas('map', 16, 256);

    var canvas = mapTexture.getSourceImage();
    var context = canvas.getContext('2d');
    var imgData = context.createImageData(16,256);

    for (let i=0; i<imgData.data.length; i++){
      imgData.data[i] = 255;
    }
    context.putImageData(imgData, 0, 0);

    this.textures.addCanvas('map', canvas);

    this.robot = this.add.sprite(0, 0, 'map').setScale(1.5,1.5);

  }

  initCameraControl() {
    var cursors = this.input.keyboard.createCursorKeys();
    var controlConfig = {
      camera: this.cameras.main,
      left: cursors.left,
      right: cursors.right,
      up: cursors.up,
      down: cursors.down,
      zoomIn: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
      zoomOut: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      acceleration: 0.06,
      drag: 0.0005,
      maxSpeed: 1.0
    };

    this.controls = new Phaser.Cameras.Controls.Smoothed(controlConfig);

    this.input.keyboard.on('KEYDOWN_Z', function (event) {
      this.cameras.main.rotation += 0.01;
    }, this);

    this.input.keyboard.on('KEYDOWN_X', function (event) {
      this.cameras.main.rotation -= 0.01;
    }, this);
  }

  initDatGui() {

    this.conv = {
      cx: 0,
      cy: 0,
      px: 0,
      py: 0
    };

    const datGui = this.datGui;

    let p1 = datGui.addFolder("pointer");
    p1.add(this.input, 'x').listen();
    p1.add(this.input, 'y').listen();
    p1.add(this.conv, 'cx').listen();
    p1.add(this.conv, 'cy').listen();
    p1.add(this.conv, 'px').listen();
    p1.add(this.conv, 'py').listen();
    p1.open();

    const help = {
      line1: 'cursors to move',
      line2: 'q & e to zoom',
      line3: 'z & x to rotate',
    }

    const cam = this.cameras.main;

    const robot1 = datGui.addFolder('robot');
    robot1.add(this.robot, 'x').listen();
    robot1.add(this.robot, 'y').listen();
    robot1.open();

    const f1 = datGui.addFolder('camera');
    f1.add(cam, 'x').listen();
    f1.add(cam, 'y').listen();
    f1.add(cam, 'scrollX').listen();
    f1.add(cam, 'scrollY').listen();
    f1.add(cam, 'rotation').min(0).step(0.01).listen();
    f1.add(cam, 'zoom', 0.1, 2).step(0.1).listen();
    f1.add(help, 'line1');
    f1.add(help, 'line2');
    f1.add(help, 'line3');
    f1.open();
    // FIXME: Horrible hack?
    var customContainer = document.getElementById('phaser-map-dat-gui');
    customContainer.appendChild(datGui.domElement);
  }
}
