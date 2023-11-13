import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";

import {COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_BOX, COLLISION_GROUP_SEESAW} from "./myAmmoHelper.js"

export let sphereCount = 0;

export function createAmmoXZPlane(width = 10, depth = 10, position = {x: 0, y: 0, z: 0}) {
	const mass=0;
    position.y -= 0.25;
    
	// THREE:
	// let geometry = new THREE.PlaneGeometry( width, depth, 1, 1 );
	// geometry.rotateX( Math.PI / 2 );
	let geometry = new THREE.BoxGeometry(width, 0.5, depth, 1, 1 );

	let material = new THREE.MeshStandardMaterial( { color: 0xA8A8F8, side: THREE.DoubleSide } );
	let mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;
	mesh.name = 'xzplane';

	// AMMO:
	let shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, 0.25, depth/2));
	shape.setMargin( 0.0 );
	let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);

	mesh.userData.physicsBody = rigidBody;

	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(
		rigidBody,
		COLLISION_GROUP_PLANE,
		COLLISION_GROUP_SPHERE | COLLISION_GROUP_BOX | COLLISION_GROUP_SEESAW);

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh; //Brukes til collision events:
}