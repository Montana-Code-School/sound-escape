import * as THREE from 'three'

/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
const PointerLockControls = function ( camera, cannonBody, domElement ) {

    var scope = this;

	this.domElement = domElement || document.body;

    this.eyeYPos = 60; // eyes are 2 meters above the ground
    this.velocityFactor = 0.2;
    this.jumpVelocity = 20;

    var pitchObject = new THREE.Object3D();
    pitchObject.add( camera );

    var yawObject = new THREE.Object3D();
    yawObject.position.y = 60;
    yawObject.add( pitchObject );

    var quat = new THREE.Quaternion();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
    
    this.yawObject = yawObject

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    this.canJump = false;

    var contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    var upAxis = new CANNON.Vec3(0,1,0);
    cannonBody.addEventListener("collide",function(e){
        var contact = e.contact;

        // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
        // We do not yet know which one is which! Let's check.
        if(contact.bi.id == cannonBody.id)  // bi is the player body, flip the contact normal
            contact.ni.negate(contactNormal);
        else
            contactNormal.copy(contact.ni); // bi is something else. Keep the normal as it is

        // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
        if(contactNormal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
            this.canJump = true;
    });

    this.velocity = cannonBody.velocity;

    var PI_2 = Math.PI / 2;

    this.onMouseMove = ( event ) => {

        if ( scope.isLocked === false ) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        yawObject.rotation.y -= movementX * 0.002;
        pitchObject.rotation.x -= movementY * 0.002;

        pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, pitchObject.rotation.x ) );
    };

    this.onKeyDown = ( event ) => {

        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                this.moveForward = true;
                break;

            case 37: // left
            case 65: // a
                this.moveLeft = true; break;

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

    };

    document.addEventListener( 'mousemove', this.onMouseMove, false );
    document.addEventListener( 'keydown', this.onKeyDown, false );
    document.addEventListener( 'keyup', this.onKeyUp, false );

    this.enabled = false;

    this.getObject = function () {
        return yawObject;
    };

    this.getDirection = function(targetVec){
        targetVec.set(0,0,-1);
        quat.multiplyVector3(targetVec);
    }

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    var inputVelocity = new THREE.Vector3();
    var euler = new THREE.Euler();

    // this.update = function ( delta ) {

    //     if ( scope.enabled === false ) return;

    //     delta *= 0.1;

    //     inputVelocity.set(0,0,0);

    //     if ( moveForward ){
    //         inputVelocity.z = -velocityFactor * delta;
    //     }
    //     if ( moveBackward ){
    //         inputVelocity.z = velocityFactor * delta;
    //     }

    //     if ( moveLeft ){
    //         inputVelocity.x = -velocityFactor * delta;
    //     }
    //     if ( moveRight ){
    //         inputVelocity.x = velocityFactor * delta;
    //     }

    //     // Convert velocity to world coordinates
    //     euler.x = pitchObject.rotation.x;
    //     euler.y = yawObject.rotation.y;
    //     euler.order = "XYZ";
    //     quat.setFromEuler(euler);
    //     inputVelocity.applyQuaternion(quat);
    //     //quat.multiplyVector3(inputVelocity);

    //     // Add to the object
    //     velocity.x += inputVelocity.x;
    //     velocity.z += inputVelocity.z;

    //     yawObject.position.copy(cannonBody.position);
    // };

    this.update = function(delta) {
		this.raycaster.ray.origin.copy(yawObject.position)
		this.velocity.x -= this.velocity.x * 1.0 * delta;
		this.velocity.z -= this.velocity.z * 1.0 * delta;
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
