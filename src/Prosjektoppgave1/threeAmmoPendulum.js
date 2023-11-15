/* 

Pendel koden er basert på Patrik Andreassen sin kode.
Patrik sin kode er inspirert av armHingeConstraint.js fra modul 7 (Werner Farstad) og støttet opp med hjelp av ChatGPT 3.5 for feilsøking.
Koden for linjen er basert på kodeeksempelet springGeneric6DofSpringConstraint.js i modul 7 (Werner Farstad).

*/


import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {MTLLoader} from "three/examples/jsm/loaders/MTLLoader";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";

import {
    COLLISION_GROUP_PENDULUM,
    COLLISION_GROUP_DOMINO,
    COLLISION_GROUP_WALL
} from "./myAmmoHelper.js"

export function createAmmoPendulum (
    mass = 1,
    color = 0xFF0000,
    position = {x:0, y:0, z:0},
    roughness = 0.5,
    metalness
) {
    // Ball
    const ballPosition = {x: position.x -12, y: position.y - 12.9, z: position.z}
    const ballRadius = 1

    let ballMesh = new THREE.Mesh(
        new THREE.SphereGeometry(ballRadius, 32, 32),
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness
        })
    );

    ballMesh.receiveShadow = true;
    ballMesh.castShadow = true;
    ballMesh.name = "WreckingBall";
    ballMesh.position.set(ballPosition.x, ballPosition.y, ballPosition.z);
    addMeshToScene(ballMesh);
    
    let sphereShape = new Ammo.btSphereShape(ballRadius);
    let sphereRigidBody = createAmmoRigidBody(sphereShape, ballMesh, 0.7, 0.8, ballPosition, mass);
    ballMesh.userData.physicsBody = sphereRigidBody;
    
    phy.ammoPhysicsWorld.addRigidBody(
        sphereRigidBody,
        COLLISION_GROUP_PENDULUM,
        COLLISION_GROUP_DOMINO | COLLISION_GROUP_WALL
    );
    phy.rigidBodies.push(ballMesh);
    sphereRigidBody.threeMesh = ballMesh;
    

    // Invisable box for position of mesh, needed for worldCoordinates for the line.
    let anchorBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: color}));
    anchorBoxMesh.position.set(position.x, position.y - 0.5, position.z); // Might look redundant, but needed for the line
    anchorBoxMesh.name = "anchorBoxMesh";
    anchorBoxMesh.castShadow = true;
    anchorBoxMesh.receiveShadow = true;
    anchorBoxMesh.visible = false;
    addMeshToScene(anchorBoxMesh);

    let boxShape = new Ammo.btBoxShape(new Ammo.btVector3(anchorBoxMesh.geometry.parameters.width/2, anchorBoxMesh.geometry.parameters.height/2, anchorBoxMesh.geometry.parameters.depth/2));
    boxShape.setMargin(0.05);
    let anchorRigidBody = createAmmoRigidBody(boxShape, anchorBoxMesh, 0.7, 0.8, position, 0);
    anchorBoxMesh.userData.physicsBody = anchorRigidBody;

    phy.ammoPhysicsWorld.addRigidBody(
        anchorRigidBody,
        COLLISION_GROUP_PENDULUM,
        COLLISION_GROUP_WALL | COLLISION_GROUP_DOMINO
    );

    anchorRigidBody.threeMesh = anchorBoxMesh;
    
    // Spaceship over the box.
    let  mesh = null;
    let  mtlLoader = new MTLLoader();
    let  modelName = 'E_45_Aircraft';

    //Laster først materiale:
    mtlLoader.load('./models/spaceship/' + modelName + '.mtl', function (materials) {
        materials.preload();
        let objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        
        //...deretter geometrien:
        objLoader.load('./models/spaceship/' + modelName + '.obj', (object) => {
                mesh = object;
                mesh.position.set(position.x, position.y, position.z);
                mesh.rotation.set(0, -Math.PI/1.2, 0);
                mesh.scale.set(1, 1, 1);

                addMeshToScene(mesh);
        });
    });

    // Line
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([anchorBoxMesh.position, ballMesh.position]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000FF });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.receiveShadow = true;
    line.castShadow = true;
    line.name = "pendulumLineMesh";
    addMeshToScene(line);

    const hingePivotA = new Ammo.btVector3(0, 0, 0);
    const hingePivotB = new Ammo.btVector3(16, 4, 0);
    const hingeAxis = new Ammo.btVector3(0, 0, 1);
    const hingeConstraint = new Ammo.btHingeConstraint(anchorRigidBody, sphereRigidBody, hingePivotA, hingePivotB, hingeAxis, hingeAxis, true);
    phy.ammoPhysicsWorld.addConstraint(hingeConstraint);
}