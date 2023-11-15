/* 
Koden under er inspirert av https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_rope.html
Den har blitt endret til å passe vårt prosjekt.
*/

import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';
import { createAmmoRigidBody, phy } from './myAmmoHelper.js';

import {
    COLLISION_GROUP_PENDULUM,
    COLLISION_GROUP_WALL,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_FAN
} from './myAmmoHelper.js';


export function createAmmoWall(mass, size, num, position) {

    const brickMass = mass;
    const brickLength = size*0.5;
    const brickDepth = size*0.2;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = num;
    const numBricksHeight = num;

    const z0 = - numBricksLength * brickLength * 0.5;
    const pos = {x: position.x, y: position.y, z: position.z};

    for ( let j = 0; j < numBricksHeight; j ++ ) {

        const oddRow = ( j % 2 ) == 1;

        pos.z = z0;

        if ( oddRow ) {
            pos.z -= 0.25 * brickLength;
        }

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for ( let i = 0; i < nRow; i ++ ) {
            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {
                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;
            }
            
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry( brickDepth, brickHeight, brickLengthCurrent ),
                new THREE.MeshStandardMaterial( { color: Math.floor( Math.random() * ( 1 << 24 )) } )
            );
            mesh.name = "brick"
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            addMeshToScene(mesh);
            
            let boxShape = new Ammo.btBoxShape(new Ammo.btVector3(brickDepth*0.5, brickHeight*0.5, brickLengthCurrent*0.5));
            boxShape.setMargin(0.05);
            let brickRigidBody = createAmmoRigidBody(boxShape, mesh, 0.7, 0.8, {x: pos.x, y:pos.y, z:pos.z + position.z}, brickMassCurrent);
            mesh.userData.physicsBody = brickRigidBody;

            phy.ammoPhysicsWorld.addRigidBody(
                brickRigidBody,
                COLLISION_GROUP_WALL,
                COLLISION_GROUP_WALL | COLLISION_GROUP_PENDULUM | COLLISION_GROUP_PLANE | COLLISION_GROUP_FAN
            );
            phy.rigidBodies.push(mesh);
            brickRigidBody.threeMesh = mesh;
            brickRigidBody.setActivationState(4); //DISABLE_DEACTIVATION

            if ( oddRow && ( i == 0 || i == nRow - 2 ) ) {
                pos.z += 0.75 * brickLength;
            } else {
                pos.z += brickLength;
            }
        }
        pos.y += brickHeight;
    }
}