
THREE = require('three')

import Game from './Game'

document.addEventListener('DOMContentLoaded', function(){
  const game = new Game();
  window.game = game;//For debugging only
});
