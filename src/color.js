module.exports = function color(mesh) {
    if (mesh.name.includes('crown') || mesh.name.includes('buttonModel') || mesh.name.includes('Text'))
        mesh.material = new THREE.MeshPhongMaterial( { color: 0xff0000 } );
    else 
        mesh.material = new THREE.MeshPhongMaterial({ color: 0x777777, shininess: 0 })
} 