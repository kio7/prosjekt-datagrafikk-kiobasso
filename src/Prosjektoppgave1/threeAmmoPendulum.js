/* 

Pendel koden er basert på Patrik Andreassen sin kode.
Patrik sin kode er inspirert av armHingeConstraint.js fra modul 7 (Werner Farstad) og støttet opp med hjelp av ChatGPT 3.5 for feilsøking.
Koden for linjen er basert på kodeeksempelet springGeneric6DofSpringConstraint.js i modul 7 (Werner Farstad).

*/


import * as THREE from "three";
import {addMeshToScene, createCameraTimeline, playAudioOnce} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {
    COLLISION_GROUP_PENDULUM,
    COLLISION_GROUP_DOMINO,
    COLLISION_GROUP_WALL
} from "./myAmmoHelper.js";

import {cameraCoordinates as cc} from "./cameraCoord.js";
import {addProgressBar} from "./screenElements.js";
import {ri} from "./script.js";


export function createAmmoPendulum (mass = 1, color = 0xFF0000, position = {x:0, y:0, z:0}, roughness = 0.5, metalness = 0.5) {

    // WreckingBall
    const ballPosition = {x: position.x - 19, y: position.y - 29, z: position.z}
    const ballRadius = 3.4;

    // THREE:
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

    // Kollisjonsrespons, lydeffekter:
    let i = false;
    ballMesh.collisionResponse = (mesh1) => {
        // Kule treffer klossene:
        if (mesh1.name === "brick" && i === false) {
            createCameraTimeline(cc.wall);
            playAudioOnce('./sounds/bricks-falling.mp3', 0.5, 1);
            i = true;

            // Legger til progressbar:
            addProgressBar();
        };
    };

    // AMMO:
    let sphereShape = new Ammo.btSphereShape(ballRadius);
    let sphereRigidBody = createAmmoRigidBody(sphereShape, ballMesh, 0.7, 0.1, ballPosition, mass);
    ballMesh.userData.physicsBody = sphereRigidBody;
    
    // Legger til i physics world:
    phy.ammoPhysicsWorld.addRigidBody(
        sphereRigidBody,
        COLLISION_GROUP_PENDULUM,
        COLLISION_GROUP_DOMINO | COLLISION_GROUP_WALL
        );

    // Legger til i scene:
    addMeshToScene(ballMesh);
    phy.rigidBodies.push(ballMesh);
    sphereRigidBody.threeMesh = ballMesh;
    

    // Invisible box for position of mesh, needed for worldCoordinates 
    // for the line so that hingeConstraint can be added:
    //THREE:
    let anchorBoxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: color}));
    anchorBoxMesh.position.set(position.x, position.y - 0.5, position.z); // Might look redundant, but needed for the line
    anchorBoxMesh.name = "anchorBoxMesh";
    anchorBoxMesh.visible = false;
    
    // AMMO:
    let boxShape = new Ammo.btBoxShape(new Ammo.btVector3(
        anchorBoxMesh.geometry.parameters.width/2, 
        anchorBoxMesh.geometry.parameters.height/2, 
        anchorBoxMesh.geometry.parameters.depth/2
        ));
    boxShape.setMargin(0.05);
    let anchorRigidBody = createAmmoRigidBody(boxShape, anchorBoxMesh, 0.7, 0.8, position, 0);
    anchorBoxMesh.userData.physicsBody = anchorRigidBody;

    // Legger til i physics world:
    phy.ammoPhysicsWorld.addRigidBody(
        anchorRigidBody,
        COLLISION_GROUP_PENDULUM,
        COLLISION_GROUP_WALL | COLLISION_GROUP_DOMINO
        );
    
    // Legger til i scene:
    addMeshToScene(anchorBoxMesh);
    anchorRigidBody.threeMesh = anchorBoxMesh;
    

    // Line
    const lineGeometry = new THREE.BufferGeometry().setFromPoints([anchorBoxMesh.position, ballMesh.position]);
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0x0000FF });
    const line = new THREE.Line(lineGeometry, lineMaterial);
    line.receiveShadow = true;
    line.castShadow = true;
    line.name = "pendulumLineMesh";
    addMeshToScene(line);


    // HingeConstraint
    const hingePivotA = new Ammo.btVector3(0, 0, 0);
    const hingePivotB = new Ammo.btVector3(29.5, 9.0, 0);
    const hingeAxis = new Ammo.btVector3(0, 0, 1);
    const hingeConstraint = new Ammo.btHingeConstraint(anchorRigidBody, sphereRigidBody, hingePivotA, hingePivotB, hingeAxis, hingeAxis, true);
    phy.ammoPhysicsWorld.addConstraint(hingeConstraint);
}

export function updateLineForWreckingBall() {
    // Endre linje posisjon:
    const lineMeshStartPoint = ri.scene.getObjectByName("anchorBoxMesh");
    const lineMeshEndPoint = ri.scene.getObjectByName("WreckingBall");
    const line = ri.scene.getObjectByName("pendulumLineMesh");

    const lineVertexPositions = line.geometry.attributes.position.array;

    const lineStartPos = new THREE.Vector3();
    lineMeshStartPoint.getWorldPosition(lineStartPos);
    lineVertexPositions[0] = lineStartPos.x;
    lineVertexPositions[1] = lineStartPos.y;
    lineVertexPositions[2] = lineStartPos.z;

    const lineEndPos = new THREE.Vector3();
    lineMeshEndPoint.getWorldPosition(lineEndPos);
    lineVertexPositions[3] = lineEndPos.x;
    lineVertexPositions[4] = lineEndPos.y;
    lineVertexPositions[5] = lineEndPos.z;

    line.geometry.attributes.position.needsUpdate = true;
    line.geometry.computeBoundingBox();
    line.geometry.computeBoundingSphere();
};