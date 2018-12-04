import {color} from './Funcs'

const globals = {
    isCube: true,
    isFoggy: true,
    isToon: false,
    isMotionSick: false
}

export default function whichPad(collision){
    switch (collision.contact.bj.name) {
        case "Pad0Model":
            pad0()
            break;
        case "Pad1Model":
            pad1()
            break;
        case "Pad2Model":
            pad2()
            break;
        case "Pad3Model":
            pad3(collision)
            break;
        case "Pad4Model":
            pad4(collision)
            break;
        case "Pad5Model":
            pad5(collision)
            break;
    }
}

function pad0(){
    game.cube.velocity.y = 50
}


function pad1(){
    if (globals.isCube){
        game.world.bodies[0].shapes[0] = new CANNON.Sphere(2)
        game.scene.children[2].geometry = new THREE.SphereGeometry(2,32,32)
        game.scene.children[2].material = new THREE.MeshToonMaterial({color: 'green', shininess: 32, reflectivity: 10})
        globals.isCube = false
    } else {
        game.world.bodies[0].shapes[0] = new CANNON.Box(new CANNON.Vec3(1.5,1.5,1.5))
        game.scene.children[2].geometry = new THREE.BoxGeometry(3,3,3)
        game.scene.children[2].material = new THREE.MeshPhongMaterial( { color: 0xff0000 } )
        globals.isCube = true
    }
}

function pad2(){
    if (globals.isFoggy){
        for (let i = 0; i < 49; i++) {
            setTimeout(function(){
                game.scene.fog.density = window.game.scene.fog.density - 0.001
            },10 * (i+1))
        }
        globals.isFoggy = false
    } else {
        for (let i = 0; i < 50; i++) {
            setTimeout(function(){
                game.scene.fog.density = window.game.scene.fog.density + 0.001
            },10 * (i+1))
        }
        globals.isFoggy = true
    }
}

function pad3(){
    if (!globals.isToon){
        for (let i = 0; i < game.scene.children[4].children.length; i++) {
            game.scene.children[4].children[i].material = new THREE.MeshToonMaterial({color: 'blue', shininess: 32, reflectivity: 10})
        }
        globals.isToon = true
    } else {
        for (let i = 0; i < game.scene.children[4].children.length; i++) {
            color(game.scene.children[4].children[i])
        }
        globals.isToon = false
    }
}

function pad4(){
    console.log("pad 4")
}

function pad5(){
    console.log("pad 5")
}

