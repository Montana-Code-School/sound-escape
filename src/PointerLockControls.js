import * as THREE from 'three'
/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

const PointerLockControls = function ( camera, domElement ) {

	var scope = this;

	this.domElement = domElement || document.body;
	this.isLocked = true;

	camera.rotation.set( 0, 0, 0 );

	var pitchObject = new THREE.Object3D();
	pitchObject.add( camera );

	var yawObject = new THREE.Object3D();
	yawObject.position.y = 10;
	yawObject.add( pitchObject );

	this.moveForward = false
	this.moveBackward = false
	this.moveLeft = false
	this.moveRight = false
	this.interact = false

	this.velocity = new THREE.Vector3()
	this.direction = new THREE.Vector3()

	this.yawObject = yawObject

	this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );


	var PI_2 = Math.PI / 2;

	this.onMouseMove = ( event ) => {

		if ( scope.isLocked === false ) return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		yawObject.rotation.y -= movementX * 0.002;
		pitchObject.rotation.x -= movementY * 0.002;

		pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );

	}

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
			case 32:
				this.interact = true
				break;

		}
	};
	this.onKeyUp = ( event ) => {
		switch ( event.keyCode ) {
			case 38: // up
			case 87: // w
				this.moveForward = false;
				break;
			case 37: // left
			case 65: // a
				this.moveLeft = false;
				break;
			case 40: // down
			case 83: // s
				this.moveBackward = false;
				break;
			case 39: // right
			case 68: // d
				this.moveRight = false;
				break;
		}
	};

	this.update = function(delta) {
		this.raycaster.ray.origin.copy(yawObject.position)
		this.velocity.x -= this.velocity.x * 10.0 * delta;
		this.velocity.z -= this.velocity.z * 10.0 * delta;
		this.velocity.y -= 9.82 * 100 * delta; // 100.0 = mass
		this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
		this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
		this.direction.normalize(); // this ensures consistent movements in all directions
		if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
		if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * delta;
		this.velocity.y = Math.max(0, this.velocity.y)
		yawObject.translateX(this.velocity.x * delta)
		yawObject.translateY(this.velocity.y * delta)
		yawObject.translateZ(this.velocity.z * delta)
	}

	function onPointerlockChange() {

		if ( document.pointerLockElement === scope.domElement ) {

			scope.dispatchEvent( { type: 'lock' } );

			scope.isLocked = true;

		} else {

			scope.dispatchEvent( { type: 'unlock' } );

			scope.isLocked = false;

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

	this.dispose = function () {

		this.disconnect();

	};

	this.getObject = function () {

		return yawObject;

	};

	this.getDirection = function () {

		// assumes the camera itself is not rotated

		var direction = new THREE.Vector3( 0, 0, - 1 );
		var rotation = new THREE.Euler( 0, 0, 0, 'YXZ' );

		return function ( v ) {

			rotation.set( pitchObject.rotation.x, yawObject.rotation.y, 0 );

			v.copy( direction ).applyEuler( rotation );

			return v;

		};

	}();

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
