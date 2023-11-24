import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import { generateTriangleShape } from "./triangleMeshHelpers.js";

import {
    COLLISION_GROUP_SPHERE, 
    COLLISION_GROUP_FUNNEL,
    COLLISION_GROUP_SEESAWOBJ
} from "./myAmmoHelper.js";

export function createAmmoFunnel(
    mass=0, 
    color=0xF3F3F3, 
    position={ x:7, y:7, z:0 },
    topRadius=5,
    bottomRadius=0.4,
    height=3,
    textureObject,
    ) {
    let geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 60, 60, true);
    
    // let material = new THREE.MeshStandardMaterial({ 
    let material = new THREE.MeshPhongMaterial({ 
        map: textureObject,
        color:color, 
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: true,
        opacity: 0.4,
    });
    let funnelMesh = new THREE.Mesh(geometry, material);
    
    funnelMesh.position.set(position.x, position.y, position.z);
    funnelMesh.userData.tag = "funnel";
    funnelMesh.name = "funnel";
    funnelMesh.renderOrder = 2;
    funnelMesh.receiveShadow = true;
    funnelMesh.castShadow = true;

    
    let shape = generateTriangleShape(funnelMesh, false);
    let rigidBody = createAmmoRigidBody(shape, funnelMesh, 0.1, 0.9, position, mass);
    funnelMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_FUNNEL,
        COLLISION_GROUP_SPHERE |
        COLLISION_GROUP_SEESAWOBJ
        );
        
        
    addMeshToScene(funnelMesh);
    phy.rigidBodies.push(funnelMesh);
    rigidBody.threeMesh = funnelMesh;

}
