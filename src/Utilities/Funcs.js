import whichPad from './PadFuncs'

export function createColliders(){
    const scaleAdjust = 2;
    const divisor = 2 / scaleAdjust;
    game.object.children.forEach(function(child, i){
      if (child.isMesh && !child.name.includes('ground')) {
        child.visible = true;
        const halfExtents = new CANNON.Vec3(child.scale.x/divisor, child.scale.y/divisor, child.scale.z/divisor);
        const box = new CANNON.Box(halfExtents);
        const body = new CANNON.Body({mass:0});
        body.addShape(box);
        body.name = child.name
        if (child.name.includes('NoteBlock')) {
          child.note = 'https://s3-us-west-2.amazonaws.com/sound-escape/sounds/Room+One+notes/' + child.name.charAt(0) + '.mp3'
          if (child.name.includes('shia')) {
            child.note = 'https://s3-us-west-2.amazonaws.com/sound-escape/sounds/shia.wav'
          }
        }
        body.position.copy(child.position);
        body.quaternion.copy(child.quaternion);
        body.collisionResponse = true
        if (!child.name.includes('Text')) {
          game.world.add(body);
        }

      }
    })
  }

export function rickRoll(songURL) {
    let rick, rolling, potentialRollers = []
    game.object.children.forEach((child) => {
      if (child.name.includes('trunk') && !child.hasSong) {
        potentialRollers.push(child)
      }
    })
    let randomNumber = Math.floor(Math.random()*potentialRollers.length)
    rick = potentialRollers[randomNumber]
    rick.hasSong = true
    rolling = new THREE.PositionalAudio( game.listener )

    game.audioLoader.load(songURL, function( buffer ) {
      rolling.setBuffer( buffer )
      rolling.setRefDistance( .3 )
      rolling.setVolume(1.5)
      rolling.setLoop( true )
      rolling.play()
      rick.add(rolling)
    })
  }

export function color(mesh) {
    if (mesh.name.includes('crown') || mesh.name.includes('buttonModel') || mesh.name.includes('Text') || mesh.name.includes('PadCase'))
        mesh.material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    else if (mesh.name.includes('Pad'))
        mesh.material = new THREE.MeshToonMaterial( { color: 'red' } );
    else
        mesh.material = new THREE.MeshPhongMaterial({ color: 0x777777, shininess: 0 })
}

export function doorOpen(doorName, whichDoor) {
    const TWEEN = require('@tweenjs/tween.js');
    let door;
    let doorBody;
    game.object.children.forEach((child) => {
      if (child.name === doorName) {
        door = child
      }
    })
    game.world.bodies.forEach((body) => {
      if (body.name === doorName) {
        doorBody = body
      }
    })
    let updateDoor = function () {
      door.position.z = current.z
      door.position.x = current.x
      doorBody.position.z = current.z
      doorBody.position.x = current.x
    }
    let current = {x: -46, z: 8.8}
    let easing = TWEEN.Easing.CubicEaseInOut = function ( k ) {
      if ( ( k *= 2 ) < 1 ) return 0.5* k * k * k;
      return 0.5 * ( ( k -= 2 ) * k * k + 2 );
        };
    let tweenHead = new TWEEN.Tween(current)
                .to({x:-46 + whichDoor, z:8.8}, 500)
                .delay(200)
                .easing(easing)
                .onUpdate(updateDoor)

    let tweenMiddle = new TWEEN.Tween(current)
                .to({x:-47 + whichDoor, z:8.8}, 2000)
                .delay(200)
                .easing(easing)
                .onUpdate(updateDoor)

    let tweenBack = new TWEEN.Tween(current)
                .to({x:-47 + whichDoor, z: 3}, 2000)
                .delay(200)
                .easing(easing)
                .onUpdate(updateDoor)

    tweenHead.chain(tweenMiddle)
    tweenMiddle.chain(tweenBack)
    tweenHead.start()
  }

export default {createColliders, color, rickRoll, doorOpen}
