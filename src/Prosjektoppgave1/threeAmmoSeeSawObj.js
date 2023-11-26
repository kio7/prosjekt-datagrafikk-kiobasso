/*
Modulen lager objektene som ligger på dumpehusken, en bøtte og en motvekt.
*/

import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {addToCompound} from "./triangleMeshHelpers.js";
import {
    COLLISION_GROUP_SEESAW, 
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_SPHERE,
    COLLISION_GROUP_SEESAWOBJ,
    COLLISION_GROUP_FUNNEL
    } from "./myAmmoHelper.js";

export function createBucket(position = {x:4 ,y:2, z:0}, roughness = 0.5, metalness = 0.5, color) {

    const segments = 50;
    const radius = 0.5;
    const bottomThickness = 0.1;
    
    // Three-container
    let bucketGroupMesh = new THREE.Group();
    bucketGroupMesh.name = "bucket";
    // Ammo-container
    let bucketCompoundShape = new Ammo.btCompoundShape();

    // Three
    let bucketMaterial = new THREE.MeshStandardMaterial({
        color: color,
        roughness: roughness,
        metalness: metalness
    });
    let bottomGeometry = new THREE.CylinderGeometry(radius, radius, bottomThickness, segments);
    let bottomMesh = new THREE.Mesh(bottomGeometry, bucketMaterial);
    bottomMesh.receiveShadow = true;
    bottomMesh.castShadow = true;
    bucketGroupMesh.add(bottomMesh);

    // Ammo
    let shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, bottomThickness/2, radius));
    addToCompound(bucketCompoundShape, bottomMesh, shape);


    // Sides of the bucket
    for (let i = 0; i < segments; i++) {
        let angle = (i / segments) * Math.PI * 2;
        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;

        // Three
        let sideMesh = new THREE.Mesh(
            new THREE.BoxGeometry((2 * (Math.PI * radius) / segments) * 1.1, 1, 0.1, 1, 1),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: roughness,
                metalness: metalness
            })
        );
        sideMesh.position.set(x, radius, z);
        sideMesh.rotation.y = Math.PI/2 - angle;
        sideMesh.castShadow = true;
        sideMesh.receiveShadow = true;
        bucketGroupMesh.add(sideMesh);

        // Ammo
        let width = sideMesh.geometry.parameters.width;
        let height = sideMesh.geometry.parameters.height;
        let depth = sideMesh.geometry.parameters.depth;
        
        let sideShape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, height/2, depth/2));
        addToCompound(bucketCompoundShape, sideMesh, sideShape);
    }

    // Ammo for the bucket, compound shape
    let rigidBody = createAmmoRigidBody(bucketCompoundShape, bucketGroupMesh, 0.3, 1.8, position, 2)
    bucketGroupMesh.userData.physicsBody = rigidBody;

    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SEESAWOBJ,
        COLLISION_GROUP_SEESAW |
        COLLISION_GROUP_SEESAWOBJ |
        COLLISION_GROUP_SPHERE |  
        COLLISION_GROUP_PLANE |
        COLLISION_GROUP_FUNNEL
    );

    addMeshToScene(bucketGroupMesh);
    phy.rigidBodies.push(bucketGroupMesh);
    rigidBody.threeMesh = bucketGroupMesh;
}


export function createCounterWeight(position = {x:-4 ,y:2, z:0}, roughness = 0.5, metalness = 0.5, color) {
    // Three
    let counterWeightMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1, 1, 1),
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: roughness,
            metalness: metalness
        })
    );
    counterWeightMesh.name = 'counterWeight';
    counterWeightMesh.castShadow = true;
    counterWeightMesh.receiveShadow = true;

    // Ammo
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
    shape.setMargin(0.05);
    let rigidBody = createAmmoRigidBody(shape, counterWeightMesh, 0.3, 1.8, position, 2);
    counterWeightMesh.userData.physicsBody = rigidBody;

    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SEESAWOBJ, 
        COLLISION_GROUP_SPHERE | 
        COLLISION_GROUP_SEESAWOBJ |
        COLLISION_GROUP_PLANE |
        COLLISION_GROUP_SEESAW
    );
    addMeshToScene(counterWeightMesh);
    phy.rigidBodies.push(counterWeightMesh);
    rigidBody.threeMesh = counterWeightMesh;
}