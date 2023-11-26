/* 
Modulen lager 2 portaler, 1 visuell og 1 fysisk for kollisjondeteksjon (ammo).
*/


import * as THREE from 'three';
import { addMeshToScene, playAudioOnce } from './myThreeHelper.js';
import { createAmmoRigidBody, phy } from './myAmmoHelper.js';

import { COLLISION_GROUP_PORTAL, COLLISION_GROUP_WALL } from './myAmmoHelper.js';

export function createAmmoPortals(
    color=0xF3F3F3,
    position={ x:0, y:0, z:0 },
    radius=1,
    textureObject,
) {
    // Visual portal
    // Three
    let geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 100);

    let material = new THREE.MeshPhongMaterial({ 
        map: textureObject,
        color:color, 
        side: THREE.DoubleSide,
    });

    let portalMesh = new THREE.Mesh(geometry, material);

    portalMesh.position.set(position.x, position.y, position.z);
    portalMesh.name = "visual_portal";
    addMeshToScene(portalMesh);


    // Physical portal for collision detection
    // Three
    const mass = 0;
    geometry = new THREE.CylinderGeometry(radius, radius, 0.1, 100);
    material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    let physicalPortalMesh = new THREE.Mesh(geometry, material);
    physicalPortalMesh.visible = false;
    physicalPortalMesh.name = "physical_portal";
    
    // Collision detection between portal and brick, for teleport sound.
    let i = false;
    physicalPortalMesh.collisionResponse = (mesh1) => {
        if (mesh1.name === "brick" && !i) {
            playAudioOnce('./sounds/distorted_laser.mp3', 0.5, 1);
            i = true;
        };
    };

    // Ammo
    let shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, 0.1, radius));
    let rigidBody = createAmmoRigidBody(shape, physicalPortalMesh, 0.0, 0.0, position, mass);
    physicalPortalMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_PORTAL,
        COLLISION_GROUP_WALL
    );

    addMeshToScene(physicalPortalMesh);
    phy.rigidBodies.push(physicalPortalMesh);
    rigidBody.threeMesh = physicalPortalMesh;
}
