import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper.js';
import { createAmmoRigidBody, phy } from './myAmmoHelper.js';

import { COLLISION_GROUP_PORTAL, COLLISION_GROUP_WALL } from './myAmmoHelper.js';

export function createAmmoPortals(
    color=0xF3F3F3,
    position={ x:0, y:0, z:0 },
    radius=1,
    textureObject,
) {
    const mass = 0;

    let geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 100);

    let material = new THREE.MeshPhongMaterial({ 
        map: textureObject,
        color:color, 
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
        opacity: 1.0,
    });

    let portalMesh = new THREE.Mesh(geometry, material);

    portalMesh.position.set(position.x, position.y, position.z);
    portalMesh.name = "portal";

    let shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, 0.1, radius));
    let rigidBody = createAmmoRigidBody(shape, portalMesh, 0.0, 0.0, position, mass);
    portalMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_PORTAL,
        COLLISION_GROUP_WALL
    );

    addMeshToScene(portalMesh);
    phy.rigidBodies.push(portalMesh);
    rigidBody.threeMesh = portalMesh;
}
