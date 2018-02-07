import React from 'react';

import Phaser from 'phaser';

export default class Map extends React.Component {
  constructor(...args) {
    super(...args);

    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'test', { preload: this.preload, create: this.create, update: this.update });

    }

    componentWillMount() {
    }

    componentWillUnmount() {
    }

    preload() {
    }

    create() {
    }

    update() {
    }


  render() {
    return (<div id='test'></div>);
  }

}
