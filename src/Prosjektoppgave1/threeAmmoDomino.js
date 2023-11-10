import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';
import { createAmmoRigidBody, phy } from './myAmmoHelper';
import { COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_MOVEABLE, COLLISION_GROUP_SEESAW } from './myAmmoHelper';

export function createAmmoDomino(pos={x:-10, y:0, z:10}, rot={x:0, y:0, z:0}, size=0.51) {
    let mass=1.5;
    const color=0x00FF00; 
    
    // First Domino:
    // THREE:
    const material = new THREE.MeshStandardMaterial({ color: color });
    let mesh = new THREE.Mesh(new THREE.BoxGeometry(size, 2*size, size/3), material);
    mesh.position.set(pos.x, pos.y, pos.z);
    // mesh.rotation.set(rot.x + Math.PI/12, rot.y, rot.z); // Comment out to make the starting domino straight
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // AMMO:
    let width = mesh.geometry.parameters.width;
    let height = mesh.geometry.parameters.height;
    let depth = mesh.geometry.parameters.depth;
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, height/2, depth/2));
    let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.5, pos, mass);

    mesh.userData.physicsBody = rigidBody;

    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SEESAW,
        COLLISION_GROUP_SPHERE | COLLISION_GROUP_SEESAW | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
    );

    addMeshToScene(mesh);
    phy.rigidBodies.push(mesh);
    rigidBody.treeMesh = mesh;


    // Rest of the dominos:
    let dominoCount = 15;

    for (let i = 0; i < dominoCount; i++) {;
        size *= 1.35; // update size
        mass *= 1.1; // update mass
        pos.z += size; // update pos

        let mesh = new THREE.Mesh(new THREE.BoxGeometry(size, 2*size, size/3), material);
        mesh.rotation.set(rot.x, rot.y, rot.z);
        mesh.position.set(pos.x, pos.y, pos.z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // AMMO:
        let width = mesh.geometry.parameters.width;
        let height = mesh.geometry.parameters.height;
        let depth = mesh.geometry.parameters.depth;
        let shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, height/2, depth/2));
        let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.5, pos, mass);
        mesh.userData.physicsBody = rigidBody;

        phy.ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_SEESAW,
            COLLISION_GROUP_SPHERE | COLLISION_GROUP_SEESAW | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
        );
        addMeshToScene(mesh);
        phy.rigidBodies.push(mesh);
        rigidBody.treeMesh = mesh;
    }
}