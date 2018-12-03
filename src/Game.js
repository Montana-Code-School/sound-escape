import PointerLockControls from './PointerLockControls';
import CannonDebugRenderer from './CannonDebugRenderer';
const TWEEN = require('@tweenjs/tween.js');

FBXLoader = require('three-fbx-loader');

export default class Game{
    constructor(){
        this.initPhysics()
        this.init()
        this.assLoad()
        setTimeout(this.animate(), 2000)
    }

    initPhysics(){
      //Build a Cannon world
      const world = new CANNON.World();
      this.world = world;
      this.world.fixedTimeStep = 1.0/60.0;
      const physicsMaterial = new CANNON.Material("groundMaterial");
      const physicsContactMaterial = new CANNON.ContactMaterial(
                                                              physicsMaterial,
                                                              physicsMaterial,
                                                              { friction:0.9, 
                                                                restitution:0.0
                                                              });
      this.world.addContactMaterial(physicsContactMaterial);
      this.world.gravity.set(0, -50, 0);
      this.world.broadphase = new CANNON.NaiveBroadphase();
      this.material = new THREE.MeshPhongMaterial( { color: 0x777777, shininess: 0 } )
      this.testMaterial = new CANNON.Material()

      // Cannon Box body
      this.boxx = new CANNON.Box(new CANNON.Vec3(1.5,1.5,1.5))
      this.cube = new CANNON.Body({mass:.3, material: this.testMaterial})
      this.cube.angularDamping = 0.01
      this.cube.linearDamping = 0.01
      this.cube.position.set(-6, 3, -6)
      this.cube.addShape(this.boxx)
      this.world.add(this.cube)

      // Cannon Cam Sphere
      this.sphere = new CANNON.Sphere(2);
      this.camBody = new CANNON.Body({mass: 7, material: physicsMaterial})
      this.camBody.addShape(this.sphere);
      this.camBody.linearDamping = 0.99;
      this.camBody.angularDamping = 0.99;
      this.camBody.position.set(0,5,20)
      this.world.add(this.camBody);

      // Cannon Plane
      this.groundShape = new CANNON.Plane();
      this.groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
      this.groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
      this.groundBody.addShape(this.groundShape);
      this.groundBody.position.set(0, 0, 0)
      this.world.add(this.groundBody);
    }

    init(){
      //Initialize a THREE scene with a camera, renderer, and controls
      let blocker = document.getElementById('blocker')
      let instructions = document.getElementById( 'instructions' );
      this.face = document.getElementsByClassName('face fadeIn')
      this.astley = document.getElementsByClassName('astley fadeIn')
      this.winner = document.getElementsByClassName('winner animateWin')
      this.scene = new THREE.Scene();
      this.audioLoader = new THREE.AudioLoader()
      this.doorOneIsOpen = false
      this.doorTwoIsOpen = false
      this.noteBlocks = []
      this.scene.background = new THREE.Color(0x282828);
      this.scene.fog = new THREE.FogExp2(0x282828, 0.042)
      this.clock = new THREE.Clock();
      this.camera = new THREE.PerspectiveCamera( 65, window.innerWidth/window.innerHeight, 0.1, 300 );
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
      this.listener = new THREE.AudioListener()
      this.camera.add( this.listener)
      this.scene.add(this.controls.getObject())

      // Hemi Light
      this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.5 );
      this.hemiLight.color.setHSL( 0.6, 1, 0.6 );
      this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
      this.hemiLight.position.set( 100, 500, 100 );
      this.scene.add( this.hemiLight );
  
      // Three Box Mesh
      this.boxGeometry = new THREE.BoxGeometry(3,3,3)
      this.boxMesh = new THREE.Mesh(this.boxGeometry, this.material)
      this.boxMesh.castShadow = true
      this.scene.add(this.boxMesh)

      // Three Plane Mesh
      this.groundMaterial = new THREE.MeshPhongMaterial({ color: 0x727272, shininess: 0 } );
      this.geometry = new THREE.PlaneGeometry( 10000, 10000, 50, 50 );
      this.geometry.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
      this.floor = new THREE.Mesh( this.geometry, this.groundMaterial );
      this.floor.receiveShadow = true;
      this.floor.castShadow = true
      this.scene.add( this.floor );

      // Three Renderer
      this.renderer = new THREE.WebGLRenderer({antialias:true});
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      this.renderer.shadowMap.size = (2048, 2048)
      
      document.body.appendChild( this.renderer.domElement );

      // !!!!!---Enable CANNON Debug Renderer---!!!!!
      // this.cannonDebugRenderer = new THREE.CannonDebugRenderer( this.scene, this.world );
    }

    assLoad() {
      const loader = new FBXLoader()

      loader.load( 'https://s3-us-west-2.amazonaws.com/sound-escape/imgs/station.fbx', function ( object ){
      // loader.load( 'models/station.fbx', function ( object ){
        
      object.traverse( function( children ) {
         if(children.isMesh) {
            children.receiveShadow = true
            children.castShadow = true
            children.material = game.material
          } else if(children.isPointLight) {
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

    rickRoll() {
      let ambience, rick, rolling, potentialRollers = []
      game.object.children.forEach((child) => {
        if (child.name.includes('trunk')) {
          potentialRollers.push(child)
        }
      })
      rick = potentialRollers[Math.floor(Math.random()*potentialRollers.length)]
      rolling = new THREE.PositionalAudio( this.listener )

      this.audioLoader.load('https://s3-us-west-2.amazonaws.com/sound-escape/music/rick-astley-never-gonna-give-you-up-hq.mp3', function( buffer ) {
        rolling.setBuffer( buffer )
        rolling.setRefDistance( .3 )
        rolling.setVolume(1.5)
        rolling.setLoop( true )
        rolling.play()
        rick.add(rolling)
      })
      ambience = new THREE.Audio( this.listener )
      this.audioLoader.load('https://s3-us-west-2.amazonaws.com/sound-escape/sounds/night-ambience1.mp3', function( buffer ) {
        ambience.setLoop( true )
        ambience.setBuffer( buffer )
        ambience.setVolume(0.03)
        ambience.play()
      })
    }

    doorOpen(doorName, whichDoor) {
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



    animate(){

      // !!!!!---Enable CANNON Debug Renderer---!!!!!
      // game.cannonDebugRenderer.update();
      const game = this
      TWEEN.update()
      // game.spotLight.position.copy(game.camera.position)
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
