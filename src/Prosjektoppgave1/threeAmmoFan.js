import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";

import {
    COLLISION_GROUP_FAN,
    COLLISION_GROUP_WALL
} from "./myAmmoHelper.js";

import { ri } from "./script.js";


export function createAmmoFan(
    position,
    rotation,
    scale,
    textureObject,
    loadingManager
) {
    let geometry = new THREE.BoxGeometry(1, 1, 1);
    
    let material = new THREE.MeshPhongMaterial({ 
        map: textureObject,
        color:0xffffff,
        transparent: true,
        depthWrite: true,
    });

    let fanMesh = new THREE.Mesh(geometry, material);

    fanMesh.position.set(position.x, position.y, position.z);
    fanMesh.rotation.set(rotation.x, rotation.y, rotation.z);
    fanMesh.scale.set(scale.x, scale.y, scale.z);
    fanMesh.name = "fan"
    fanMesh.visible = false;

    let shape = new Ammo.btBoxShape(new Ammo.btVector3(0.5, 0.5, 0.5));
    let rigidBody = createAmmoRigidBody(shape, fanMesh, 0, 0, position, 0);
    fanMesh.userData.physicsBody = rigidBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rigidBody,
        COLLISION_GROUP_FAN,
        COLLISION_GROUP_WALL
    );

    addMeshToScene(fanMesh);
    phy.rigidBodies.push(fanMesh);
    rigidBody.threeMesh = fanMesh;



    // Fan stuff...


    let  mesh = null;
	let  mtlLoader = new MTLLoader();
	let  modelName = 'fan';  //gubbe, male, ant1, ftorso

	//Laster først materiale:
	mtlLoader.load('./models/fan/' + modelName + '.mtl', function (materials) {
		materials.preload();
		let  objLoader = new OBJLoader();
		objLoader.setMaterials(materials);

		//...deretter geometrien:
		objLoader.load(
			'./models/fan/' + modelName + '.obj',
			 (object) => {
				mesh = object;
				mesh.position.set(position.x, position.y, position.z);
                mesh.rotation.set(rotation.x, rotation.y, rotation.z);
				mesh.scale.set(scale.x, scale.y, scale.z);
				addMeshToScene(mesh);
			}
		);
	});

}


export function moveBricks() {
    ri.scene.children.forEach((object) => {
        if (object.name == "brick") {
            let brickPosition = object.userData.physicsBody.getWorldTransform().getOrigin();
            // console.log(brickPosition.y());
            if (brickPosition.y() < -2 && brickPosition.y() > -10 && brickPosition.x() < 25) {
                let force = new Ammo.btVector3(0.05, 0, 0);
                object.userData.physicsBody.applyCentralImpulse(force);
            }
        }
    });
}