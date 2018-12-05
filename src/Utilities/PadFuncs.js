import {color} from './Funcs'
const Reflector = require('three-reflector')(THREE)

const globals = {
    isCube: true,
    isFoggy: false,
    isToon: false,
    hasShape: false,
    pad0on: false
}

export default function whichPad(object){
    switch (object.name) {
        case "Pad0Model":
            pad0(object)
            break;
        case "Pad1Model":
            pad1(object)
            break;
        case "Pad2Model":
            pad2(object)
            break;
        case "Pad3Model":
            pad3(object)
            break;
        case "Pad4Model":
            pad4(object)
            break;
        default:
            console.log('This is not a pad.')
        break;
    }
}

function pad0(object){
    if (!globals.pad0on) {
        globals.pad0on = true
        object.material = new THREE.MeshToonMaterial({color: 'green', shininess: 25})
        game.cube.velocity.y = 50
        setTimeout(function (){
            object.material = new THREE.MeshToonMaterial({color: 'red', shininess: 25})
        globals.pad0on = false
        }, 4000)
    }
}


function pad1(object){
    const cannonBody = game.world.bodies[0]
    const threeMesh = game.scene.children[2]
    if (globals.isCube){
        object.material = new THREE.MeshToonMaterial({color: 'green', shininess: 25})
        cannonBody.shapes[0] = new CANNON.Sphere(2)
        threeMesh.geometry = new THREE.SphereGeometry(2,32,32)
        threeMesh.material = new THREE.MeshToonMaterial({color: 'green', shininess: 32, reflectivity: 10})
        globals.isCube = false
    } else {
        object.material = new THREE.MeshToonMaterial({color: 'red', shininess: 25})
        cannonBody.shapes[0] = new CANNON.Box(new CANNON.Vec3(1.5,1.5,1.5))
        threeMesh.geometry = new THREE.BoxGeometry(3,3,3)
        threeMesh.material = new THREE.MeshPhongMaterial( { color: 0xff0000 } )
        globals.isCube = true
    }
}

function pad2(object){
    const fog = game.scene.fog
    if (globals.isFoggy){
        object.material = new THREE.MeshToonMaterial({color: 'red', shininess: 25})
        for (let i = 0; i < 50; i++) {
            setTimeout(function(){
                fog.density = fog.density - 0.001
            },10 * (i+1))
        }
        globals.isFoggy = false
    } else {
        object.material = new THREE.MeshToonMaterial({color: 'green', shininess: 25})
        for (let i = 0; i < 50; i++) {
            setTimeout(function(){
                fog.density = fog.density + 0.001
            },10 * (i+1))
        }
        globals.isFoggy = true
    }
}

function pad3(object){
    const fbxFile = game.scene.getObjectByName('fbxFile')
    if (!globals.isToon){
        object.material = new THREE.MeshToonMaterial({color: 'green', shininess: 25})
        for (let i = 0; i < fbxFile.children.length; i++) {
            if (!fbxFile.children[i].name.includes('Pad'))
            fbxFile.children[i].material = new THREE.MeshToonMaterial({color: 'blue', shininess: 32, reflectivity: 10})
        }
        globals.isToon = true
    } else {
        object.material = new THREE.MeshToonMaterial({color: 'red', shininess: 25})
        for (let i = 0; i < fbxFile.children.length; i++) {
            if (!fbxFile.children[i].name.includes('Pad'))
            color(fbxFile.children[i])
        }
        globals.isToon = false
    }
}

async function pad4(object){
    if (!globals.hasShape){
        object.material = new THREE.MeshToonMaterial({color: 'green', shininess: 25})
        globals.hasShape = true
        const ratio = window.devicePixelRatio
        const width = window.innerWidth
        const height = window.innerHeight
        const mirrorGeometry = new THREE.PlaneGeometry(10,10,1,1)
        const mirror = new Reflector(mirrorGeometry, {color: 0x889999, recursion: 1, clipBias: 0.003, textureWidth: width * ratio, textureHeight: height * ratio})
        mirror.applyMatrix( new THREE.Matrix4().makeRotationY( Math.PI / 2 ) );
        mirror.position.set(-5,5,10)
        mirror.name = 'Mirror'
        game.scene.add(mirror)
        const random = () => Math.floor(Math.random() * 20 + 1)
        const shapeGeometry = new THREE.TorusKnotGeometry( 2, 0.2, 70, 20, random(), random() )
        const shapeMaterial = new THREE.MeshPhongMaterial( { color: 0xffff00 } )
        const shapeMesh = new THREE.Mesh(shapeGeometry, shapeMaterial)
        shapeMesh.castShadow = true
        shapeMesh.receiveShadow = true
        shapeMesh.position.set(5,5,10)
        shapeMesh.name = 'TorusKnot'
        game.scene.add(shapeMesh)
    } else {
        object.material = new THREE.MeshToonMaterial({color: 'red', shininess: 25})
        globals.hasShape = false
        game.scene.remove(game.scene.getObjectByName('TorusKnot'))
        game.scene.remove(game.scene.getObjectByName('Mirror'))
    }
}


