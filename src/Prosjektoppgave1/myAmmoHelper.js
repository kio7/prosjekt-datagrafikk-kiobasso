/*

Domino sound effect: Sound Effect by Leobathro from Pixabay


*/


export const COLLISION_GROUP_PLANE = 1;
export const COLLISION_GROUP_SPHERE = 2;
export const COLLISION_GROUP_CANON = 4;
export const COLLISION_GROUP_RAILS = 8;
export const COLLISION_GROUP_SEESAW = 16;
export const COLLISION_GROUP_DOMINO = 32;
export const COLLISION_GROUP_FUNNEL = 64;
export const COLLISION_GROUP_SEESAWOBJ = 128;
export const COLLISION_GROUP_PENDULUM = 256;
export const COLLISION_GROUP_WALL = 512;
export const COLLISION_GROUP_FAN = 1024;
export const COLLISION_GROUP_PORTAL = 2048;
export const COLLISION_GROUP_BOX = 4096;


export const IMPULSE_FORCE = 20;

export let phy = {
	rigidBodies: [],
	checkCollisions: true,
	transform: undefined
}

export function createAmmoWorld() {
	phy.transform = new Ammo.btTransform(); // Hjelpeobjekt.
	
	// Initialiserer phy.ammoPhysicsWorld:
	let collisionConfiguration = new Ammo.btDefaultCollisionConfiguration(),
		dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration),
		overlappingPairCache = new Ammo.btDbvtBroadphase(),
		solver = new Ammo.btSequentialImpulseConstraintSolver();

	phy.ammoPhysicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
	phy.ammoPhysicsWorld.setGravity(new Ammo.btVector3(0, -9.80665, 0));
}

export function createAmmoRigidBody(shape, threeMesh, restitution=0.7, friction=0.8, position={x:0, y:50, z:0}, mass=1, setLocalScaling=false) {

	let transform = new Ammo.btTransform();
	transform.setIdentity();
	transform.setOrigin(new Ammo.btVector3(position.x, position.y, position.z));

	let quaternion = threeMesh.quaternion;
	transform.setRotation(new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

	if (setLocalScaling) {
		let scale = threeMesh.scale;
		shape.setLocalScaling(new Ammo.btVector3(scale.x, scale.y, scale.z));
	}

	let motionState = new Ammo.btDefaultMotionState(transform);
	let localInertia = new Ammo.btVector3(0, 0, 0);
	shape.calculateLocalInertia(mass, localInertia);

	let rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);
	let rigidBody = new Ammo.btRigidBody(rbInfo);
	rigidBody.setRestitution(restitution);
	rigidBody.setFriction(friction);

	return rigidBody;
}

export function updatePhysics(deltaTime) {
	// Step physics world:
	phy.ammoPhysicsWorld.stepSimulation(deltaTime, 10);

	// Update rigid bodies
	for (let i = 0; i < phy.rigidBodies.length; i++) {
		let mesh = phy.rigidBodies[i];
		let rigidBody = mesh.userData.physicsBody;
		let motionState = rigidBody.getMotionState();
		if (motionState) {
			motionState.getWorldTransform(phy.transform);
			let p = phy.transform.getOrigin();
			let q = phy.transform.getRotation();
			mesh.position.set(p.x(), p.y(), p.z());
			mesh.quaternion.set(q.x(), q.y(), q.z(), q.w());
		}
	}
	// Kollisjonsdeteksjon:
	if (phy.checkCollisions)
		checkCollisions(deltaTime);
}

// Finner alle manifolds, gjennomløper og gjør noe dersom kollison mellom kulene:
function checkCollisions(deltaTime) {
	// Finner alle mulige kollisjonspunkter/kontaktpunkter (broad phase):
	let numManifolds = phy.ammoPhysicsWorld.getDispatcher().getNumManifolds();
	// Gjennomløper alle kontaktpunkter:
	for (let i=0; i < numManifolds;i++) {
		// contactManifold er et btPersistentManifold-objekt:
		let contactManifold =  phy.ammoPhysicsWorld.getDispatcher().getManifoldByIndexInternal(i);
		let numContacts = contactManifold.getNumContacts();
		if (numContacts>0) {
			// Henter objektene som er involvert:
			// getBody0() og getBody1() returnerer et btCollisionObject,
			// gjøres derfor om til btRigidBody-objekter vha. Ammo.castObject():
			let rbObject0 = Ammo.castObject(contactManifold.getBody0(), Ammo.btRigidBody);
			let rbObject1 = Ammo.castObject(contactManifold.getBody1(), Ammo.btRigidBody);
			let threeMesh0 = rbObject0.threeMesh;
			let threeMesh1 = rbObject1.threeMesh;
			
			if (threeMesh0 && threeMesh1) {
				for (let j = 0; j < numContacts; j++) {
					let contactPoint = contactManifold.getContactPoint(j);
					const distance = contactPoint.getDistance();
					if (distance <= 0) {
												
						// DOMINO
						if (
						(threeMesh0.name === 'domino' && threeMesh1.name === 'domino') ||
						(threeMesh1.name === 'domino' && threeMesh0.name === 'domino')
						) {
							if (typeof threeMesh0.collisionResponse === 'function')
								threeMesh0.collisionResponse(threeMesh1);
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}
						// Marble fra rails treffes domino eller rails
						if (
						(threeMesh0.name === 'railMarble' && threeMesh1.name === 'rails') ||
						(threeMesh1.name === 'railMarble' && threeMesh0.name === 'rails')
						) {
							if (typeof threeMesh0.collisionResponse === 'function')
								threeMesh0.collisionResponse(threeMesh1);
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}

						// Marble fra kanon treffer funnel
						if (
						(threeMesh0.name === 'marble' && threeMesh1.name === 'funnel') ||
						(threeMesh1.name === 'marble' && threeMesh0.name === 'funnel')
						) {
							if (typeof threeMesh0.collisionResponse === 'function')
								threeMesh0.collisionResponse(threeMesh1);
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}

						// Marble fra kanon treffer bucket
						if (
						(threeMesh0.name === 'marble' && threeMesh1.name === 'bucket') ||
						(threeMesh1.name === 'marble' && threeMesh0.name === 'bucket')
						) {
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}

						// Marble fra kanon treffer dominos
						if (
						(threeMesh0.name === 'railMarble' && threeMesh1.name === 'domino') ||
						(threeMesh1.name === 'railMarble' && threeMesh0.name === 'domino')
						) {
							if (typeof threeMesh0.collisionResponse === 'function')
								threeMesh0.collisionResponse(threeMesh1);
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}

						// WreckingBall treffer vegg
						if (
						(threeMesh0.name === 'WreckingBall' && threeMesh1.name === 'brick') ||
						(threeMesh1.name === 'WreckingBall' && threeMesh0.name === 'brick')
						) {
							if (typeof threeMesh0.collisionResponse === 'function')
								threeMesh0.collisionResponse(threeMesh1);
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}

						// Brick treffer portal
						if (
						(threeMesh0.name === 'brick' && threeMesh1.name === 'portal') ||
						(threeMesh1.name === 'brick' && threeMesh0.name === 'portal')
						) {

							if (typeof threeMesh0.collisionResponse === 'function')
								threeMesh0.collisionResponse(threeMesh1);
							if (typeof threeMesh1.collisionResponse === 'function')
								threeMesh1.collisionResponse(threeMesh0);
						}
	
					}
				}
			}
		}
	}
}



export function moveRigidBody(movableMesh, direction) {
	let transform = new Ammo.btTransform();
	let motionState = movableMesh.userData.physicsBody.getMotionState();
	motionState.getWorldTransform(transform);
	let position = transform.getOrigin();
	transform.setOrigin(new Ammo.btVector3(position.x() + direction.x, position.y() + direction.y, position.z() + direction.z));
	motionState.setWorldTransform(transform);
}

// export function applyImpulse(rigidBody, force=IMPULSE_FORCE, direction = {x:0, y:1, z:0}) {
// 	if (!rigidBody)
// 		return;
// 	rigidBody.activate(true);
// 	let impulseVector = new Ammo.btVector3(direction.x * force , direction.y * force , direction.z * force );
// 	rigidBody.applyCentralImpulse(impulseVector);
// }

// export function applyForce(rigidBody, force=IMPULSE_FORCE, direction = {x:0, y:1, z:0}) {
// 	if (!rigidBody)
// 		return;
// 	rigidBody.activate(true);
// 	let forceVector = new Ammo.btVector3(direction.x * force , direction.y * force , direction.z * force );
// 	rigidBody.applyCentralForce(forceVector);
// }