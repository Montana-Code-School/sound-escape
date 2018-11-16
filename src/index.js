
THREE = require('three')
CANNON = require('cannon')

import FirstPersonControls from './FirstPersonControls'
import Game from './Game'

document.addEventListener('DOMContentLoaded', function(){
  console.log('DOMContentLoaded')
  const game = new Game();
  window.game = game;//For debugging only
});

console.log('we here')
