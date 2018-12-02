module.exports = function color(mesh) {
    if (mesh.name.includes('crown'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    else if (mesh.name.includes('trunk') || mesh.name.includes('buttonCase'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0x000000 } );
    else if (mesh.name.includes('buttonModel'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    else if (mesh.name.includes('NoteBlock'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0x9e9e9e } );
    else if (mesh.name.includes('Text'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0x006993 } );
    else if (mesh.name.includes('bldgWall') || mesh.name.includes('awning'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0x14a020 } );
    else if (mesh.name.includes('door'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0x1d1d7f } );
    else if (mesh.name.includes('Cube'))
        mesh.material = new THREE.MeshBasicMaterial( { color: 0x774c05 } );
    else {
        console.log(mesh.name)
        mesh.material = new THREE.MeshBasicMaterial( { color: 0xdddddd } );
    }
}