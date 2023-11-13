import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";

import {
	COLLISION_GROUP_PLANE, 
	COLLISION_GROUP_SPHERE, 
	COLLISION_GROUP_MOVEABLE, 
	COLLISION_GROUP_BOX, 
	COLLISION_GROUP_SEESAW,
} from "./myAmmoHelper.js"

export let sphereCount = 0;

export function createAmmoMarble(
	radius = 0.2, 
	mass = 1, 
	color=0x00FF00, 
	position={x:-0.4, y:4, z:0},
	roughness=0.5,
	metalness=1.0, 
	name = "default"){

	//THREE
	let mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 232, 232),
		new THREE.MeshStandardMaterial({color: color, roughness, metalness}));
	mesh.name = name;
	mesh.position.set(position.x, position.y, position.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	//AMMO
	let shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
	shape.setMargin( 0.1 );
	let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.0, position, mass);

	mesh.userData.physicsBody = rigidBody;

	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(
		rigidBody,
		COLLISION_GROUP_SPHERE,
		COLLISION_GROUP_SPHERE | 
		COLLISION_GROUP_BOX | 
		COLLISION_GROUP_MOVEABLE | 
		COLLISION_GROUP_PLANE | 
		COLLISION_GROUP_SEESAW);

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh;
	rigidBody.setActivationState(4); //DISABLE_DEACTIVATION

	sphereCount++;
}