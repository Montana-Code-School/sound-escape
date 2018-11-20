
import * as THREE from 'three'
// THREE = require('three')

import FirstPersonControls from './FirstPersonControls'
import Game from './Game'

document.addEventListener('DOMContentLoaded', function(){
  console.log('DOMContentLoaded')
  const game = new Game();
  window.game = game;//For debugging only
});

