import Phaser from 'phaser';

import dat from 'dat.gui';

// import ImageDataUri from 'image-data-uri';

import Logo from '../assets/images/logo.png';
import RobotImage from '../assets/images/robot_large.png';
import RobotMinimapImage from '../assets/images/robot_minimap_large.png';

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

    this.lastNavigationX = 0.1;
    this.lastNavigationY = 0.1;

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
    this.load.image('robot', RobotImage);
    this.load.image('robotMinimap', RobotMinimapImage);
  }

  zoomIn = () => {
    this.map.scaleFactor = this.map.scaleFactor + 0.2;
    this.map.updateScale();
  }

  zoomOut = () => {
    this.map.scaleFactor = this.map.scaleFactor - 0.2
    this.map.updateScale();
  }

  create() {
    this.initCameraControl();

    this.createMap();
    this.createRobot();

    this.createMiniMap();

    this.initTouchRipple();

    if(this.useDatGui) {
      this.createDatGui();
    }

    // Set Inital camera position
    const cam = this.cameras.main;
    cam.scrollX = -this.sys.game.config.width/2;
    cam.scrollY = -this.sys.game.config.height/2;
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
      if(pointer.camera === this.cameras.main) {
        this.sendNavigationGoal(pointer.downX, pointer.downY);

        this.startTouchRipple(pointer.downX, pointer.downY);
      }

      if(pointer.camera === this.minimap){
        const camera = this.minimap;
        const p = camera.getWorldPoint(pointer.downX, pointer.downY);

        this.cameras.main.scrollX = p.x - this.sys.game.config.width/2;
        this.cameras.main.scrollY = p.y - this.sys.game.config.height/2;
      }

    });

    // this.sys.game.canvas.addEventListener('touchmove', (event) => {
    //   event.preventDefault();
    //   console.log(event)
    // });
  }

  createRobot() {
    const x = this.storeState.getIn(['robotPose', 'position', 'x']);
    const y = this.storeState.getIn(['robotPose', 'position', 'y']);

    this.robot = new Robot({
      scene: this,
      storeState: this.storeState,
      key: 'robot',
      x: 0,
      y: 0,
      map: this.map,
      scaleFactor: 0.1,
      useTween: false,
      useLowPass: true,
    });
  }


  createMiniMap() {
    const {height} = this.sys.game.config;
    const mapHeight = Math.round(height/2.5)
    const mapWidth =  mapHeight;
    // const mapWidth = Math.round(width/3)

    const mapPositionY = height - mapHeight;
    const mapPositionX =  0;

    this.minimap = this.cameras.add(
      mapPositionX,
      mapPositionY,
      mapWidth,
      mapHeight
    ).setZoom(0.4);

    this.minimap.setBackgroundColor(0x000000);
    this.minimap.scrollX = -mapHeight/2;
    this.minimap.scrollY = -mapWidth/2;

    this.cameraBorderGraphics = this.add.graphics();

    this.updateCameraBorder();
  }

  initTouchRipple() {
    this.touchRippleData = {x: 3000, y:3000, radius: 1, alpha: 1};

    this.touchRippleTween = this.tweens.add({
      targets: this.touchRippleData,
      radius: 30,
      alpha: 0,
      ease: 'Linear',
      duration: 500,
      paused: true,
    });

    this.touchRippleGraphics = this.add.graphics();
  }

  startTouchRipple(x, y)
  {
    const p = this.cameras.main.getWorldPoint(x, y);
    this.touchRippleData.x = p.x;
    this.touchRippleData.y = p.y;
    this.touchRippleTween.play();
  }


  sendNavigationGoal(x, y) {
    const resolution = this.storeState.getIn(['mapInfo', 'resolution']);

    const robotPosePosition = this.storeState.getIn(['robotPose', 'position']).toJS();

    const camera = this.cameras.main;
    const p = camera.getWorldPoint(x, y);

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

    this.lastNavigationX = position.x;
    this.lastNavigationY = position.y;

    this.actions.sendNavigationGoal(pose);

  }

  initCameraControl() {
    this.cameras.main.setBounds(-2000, -2000, 4000, 4000);

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



  update(time, delta) {

    this.controls.update(delta);

    this.map.update(this.storeState);
    this.robot.update(this.storeState, delta);

    this.updateMiniMap();

    this.updateTouchRipple();

    if(this.useDatGui) {
      this.updateDatGui();
    }
  }

  updateMiniMap() {
    if(this.map.height > 0){
      const mapZoomX = this.minimap.height/(this.map.height*this.map.scaleX);
      const mapZoomY = this.minimap.width/(this.map.width*this.map.scaleY);
      let mapZoom;

      if(mapZoomX < mapZoomY){
        mapZoom = mapZoomX;
      } else {
        mapZoom = mapZoomY;
      }

      this.minimap.setZoom(mapZoom);

      this.minimap.scrollX = -this.minimap.height/2;
      this.minimap.scrollY = -this.minimap.width/2;
    }

    this.updateCameraBorder();

  }

  updateCameraBorder() {

    this.cameraBorderGraphics.clear();
    var color = 0x00BCD4;
    var thickness = 5;
    var alpha = 1;

    this.cameraBorderGraphics.lineStyle(thickness, color, alpha);

    const camera = this.cameras.main;

    const cameraWidth = camera.width/camera.zoom;
    const cameraHeight = camera.height/camera.zoom;

    // TODO: Figure out why this works...
    const borderPositionX = camera.scrollX - thickness*camera.zoom + (camera.width/2)*(camera.zoom-1)/camera.zoom;
    const borderPositionY = camera.scrollY + (camera.height/2)*(camera.zoom-1)/camera.zoom;

    this.cameraBorder = this.cameraBorderGraphics.strokeRect(
      borderPositionX,
      borderPositionY,
      cameraWidth + thickness,
      cameraHeight + thickness
    );

  }

  updateTouchRipple() {
    this.touchRippleGraphics.clear();
    this.touchRippleGraphics.fillStyle(0x00BCD4, this.touchRippleData.alpha);

    this.touchRippleGraphics.fillCircle(
      this.touchRippleData.x,
      this.touchRippleData.y,
      this.touchRippleData.radius
    );
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
    // g1.open();

    const p1 = datGui.addFolder("pointer");
    p1.add(this.input, 'x').listen();
    p1.add(this.input, 'y').listen();
    p1.add(this.conv, 'camera_x').listen();
    p1.add(this.conv, 'camera_y').listen();
    p1.add(this.conv, 'map_x').listen();
    p1.add(this.conv, 'map_y').listen();
    p1.add(this.conv, 'ros_x').listen();
    p1.add(this.conv, 'ros_y').listen();
    // p1.open();

    const help = {
      line1: 'cursors to move',
      line2: 'q & e to zoom',
      line3: 'z & x to rotate',
    }

    const robot1 = datGui.addFolder('robot');
    robot1.add(this.robot, 'x').listen();
    robot1.add(this.robot, 'y').listen();
    robot1.add(this.robot, 'angle').listen();
    robot1.add(this.robot, 'useLowPass').listen();
    robot1.add(this.robot, 'lowpassTrans').listen();
    robot1.add(this.robot, 'lowpassAngle').listen();
    robot1.add(this.robot, 'rosPositionX').listen();
    robot1.add(this.robot, 'rosPositionY').listen();
    // robot1.open();

    const commands1 = datGui.addFolder('commands');
    commands1.add(this, 'lastNavigationX').listen();
    commands1.add(this, 'lastNavigationY').listen();
    // commands1.open();

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
    // map1.open();

    const minimap1 = this.minimap;
    const mini1 = datGui.addFolder('minimap');
    mini1.add(minimap1, 'x').listen();
    mini1.add(minimap1, 'y').listen();
    mini1.add(minimap1, 'scrollX').listen();
    mini1.add(minimap1, 'scrollY').listen();
    mini1.add(minimap1, 'rotation').min(0).step(0.01).listen();
    mini1.add(minimap1, 'zoom', 0.1, 2).step(0.1).listen();

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
    // f1.open();


    // FIXME: Horrible hack?
    var customContainer = document.getElementById('phaser-map-dat-gui');
    customContainer.appendChild(datGui.domElement);
  }
}
