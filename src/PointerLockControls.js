/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */

import * as THREE from 'three'
const Util = require('./Utilities/Funcs')

const PointerLockControls = function ( camera, cannonBody, domElement ) {

    const scope = this;
	this.domElement = domElement || document.body;
    this.velocityFactor = 0.2;
    this.jumpVelocity = 20;
    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add( camera );
    this.yawObject = new THREE.Object3D();
    this.yawObject.add( this.pitchObject );
    this.quat = new THREE.Quaternion();
    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;
    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
    this.canJump = false;
    this.contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    this.upAxis = new CANNON.Vec3(0,1,0);
    this.direction = new THREE.Vector3()
    this.ray = new THREE.Raycaster()
    this.ray.near = 0
    this.ray.far = 7
    this.cannonBody = cannonBody
    this.mouse = new THREE.Vector2()
    this.intersects = []

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
        if (game.object !== undefined) {
          this.intersects = this.ray.intersectObjects(game.object.children)
        }
    };

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
        if (intersect.object.name.includes('button') && !game.doorOneIsOpen) {
            let B = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/electric_door_opening_2.mp3')
            B.volume = 0.5
            Util.doorOpen('door0Model', 0)
            game.doorOneIsOpen = true
            setTimeout(() => B.play(), 1000)
            game.face[0].style.display = 'block'
        }
        if (intersect.object.note) {
        let audio = new Audio(intersect.object.note);
        audio.volume = 0.5
        audio.play();
        game.noteBlocks.push(intersect.object.name.charAt(0))
        if (intersect.object.name === "shiaNoteBlock") {
            game.noteBlocks = []
        }
        if (game.noteBlocks.length === 4) {
            if (game.noteBlocks.join('') === "FACE" && !game.doorTwoIsOpen) {
            let fmaj7 = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/Fmaj7.mp3')
            let B = new Audio('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/electric_door_opening_2.mp3')
            Util.doorOpen('door1Model', -18)
            game.doorTwoIsOpen = true
            B.volume = 0.1
            fmaj7.volume = 0.1
            setTimeout(() => fmaj7.play(), 700)
            setTimeout(() => B.play(), 1000)

            Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/rick-astley-never-gonna-give-you-up-hq.mp3')
            Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/Toto+-+Africa+(Video).mp3')
            Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/F+it+up+-+Louis+Cole+(Live+Sesh).mp3')
            Util.rickRoll('https://s3-us-west-2.amazonaws.com/sound-escape/music/Peaches+-+The+Presidents+of+the+United+States+of+America.mp3')
            let ambience = new THREE.Audio( game.listener )
            game.audioLoader.load('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/night-ambience1.mp3', function( buffer ) {
              ambience.setLoop( true )
              ambience.setBuffer( buffer )
              ambience.setVolume(0.03)
              ambience.play()
            })
            game.astley[0].style.display = 'block'

            setTimeout(() => {
                game.astley[0].style.display = 'none'
            }, 5500)

            } else {
            game.noteBlocks = []
            }
        }
        }
        if (intersect.object.children !== undefined && intersect.object.children.length !== 0) {
        if (intersect.object.children[0].buffer.duration === 212.6033560090703) {
            game.winner[0].style.display = 'block'
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

        //!!!!!!!!!!!------enable motion sickness mode-------!!!!!!!!!
        // this.yawObject.quaternion.copy(this.cannonBody.quaternion)
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
