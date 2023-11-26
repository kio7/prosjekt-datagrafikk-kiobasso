/*
Modul som lager klinkekulene som ruller gjennom banen.
*/

import * as THREE from "three";
import {addMeshToScene, playAudioOnce} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import { createCameraTimeline } from "./myThreeHelper";
import { cameraCoordinates as cc } from "./cameraCoord";
import {
	COLLISION_GROUP_PLANE, 
	COLLISION_GROUP_SPHERE, 
	COLLISION_GROUP_RAILS, 
	COLLISION_GROUP_SEESAW,
	COLLISION_GROUP_SEESAWOBJ,
	COLLISION_GROUP_DOMINO,
	COLLISION_GROUP_FUNNEL,
	COLLISION_GROUP_CANON
} from "./myAmmoHelper.js"


export function createAmmoMarble(
	radius = 0.2, 
	mass = 1, 
	color=0x00FF00, 
	position={x:-0.4, y:4, z:0},
	roughness=0.5,
	metalness=1.0, 
	name = "default"
	){

	//THREE
	let mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 32, 32),
		new THREE.MeshStandardMaterial({color: color, roughness, metalness})
	);

	mesh.name = name;
	mesh.position.set(position.x, position.y, position.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	// Kollisjonsfunksjon:	
	let funnel = 0;
	let bucket = 0;
	mesh.collisionResponse = (mesh1) => {
		// Kule kolliderer med rails:
		if ((position.z < mesh.position.z - 0.5) && (mesh1.name === "rails")) {
			playAudioOnce('./sounds/marble-rolling.mp3', 0.5, 0.8)};
		
		// Kule treffer funnel:
		if (mesh1.name === 'funnel' && funnel === 0) {
			playAudioOnce('./sounds/larger-wine-glass.mp3', 0.5, 1);
			createCameraTimeline(cc.funnel)
			funnel = 1};
		
		// Kule ruller rundt i funnel:
		if (mesh1.name === 'funnel') {
			playAudioOnce('./sounds/marble-rolling.mp3', 0.5, 1)};

		// Kule treffer bucket:
		if (mesh1.name === 'bucket' && bucket === 0) {
			playAudioOnce('./sounds/metal-moving.mp3', 0.5, 1);
			bucket = 1;
			// Setter igang kameraanimasjon:
			createCameraTimeline(cc.bucket)};
		
		// Setter igang kameraanimasjon når kula treffer domino:
		if (mesh1.name === 'domino') {createCameraTimeline(cc.dominos)};
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
		COLLISION_GROUP_RAILS | 
		COLLISION_GROUP_PLANE | 
		COLLISION_GROUP_SEESAW |
		COLLISION_GROUP_DOMINO |
		COLLISION_GROUP_FUNNEL |
		COLLISION_GROUP_CANON |
		COLLISION_GROUP_SEESAWOBJ	
	);

	// Legger til i scene:
	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh;
	// Sørger for at kula ikke "sovner" og reagerer på brukerinput (f.eks. skyting):
	rigidBody.setActivationState(4); //DISABLE_DEACTIVATION
}