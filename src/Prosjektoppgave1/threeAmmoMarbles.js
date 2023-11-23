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

export let sphereCount = 0;

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
		new THREE.MeshStandardMaterial({color: color, roughness, metalness}));

	mesh.name = name;
	mesh.position.set(position.x, position.y, position.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	// Kollisjonsfunksjon:	
	let funnel = 0;
	let bucket = 0;
	mesh.collisionResponse = (mesh1) => {
		if ((position.z < mesh.position.z - 0.5) && (mesh1.name === "rails")) {
			// console.log(position.z, mesh.position.z, )
			playAudioOnce('./sounds/marble-rolling.mp3', 0.5, 0.8);
		}
		
		if (mesh1.name === 'funnel' && funnel === 0) {
			playAudioOnce('./sounds/larger-wine-glass.mp3', 0.5, 1);
			createCameraTimeline(cc.funnel)
			funnel = 1;
		}
		
		if (mesh1.name === 'funnel') {
			playAudioOnce('./sounds/marble-rolling.mp3', 0.5, 1);
		}

		if (mesh1.name === 'bucket' && bucket === 0) {
			// console.log("Bucket - CR");
			playAudioOnce('./sounds/metal-moving.mp3', 0.5, 1);
			bucket = 1;
			createCameraTimeline(cc.bucket)
		}
		
		if (mesh1.name === 'domino') {
			createCameraTimeline(cc.dominos)
		}
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

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh;
	rigidBody.setActivationState(4); //DISABLE_DEACTIVATION

	sphereCount++;
}