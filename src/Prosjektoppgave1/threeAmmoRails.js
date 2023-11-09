import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {createTriangleShapeAddToCompound} from "./triangleMeshHelpers.js";

import {COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_MOVEABLE, COLLISION_GROUP_BOX} from "./myAmmoHelper.js"

class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {super(); this.scale = scale;}
    
	getPoint( t, optionalTarget = new THREE.Vector3() ) {
		const tx = t * 12 - 1.5;
		const ty = (Math.sin( 2 * Math.PI * t )) * Math.cos( 2 * Math.PI * t );
		const tz = 0;
		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
	}
}

export function createRails() {
    const mass = 0;
    const position = {x:-15, y:0.5, z:0};

    // AMMO-container
    let compoundShape = new Ammo.btCompoundShape();
    // THREE-container
    let railGroupMesh = new THREE.Group();
    railGroupMesh.position.set(position.x, position.y, position.z);

    createRailMesh(railGroupMesh, compoundShape)

    let rigidRailBody = createAmmoRigidBody(compoundShape, railGroupMesh, 0.4, 0.0, position, mass);
    railGroupMesh.userData.physicsBody = rigidRailBody;
    
    // Legger til  i physics world:
    phy.ammoPhysicsWorld.addRigidBody(
        rigidRailBody,
        COLLISION_GROUP_BOX,
        COLLISION_GROUP_BOX | COLLISION_GROUP_SPHERE | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
    );
    addMeshToScene(railGroupMesh);
    phy.rigidBodies.push(railGroupMesh);
    rigidRailBody.threeMesh = railGroupMesh;

}


export function createRailMesh(railGroupMesh, compoundShape) {
    const radius = 0.04;
    const tilt = 0.09;
    const tubularSegments = 160
    const radialSegments = 100;
    const railOffset = 0.4;
    const color = 0xF00FE0;

        // THREE - Rail 1
        const railOnePath = new CustomSinCurve(2);
        const geometry = new THREE.TubeGeometry( railOnePath, tubularSegments, radius, radialSegments, false );
        const material = new THREE.MeshStandardMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
        const railOneMesh = new THREE.Mesh( geometry, material );
        railOneMesh.castShadow = true;
        railOneMesh.receiveShadow = true;
        
        railOneMesh.rotateX(Math.PI/2);
        railOneMesh.rotateY(Math.PI * tilt);
        railOneMesh.position.set(0.2, 0, railOffset);
        
        railGroupMesh.add(railOneMesh);

        // AMMO - Rail 1        
        createTriangleShapeAddToCompound(compoundShape, railOneMesh);

        // THREE - Rail 2
        const railTwoPath = new CustomSinCurve(2);
        const geometry2 = new THREE.TubeGeometry( railTwoPath, tubularSegments, radius, radialSegments, false );
        const material2 = new THREE.MeshStandardMaterial( { color: 0x00ff00, side: THREE.DoubleSide } );
        const railTwoMesh = new THREE.Mesh( geometry2, material2 );
        railTwoMesh.castShadow = true;
        railTwoMesh.receiveShadow = true;

        railTwoMesh.rotateX(Math.PI/2);
        railTwoMesh.rotateY(Math.PI * tilt);
        railTwoMesh.position.set(0.2, 0, -railOffset);

        railGroupMesh.add(railTwoMesh);

        // AMMO - Rail 2
        createTriangleShapeAddToCompound(compoundShape, railTwoMesh);
    }