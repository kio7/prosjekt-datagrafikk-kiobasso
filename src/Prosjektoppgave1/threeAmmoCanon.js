/*
Modulen lager en kanon som kan skyte ut kuler.
*/

import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import { addToCompound } from "./triangleMeshHelpers.js";
import {
    COLLISION_GROUP_SPHERE, 
    COLLISION_GROUP_CANON
} from "./myAmmoHelper.js"

// Hovedfunksjonen som lager kanonen:
export function createAmmoCanon(position = {x:0, y:0, z:0}, rotateY, rotateZ, color) {
    const mass = 0;
    const canonPosition = {x: position.x, y: position.y + 0.5, z: position.z};
    const segments = 50; 

    // // AMMO-container
    let compoundShape = new Ammo.btCompoundShape();
    // THREE-container
    let canonGroupMesh = new THREE.Group();

    // Lag cylinder
    createAmmoCanonMesh(canonGroupMesh, compoundShape ,segments, color);

    canonGroupMesh.rotateY(rotateY);
    canonGroupMesh.rotateZ(rotateZ);
    canonGroupMesh.name = 'canon';

    // AMMO
    let rigidCanonBody = createAmmoRigidBody(compoundShape, canonGroupMesh, 0.7, 0.8, canonPosition, mass);
    canonGroupMesh.userData.physicsBody = rigidCanonBody;
        
    // Legger til  i physics world:
    phy.ammoPhysicsWorld.addRigidBody(
        rigidCanonBody,
        COLLISION_GROUP_CANON,
        COLLISION_GROUP_SPHERE
    );

    addMeshToScene(canonGroupMesh);
    phy.rigidBodies.push(canonGroupMesh);
    rigidCanonBody.threeMesh = canonGroupMesh;    
}

// Lager kanonen:
export function createAmmoCanonMesh(canonGroupMesh, compoundShape, segments, color) {
    const radius = 0.3;
	const elm_width = 0.042;
	const elm_height = 1;
	const elm_depth = 0.05;
    const theta = (2*Math.PI) / segments;

    // Lager bunnen på kanonen: 
    let activator = new THREE.CylinderGeometry(radius, radius, 0.1, segments);
    let activatorMesh = new THREE.Mesh(
        activator, 
        new THREE.MeshStandardMaterial({
            color: color,
            roughness: 0.0,
            metalness: 0.0
        }));
    activatorMesh.position.set(0, -0.4, 0);
    activatorMesh.name = 'activator';
    canonGroupMesh.add(activatorMesh);
    let shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, 0.1, radius));
    addToCompound(compoundShape, activatorMesh, shape);

    // Lager sylinderen på kanonen:
    for (let i = 0; i < segments; i++) {
        // THREE
        let mesh = new THREE.Mesh(
            new THREE.BoxGeometry(elm_width,elm_height,elm_depth, 1, 1),
            new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.0,
                metalness: 0.0
            }));
        mesh.name = 'cube';
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Posisjoner elementer i sirkel:
        const angle = theta * i;
        const x = radius * Math.cos(angle);
        const y = 0;
        const z = radius * Math.sin(angle);

        // Roter elementet slik at det peker utover fra sirkelen:
        mesh.position.set(x, y, z);
        mesh.rotation.y = Math.PI/2 - angle;

        // Legg elementet til i gruppen:
        canonGroupMesh.add(mesh);
        let shape = new Ammo.btBoxShape(new Ammo.btVector3(elm_width/2,elm_height/2,elm_depth/2));
        addToCompound(compoundShape, mesh, shape);

    }; 
};