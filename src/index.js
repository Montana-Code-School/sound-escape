import * as THREE from 'three';
import FirstPersonControls from './FirstPersonControls'

let renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true});
renderer.setClearColor(0x6288dd);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap


let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000)
camera.position.z = 200

let scene = new THREE.Scene()

let clock = new THREE.Clock()

let controls = new FirstPersonControls(camera)
controls.movementSpeed = 1000
controls.lookSpeed = 0.1

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


let material = new THREE.MeshPhongMaterial({
  color: 0xffe539,
  // map: new THREE.TextureLoader().load('ed.jpeg'),
  // map: new THREE.TextureLoader().load('paper.jpg'),
  // normalMap: new THREE.TextureLoader().load('ed.jpeg')

})



// Louis Box
let listener = new THREE.AudioListener()
camera.add( listener )

let music = new THREE.PositionalAudio( listener )

let audioLoader = new THREE.AudioLoader()
audioLoader.load('louis.mp3', function( buffer) {
  music.setBuffer( buffer)
  music.setRefDistance( 20 )
  music.play()
})

let geometry = new THREE.CubeGeometry(100, 100, 100)
let mat = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/sound-escape/louis.jpg'),
})
let mesh = new THREE.Mesh(geometry, mat)
mesh.position.set(0, -47, -1200)
mesh.castShadow = true
// mesh.recieveShadow = false
mesh.add( music )

scene.add(mesh);


// Ed Box
let listener = new THREE.AudioListener()
camera.add( listener )

let roy = new THREE.PositionalAudio( listener )

let audioLoader = new THREE.AudioLoader()
audioLoader.load('/assets/music/ed.mp3', function( buffer) {
  roy.setBuffer( buffer)
  roy.setRefDistance( 20 )
  roy.play()
})
const edImage = "https://s3-us-west-2.amazonaws.com/sound-escape/ed.jpeg"
let geo2 = new THREE.CubeGeometry(200, 200, 200)
let mat = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(edImage),
})
let mesh3 = new THREE.Mesh(geo2, mat)
mesh3.position.set(-300, 0, -1200)
mesh3.castShadow = true
// mesh.recieveShadow = false
mesh3.add( roy )

scene.add(mesh3);


// Do it Box
let listener = new THREE.AudioListener()
camera.add( listener )

let doit = new THREE.PositionalAudio( listener )

let audioLoader = new THREE.AudioLoader()
audioLoader.load('https://s3-us-west-2.amazonaws.com/sound-escape/doit.mp3', function( buffer) {
  doit.setBuffer( buffer)
  doit.setRefDistance( 20 )
  doit.play()
})

let box = new THREE.BoxGeometry(100, 100, 100)
let mat1 = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load('/assets/imgs/shia.png'),
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
// let helper = new THREE.Helper( mesh2, 1, 0XFFFF00 )
//   scene.add(helper)
  console.log(floor)
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
