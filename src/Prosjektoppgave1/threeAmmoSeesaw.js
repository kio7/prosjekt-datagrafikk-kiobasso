import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";

import {
    COLLISION_GROUP_SEESAW, 
    COLLISION_GROUP_SEESAWOBJ,
    COLLISION_GROUP_PLANE, 
    COLLISION_GROUP_SPHERE,
    COLLISION_GROUP_RAILS
} from "./myAmmoHelper.js";


export function createAmmoSeeSaw ( 
    sessawHeight = 4, 
    position = {x:0, y:0, z:0},
    plankColor,
    standColor
    ) {
    const rigidBodyPlank = createPlank(sessawHeight, position, plankColor);
    const rigidBodyAnchor = createAnchor(sessawHeight, position, standColor);

    const anchorPivot = new Ammo.btVector3(0, 0.5 * sessawHeight, 0);
    const anchorAxis = new Ammo.btVector3(0, 0, 1);
    const plankPivot = new Ammo.btVector3(0, 0, 0);
    const plankAxis = new Ammo.btVector3(0, 0, 1);

    const hingeConstraint = new Ammo.btHingeConstraint(
        rigidBodyAnchor,
        rigidBodyPlank,
        anchorPivot,
        plankPivot,
        anchorAxis,
        plankAxis,
        false
    );

    const lowerLimit = -Math.PI/12;
    const upperLimit = Math.PI/12;
    const softness = 0.9;
    const biasFactor = 0.3;
    const relaxationFactor = 1.0;
    hingeConstraint.setLimit( lowerLimit, upperLimit, softness, biasFactor, relaxationFactor);
    hingeConstraint.enableAngularMotor(true, 0, 0.5);

    phy.ammoPhysicsWorld.addConstraint(hingeConstraint, false)
}

function createPlank(sessawHeight, position, color) {
    const mass = 10;
    const width=10, height=0.2, depth=1;
    const plankPosition = {x:position.x, y: position.y + sessawHeight, z: position.z};
    //THREE
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth, 1, 1),
        new THREE.MeshStandardMaterial({color: color}));

    mesh.name = 'plank'
    // mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // AMMO
    const mesh_width = mesh.geometry.parameters.width;
	const mesh_height = mesh.geometry.parameters.height;
	const mesh_depth = mesh.geometry.parameters.depth;

	const shape = new Ammo.btBoxShape( new Ammo.btVector3( mesh_width/2, mesh_height/2, mesh_depth/2) );
	shape.setMargin( 0.05 );
	const rigidBody = createAmmoRigidBody(shape, mesh, 0.3, 1.8, plankPosition, mass);
	rigidBody.setDamping(0.1, 0.5);
	rigidBody.setActivationState(4);
	mesh.userData.physicsBody = rigidBody;

    // Legg til i physics world
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,        
        COLLISION_GROUP_SEESAW, 
        COLLISION_GROUP_RAILS | 
        COLLISION_GROUP_SEESAWOBJ |
        COLLISION_GROUP_SPHERE
        );

    addMeshToScene(mesh);
    phy.rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;

    return rigidBody;
    
};

function createAnchor(sessawHeight, position, color) {
    const radius = 0.2;
    const anchorPosition = {x: position.x, y:position.y + (0.5 * sessawHeight), z: position.z};
    const mass = 0

    // THREE
    const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, 1 * sessawHeight, 32, 32),
        new THREE.MeshStandardMaterial({color: color})
    );
    mesh.name = 'anchor';
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    // AMMO
    const shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, 0.15, radius));
    shape.setMargin(0.05);
    const rigidBody = createAmmoRigidBody(shape, mesh, 0.3, 0.0, anchorPosition, mass);
    mesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_SEESAW,
        COLLISION_GROUP_SEESAW | 
        COLLISION_GROUP_SEESAWOBJ |
        COLLISION_GROUP_PLANE | 
        COLLISION_GROUP_SPHERE 
    );

    addMeshToScene(mesh);
    phy.rigidBodies.push(mesh);
    rigidBody.threeMesh = mesh;

    return rigidBody
};
