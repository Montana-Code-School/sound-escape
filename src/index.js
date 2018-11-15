import * as THREE from 'three'
import * as CANNON from 'cannon'
import FirstPersonControls from './FirstPersonControls'

let renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true});
renderer.setClearColor(0x6288dd);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap


let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000)
camera.position.z = 200
camera.position.set(0,40,200)

let scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0xD6F1FF, 0.0005)

let clock = new THREE.Clock()

let controls = new FirstPersonControls(camera)
controls.movementSpeed = 1000
controls.lookSpeed = 0.1
controls.lookVertical = false; // Don't allow the player to look up or down. This is a temporary fix to keep people from flying
controls.noFly = true; // Don't allow hitting R or F to go up or down

let light = new THREE.AmbientLight(0xffffff, 0.8)
light.castShadow = false
scene.add(light)


let light1 = new THREE.PointLight(0xffffff, 1)
light1.position.set( 0, 350, -1200)
light1.castShadow = true
scene.add(light1)

light1.shadow.mapSize.width = 2048
light1.shadow.mapSize.height = 2048
light1.shadow.camera.near = 0.8
light1.shadow.camera.far = 800

let directionalLight1 = new THREE.DirectionalLight( 0xF7EFBE, 0.7 );
directionalLight1.position.set( 0.5, 1, 0.5 );
scene.add( directionalLight1 );

// Louis Box
let listener = new THREE.AudioListener()
camera.add( listener )

let music = new THREE.PositionalAudio( listener )
const louisMusic = 'https://s3-us-west-2.amazonaws.com/sound-escape/music/louis.mp3'
let audioLoader = new THREE.AudioLoader()
audioLoader.load(louisMusic, function( buffer) {
  music.setBuffer( buffer)
  music.setRefDistance( 20 )
  music.play()
})
const louisImg = 'https://s3-us-west-2.amazonaws.com/sound-escape/imgs/louis.jpg' 
let geometry = new THREE.CubeGeometry(100, 100, 100)
let matL = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(louisImg),
})
let mesh = new THREE.Mesh(geometry, matL)
mesh.position.set(0, -47, -1200)
mesh.castShadow = true
mesh.recieveShadow = false
mesh.add( music )
scene.add(mesh);


// Ed Box
let listenerEd = new THREE.AudioListener()
  camera.add( listenerEd )
let roy = new THREE.PositionalAudio( listenerEd )
const edMusic = 'https://s3-us-west-2.amazonaws.com/sound-escape/music/ed.mp3'
let audioLoaderEd = new THREE.AudioLoader()
  audioLoaderEd.load(edMusic, function( buffer) {
  roy.setBuffer( buffer)
  roy.setRefDistance( 20 )
  roy.play()
})
const edImage = "https://s3-us-west-2.amazonaws.com/sound-escape/imgs/ed.jpeg"
let geo2 = new THREE.CubeGeometry(200, 200, 200)
let mat = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(edImage),
})
let mesh3 = new THREE.Mesh(geo2, mat)
  mesh3.position.set(-300, 0, -1200)
  mesh3.castShadow = true
  mesh3.add( roy )
  scene.add(mesh3);


// Do it Box
let listenerShia = new THREE.AudioListener()
  camera.add( listenerShia )
let doit = new THREE.PositionalAudio( listener )
const doitAudio = 'https://s3-us-west-2.amazonaws.com/sound-escape/sounds/doit.mp3'
let audioLoaderShia = new THREE.AudioLoader()
  audioLoaderShia.load(doitAudio, function( buffer) {
  doit.setBuffer( buffer)
  doit.setRefDistance( 20 )
  doit.play()
})
const shia = 'https://s3-us-west-2.amazonaws.com/sound-escape/imgs/shia.png'
let box = new THREE.BoxGeometry(100, 100, 100)
let mat1 = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(shia),
})
let boxy = new THREE.Mesh(box, mat1)
  boxy.position.set(250, -60, -1400)
  boxy.castShadow = true
  boxy.recieveShadow = false
  boxy.add ( doit )
  scene.add(boxy)



let floor = new THREE.PlaneGeometry(10000, 5000, 100, 100)

let floormat = new THREE.MeshStandardMaterial ({
  map: new THREE.TextureLoader().load(edImage),
  emissive: .6
})
let mesh2 = new THREE.Mesh(floor, floormat)
  mesh2.rotation.x = -90 * Math.PI / 180
  mesh2.position.y = -80
  mesh2.receiveShadow = true
  scene.add(mesh2)
  scene.add(floor)

function createWall(floor, direction, colorOrTexture) {
  let wallGeography;
  let eastWestRelation = floor.parameters.height/2
  let northSouthRelation = floor.parameters.width/2
  if (direction === 'south' || direction === 'north') {
    wallGeography = new THREE.BoxGeometry(1, 1000, floor.parameters.height)
  }
  else if (direction == 'east' || direction === 'west') {
    wallGeography = new THREE.BoxGeometry(floor.parameters.width, 1000, 1)
  }

  let mat = new THREE.MeshPhongMaterial({
    emissive: 1,
    color: colorOrTexture
  })

  let wall = new THREE.Mesh(wallGeography, mat)
  switch (direction) {
    case 'south':
      wall.position.x = -northSouthRelation;
      wall.position.z = 0;
      break;
    case 'north':
      wall.position.x = northSouthRelation;
      wall.position.z = 0;
      break;
    case 'east':
      wall.position.x = 0;
      wall.position.z = eastWestRelation;
      break;
    case 'west':
      wall.position.x = 0;
      wall.position.z = -eastWestRelation;
      break;
  }
  return wall
}

let northWall = createWall(floor, 'north', 'yellow')
let southWall = createWall(floor, 'south', 'red')
let eastWall = createWall(floor, 'east', 'green')
let westWall = createWall(floor, 'west', 'blue')

scene.add(northWall, southWall, eastWall, westWall)

let ceiling = new THREE.PlaneGeometry(10000, 10000, 100, 100)
let ceilmat = new THREE.MeshStandardMaterial ({
  emissive: .6,
  color: 'grey'
})
let ceil = new THREE.Mesh(ceiling, ceilmat)
ceil.rotation.x = 90 * Math.PI / 180
ceil.position.y = 500
ceil.receiveShadow = true
scene.add(ceil)



// let helper = new THREE.CameraHelper( light1.shadow.camera)
// scene.add( helper )



//RENDER LOOP
requestAnimationFrame(render)

function render() {
    controls.update( clock.getDelta() )
    // mesh.rotation.x += 0.03
    // mesh.rotation.y += 0.01
    // mesh3.rotation.x += 0.01
    // mesh3.rotation.y += 0.01
    // boxy.rotation.x += 0.02
    // boxy.rotation.y += 0.01
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
