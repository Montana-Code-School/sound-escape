import * as THREE from 'three'

/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
const PointerLockControls = function ( camera, cannonBody, domElement ) {

    console.log('in controls', cannonBody)
    var scope = this;

	this.domElement = domElement || document.body;

    this.eyeYPos = 2; // eyes are 2 meters above the ground
    this.velocityFactor = 0.2;
    this.jumpVelocity = 20;

    this.pitchObject = new THREE.Object3D();
    this.pitchObject.add( camera );

    this.yawObject = new THREE.Object3D();
    this.yawObject.position.y = 2;
    this.yawObject.add( this.pitchObject );

    this.quat = new THREE.Quaternion();

    this.moveForward = false;
    this.moveBackward = false;
    this.moveLeft = false;
    this.moveRight = false;

    this.velocity = new THREE.Vector3()
    this.direction = new THREE.Vector3()
    
    // this.yawObject = yawObject

    this.raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );

    this.canJump = false;

    this.contactNormal = new CANNON.Vec3(); // Normal in the contact, pointing *out* of whatever the player touched
    this.upAxis = new CANNON.Vec3(0,1,0);
    this.cannonBody = cannonBody

    // this.cannonBody.addEventListener("collide",function(e){
    //     console.log("event listneerwers")
    //     // contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
    //     // We do not yet know which one is which! Let's check.
    //     if(e.contact.bi.id == this.cannonBody.id) { // bi is the player body, flip the contact normal
    //         e.contact.ni.negate(this.contactNormal);
    //         console.log("if if if")
    //     }
    //     else {
    //         this.contactNormal.copy(e.contact.ni); // bi is something else. Keep the normal as it is
    //         console.log("else else else")
    //     }
    //     // If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
    //     if(this.contactNormal.dot(upAxis) > 0.5) // Use a "good" threshold value between 0 and 1 here!
    //         this.canJump = true;
    // });



    // this.velocity = this.cannonBody.velocity;

    var PI_2 = Math.PI / 2;

    this.onMouseMove = ( event ) => {

        if ( scope.isLocked === false ) return;

        var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
        var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

        this.yawObject.rotation.y -= movementX * 0.001;
        this.pitchObject.rotation.x -= movementY * 0.001;

        this.pitchObject.rotation.x = Math.max( - PI_2, Math.min( PI_2, this.pitchObject.rotation.x ) );
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
        return this.yawObject;
    };

    this.getDirection = function(targetVec){
        targetVec.set(0,0,-1);
        quat.multiplyVector3(targetVec);
    }

    // Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
    this.inputVelocity = new THREE.Vector3();
    this.euler = new THREE.Euler();

    // this.update = function ( delta ) {
    //     // if ( this.enabled === false ) return;
    //     delta *= 0.5;

    //     this.inputVelocity.set(0,0,0);

    //     if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 400.0 * delta;
    //     if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 400.0 * delta;


	// 	this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
	// 	this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
	// 	this.direction.normalize(); // this ensures consistent movements in all directions

        
    //     // Convert velocity to world coordinates
    //     this.euler.x = this.pitchObject.rotation.x;
    //     this.euler.y = this.yawObject.rotation.y;
    //     this.euler.order = "XYZ";
    //     this.quat.setFromEuler(this.euler);
    //     this.inputVelocity.applyQuaternion(this.quat);
    //     // this.quat.multiplyVector3(this.inputVelocity);

    //     // Add to the object
    //     this.velocity.x += this.inputVelocity.x;
    //     this.velocity.z += this.inputVelocity.z;

	// 	this.velocity.y = Math.max(0, this.velocity.y)

    //     this.yawObject.translateX(this.velocity.x * delta)
    //     this.yawObject.translateY(this.velocity.y * delta)
    //     this.yawObject.translateZ(this.velocity.z * delta)
    //     this.yawObject.position.copy(this.cannonBody.position);
    //     this.cannonBody.position.copy(this.yawObject.position)
    // };

    this.update = function(delta) {
		// this.raycaster.ray.origin.copy(this.yawObject.position)
		this.velocity.x -= this.velocity.x * 1.0 * delta;
		this.velocity.z -= this.velocity.z * 1.0 * delta;
		this.velocity.y -= 9.82 * 100 * delta; // 100.0 = mass
		this.direction.z = Number( this.moveForward ) - Number( this.moveBackward );
		this.direction.x = Number( this.moveLeft ) - Number( this.moveRight );
		this.direction.normalize(); // this ensures consistent movements in all directions
		if ( this.moveForward || this.moveBackward ) this.velocity.z -= this.direction.z * 50.0 * delta;
		if ( this.moveLeft || this.moveRight ) this.velocity.x -= this.direction.x * 50.0 * delta;
		this.velocity.y = Math.max(0, this.velocity.y)
		this.yawObject.translateX(this.velocity.x * delta)
		this.yawObject.translateY(this.velocity.y * delta)
        this.yawObject.translateZ(this.velocity.z * delta)  
        game.camBody.position.copy(this.yawObject.position)
        // console.log("cambody",game.camBody.position,"yaw",this.yawObject.position)

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
