import Phaser from 'phaser';

export default class Map extends Phaser.GameObjects.Sprite {
  constructor(config) {
    super(config.scene, config.x, config.y, config.key);

    config.scene.add.existing(this);

    this.storeState = config.storeState;
    this.scaleFactor = config.scaleFactor;

    this.delayedTextureUpdate = true;

    this.updateScale();
  }

  updateScale() {
    this.setScale(this.scaleFactor);
  }

  update = (storeState) => {
    this.storeState = storeState;

    if(this.storeState.get('mapData') !== this.mapData){ // If map has been updated
      this.mapData = this.storeState.get('mapData');

      this.updateScale();
      this.updateMapTexture();

      this.input.hitArea.width = this.width;
      this.input.hitArea.height = this.height;
    } else if(this.delayedTextureUpdate) {
      this.updateMapTexture();
      this.delayedTextureUpdate = false;
    }
  }

  updateMapOrigin() {
    const resolution = this.storeState.getIn(['mapInfo', 'resolution']);
    const mapOrigin = this.storeState.getIn(['mapInfo', 'origin', 'position']).toJS();

    const offsetX = (resolution*this.width/2 + mapOrigin.x)/resolution;
    const offsetY = -(resolution*this.height/2 + mapOrigin.y)/resolution;

    this.setDisplayOrigin(this.width/2 - offsetX, this.height/2 - offsetY);

  }

  updateMapTexture() {
    const {width, height} = this.storeState.get('mapInfo').toJS();
    const mapData = this.storeState.get('mapData');

    if(this.width !== width || this.height !== height) {
      // Figure out why this is neccecary
      this.setSize(width, height);
      this.delayedTextureUpdate = true;
      return;
    }

    this.updateMapOrigin();

    if(width === 0 || height === 0) {
      return;
    }

    const mapTexture = this.scene.textures.createCanvas('map', width, height);
    const canvas = mapTexture.getSourceImage();
    const context = canvas.getContext('2d');

   const imageData = context.createImageData(width, height);

    for ( let row = 0; row < height; row++) {
      for ( let col = 0; col < width; col++) {
        // Determine the index into the map data
        const mapI = col + ((height - row - 1) * width);
        // Determine the value
        const data = mapData[mapI];

        let val;

        var red, green, blue
        if (data === -1) {
          // Make unexplored black
          val = 0

          red = val
          green = val
          blue = val
        } else if (data > 50) {
          // Make walls blue
          val = 255 - data

          red = 50
          green = 50
          blue = val
        } else {
          // Make clear space a shade of gray
          val = 255 - data

          red = val
          green = val
          blue = val
        }

        // Determine the index into the image data array
        var i = (col + (row * this.width)) * 4;
        // r
        imageData.data[i] = red;
        // g
        imageData.data[++i] = green;
        // b
        imageData.data[++i] = blue;
        // a
        imageData.data[++i] = 255;
      }
    }

    context.putImageData(imageData, 0, 0);
    this.scene.textures.addCanvas('map', canvas);

    this.setSize(width, height);
    this.setTexture('map');
    // this.setSizeToFrame();
    // this.setOriginFromFrame();
    // this.initPipeline('TextureTintPipeline');
  }
}
