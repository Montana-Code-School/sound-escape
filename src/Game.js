import PointerLockControls from './PointerLockControls';
import CannonDebugRenderer from './CannonDebugRenderer';
FBXLoader = require('three-fbx-loader');

export default class Game{
    constructor(){
        this.initPhysics()
        this.init()
        this.assLoad()
        this.animate()
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
      this.scene.background = new THREE.Color(0,0,0);
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
      this.geometry = new THREE.PlaneGeometry( 300, 300, 50, 50 );
      this.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
      this.floor = new THREE.Mesh( this.geometry, this.material );
      this.floor.castShadow = true;
      this.floor.receiveShadow = true;
      this.scene.add( this.floor );


      // Three Renderer
      this.renderer = new THREE.WebGLRenderer({antialias:true});
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      document.body.appendChild( this.renderer.domElement );
      this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene, this.world );
    }

    assLoad() {
      const loader = new FBXLoader()
      loader.load( 'models/step.fbx', function ( object ){
        object.traverse( function( children ) {
          if(children.isMesh) {
            children.receiveShadow = true
            children.castShadow = true
          } else if(children.isPointLight) {
            children.castShadow = true
          } else if(children.isSpotLight) {
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
        if (child.isMesh) {
          child.visible = true;
          const halfExtents = new CANNON.Vec3(child.scale.x/divisor, child.scale.y/divisor, child.scale.z/divisor);
          const box = new CANNON.Box(halfExtents);
          const body = new CANNON.Body({mass:0});
          body.addShape(box);
          body.position.copy(child.position);
          body.quaternion.copy(child.quaternion);
          body.collisionResponse = true
          game.world.add(body);
        }
      })
    }

    animate(){
      const game = this
      game.cannonDebugRenderer.update();  
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


