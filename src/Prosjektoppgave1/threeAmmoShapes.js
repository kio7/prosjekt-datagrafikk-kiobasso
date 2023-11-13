import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {XZPLANE_SIDELENGTH} from "./script.js";

import {COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_BOX, COLLISION_GROUP_SEESAW} from "./myAmmoHelper.js"

export let sphereCount = 0;

export function createAmmoXZPlane(width = 10, depth = 10, position = {x: 0, y: 0, z: 0}) {
	const mass=0;
	// const position = {x: 0, y: 0, z: 0};

	// THREE:
	let geometry = new THREE.PlaneGeometry( width, depth, 1, 1 );
	geometry.rotateX( -Math.PI / 2 );
	let material = new THREE.MeshStandardMaterial( { color: 0xA8A8F8, side: THREE.DoubleSide } );
	let mesh = new THREE.Mesh(geometry, material);
	mesh.receiveShadow = true;
	mesh.name = 'xzplane';

	// AMMO:
	let shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, 0, depth/2));
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

export function createAmmoSphere(mass = 10, color=0x00FF00, position={x:0, y:50, z:0}) {
	const radius = 0.2*mass;

	//THREE
	let mesh = new THREE.Mesh(
		new THREE.SphereGeometry(radius, 32, 32),
		new THREE.MeshStandardMaterial({color: color}));
	mesh.name = 'sphere';
	mesh.position.set(position.x, position.y, position.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;
	mesh.collisionResponse = (mesh1) => {
		mesh1.material.color.setHex(Math.random() * 0xffffff);
	};
	//AMMO
	let shape = new Ammo.btSphereShape(mesh.geometry.parameters.radius);
	shape.setMargin( 0.05 );
	let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.5, position, mass);

	mesh.userData.physicsBody = rigidBody;

	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(
		rigidBody,
		COLLISION_GROUP_SPHERE,
		COLLISION_GROUP_SPHERE | COLLISION_GROUP_BOX | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE );

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh;

	sphereCount++;
}

export function createAmmoCube(mass = 17, color=0xF00FE0, position={x:20, y:50, z:30}) {
	const sideLength = 0.2*mass;

	//THREE
	let mesh = new THREE.Mesh(
		new THREE.BoxGeometry(sideLength,sideLength,sideLength, 1, 1),
		new THREE.MeshStandardMaterial({color: color}));
	mesh.name = 'cube';
	mesh.position.set(position.x, position.y, position.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	//AMMO
	let width = mesh.geometry.parameters.width;
	let height = mesh.geometry.parameters.height;
	let depth = mesh.geometry.parameters.depth;

	let shape = new Ammo.btBoxShape( new Ammo.btVector3( width/2, height/2, depth/2) );
	shape.setMargin( 0.05 );
	let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);

	mesh.userData.physicsBody = rigidBody;

	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(
		rigidBody,
		COLLISION_GROUP_BOX,
		COLLISION_GROUP_BOX | COLLISION_GROUP_SPHERE | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
	);

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh;
}

export function createMovable(color=0x00A6E5, position={x:-10, y:0, z:-30}) {
	const sideLength = 5;
	const mass = 0; //Merk!

	//THREE
	let mesh = new THREE.Mesh(
		new THREE.BoxGeometry(sideLength,sideLength,sideLength, 1, 1),
		new THREE.MeshStandardMaterial({color: color}));
	mesh.name = 'movable';
	position.y = position.y + mesh.scale.y*sideLength/2;
	mesh.position.set(position.x, position.y, position.z);
	mesh.castShadow = true;
	mesh.receiveShadow = true;

	//AMMO
	let width = mesh.geometry.parameters.width;
	let height = mesh.geometry.parameters.height;
	let depth = mesh.geometry.parameters.depth;


	let shape = new Ammo.btBoxShape( new Ammo.btVector3( width/2, height/2, depth/2) );
	let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.8, position, mass);
	// Følgende er avgjørende for å kunne flytte på objektet:
	// 2 = BODYFLAG_KINEMATIC_OBJECT: Betyr kinematic object, masse=0 men kan flyttes!
	rigidBody.setCollisionFlags(rigidBody.getCollisionFlags() | 2);
	// 4 = BODYSTATE_DISABLE_DEACTIVATION, dvs. "Never sleep".
	rigidBody.setActivationState(4);
	mesh.userData.physicsBody = rigidBody;

	// Legger til physics world:
	phy.ammoPhysicsWorld.addRigidBody(
		rigidBody,
		COLLISION_GROUP_MOVEABLE, 
		COLLISION_GROUP_SPHERE | COLLISION_GROUP_PLANE | COLLISION_GROUP_BOX
	);

	addMeshToScene(mesh);
	phy.rigidBodies.push(mesh);
	rigidBody.threeMesh = mesh;
}

export function createAmmoSpheres(noSpheres) {
	for (let i=0; i<noSpheres; i++) {
		let height = 40 + Math.random() * 30;
		createRandomSpheres(height);
	}
}

export function createRandomSpheres(height=50) {
	const xPos = -(XZPLANE_SIDELENGTH/2) + Math.random() * XZPLANE_SIDELENGTH;
	const zPos = -(XZPLANE_SIDELENGTH/2) + Math.random() * XZPLANE_SIDELENGTH;
	const pos = {x: xPos, y: height, z: zPos};
	const mass = 5 + Math.random() * 20;

	createAmmoSphere(mass, 0x00FF00, {x:xPos, y:50, z:zPos});
}
