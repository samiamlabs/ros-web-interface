import React from 'react';

import Phaser from 'phaser';

import Logo from '../../assets/images/logo.png';

import dat from 'dat.gui';
export default class Map extends React.Component {
  constructor(...args) {
    super(...args);
      console.log("create map")
      console.log(this.props.useDatGui)
    }

    componentDidMount() {
      var config = {
      type: Phaser.AUTO,
      parent: 'phaser-map',
      width: window.innerWidth,
      height: window.innerHeight,
      scene: {
          preload: this.preload,
          create: this.create
        }
      };


      this.game = new Phaser.Game(config);
      this.game.reactMapComponent = this;

      if (this.props.useDatGui){
        this.game.datGui = new dat.GUI({autoPlace: false});
      }
    }

    componentWillUnmount() {
      if (this.props.useDatGui){
        this.game.datGui.destroy(); // does not work properly...
      }

      this.game.destroy(true);
    }

    preload () {
      this.load.image('logo', Logo);
    }

    create () {

      var logo = this.add.image(400, 150, 'logo');

      this.tweens.add({
          targets: logo,
          y: 450,
          duration: 2000,
          ease: 'Power2',
          yoyo: true,
          loop: -1
      });

      if (this.sys.game.reactMapComponent.props.useDatGui){
        const datGui = this.sys.game.datGui;

        let p1 = datGui.addFolder("Pointer");
        p1.add(this.input, 'x').listen();
        p1.add(this.input, 'y').listen();
        p1.open();

        // FIXME: Horrible hack?
        var customContainer = document.getElementById('phaser-map-dat-gui');
        customContainer.appendChild(datGui.domElement);
      }

    }

    update() {
      this.game.debug.pointer(this.game.input.activePointer)
    }


  render() {
    const datGuiStyle = {
      position: 'absolute',
      top: '90px',
      right: '100px',
    };

    return (
        <div id='phaser-map'>
          <div id='phaser-map-dat-gui' style={datGuiStyle}/>
        </div>
    );
  }
}

Map.defaultProps = { useDatGui: false };
