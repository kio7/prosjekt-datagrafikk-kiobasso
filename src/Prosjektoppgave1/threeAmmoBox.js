/*

Boksen som tar imot alle klossene på slutten.

*/

import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper.js';
import { createAmmoRigidBody, phy } from './myAmmoHelper.js';
import { addToCompound } from './triangleMeshHelpers.js';
import {
    COLLISION_GROUP_WALL,
    COLLISION_GROUP_BOX
} from './myAmmoHelper.js';

export function createBox(scale = 1, position = {x:0, y:0, z:0}, color = 0x00FF00, textureObject) {
    const mass = 0;

    // Lager gruppe for å kunne legge til flere meshes:
    let boxGroupMesh = new THREE.Group();
    boxGroupMesh.name = 'boxGroup';
    boxGroupMesh.position.set(position.x, position.y, position.z);

    let compoundShape = new Ammo.btCompoundShape();

    // THREE:
    let material = new THREE.MeshPhongMaterial( {
        color: color,
        map: textureObject,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
    });

    // Bunnen på boksen
    let mesh = new THREE.Mesh(new THREE.BoxGeometry(scale, 0.1, scale), material);
    mesh.renderOrder = 1;
    mesh.receiveShadow = true;
    mesh.name = 'box';
    mesh.position.set(0, -scale/2, 0);
    boxGroupMesh.add(mesh);
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(scale/2, 0.05, scale/2));
    addToCompound(compoundShape, mesh, shape);
    
    // Sidene på boksen
    let copyMesh = mesh.clone();
    copyMesh.position.set(0, 0, scale/2);
    copyMesh.rotation.x = Math.PI/2;
    boxGroupMesh.add(copyMesh);
    addToCompound(compoundShape, copyMesh, shape);

    copyMesh = mesh.clone();
    copyMesh.position.set(0, 0, -scale/2);
    copyMesh.rotation.x = Math.PI/2;
    boxGroupMesh.add(copyMesh);
    addToCompound(compoundShape, copyMesh, shape);

    copyMesh = mesh.clone();
    copyMesh.position.set(scale/2, 0, 0);
    copyMesh.rotation.z = Math.PI/2;
    boxGroupMesh.add(copyMesh);
    addToCompound(compoundShape, copyMesh, shape);

    copyMesh = mesh.clone();
    copyMesh.position.set(-scale/2, 0, 0);
    copyMesh.rotation.z = Math.PI/2;
    boxGroupMesh.add(copyMesh);
    addToCompound(compoundShape, copyMesh, shape);

    // AMMO:
    let rigidBody = createAmmoRigidBody(compoundShape, boxGroupMesh, 0.0, 0.0, position, mass);
    boxGroupMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_BOX,
        COLLISION_GROUP_WALL
    );
    addMeshToScene(boxGroupMesh);
    phy.rigidBodies.push(boxGroupMesh);
    rigidBody.threeMesh = boxGroupMesh;   
}
