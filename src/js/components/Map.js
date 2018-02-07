import React from 'react';

import Phaser from 'phaser';

import Logo from '../../assets/images/logo.png';

export default class Map extends React.Component {
  constructor(...args) {
    super(...args);

    var config = {
    type: Phaser.CANVAS,
    parent: 'test',
    width: 800,
    height: 600,
    scene: {
        preload: this.preload,
        create: this.create
      }
    };


    this.game = new Phaser.Game(config);

    }

    componentWillMount() {
    }

    componentWillUnmount() {
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

    }

    update() {
    }


  render() {
    return (<div id='test'></div>);
  }

}
