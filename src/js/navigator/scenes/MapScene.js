import Phaser from 'phaser';
import dat from 'dat.gui';

import Logo from '../assets/images/logo.png';

import Map from '../sprites/Map';
import Robot from '../sprites/Robot';

import ROSLIB from 'roslib';

export default class MapScene extends Phaser.Scene {
  constructor({useDatGui =  null, storeState = null, actions = null}) {
    super({
      key: 'MapScene'
    });

    this.useDatGui = useDatGui;

    this.storeState = storeState;
    this.laseStoreState = storeState;

    this.actions = actions;

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
    // this.load.image('map', Logo);
  }

  create() {
    this.initCameraControl();

    this.createMap();
    this.createRobot();

    // Create circle at 0 0
    const graphics = this.add.graphics();

    var color = 0xffff00;
    var thickness = 4;
    var alpha = 1;

    graphics.lineStyle(thickness, color, alpha);

    var a = new Phaser.Geom.Point(0, 0);
    var radius = 10;

    graphics.strokeCircle(a.x, a.y, radius);

    if(this.useDatGui) {
      this.createDatGui();
    }

    // Set Inital camera position
    const cam = this.cameras.main;
    cam.scrollX = -this.sys.game.config.width/2;
    cam.scrollY = -this.sys.game.config.height/2;

  }

  update(time, delta) {

    this.controls.update(delta);

    this.map.update(this.storeState);
    this.robot.update(this.storeState);

    if(this.useDatGui) {
      this.updateDatGui();
    }
  }


  createMap() {
    this.map = new Map({
      scene: this,
      storeState: this.storeState,
      key: 'logo',
      x: 0,
      y: 0,
      scaleFactor: 2,
    }).setInteractive();

    this.map.on('pointerdown', (pointer) => {
      const resolution = this.storeState.getIn(['mapInfo', 'resolution']);

      const robotPosePosition = this.storeState.getIn(['robotPose', 'position']).toJS();

      const camera = this.cameras.main;
      const p = camera.getWorldPoint(pointer.downX, pointer.downY);

      const mapPoint = Phaser.Math.TransformXY(p.x, p.y, this.map.x, this.map.y, this.map.rotation, this.map.scaleX, this.map.scaleY);

      const position = {x: mapPoint.x*resolution, y: -mapPoint.y*resolution, z: 0};

      const xDelta =  position.x - robotPosePosition.x
      const yDelta =  position.y - robotPosePosition.y

      var thetaRadians  = Math.atan2(xDelta,yDelta);

      if (thetaRadians >= 0 && thetaRadians <= Math.PI) {
        thetaRadians += (3 * Math.PI / 2);
      } else {
        thetaRadians -= (Math.PI/2);
      }

      var qz =  Math.sin(-thetaRadians/2.0);
      var qw =  Math.cos(-thetaRadians/2.0);

      var orientation = new ROSLIB.Quaternion({x:0, y:0, z:qz, w:qw});

      const pose = {position, orientation};
      this.actions.sendNavigationGoal(pose);

    });
  }

  createRobot() {
    const x = this.storeState.getIn(['robotPose', 'position', 'x']);
    const y = this.storeState.getIn(['robotPose', 'position', 'y']);

    this.robot = new Robot({
      scene: this,
      storeState: this.storeState,
      key: 'logo',
      x,
      y,
      map: this.map,
      scaleFactor: 0.1,
    });


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

  updateDatGui() {
    const camera = this.cameras.main;
    const p = camera.getWorldPoint(this.input.x, this.input.y);

    this.conv.camera_x = p.x;
    this.conv.camera_y = p.y;

    const point = Phaser.Math.TransformXY(p.x, p.y, this.map.x, this.map.y, this.map.rotation, this.map.scaleX, this.map.scaleY);
    this.conv.map_x = point.x;
    this.conv.map_y = point.y;

    const resolution = this.storeState.getIn(['mapInfo', 'resolution']);
    this.conv.ros_x = point.x*resolution;
    this.conv.ros_y = - point.y*resolution;
  }

  createDatGui() {

    this.conv = {
      camera_x: 0,
      camera_y: 0,
      map_x: 0,
      map_y: 0,
      ros_x: 0.1,
      ros_y: 0.1,
    };

    const datGui = this.datGui;

    const g1 = datGui.addFolder('game');
    g1.add(this.sys.game.loop, 'actualFps').listen();
    g1.add(this.sys.game.loop, 'delta').listen();
    g1.open();

    const p1 = datGui.addFolder("pointer");
    p1.add(this.input, 'x').listen();
    p1.add(this.input, 'y').listen();
    p1.add(this.conv, 'camera_x').listen();
    p1.add(this.conv, 'camera_y').listen();
    p1.add(this.conv, 'map_x').listen();
    p1.add(this.conv, 'map_y').listen();
    p1.add(this.conv, 'ros_x').listen();
    p1.add(this.conv, 'ros_y').listen();
    p1.open();

    const help = {
      line1: 'cursors to move',
      line2: 'q & e to zoom',
      line3: 'z & x to rotate',
    }

    const robot1 = datGui.addFolder('robot');
    robot1.add(this.robot, 'x').listen();
    robot1.add(this.robot, 'y').listen();
    robot1.add(this.robot, 'rosPositionX').listen();
    robot1.add(this.robot, 'rosPositionY').listen();
    robot1.open();

    const map1 = datGui.addFolder('map');
    map1.add(this.map, 'x').listen();
    map1.add(this.map, 'y').listen();
    map1.add(this.map, 'originX').listen();
    map1.add(this.map, 'originY').listen();
    map1.add(this.map, '_displayOriginX').listen();
    map1.add(this.map, '_displayOriginY').listen();
    map1.add(this.map, 'width').listen();
    map1.add(this.map, 'height').listen();
    map1.add(this.map, 'scaleX').listen();
    map1.add(this.map, 'scaleY').listen();
    map1.open();

    const cam = this.cameras.main;
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
