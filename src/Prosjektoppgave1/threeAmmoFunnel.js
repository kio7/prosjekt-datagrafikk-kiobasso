import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import { generateTriangleShape } from "./triangleMeshHelpers.js";

import {COLLISION_GROUP_SEESAW, COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_MOVEABLE} from "./myAmmoHelper.js";
import {ri} from "./script.js";

export function createAmmoFunnel(
    mass=0, 
    color=0xF3F3F3, 
    position={ x:7, y:7, z:0 },
    topRadius=5,
    bottomRadius=0.4,
    height=3,
    ) {
    let geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, 60, 60, true);
    let material = new THREE.MeshStandardMaterial({ color:color, side: THREE.DoubleSide });
    let funnelMesh = new THREE.Mesh(geometry, material);
    funnelMesh.position.set(position.x, position.y, position.z);
    funnelMesh.userData.tag = "funnel";
    funnelMesh.receiveShadow = true;
    funnelMesh.castShadow = true;

    
    let shape = generateTriangleShape(funnelMesh, false);
    let rigidBody = createAmmoRigidBody(shape, funnelMesh, 0.3, 0.2, position, mass);
    funnelMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SEESAW,
        COLLISION_GROUP_SEESAW | COLLISION_GROUP_SPHERE | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
        );
        
        
    addMeshToScene(funnelMesh);
    phy.rigidBodies.push(funnelMesh);
    rigidBody.threeMesh = funnelMesh;

}
