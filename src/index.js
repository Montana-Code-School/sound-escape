import * as THREE from 'three';
import FirstPersonControls from './FirstPersonControls'

var renderer = new THREE.WebGLRenderer({canvas: document.getElementById('myCanvas'), antialias: true});
renderer.setClearColor(0x6288dd);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap


var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 15000)
camera.position.z = 200


console.log(camera)

var scene = new THREE.Scene()

var clock = new THREE.Clock()

var controls = new FirstPersonControls(camera)
controls.movementSpeed = 1000
controls.lookSpeed = 0.1


var light = new THREE.AmbientLight(0xffffff, 0.8)
light.castShadow = false
scene.add(light)


var light1 = new THREE.PointLight(0xffffff, 1)
light1.position.set( 0, 350, -1200)
light1.castShadow = true
scene.add(light1)

light1.shadow.mapSize.width = 2048
light1.shadow.mapSize.height = 2048
light1.shadow.camera.near = 0.8
light1.shadow.camera.far = 800


var material = new THREE.MeshPhongMaterial({
  color: 0xffe539,
  // map: new THREE.TextureLoader().load('ed.jpeg'),
  // map: new THREE.TextureLoader().load('paper.jpg'),
  // normalMap: new THREE.TextureLoader().load('ed.jpeg')

})



// Louis Box
var listener = new THREE.AudioListener()
camera.add( listener )

var music = new THREE.PositionalAudio( listener )

var audioLoader = new THREE.AudioLoader()
audioLoader.load('louis.mp3', function( buffer) {
  music.setBuffer( buffer)
  music.setRefDistance( 20 )
  music.play()
})

var geometry = new THREE.CubeGeometry(100, 100, 100)
var mat = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/sound-escape/louis.jpg'),
})
var mesh = new THREE.Mesh(geometry, mat)
mesh.position.set(0, -47, -1200)
mesh.castShadow = true
// mesh.recieveShadow = false
mesh.add( music )

scene.add(mesh);


// Ed Box
var listener = new THREE.AudioListener()
camera.add( listener )

var roy = new THREE.PositionalAudio( listener )

var audioLoader = new THREE.AudioLoader()
audioLoader.load('/assets/music/ed.mp3', function( buffer) {
  roy.setBuffer( buffer)
  roy.setRefDistance( 20 )
  roy.play()
})
const edImage = "https://s3-us-west-2.amazonaws.com/sound-escape/ed.jpeg"
var geo2 = new THREE.CubeGeometry(200, 200, 200)
var mat = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load(edImage),
})
var mesh3 = new THREE.Mesh(geo2, mat)
mesh3.position.set(-300, 0, -1200)
mesh3.castShadow = true
// mesh.recieveShadow = false
mesh3.add( roy )

scene.add(mesh3);


// Do it Box
var listener = new THREE.AudioListener()
camera.add( listener )

var doit = new THREE.PositionalAudio( listener )

var audioLoader = new THREE.AudioLoader()
audioLoader.load('https://s3-us-west-2.amazonaws.com/sound-escape/doit.mp3', function( buffer) {
  doit.setBuffer( buffer)
  doit.setRefDistance( 20 )
  doit.play()
})

var box = new THREE.BoxGeometry(100, 100, 100)
var mat1 = new THREE.MeshLambertMaterial({
  map: new THREE.TextureLoader().load('/assets/imgs/shia.png'),
})
var boxy = new THREE.Mesh(box, mat1)
boxy.position.set(250, -60, -1400)
boxy.castShadow = true
boxy.recieveShadow = false
boxy.add ( doit )

scene.add(boxy)



var floor = new THREE.PlaneGeometry(10000, 10000, 100, 100)
// let helper = new THREE.Helper( mesh2, 1, 0XFFFF00 )
//   scene.add(helper)
  console.log(floor)
var floormat = new THREE.MeshStandardMaterial ({
  map: new THREE.TextureLoader().load(edImage),
  emissive: .6
})
var mesh2 = new THREE.Mesh(floor, floormat)
mesh2.rotation.x = -90 * Math.PI / 180
mesh2.position.y = -80
mesh2.receiveShadow = true
scene.add(mesh2)
scene.add(floor)

// Wall
let wallGeoNS = new THREE.BoxGeometry(1, 1000, 10000, 1)
let nMat = new THREE.MeshPhongMaterial ({
  emissive: 1,
  color: 'red'
})
let wallN = new THREE.Mesh(wallGeoNS, nMat)
wallN.position.x = 5000
wallN.position.z = 0

let sMat = new THREE.MeshPhongMaterial ({
  emissive: 1,
  color: 'yellow'
})
let wallS = new THREE.Mesh(wallGeoNS, sMat)
wallS.position.x = -5000
wallS.position.z = 0


let wallGeoEW = new THREE.BoxGeometry(10000, 1000, 1, 1)
let wMat = new THREE.MeshPhongMaterial ({
  emissive: 1,
  color: 'blue'
})
let wallW = new THREE.Mesh(wallGeoEW, wMat)
wallW.position.x = 0
wallW.position.z = -5000

let eMat = new THREE.MeshPhongMaterial ({
  emissive: 1,
  color: 'green'
})
let wallE = new THREE.Mesh(wallGeoEW, eMat)
wallE.position.x = 0
wallE.position.z = 5000

scene.add(wallS, wallN, wallE, wallW)

var ceiling = new THREE.PlaneGeometry(10000, 10000, 100, 100)
// let helper = new THREE.Helper( mesh2, 1, 0XFFFF00 )
//   scene.add(helper)
  console.log(floor)
var ceilmat = new THREE.MeshStandardMaterial ({
  emissive: .6,
  color: 'grey'
})
var ceil = new THREE.Mesh(ceiling, ceilmat)
ceil.rotation.x = 90 * Math.PI / 180
ceil.position.y = 500
ceil.receiveShadow = true
scene.add(ceil)



// var helper = new THREE.CameraHelper( light1.shadow.camera)
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
