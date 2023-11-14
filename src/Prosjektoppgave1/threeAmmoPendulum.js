import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";

import {
    COLLISION_GROUP_PLANE, 
    COLLISION_GROUP_SPHERE, 
    COLLISION_GROUP_SEESAW, 
    COLLISION_GROUP_PENDULUM,
    COLLISION_GROUP_DOMINO
} from "./myAmmoHelper.js"

export function createAmmoPendulum (
    mass = 1,
    color = 0xFF0000,
    position = {x:0, y:0, z:0}
) {
    // Box
    //THREE
    let boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({color: color}));
    boxMesh.castShadow = true;
    boxMesh.receiveShadow = true;

    //AMMO
    let boxShape = new Ammo.btBoxShape(new Ammo.btVector3(boxMesh.geometry.parameters.width/2, boxMesh.geometry.parameters.height/2, boxMesh.geometry.parameters.depth/2));
    boxShape.setMargin(0.1);
    let boxRigidBody = createAmmoRigidBody(boxShape, boxMesh, 0.7, 0.0, position, 0);
    boxMesh.userData.physicsBody = boxRigidBody;

    phy.ammoPhysicsWorld.addRigidBody(
        boxRigidBody,
        COLLISION_GROUP_PENDULUM,
        COLLISION_GROUP_SPHERE | 
        COLLISION_GROUP_PLANE
    );

    addMeshToScene(boxMesh);
    boxRigidBody.threeMesh = boxMesh;
    
    
    // Ball
    const ballPosition = {x: position.x -12, y: position.y - 12.9, z: position.z}
    //THREE
    let ballMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({color: color}));
    ballMesh.castShadow = true;
    ballMesh.receiveShadow = true;
    
    //AMMO
    let ballShape = new Ammo.btSphereShape(ballMesh.geometry.parameters.radius);
    ballShape.setMargin(0.1);
    let ballRigidBody = createAmmoRigidBody(ballShape, ballMesh, 0.7, 0.0, ballPosition, mass);
    ballMesh.userData.physicsBody = ballRigidBody;
    
    phy.ammoPhysicsWorld.addRigidBody(
        ballRigidBody,
        COLLISION_GROUP_SPHERE,
        COLLISION_GROUP_SPHERE | 
        COLLISION_GROUP_PLANE | 
        COLLISION_GROUP_DOMINO
    );
        
    addMeshToScene(ballMesh);
    ballRigidBody.threeMesh = ballMesh;
    ballRigidBody.setActivationState(4); //DISABLE_DEACTIVATION


    // Spring
    const transform1 = new Ammo.btTransform();
    transform1.setIdentity();
    transform1.setOrigin(new Ammo.btVector3(0, -8, 0));
    const transform2 = new Ammo.btTransform();
    transform2.setIdentity();
    transform2.setOrigin(new Ammo.btVector3(0, 0, 0));

    const springConstraint = new Ammo.btGeneric6DofSpringConstraint(
        boxRigidBody,
        ballRigidBody,
        transform1,
        transform2,
        true
    );

    // Removing any restrictions on the y-coordinate of the hanging ball
    // by setting the lower limit above the upper one.
    springConstraint.setLinearLowerLimit(new Ammo.btVector3(0, 0, 0));
    springConstraint.setLinearUpperLimit(new Ammo.btVector3(-1, -1, 0));

    springConstraint.setAngularLowerLimit(new Ammo.btVector3(0, 0, 0));
    springConstraint.setAngularUpperLimit(new Ammo.btVector3(0, 0, 0));

    springConstraint.enableSpring(0, true);
    springConstraint.enableSpring(1, true);
    springConstraint.enableSpring(2, false);

    springConstraint.setStiffness(0, 2);
    springConstraint.setStiffness(1, 10);
    springConstraint.setStiffness(2, 0);

    springConstraint.setDamping(0, 0.9);
    springConstraint.setDamping(1, 0.9);
    springConstraint.setDamping(2, 0.9);

    phy.rigidBodies.push(boxMesh);
    phy.rigidBodies.push(ballMesh);
    phy.ammoPhysicsWorld.addConstraint(springConstraint, true);
}