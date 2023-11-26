/*
modulen lager en traktlignende figur som kan fange opp klossene som faller over ende.
*/

import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';
import { addToCompound } from './triangleMeshHelpers';
import { createAmmoRigidBody, phy } from './myAmmoHelper';
import { 
    COLLISION_GROUP_WALL,
    COLLISION_GROUP_PLANE,
} from './myAmmoHelper';


export function createFunnelBox(
        width = 10,
        depth = 10,
        textureObject,
        color = 0x96f1ff,
        position = {x:0, y:0, z:0}) {
    
    const mass = 0;

    let funnelBoxGroupMesh = new THREE.Group();
    funnelBoxGroupMesh.name = 'funnelBoxGroup';
    let compoundShape = new Ammo.btCompoundShape();
    
    // THREE:
    let material = new THREE.MeshPhongMaterial( {
        color: color,
        map: textureObject,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        opacity: 0.5,
    });

    // Store flater som lager V-formen på starten av trakten
    let Left1Geometry = new THREE.BoxGeometry(width*1.2, 0.5, depth*1.5, 1, 1);
    let Left1Mesh = new THREE.Mesh(Left1Geometry, material);
    Left1Mesh.renderOrder = 1;
    Left1Mesh.receiveShadow = true;
    Left1Mesh.position.x = -3;
    Left1Mesh.position.z = -5.5;
    Left1Mesh.rotation.y = Math.PI/2;
    Left1Mesh.rotation.z = Math.PI/7;

    funnelBoxGroupMesh.add(Left1Mesh);
    let shape = new Ammo.btBoxShape(new Ammo.btVector3(width*0.6, 0.5, depth*0.75));
    addToCompound(compoundShape, Left1Mesh, shape);

    let Right1Geometry = new THREE.BoxGeometry(width*1.2, 0.5, depth*1.5, 1, 1);
    let Right1Mesh = new THREE.Mesh(Right1Geometry, material);
    Right1Mesh.renderOrder = 1;
    Right1Mesh.receiveShadow = true;
    Right1Mesh.position.x = -3;
    Right1Mesh.position.z = 5.5;
    Right1Mesh.rotation.y = Math.PI/2;
    Right1Mesh.rotation.z = -Math.PI/7;

    funnelBoxGroupMesh.add(Right1Mesh);
    shape = new Ammo.btBoxShape(new Ammo.btVector3(width*0.6, 0.5, depth*0.75));
    addToCompound(compoundShape, Right1Mesh, shape);

    // Flatene som ligger nært veggen som også lager hullet i trakten
    let Left2Geometry = new THREE.BoxGeometry(width*1.05, 0.5, depth*0.25, 1, 1);
    let Left2Mesh = new THREE.Mesh(Left2Geometry, material);
    Left2Mesh.renderOrder = 1;
    Left2Mesh.receiveShadow = true;
    Left2Mesh.position.x = 5.75;
    Left2Mesh.position.y = 0.32;
    Left2Mesh.position.z = -6.17;
    Left2Mesh.rotation.y = Math.PI/2;
    Left2Mesh.rotation.z = Math.PI/7;

    funnelBoxGroupMesh.add(Left2Mesh);
    shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2*1.05, 0.5, depth*0.125));
    addToCompound(compoundShape, Left2Mesh, shape);

    let Right2Geometry = new THREE.BoxGeometry(width*1.05, 0.5, depth*0.25, 1, 1);
    let Right2Mesh = new THREE.Mesh(Right2Geometry, material);
    Right2Mesh.renderOrder = 1;
    Right2Mesh.receiveShadow = true;
    Right2Mesh.position.x = 5.75;
    Right2Mesh.position.y = 0.32;
    Right2Mesh.position.z = 6.17;
    Right2Mesh.rotation.y = Math.PI/2;
    Right2Mesh.rotation.z = -Math.PI/7;

    funnelBoxGroupMesh.add(Right2Mesh);
    shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2*1.05, 0.5, depth*0.125));
    addToCompound(compoundShape, Right2Mesh, shape);

    // Veggen.
    let BackGeometry = new THREE.BoxGeometry(width*0.7, 0.5, depth*2.3, 1, 1);
    let BackMesh = new THREE.Mesh(BackGeometry, material);
    BackMesh.renderOrder = 1;
    BackMesh.receiveShadow = true;
    BackMesh.castShadow = true;
    BackMesh.position.x = 7.25;
    BackMesh.rotation.z = Math.PI/2;

    funnelBoxGroupMesh.add(BackMesh);
    shape = new Ammo.btBoxShape(new Ammo.btVector3(width*0.35, 0.5, depth*1.15));
    addToCompound(compoundShape, BackMesh, shape);
    

    // AMMO:
    let rigidBody = createAmmoRigidBody(compoundShape, funnelBoxGroupMesh, 0.2, 0.1, position, mass);
    funnelBoxGroupMesh.userData.physicsBody = rigidBody;

    // Legger til i physics world:
    phy.ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_PLANE,
            COLLISION_GROUP_WALL
    );

    // Legger til i scenen:
    addMeshToScene(funnelBoxGroupMesh)
    phy.rigidBodies.push(funnelBoxGroupMesh);
    rigidBody.threeMesh = funnelBoxGroupMesh;
}