import FirstPersonControls from "./FirstPersonControls";
import PointerLockControls from './PointerLockControls';
FBXLoader = require('three-fbx-loader');

export default class Game{
    constructor(){
        this.init();
    }

    init(){
      const game = this;
      let blocker = document.getElementById('blocker')
      let instructions = document.getElementById( 'instructions' );

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0,0,0);
      this.clock = new THREE.Clock();

      this.camera = new THREE.PerspectiveCamera( 65, window.innerWidth/window.innerHeight, 0.1, 10000 );

      this.controls = new PointerLockControls(this.camera);
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
      


      this.material = new THREE.MeshLambertMaterial();
 
      this.thing = new THREE.SphereGeometry(30, 20, 20)
      this.dropBall = new THREE.Mesh(this.thing, this.material)
      this.dropBall.castShadow = true
      this.scene.add(this.dropBall)

      // use ObjectLoader not objLoader
      
      this.assLoad()

      this.renderer = new THREE.WebGLRenderer({antialias:true});
      this.renderer.setSize( window.innerWidth, window.innerHeight );
      this.renderer.shadowMap.enabled = true
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
      document.body.appendChild( this.renderer.domElement );
      setTimeout(this.animate, 500)

    }

    initPhysics(){
      const world = new CANNON.World();
      game.world = world;
      console.log(game.world)
      this.fixedTimeStep = 1.0/60.0;
      

      // this.damping = 0.01;

      game.world.broadphase = new CANNON.NaiveBroadphase();
      game.world.gravity.set(0, -10, 0);

      const sphere = new CANNON.Sphere(1);
      const dropme = new CANNON.Body({mass: 1}) 
      dropme.addShape(sphere);
      dropme.position.set(-100, 40, 0)
      this.dropme = dropme
      game.world.add(this.dropme);
      console.log("dropme in initphys", this.dropme.position)

    //   this.groundShape = new CANNON.Plane();
    //   this.groundMaterial = new CANNON.Material();
    //   this.groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
      // this.groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
    //   this.groundBody.addShape(groundShape);
    //   this.world.add(this.groundBody);
    game.createColliders()
    }

    assLoad() {
      // console.log("this is an assload")
      const loader = new FBXLoader()
        // this.loader = new THREE.JSONLoader( this.manager ) 
      loader.load( 'models/basicmap.fbx', function ( object ){
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
      game.initPhysics()
      })
      // loader.load('models/platforms.fbx', function(platforms){
      //   platforms.traverse(function (children){
      //     if (children.isMesh){
      //       children.receiveShadow = true
      //       children.castShadow = true
      //     } else {
      //       children.castShadow = true
      //     }
      //   })
      //   platforms.position.set(0,0,700)
      //   game.scene.add(platforms)
      // })
    }

    createColliders(){
      // console.log('im the object in CC', game.object)
      const scaleAdjust = 0.9;
      const divisor = 2 / scaleAdjust;
      game.object.children.forEach(function(child){
        if (child.isMesh){
          child.visible = true;
          const halfExtents = new CANNON.Vec3(child.scale.x/divisor, child.scale.y/divisor, child.scale.z/divisor);
          const box = new CANNON.Box(halfExtents);
          const body = new CANNON.Body({mass:0});
          body.addShape(box);
          body.position.copy(child.position);
          body.quaternion.copy(child.quaternion);
          game.world.add(body);
        }
      })
    }

    animate(){
      requestAnimationFrame( function(){ 
        game.animate();       
      } );   
      // console.log(game.clock.getDelta()) 
      // if (game.clock.getDelta() > 0) {
      //   game.world.step(this.fixedTimeStep * game.clock.getDelta())
      // }
        console.log(game.world)
      // console.log("dropme in animate ", this.dropme)
      // console.log('dropball in animage', this.dropBall)
      this.dropBall.position.copy(this.dropme.position)
      this.dropBall.quaternion.copy(this.dropme.quaternion)
      this.controls.update(this.clock.getDelta())
      this.renderer.render( this.scene, this.camera );
    }
  }













//---------------------------------------------------------------------
// ORIGINAL
//---------------------------------------------------------------------



// import FirstPersonControls from "./FirstPersonControls";
// import PointerLockControls from './PointerLockControls'
// import CannonDebugRenderer from "./CannonDebugRenderer"


// console.log("game class")
// export default class Game{
//     constructor(){
//         this.useVisuals = false;
//         this.init();
//     }

//     init(){
//           const game = this;

//       this.scene = new THREE.Scene();
//       this.scene.background = new THREE.Color(0,0,0);
//       this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 10000 );
//       this.camera.position.set(0,3,5)
//       this.clock = new THREE.Clock();


//       this.material = new THREE.MeshNormalMaterial
//       this.camObj = new THREE.SphereGeometry
//       this.camMove = new THREE.Mesh(this.camObj, this.material)
//       this.scene.add(this.camMove)





//       this.renderer = new THREE.WebGLRenderer();
//       this.renderer.setSize( window.innerWidth, window.innerHeight );
//       document.body.appendChild( this.renderer.domElement );

//       const buttons = document.getElementById("gui").childNodes;
//       const alotOfStuff = async () => {

//         function addBodyWait (spherage= true, i) {
//             setTimeout(function(){ game.addBody(spherage); }, i * 30);
//         }

//         for (let index = 0; index < 100; index++) {
//             if(index % 2 === 0){
//                 addBodyWait(true, index)
//             }
//             await addBodyWait(false, index)
//         }
//       }
//       buttons[1].onclick = function(){ game.addBody(true) };
//       buttons[3].onclick = function(){ game.addBody(false); };





//           if (this.useVisuals){
//               this.helper = new CannonHelper(this.scene);
//               this.helper.addLights(this.renderer);
//           }

//       this.initPhysics();
//     }

//     addBody( sphere=true ){
//       const material = new CANNON.Material();
//       const body = new CANNON.Body({ mass: 5, material: material });
//       if (sphere){
//         body.addShape(this.shapes.sphere);
//       }else{
//         body.addShape(this.shapes.box);
//       }

//       const x = Math.random()*0.3 + 1;
//       body.position.set((sphere) ? -x : x, 19, 0);
//       body.linearDamping = this.damping;
//       this.world.add(body);

//           if (this.useVisuals) this.helper.addVisual(body, (sphere) ? 'sphere' : 'box', true, false);

//       // Create contact material behaviour
//       const material_ground = new CANNON.ContactMaterial(this.groundMaterial, material, { friction: 0.0, restitution: (sphere) ? 0.9 : 0.3 });

//       this.world.addContactMaterial(material_ground);
//     }

//     initPhysics(){
//       const world = new CANNON.World();
//       this.world = world;
//       this.fixedTimeStep = 1.0/60.0;
//       this.damping = 0.01;
//       this.body

//       world.broadphase = new CANNON.NaiveBroadphase();
//       world.gravity.set(0, -10, 0);
//       this.debugRenderer = new THREE.CannonDebugRenderer(this.scene, this.world);

//       const groundShape = new CANNON.Plane();
//       const groundMaterial = new CANNON.Material();
//       const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial });
//       groundBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
//       groundBody.addShape(groundShape);
//       world.add(groundBody);

//       const wallShape = new CANNON.Plane();
//       const wallMaterial = new CANNON.Material();
//       const wallBody = new CANNON.Body({ mass: 0, material: wallMaterial });
//       wallBody.quaternion.setFromAxisAngle( new CANNON.Vec3(0,1,0), -Math.PI/2);
//       wallBody.position.set(10,5,0)
//       wallBody.addShape(wallShape);
//       world.add(wallBody);

//       // const wall2Shape = new CANNON.Plane();
//       // const wall2Material = new CANNON.Material();
//       // const wall2Body = new CANNON.Body({ mass: 0, material: wall2Material });
//       // wall2Body.quaternion.setFromAxisAngle( new CANNON.Vec3(0,1,0), -Math.PI/2);
//       // wall2Body.position.set(-10,5,0)
//       // wall2Body.addShape(wall2Shape);
//       // world.add(wall2Body);

//       const wall3Shape = new CANNON.Plane();
//       const wall3Material = new CANNON.Material();
//       const wall3Body = new CANNON.Body({ mass: 0, material: wall3Material });
//       wall3Body.quaternion.setFromAxisAngle( new CANNON.Vec3(0,1,0), -Math.PI/2);
//       wall3Body.position.set(-20,5,-5)
//       wall3Body.addShape(groundShape);
//       world.add(wall3Body);

//     //   const camSphere = new CANNON.Sphere(1);
//     //   const camBody = new CANNON.Body({mass: 0});
//     //   camBody.addShape(camSphere);
//     //   camBody.position.set(new CANNON.Vec3(5,5,5))
//     //   this.camBody = camBody
//     //   this.world.add(this.camBody);


//       const material = new CANNON.Material();
//       const body = new CANNON.Body({ mass: 1, material: material });
//       const camSphere = new CANNON.Sphere(1);
//       body.addShape(camSphere);

//     //   const x = Math.random()*0.3 + 1;
//       // console.log(this.camera.position)
//       body.position.set(this.camera.position.x,this.camera.position.y,this.camera.position.z);
//       body.linearDamping = this.damping;
//       this.body = body


//       this.controls = new FirstPersonControls(this.camera, this.domElement);
//       this.controls.movementSpeed = 5;
//       this.controls.lookSpeed = 0.2;

//       console.log(this.body)
//       console.log('camera in gamejs', this.camera)

//       this.world.add(body);

//       if (this.useVisuals) this.helper.addVisual(body, (true) ? 'sphere' : 'box', true, false);

//       // Create contact material behaviour
//     //   const material_ground = new CANNON.ContactMaterial(this.groundMaterial, material, { friction: 0.0, restitution: (true) ? 0.9 : 0.3 });

//     //   this.world.addContactMaterial(material_ground);

//       if (this.useVisuals) this.helper.addVisual(groundBody, 'ground', false, true);

//       this.shapes = {};
//       this.shapes.sphere = new CANNON.Sphere(1);
//       this.shapes.box = new CANNON.Box(new CANNON.Vec3(0.5,0.5,0.5));

//       this.groundMaterial = groundMaterial;

//       this.animate();
//     }

//     animate() {
//           const game = this;
//           requestAnimationFrame( function(){ game.animate(); } );

//           // this.camMove.position.copy(this.body.position)
//           // this.body.position.copy(this.camera.position)
//           this.camera.position.copy(this.body.position)



//           this.world.step(this.fixedTimeStep);

//       if (this.useVisuals){
//               this.helper.updateBodies(this.world);
//           }else{
//               this.debugRenderer.update();
//           }

//           this.controls.update(this.clock.getDelta())

//           this.renderer.render( this.scene, this.camera );
//       }
//   }
//   console.log(Game)





//   // class CannonHelper{
//   //   constructor(scene){
//   //       this.scene = scene;
//   //   }

//   //   addLights(renderer){
//   //       renderer.shadowMap.enabled = true;
//   //       renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//   //       // LIGHTS
//   //       const ambient = new THREE.AmbientLight( 0x888888 );
//   //       this.scene.add( ambient );

//   //       const light = new THREE.DirectionalLight( 0xdddddd );
//   //       light.position.set( 3, 10, 4 );
//   //       light.target.position.set( 0, 0, 0 );

//   //       light.castShadow = true;

//   //       const lightSize = 10;
//   //       light.shadow.camera.near = 1;
//   //       light.shadow.camera.far = 50;
//   //       light.shadow.camera.left = light.shadow.camera.bottom = -lightSize;
//   //       light.shadow.camera.right = light.shadow.camera.top = lightSize;

//   //       light.shadow.mapSize.width = 1024;
//   //       light.shadow.mapSize.height = 1024;

//   //       this.sun = light;
//   //       this.scene.add(light);
//   //   }

//   //   createCannonTrimesh(geometry){
//   //   if (!geometry.isBufferGeometry) return null;

//   //   const posAttr = geometry.attributes.position;
//   //   const vertices = geometry.attributes.position.array;
//   //   let indices = [];
//   //   for(let i=0; i<posAttr.count; i++){
//   //     indices.push(i);
//   //   }

//   //   return new CANNON.Trimesh(vertices, indices);
//   // }

//   // createCannonConvex(geometry){
//   //   if (!geometry.isBufferGeometry) return null;

//   //   const posAttr = geometry.attributes.position;
//   //   const floats = geometry.attributes.position.array;
//   //   const vertices = [];
//   //   const faces = [];
//   //   let face = [];
//   //   let index = 0;
//   //   for(let i=0; i<posAttr.count; i+=3){
//   //     vertices.push( new CANNON.Vec3(floats[i], floats[i+1], floats[i+2]) );
//   //     face.push(index++);
//   //     if (face.length==3){
//   //       faces.push(face);
//   //       face = [];
//   //     }
//   //   }

//   //   return new CANNON.ConvexPolyhedron(vertices, faces);
//   // }

//   //   addVisual(body, name, castShadow=true, receiveShadow=true){
//   //   body.name = name;
//   //   if (this.currentMaterial===undefined) this.currentMaterial = new THREE.MeshLambertMaterial({color:0x888888});
//   //   if (this.settings===undefined){
//   //     this.settings = {
//   //       stepFrequency: 60,
//   //       quatNormalizeSkip: 2,
//   //       quatNormalizeFast: true,
//   //       gx: 0,
//   //       gy: 0,
//   //       gz: 0,
//   //       iterations: 3,
//   //       tolerance: 0.0001,
//   //       k: 1e6,
//   //       d: 3,
//   //       scene: 0,
//   //       paused: false,
//   //       rendermode: "solid",
//   //       constraints: false,
//   //       contacts: false,  // Contact points
//   //       cm2contact: false, // center of mass to contact points
//   //       normals: false, // contact normals
//   //       axes: false, // "local" frame axes
//   //       particleSize: 0.1,
//   //       shadows: false,
//   //       aabbs: false,
//   //       profiling: false,
//   //       maxSubSteps:3
//   //     }
//   //     this.particleGeo = new THREE.SphereGeometry( 1, 16, 8 );
//   //     this.particleMaterial = new THREE.MeshLambertMaterial( { color: 0xff0000 } );
//   //   }
//   //   // What geometry should be used?
//   //   let mesh;
//   //   if(body instanceof CANNON.Body) mesh = this.shape2Mesh(body, castShadow, receiveShadow);

//   //   if(mesh) {
//   //     // Add body
//   //     body.threemesh = mesh;
//   //           mesh.castShadow = castShadow;
//   //           mesh.receiveShadow = receiveShadow;
//   //     this.scene.add(mesh);
//   //   }
//   // }

//   // shape2Mesh(body, castShadow, receiveShadow){
//   //   const obj = new THREE.Object3D();
//   //   const material = this.currentMaterial;
//   //   const game = this;
//   //   let index = 0;

//   //   body.shapes.forEach (function(shape){
//   //     let mesh;
//   //     let geometry;
//   //     let v0, v1, v2;

//   //     switch(shape.type){

//   //     case CANNON.Shape.types.SPHERE:
//   //       const sphere_geometry = new THREE.SphereGeometry( shape.radius, 8, 8);
//   //       mesh = new THREE.Mesh( sphere_geometry, material );
//   //       break;

//   //     case CANNON.Shape.types.PARTICLE:
//   //       mesh = new THREE.Mesh( game.particleGeo, game.particleMaterial );
//   //       const s = this.settings;
//   //       mesh.scale.set(s.particleSize,s.particleSize,s.particleSize);
//   //       break;

//   //     case CANNON.Shape.types.PLANE:
//   //       geometry = new THREE.PlaneGeometry(10, 10, 4, 4);
//   //       mesh = new THREE.Object3D();
//   //       const submesh = new THREE.Object3D();
//   //       const ground = new THREE.Mesh( geometry, material );
//   //       ground.scale.set(100, 100, 100);
//   //       submesh.add(ground);

//   //       mesh.add(submesh);
//   //       break;

//   //     case CANNON.Shape.types.BOX:
//   //       const box_geometry = new THREE.BoxGeometry(  shape.halfExtents.x*2,
//   //                             shape.halfExtents.y*2,
//   //                             shape.halfExtents.z*2 );
//   //       mesh = new THREE.Mesh( box_geometry, material );
//   //       break;

//   //     case CANNON.Shape.types.CONVEXPOLYHEDRON:
//   //       const geo = new THREE.Geometry();

//   //       // Add vertices
//   //       shape.vertices.forEach(function(v){
//   //         geo.vertices.push(new THREE.Vector3(v.x, v.y, v.z));
//   //       });

//   //       shape.faces.forEach(function(face){
//   //         // add triangles
//   //         const a = face[0];
//   //         for (let j = 1; j < face.length - 1; j++) {
//   //           const b = face[j];
//   //           const c = face[j + 1];
//   //           geo.faces.push(new THREE.Face3(a, b, c));
//   //         }
//   //       });
//   //       geo.computeBoundingSphere();
//   //       geo.computeFaceNormals();
//   //       mesh = new THREE.Mesh( geo, material );
//   //       break;

//   //     case CANNON.Shape.types.HEIGHTFIELD:
//   //       geometry = new THREE.Geometry();

//   //       v0 = new CANNON.Vec3();
//   //       v1 = new CANNON.Vec3();
//   //       v2 = new CANNON.Vec3();
//   //       for (let xi = 0; xi < shape.data.length - 1; xi++) {
//   //         for (let yi = 0; yi < shape.data[xi].length - 1; yi++) {
//   //           for (let k = 0; k < 2; k++) {
//   //             shape.getConvexTrianglePillar(xi, yi, k===0);
//   //             v0.copy(shape.pillarConvex.vertices[0]);
//   //             v1.copy(shape.pillarConvex.vertices[1]);
//   //             v2.copy(shape.pillarConvex.vertices[2]);
//   //             v0.vadd(shape.pillarOffset, v0);
//   //             v1.vadd(shape.pillarOffset, v1);
//   //             v2.vadd(shape.pillarOffset, v2);
//   //             geometry.vertices.push(
//   //               new THREE.Vector3(v0.x, v0.y, v0.z),
//   //               new THREE.Vector3(v1.x, v1.y, v1.z),
//   //               new THREE.Vector3(v2.x, v2.y, v2.z)
//   //             );
//   //             var i = geometry.vertices.length - 3;
//   //             geometry.faces.push(new THREE.Face3(i, i+1, i+2));
//   //           }
//   //         }
//   //       }
//   //       geometry.computeBoundingSphere();
//   //       geometry.computeFaceNormals();
//   //       mesh = new THREE.Mesh(geometry, material);
//   //       break;

//   //     case CANNON.Shape.types.TRIMESH:
//   //       geometry = new THREE.Geometry();

//   //       v0 = new CANNON.Vec3();
//   //       v1 = new CANNON.Vec3();
//   //       v2 = new CANNON.Vec3();
//   //       for (let i = 0; i < shape.indices.length / 3; i++) {
//   //         shape.getTriangleVertices(i, v0, v1, v2);
//   //         geometry.vertices.push(
//   //           new THREE.Vector3(v0.x, v0.y, v0.z),
//   //           new THREE.Vector3(v1.x, v1.y, v1.z),
//   //           new THREE.Vector3(v2.x, v2.y, v2.z)
//   //         );
//   //         var j = geometry.vertices.length - 3;
//   //         geometry.faces.push(new THREE.Face3(j, j+1, j+2));
//   //       }
//   //       geometry.computeBoundingSphere();
//   //       geometry.computeFaceNormals();
//   //       mesh = new THREE.Mesh(geometry, MutationRecordaterial);
//   //       break;

//   //     default:
//   //       throw "Visual type not recognized: "+shape.type;
//   //     }

//   //     mesh.receiveShadow = receiveShadow;
//   //     mesh.castShadow = castShadow;

//   //           mesh.traverse( function(child){
//   //               if (child.isMesh){
//   //                   child.castShadow = castShadow;
//   //         child.receiveShadow = receiveShadow;
//   //               }
//   //           });

//   //     var o = body.shapeOffsets[index];
//   //     var q = body.shapeOrientations[index++];
//   //     mesh.position.set(o.x, o.y, o.z);
//   //     mesh.quaternion.set(q.x, q.y, q.z, q.w);

//   //     obj.add(mesh);
//   //   });

//   //   return obj;
//   // }

//   //   updateBodies(world){
//   //       world.bodies.forEach( function(body){
//   //           if ( body.threemesh != undefined){
//   //               body.threemesh.position.copy(body.position);
//   //               body.threemesh.quaternion.copy(body.quaternion);
//   //           }
//   //       });
//   //   }
//   // }
