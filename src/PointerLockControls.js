/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */

import * as THREE from 'three'
import whichPad from './Utilities/PadFuncs'
const Util = require('./Utilities/Funcs')
import SceneUtils from './Utilities/SceneUtils'

const PointerLockControls = function ( camera, cannonBody, domElement ) {

    const scope = this;
	this.domElement = domElement || document.body;
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add( camera );
    this.yawObject = new THREE.Object3D();
    this.yawObject.add( this.pitchObject );
    this.cannonBody = cannonBody
    this.quat = new THREE.Quaternion();

    // movement
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.canJump = false;
    this.velocityFactor = 0.2;
    this.jumpVelocity = 20;
    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()

    this.contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    this.upAxis = new CANNON.Vec3(0,1,0);
    this.direction = new THREE.Vector3()

    // raycaster
    this.ray = new THREE.Raycaster()
    this.ray.near = 0
    this.ray.far = 7
    this.mouse = new THREE.Vector2()
    this.intersects = []

    // tree flags
    this.motionSicknessMode = false
    this.colorChangeMode = false
    this.wireFrame = false

    this.cannonBody.addEventListener("collide",function(e){
        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if(e.contact.bi.id == scope.cannonBody.id ) { // bi is the player body, flip the contact normal
            e.contact.ni.negate(scope.contactNormal);
            game.world.bodies.forEach((body) => {
              if (e.contact.bj.id !== 22 && e.contact.bj.id !== 2 && e.contact.bj.id === body.id) {
                body.canInteract = !body.canInteract
              }
            })
          }
        else
            scope.contactNormal.copy(e.contact.ni); // bi is something else. Keep the normal as it is
        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        if(scope.contactNormal.dot(scope.upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
            scope.canJump = true;
    });

    this.velocity = this.cannonBody.velocity;
    const PI_2 = Math.PI / 2;

    this.onMouseMove = ( event ) => {
        if ( scope.enabled === false ) return;
        const movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        const movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;
        this.yawObject.rotation.y -= movementX * 0.001;
        this.pitchObject.rotation.x -= movementY * 0.001;
        this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );
        // resets objects intersected by raycaster on mousemove
        if (game.object !== undefined) {
          this.intersects = this.ray.intersectObjects(game.object.children)
        }
    };

    // movement flags
    this.onKeyDown = ( event ) => {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = true;
                break;
            case 40: // down
            case 83: // s
                this.moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = true;
                break;
            case 32: // space
                if ( this.canJump === true ){
                    this.velocity.y = this.jumpVelocity;
                }
                this.canJump = false;
                break;
        }
        if (game.object !== undefined) {
            this.intersects = this.ray.intersectObjects(game.object.children)
        }
    };

    this.onKeyUp = ( event ) => {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                this.moveForward = false;
                break;
            case 37: // left
            case 65: // a
                this.moveLeft = false;
                break;
            case 40: // down
            case 83: // a
                this.moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                this.moveRight = false;
                break;
        }
        if (game.object !== undefined) {
            this.intersects = this.ray.intersectObjects(game.object.children)
        }
    };

    this.onClick = ( event ) => {
      game.controls.intersects.forEach((intersect) => {
        if (intersect.object.name.includes('Pad')){
          whichPad(intersect.object)
        }
        // picks up or drops oscillator box
        if (intersect.object.name === "box") {
            game.boxMesh.isPickedUp = !game.boxMesh.isPickedUp
            if (game.boxMesh.isPickedUp === false) {
              game.waveform.style.display = 'none'
              SceneUtils.detach(game.boxMesh, game.camera, game.scene)
              // checks if oscillator frequency is in range to open door
              if (game.oscillator.frequency.value < 2800 && game.oscillator.frequency.value > 2700) {
                game.oscillator.stop()
                let B = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/electric_door_opening_2.mp3')
                B.volume = 0.5
                Util.doorOpen('door0Model', 0)
                game.doorOneIsOpen = true
                setTimeout(() => B.play(), 1000)
                game.face[0].style.display = 'block'
              }
            } else if (game.boxMesh.isPickedUp === true)
              SceneUtils.attach(game.boxMesh, game.scene, game.camera)
              game.waveform.style.display = 'block'
            }
          // opens door one when button is pressed
          if (intersect.object.name.includes('button') && !game.doorOneIsOpen) {
            game.doorOneIsOpen = true
            game.face[0].style.display = 'block'
            Util.doorOpen('door0Model', 0)
            // door sound create and play
            let B = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/electric_door_opening_2.mp3')
            B.volume = 0.5
            setTimeout(() => B.play(), 1000)
          }
          // note block checker
          if (intersect.object.note) {
            game.noteBlocks.push(intersect.object.name.charAt(0))
            // play the pressed note
            let audio = new Audio(intersect.object.note);
            audio.volume = 0.5
            audio.play();
            // resets success array when reset block is pressed
            if (intersect.object.name === "shiaNoteBlock") {
              game.noteBlocks = []
            }
            // checks note array for success
            if (game.noteBlocks.length === 4) {
              if (game.noteBlocks.join('') === "FACE" && !game.doorTwoIsOpen) {
                // success chord
                let fmaj7 = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/Fmaj7.mp3')
                fmaj7.volume = 0.5
                setTimeout(() => fmaj7.play(), 700)
                // door two sound and animation
                game.doorTwoIsOpen = true
                let B = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/electric_door_opening_2.mp3')
                B.volume = 0.1
                setTimeout(() => B.play(), 1000)
                Util.doorOpen('door1Model', -18)
                // initialize tree music for next puzzle
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/rick-astley-never-gonna-give-you-up-hq.mp3', 'rick')
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/Toto+-+Africa+(Video).mp3', 'toto')
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/F+it+up+-+Louis+Cole+(Live+Sesh).mp3', 'louis')
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/Peaches+-+The+Presidents+of+the+United+States+of+America.mp3', 'peaches')
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/MESHUGGAH+-+Bleed+(OFFICIAL+MUSIC+VIDEO).mp3', 'bleed')
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/Ragtime+Piano+SCOTT+JOPLIN+.+The+Entertainer+(1902).mp3', 'entertainer')
                Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/Britney+Spears+-+...Baby+One+More+Time.mp3', 'britney')
                // outdoors sounds for next puzzle
                let ambience = new THREE.Audio( game.listener )
                game.audioLoader.load('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/night-ambience1.mp3', function( buffer ) {
                  ambience.setLoop( true )
                  ambience.setBuffer( buffer )
                  ambience.setVolume(0.03)
                  ambience.play()
                })
                // clue for next puzzle
                game.astley[0].style.display = 'block'
                setTimeout(() => {
                  game.astley[0].style.display = 'none'
                }, 5500)
                // resets success array
                } else {
                  game.noteBlocks = []
                }
              }
            }
          // tree checkers
          if (intersect.object.children !== undefined && intersect.object.children.length !== 0) {
            // if rick tree is clicked player wins.
            if (intersect.object.tagName === 'rick') {
                game.winner[0].style.display = 'block'
            }
            // if bleed tree is clicked enable motion sickness mode, turn it off if tree is clicked again
            if(intersect.object.tagName === 'bleed') {
              this.motionSicknessMode = !this.motionSicknessMode
              if (!this.motionSicknessMode) {
                this.yawObject.quaternion.copy(new THREE.Quaternion(0, 0, 0, 0))
              }
            }
            // if toto tree is clicked enable color change mode
            if (intersect.object.tagName === 'toto') {
              this.colorChangeMode = !this.colorChangeMode
            }
            // if entertainer tree is clicked enable wireframe
            if (intersect.object.tagName === 'entertainer') {
              this.wireFrame = !this.wireFrame
              if (this.wireFrame) {
                game.object.children.forEach((child) => {
                  child.material.wireframe = true
                })
              }
            // if britney tree is clicked, randomize tree positions.
            }
            if (intersect.object.tagName === 'britney') {
              game.object.children.forEach((child) => {
                let x, y, z
                if (child.name.includes('trunk') || child.name.includes('crown')) {
                  x = (Math.floor(Math.random() * game.object.children.length) + -400) / 2
                  y = Math.floor(Math.random() * 4)
                  z = (Math.floor(Math.random() * game.object.children.length) + -400) / 2
                  child.position.copy(new THREE.Vector3(x, y, z))
                }
              })
            }
          }
      })
    }


    document.addEventListener( 'mousemove', this.onMouseMove, false );
    document.addEventListener( 'keydown', this.onKeyDown, false );
    document.addEventListener( 'keyup', this.onKeyUp, false );
    document.addEventListener( 'click', this.onClick, false )
    this.enabled = false;

    this.getObject = function () {
        return this.yawObject;
    };

    this.getDirection = function(targetVec){
        targetVec.set(0,0,-1);
        scope.quat.multiplyVector3(targetVec);
    }

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    this.inputVelocity = new THREE.Vector3();
    this.euler = new THREE.Euler();

    this.update = ( delta ) => {
        this.yawObject.position.x = (this.cannonBody.position.x);
        this.yawObject.position.y = (this.cannonBody.position.y + 1);
        this.yawObject.position.z = (this.cannonBody.position.z);
        if ( scope.enabled === false ) return;
        delta *= 400;
        this.inputVelocity.set(0,0,0);
        if ( this.moveForward ){
            this.inputVelocity.z = -this.velocityFactor * delta;
        }
        if ( this.moveBackward ){
            this.inputVelocity.z = this.velocityFactor * delta;
        }
        if ( this.moveLeft ){
            this.inputVelocity.x = -this.velocityFactor * delta;
        }
        if ( this.moveRight ){
            this.inputVelocity.x = this.velocityFactor * delta;
        }

        // Convert velocity to world coordinates
        this.euler.x = this.pitchObject.rotation.x;
        this.euler.y = this.yawObject.rotation.y;
        this.euler.order = 'XYZ';
        this.quat.setFromEuler(this.euler);
        this.inputVelocity.applyQuaternion(this.quat);

        // Add to the object
        this.velocity.x += this.inputVelocity.x;
        this.velocity.z += this.inputVelocity.z;

        this.ray.setFromCamera(this.mouse, camera)

        if (this.motionSicknessMode) {
          this.yawObject.quaternion.copy(this.cannonBody.quaternion)
        }
    };

	function onPointerlockChange() {
		if ( document.pointerLockElement === scope.domElement ) {
			scope.dispatchEvent( { type: 'lock' } );
			scope.enabled = true;
		} else {
			scope.dispatchEvent( { type: 'unlock' } );
            scope.enabled = false;
		}
	}

	function onPointerlockError() {
		console.error( 'THREE.PointerLockControls: Unable to use Pointer Lock API' );
	}

	this.connect = () => {
		document.addEventListener( 'mousemove', this.onMouseMove, false );
		document.addEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.addEventListener( 'pointerlockerror', onPointerlockError, false );
		document.addEventListener( 'keydown', this.onKeyDown, false );
		document.addEventListener( 'keyup', this.onKeyUp, false );
	};

	this.disconnect = function () {
		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'pointerlockchange', onPointerlockChange, false );
		document.removeEventListener( 'pointerlockerror', onPointerlockError, false );
	};

    this.lock = () => {
		this.domElement.requestPointerLock();
	};

	this.unlock = function () {
		document.exitPointerLock();
	};

	this.connect();
};

PointerLockControls.prototype = Object.create( THREE.EventDispatcher.prototype );
PointerLockControls.prototype.constructor = PointerLockControls;

export default PointerLockControls
