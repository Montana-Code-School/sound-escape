<<<<<<< Updated upstream
=======
import * as THREE from 'three'
import * as CANNON from 'cannon'
import FirstPersonControls from './FirstPersonControls'



let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000)
let renderer, scene, clock, light, sphere, sphereMat, sphr, floor, floormat, mesh2
const controls = new FirstPersonControls(camera)
// const world = new CANNON.World()

initCannon()
initThree()
animate()

function initCannon() {
  let box, boxBody, world, timeStep = 1/60, ball, ballBody, floorPhys, floorBody 
  

  world = new CANNON.World()
  world.gravity.set(0, 0, -120)
  world.solver.iterations = 10
  world.broadphase = new CANNON.NaiveBroadphase()

  // BALL
  ball = new CANNON.Sphere(25)
  ballBody = new CANNON.Body({
    mass:1, 
    shape: ball
  })
  ballBody.position.set(0, -600, 500)
  world.addBody(ballBody)  

// CAM BOX
box = new CANNON.Box(new CANNON.Vec3(25, 25, 25))
boxBody = new CANNON.Body({
  mass: 0, 
  shape: boxBody
})
boxBody.position.set(0,0,200)
world.addBody(boxBody)


//WALL
// groundBody = new CANNON.Body({ mass: 0, material: physicsMaterial });
// groundBody.addShape(groundShape);
// groundBody.quaternion.;
// groundBody.position.set(0,0,0);
// world.addBody(groundBody);

// 
const physicsMaterial = new CANNON.Material("slipperyMaterial");
const physicsContactMaterial = new CANNON.ContactMaterial(
    physicsMaterial,
    physicsMaterial,
    0.0, // friction coefficient
    0.3  // restitution
    );
  world.addContactMaterial(physicsContactMaterial)

//FLOOR
floorPhys = new CANNON.Plane()
floorBody = new CANNON.Body({
  mass: 0,
  material:physicsMaterial
})
floorBody.addShape(floorPhys)
// floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0),-Math.PI/2)
floorBody.position.set(0,0,0)
world.addBody(floorBody)
}


function updatePhysics() {
  // Step the physics world
  world.step(timeStep);
  // Copy coordinates from Cannon.js to Three.js
  mesh2.position.copy(floorBody.position);
  mesh2.quaternion.copy(floorBody.quaternion);
  sphr.position.copy(ballBody.position)
  camera.position.copy(boxBody.position)
  // boxBody.position.copy(camera.position)

}

//---------------------------------------
// THREE
//---------------------------------------




function initThree() {


renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true});
renderer.setClearColor(0x6288dd);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap


// camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000)
camera.up.set(0,0,1)
// camera.position.z = 200
camera.position.set(-1000,40,200)

scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0xD6F1FF, 0.0005)

clock = new THREE.Clock()

// let controls = new FirstPersonControls(camera)
controls.movementSpeed = 1000
controls.lookSpeed = 0.1
// controls.lookVertical = true; // Don't allow the player to look up or down. This is a temporary fix to keep people from flying
// controls.noFly = true; // Don't allow hitting R or F to go up or down

light = new THREE.AmbientLight(0xffffff, 0.8)
light.castShadow = false
scene.add(light)


//SPHERE
sphere = new THREE.SphereGeometry(25, 320, 320)
sphereMat = new THREE.MeshBasicMaterial()
sphr = new THREE.Mesh(sphere, sphereMat)
// sphr.position.set(0,60,300)
scene.add(sphr)

//CAMERA BOX
// const cube = new THREE.÷

//FLOOR
floor = new THREE.PlaneGeometry(10000, 5000, 100, 100)
// floor.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
floormat = new THREE.MeshStandardMaterial ()
mesh2 = new THREE.Mesh(floor, floormat)
  // mesh2.rotation.x = -90 * Math.PI / 180
  // mesh2.position.y = -80
  mesh2.receiveShadow = true
  scene.add(mesh2)
  // scene.add(floor)

}

// const helper = new THREE.CameraHelper( light1.shadow.camera)
// scene.add( helper )
>>>>>>> Stashed changes

THREE = require('three')
CANNON = require('cannon')

<<<<<<< Updated upstream
import FirstPersonControls from './FirstPersonControls'
import Game from './Game'

document.addEventListener('DOMContentLoaded', function(){
  console.log('DOMContentLoaded')
  const game = new Game();
  window.game = game;//For debugging only
});

console.log('we here')
=======
//RENDER LOOP
function animate() {
  requestAnimationFrame(render)

  function render() {
    controls.update( clock.getDelta() )
    renderer.render(scene, camera);
    updatePhysics()
    // console.log("cube", body.position)
    // console.log("floor", floorBody.position)

    requestAnimationFrame(render);
  }
}
>>>>>>> Stashed changes
