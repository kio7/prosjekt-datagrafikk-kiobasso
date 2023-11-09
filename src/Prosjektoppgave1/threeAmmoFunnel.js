import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {COLLISION_GROUP_SEESAW as COLLISION_GROUP_SEESAW, COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_MOVEABLE} from "./myAmmoHelper.js";
import {addToCompound} from "./triangleMeshHelpers.js";

export function createAmmoFunnel(mass=0, color=0x0000FF, position={x:7, y:7, z:0}) {
    const segments = 175;
    const funnelHeight = 4;

    let funnelGroup = new THREE.Group();
    funnelGroup.position.set(position.x, position.y, position.z)
    let radius = funnelHeight / 2;
    let material = new THREE.MeshStandardMaterial({color: color});
    let compoundShape = new Ammo.btCompoundShape();

    // Sides
    for (let i = 0; i < segments; i++) {
        let angle = (i / segments) * Math.PI * 2;
        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;
        // THREE
        let sideMesh = new THREE.Mesh(new THREE.BoxGeometry(radius/15, funnelHeight, radius/20, 1, 1), material);
        sideMesh.rotateY(Math.PI/2 - angle);
        sideMesh.rotateX(Math.PI/3.5);
        sideMesh.position.set(x, position.y / 5.5, z);
        sideMesh.castShadow = true;
        sideMesh.receiveShadow = true;

        // AMMO
        let width = sideMesh.geometry.parameters.width;
        let height = sideMesh.geometry.parameters.height;
        let depth = sideMesh.geometry.parameters.depth;

        funnelGroup.add(sideMesh);
        let sideShape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2, height / 2, depth / 2));
        addToCompound(compoundShape, sideMesh, sideShape);
    }

    // Group
    let rightBody = createAmmoRigidBody(compoundShape, funnelGroup, 0.7, 0.8, position, mass);
    funnelGroup.userData.physicsBody = rightBody;
    phy.ammoPhysicsWorld.addRigidBody(
        rightBody,
        COLLISION_GROUP_SEESAW,
        COLLISION_GROUP_SEESAW | COLLISION_GROUP_SPHERE | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
    );
    addMeshToScene(funnelGroup);
    rightBody.threeMesh = funnelGroup;
}