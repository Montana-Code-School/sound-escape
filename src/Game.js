import PointerLockControls from './PointerLockControls';
import CannonDebugRenderer from './CannonDebugRenderer';
const TWEEN = require('@tweenjs/tween.js');

FBXLoader = require('three-fbx-loader');

export default class Game{
    constructor(){
        this.initPhysics()
        this.init()
        this.assLoad()
        
        setTimeout(this.animate(), 1000)
    }

    initPhysics(){
      const world = new CANNON.World();
      this.world = world;
      this.world.fixedTimeStep = 1.0/60.0;
      this.world.defaultContactMaterial.contactEquationStiffness = 1e9;
      this.world.defaultContactMaterial.contactEquationRelaxation = 4;
      const physicsMaterial = new CANNON.Material("slipperyMaterial");
      const physicsContactMaterial = new CANNON.ContactMaterial(
                                                              physicsMaterial,
                                                              physicsMaterial,
                                                              0.0, // friction coefficient
                                                              0.3  // restitution
                                                              );
      this.world.addContactMaterial(physicsContactMaterial);
      this.world.gravity.set(0, -10, 0);
      this.world.broadphase = new CANNON.NaiveBroadphase();
      this.material = new THREE.MeshLambertMaterial( { color: 0xdddddd } )
      this.testMaterial = new CANNON.Material()
      
      // Cannon Box body
      this.boxx = new CANNON.Box(new CANNON.Vec3(1.5,1.5,1.5))
      this.cube = new CANNON.Body({mass:.1, material: this.testMaterial})
      this.cube.angularDamping = 0.01
      this.cube.linearDamping = 0.01
      this.cube.position.set(0, 2, -7)
      this.cube.addShape(this.boxx)
      this.world.add(this.cube)

      // Cannon Cam Sphere
      this.sphere = new CANNON.Sphere(2);
      this.camBody = new CANNON.Body({mass: 10}) 
      this.camBody.addShape(this.sphere);      
      this.camBody.linearDamping = 0.9
      this.camBody.position.set(0,5,20)
      this.world.add(this.camBody);

      // Cannon Plane
      this.groundShape = new CANNON.Plane();
      this.groundBody = new CANNON.Body({ mass: 0 });
      this.groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
      this.groundBody.addShape(this.groundShape);
      this.groundBody.position.set(0, 0, 0)
      this.world.add(this.groundBody);
    }

    init(){
      let blocker = document.getElementById('blocker')
      let instructions = document.getElementById( 'instructions' );
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x828282);
      // this.scene.fog = new THREE.FogExp2(0x828282, 0.04)
      this.clock = new THREE.Clock();
      this.camera = new THREE.PerspectiveCamera( 65, window.innerWidth/window.innerHeight, 0.1, 10000 );
      this.controls = new PointerLockControls(this.camera, this.camBody);
      instructions.addEventListener( 'click', this.controls.lock, false );
      this.controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
      } );
      this.controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
      } );

      this.scene.add(this.controls.getObject())

      // Three Box Mesh 
      this.boxGeometry = new THREE.BoxGeometry(3,3,3)
      this.boxMesh = new THREE.Mesh(this.boxGeometry, this.material)
      this.boxMesh.castShadow = true
      this.scene.add(this.boxMesh)

      // Three Plane ahhhhh
      this.groundMaterial = new THREE.MeshLambertMaterial({ color: 0xdddddd } );
      this.geometry = new THREE.PlaneGeometry( 10000, 10000, 50, 50 );
      this.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
      this.floor = new THREE.Mesh( this.geometry, this.material );
      // this.floor.castShadow = true;
      this.floor.receiveShadow = true;
      this.scene.add( this.floor );


      // Three Renderer
      this.renderer = new THREE.WebGLRenderer({antialias:true});
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      document.body.appendChild( this.renderer.domElement );
      // this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene, this.world );
    }

    assLoad() {
      const loader = new FBXLoader()

      loader.load( 'https://s3-us-west-2.amazonaws.com/sound-escape/imgs/station.fbx', function ( object ){
        object.traverse( function( children ) {
          if(children.name.includes('door')) {
            console.log(children.position)
          }
          if (children.name.includes('roof')) {
            children.receiveShadow = true
          } else if(children.isMesh && !children.name.includes('roof')) {
            children.receiveShadow = true
            children.castShadow = true
          } else if(children.isPointLight) {
            children.castShadow = true
          } else if(children.isHemiLight) {
            children.castShadow = true
          } 
        })
      game.scene.add( object )
      game.object = object
      game.createColliders()
      })
    }

    createColliders(){
      const scaleAdjust = 2;
      const divisor = 2 / scaleAdjust;
      game.object.children.forEach(function(child){
        if (child.isMesh && !child.name.includes('ground')) {
          child.visible = true;
          const halfExtents = new CANNON.Vec3(child.scale.x/divisor, child.scale.y/divisor, child.scale.z/divisor);
          const box = new CANNON.Box(halfExtents);
          const body = new CANNON.Body({mass:0});
          body.addShape(box);
          body.name = child.name
          body.position.copy(child.position);
          body.quaternion.copy(child.quaternion);
          body.collisionResponse = true
          game.world.add(body);
        }
      })
    }

    doorOpen() {
      let door;
      let doorBody;
      game.object.children.forEach((child) => {
        if (child.name === 'door0Model') {
          door = child
        }
      })
      game.world.bodies.forEach((body) => {
        if (body.name === 'door0Model') {
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
                  .to({x:-46, z:8.8}, 500)
                  .delay(200)
                  .easing(easing)
                  .onUpdate(updateDoor)

      let tweenMiddle = new TWEEN.Tween(current)
                  .to({x:-47, z:8.8}, 2000)
                  .delay(200)
                  .easing(easing)
                  .onUpdate(updateDoor)

      let tweenBack = new TWEEN.Tween(current)
                  .to({x:-47, z: 3}, 2000)
                  .delay(200)
                  .easing(easing)
                  .onUpdate(updateDoor)

      tweenHead.chain(tweenMiddle)
      tweenMiddle.chain(tweenBack)
      tweenHead.start()
    }

    animate(){
      const game = this
      // game.cannonDebugRenderer.update();  
      TWEEN.update()
      game.controls.update(game.clock.getDelta())
      game.renderer.render( game.scene, game.camera );
      requestAnimationFrame( function(){
        game.boxMesh.position.copy(game.cube.position)
        game.boxMesh.quaternion.copy(game.cube.quaternion)
        game.world.step(game.world.fixedTimeStep)
        game.animate();       
      } ); 
    }
  }


