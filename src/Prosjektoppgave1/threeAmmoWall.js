/* 
Denne koden lager en vegg med en rekke klosser.

Koden er inspirert av https://github.com/mrdoob/three.js/blob/master/examples/physics_ammo_rope.html
*/

import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';
import { createAmmoRigidBody, phy } from './myAmmoHelper.js';

import {
    COLLISION_GROUP_PENDULUM,
    COLLISION_GROUP_WALL,
    COLLISION_GROUP_PLANE,
    COLLISION_GROUP_FAN,
    COLLISION_GROUP_PORTAL,
    COLLISION_GROUP_BOX
} from './myAmmoHelper.js';

import { createParticles } from './threeParticles.js';
import { ri } from './script.js';


export function createAmmoWall(mass, size, num, position) {
    const brickMass = mass;
    const brickLength = size*0.5;
    const brickDepth = size*0.2;
    const brickHeight = brickLength * 0.5;
    const numBricksLength = num;
    const numBricksHeight = num;

    const z0 = - numBricksLength * brickLength * 0.5; // outermost position of the wall
    const pos = {x: position.x, y: position.y, z: position.z};

    // Most of the code underneeth is based on the provided link  above.
    for (let j = 0; j < numBricksHeight; j++) {

        const oddRow = (j % 2) == 1;
        pos.z = z0;

        if (oddRow) {
            pos.z -= 0.25 * brickLength;
        }

        const nRow = oddRow ? numBricksLength + 1 : numBricksLength;

        for (let i = 0; i < nRow; i ++) {
            let brickLengthCurrent = brickLength;
            let brickMassCurrent = brickMass;
            if ( oddRow && ( i == 0 || i == nRow - 1 ) ) {
                brickLengthCurrent *= 0.5;
                brickMassCurrent *= 0.5;
            }
            
            // Three
            const mesh = new THREE.Mesh(
                new THREE.BoxGeometry( brickDepth, brickHeight, brickLengthCurrent ),
                new THREE.MeshStandardMaterial( { color: Math.floor( Math.random() * ( 1 << 24 )) } )
            );
            mesh.name = "brick"
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Collision event, particles and teleport bricks
            let toggle = false
            mesh.collisionResponse = (mesh1) => {
                if (mesh1.name === "physical_portal" && toggle === false) {
                    // Particles first portal
                    createParticles({x: mesh.position.x, y: mesh.position.y + 0.5, z: mesh.position.z});
                    
                    // Move to second portal
                    // Add new Mesh
                    let material = mesh.material

                    let newMesh = new THREE.Mesh(
                        new THREE.BoxGeometry( brickDepth, brickHeight, brickLengthCurrent ),
                        material
                    );
                    
                    newMesh.position.set(75, 24, -70)
                    newMesh.rotation.set(mesh.rotation.x, mesh.rotation.y, mesh.rotation.z)
                    newMesh.castShadow = true;
                    newMesh.receiveShadow = true;
                    newMesh.name = "newBrick"


                    let shape = new Ammo.btBoxShape(new Ammo.btVector3(brickDepth*0.5, brickHeight*0.5, brickLengthCurrent*0.5));
                    let rigidBody = createAmmoRigidBody(shape, newMesh, 0.0, 0.9, newMesh.position, brickMassCurrent);
                    rigidBody.setLinearVelocity(mesh.userData.physicsBody.getLinearVelocity());
                    newMesh.userData.physicsBody = rigidBody;

                    phy.ammoPhysicsWorld.addRigidBody(
                        rigidBody,
                        COLLISION_GROUP_WALL,
                        COLLISION_GROUP_WALL |
                        COLLISION_GROUP_PENDULUM |
                        COLLISION_GROUP_PLANE |
                        COLLISION_GROUP_FAN |
                        COLLISION_GROUP_PORTAL |
                        COLLISION_GROUP_BOX
                    );

                    addMeshToScene(newMesh);
                    phy.rigidBodies.push(newMesh);
                    rigidBody.threeMesh = newMesh;

                    // Remove the old Mesh
                    ri.scene.remove(mesh);
                    
                    // Particles second portal
                    createParticles({x: newMesh.position.x, y: newMesh.position.y + 0.5, z: newMesh.position.z});
                    toggle = true; // not repeatable for each brick

                    // Progressbar
                    const progressBar = document.getElementById("progressbar");
                    if (ri.progressBarCount < 100) {
                        if (ri.progressBarCount > 10) {
                            progressBar.style.width = (ri.progressBarCount + 5.0) + "%";
                            progressBar.innerHTML = progressBar.style.width;
                        }
                        ri.progressBarCount += 5.0;
                    }
                    // Progressbar complete, show text
                    if (ri.progressBarCount === 100) {
                        const text = document.createElement("div");
                        text.id = "progressbar-text";
                        text.className = "progressbar-text";
                        text.innerHTML = "WE ARE READY!";
                        document.body.appendChild(text);
                        ri.progressBarCount += 1.0; // To avoid this if statement to run again
                    }
                }
            }

            addMeshToScene(mesh);
            
            // Ammo
            let boxShape = new Ammo.btBoxShape(new Ammo.btVector3(brickDepth*0.5, brickHeight*0.5, brickLengthCurrent*0.5));
            boxShape.setMargin(0.05);
            let brickRigidBody = createAmmoRigidBody(boxShape, mesh, 0.2, 0.9, {x: pos.x, y:pos.y, z:pos.z + position.z}, brickMassCurrent);
            mesh.userData.physicsBody = brickRigidBody;

            phy.ammoPhysicsWorld.addRigidBody(
                brickRigidBody,
                COLLISION_GROUP_WALL,
                COLLISION_GROUP_WALL |
                COLLISION_GROUP_PENDULUM |
                COLLISION_GROUP_PLANE |
                COLLISION_GROUP_FAN |
                COLLISION_GROUP_PORTAL
            );
            phy.rigidBodies.push(mesh);
            brickRigidBody.threeMesh = mesh;
            brickRigidBody.setActivationState(4); //DISABLE_DEACTIVATION

            if (oddRow && (i == 0 || i == nRow - 2)) {
                pos.z += 0.75 * brickLength;
            } else {
                pos.z += brickLength;
            }
        }
        pos.y += brickHeight;
    }
}