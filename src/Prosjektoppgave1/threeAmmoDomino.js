import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';
import { createAmmoRigidBody, phy } from './myAmmoHelper';
import { COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_MOVEABLE, COLLISION_GROUP_SEESAW } from './myAmmoHelper';

export function createAmmoDomino(
    pos={x:-10, y:0, z:10}, 
    size=0.51, 
    dominoCount = 7,
    textureObject    
    ) {
    let mass=1.5;
    const color=0xFFFFFF; 
    const material = new THREE.MeshStandardMaterial({ 
        map: textureObject,
        color: color,
        side: THREE.DoubleSide, 
    });

    for (let i = 0; i < dominoCount; i++) {;
        size = size + 0.25 * i; // update size
        mass = mass + 1.33 * i; // update mass
        pos.z += size - size * 0.2; // update pos

        let mesh = new THREE.Mesh(new THREE.BoxGeometry(size, 2*size, size/3), material);

        mesh.receiveShadow = true;
        mesh.castShadow = true;

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