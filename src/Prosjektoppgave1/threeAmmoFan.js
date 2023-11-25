import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";

import {
    COLLISION_GROUP_FAN,
    COLLISION_GROUP_WALL
} from "./myAmmoHelper.js";


export function createAmmoFan(
    position,
    rotation,
    scale,
    textureObject
) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    
    let material = new THREE.MeshPhongMaterial({ 
        map: textureObject,
        color:0xffffff,
        transparent: true,
        depthWrite: true,
    });

    let fanMesh = new THREE.Mesh(geometry, material);

    fanMesh.position.set(position.x, position.y, position.z);
    fanMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    fanMesh.scale.set(scale.x, scale.y, scale.z);
    fanMesh.name = "fan"
    fanMesh.visible = false;

    let shape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
    let rigidBody = createAmmoRigidBody(shape, fanMesh, 0, 0, position, 0);
    fanMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_FAN,
        COLLISION_GROUP_WALL
    );

    addMeshToScene(fanMesh);
    phy.rigidBodies.push(fanMesh);
    rigidBody.threeMesh = fanMesh;
}