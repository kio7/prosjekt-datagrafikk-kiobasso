/*
Modulen lager et xz-plan med en tekstur.
*/

import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";

import {COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_SEESAW, COLLISION_GROUP_DOMINO, COLLISION_GROUP_WALL} from "./myAmmoHelper.js"

export function createAmmoXZPlane(
    width = 10, 
    depth = 10, 
    position = {x: 0, y: 0, z: 0},
    textureObject,
    color = 0x00FF00,
	rotation = {x: 0, y: 0, z: 0},
	friction = 0.7,
    ){
	
    const mass=0;
    position.y -= 0.25; // Slik at plane ligger på y=0

	// Three
	let geometry = new THREE.BoxGeometry(width, 0.5, depth, 1, 1);

	let material = new THREE.MeshPhongMaterial( { 
        color: color,
        map: textureObject, 
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
    } );
	let mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = 1;
	mesh.receiveShadow = true;
	mesh.rotation.x = rotation.x;
	mesh.rotation.y = rotation.y;
	mesh.rotation.z = rotation.z;
	mesh.name = 'xzplane';

	// Ammo
	let shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, 0.25, depth/2));
	shape.setMargin( 0.0 );
	let rigidBody = createAmmoRigidBody(shape, mesh, 0.2, friction, position, mass);
	mesh.userData.physicsBody = rigidBody;

	phy.ammoPhysicsWorld.addRigidBody(
		rigidBody,
		COLLISION_GROUP_PLANE,
		COLLISION_GROUP_SPHERE | COLLISION_GROUP_SEESAW | COLLISION_GROUP_DOMINO | COLLISION_GROUP_WALL);

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh; // Brukes til collision events
}