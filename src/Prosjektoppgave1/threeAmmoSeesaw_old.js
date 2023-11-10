import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";
import {createAmmoRigidBody, phy} from "./myAmmoHelper.js";
import {addToCompound} from "./triangleMeshHelpers.js";
import {COLLISION_GROUP_SEESAW, COLLISION_GROUP_BOX, COLLISION_GROUP_PLANE, COLLISION_GROUP_SPHERE, COLLISION_GROUP_MOVEABLE} from "./myAmmoHelper.js";


export function createAmmoSeesaw(mass = 20, position={x:0, y:0, z:0}, rotation=0) {
    const scale = 1.0;
    
    const seesawBaseMesh = new THREE.Group();
    const seesawPlankMesh = new THREE.Group();
    seesawBaseMesh.position.set(position.x, position.y, position.z);
    seesawBaseMesh.rotateY(rotation);

    seesawPlankMesh.position.set(position.x, position.y, position.z);
    seesawPlankMesh.rotateY(rotation);

    let baseCompoundShape = new Ammo.btCompoundShape();
    let seesawCompoundShape = new Ammo.btCompoundShape();
    
    // Create Mesh
    createBaseMesh(seesawBaseMesh, scale, baseCompoundShape)
    createPlankMesh(seesawPlankMesh, scale, seesawCompoundShape)

    // Base
    let baseRigidBody = createAmmoRigidBody(baseCompoundShape, seesawBaseMesh, 0.7, 0.8, position, 0);
    seesawBaseMesh.userData.physicsBody = baseRigidBody;
    baseRigidBody.threeMesh = seesawBaseMesh;

    phy.ammoPhysicsWorld.addRigidBody(
        baseRigidBody,
        COLLISION_GROUP_SEESAW,
        COLLISION_GROUP_SEESAW | COLLISION_GROUP_BOX | COLLISION_GROUP_SPHERE | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
    );
    addMeshToScene(seesawBaseMesh);
    phy.rigidBodies.push(seesawBaseMesh);


    // Plank
    let plankRigidBody = createAmmoRigidBody(seesawCompoundShape, seesawPlankMesh, 0.7, 0.8, position, mass);
    seesawPlankMesh.userData.physicsBody = plankRigidBody;
    plankRigidBody.threeMesh = seesawPlankMesh;

    phy.ammoPhysicsWorld.addRigidBody(
        plankRigidBody,
        COLLISION_GROUP_SEESAW,
        COLLISION_GROUP_SEESAW | COLLISION_GROUP_BOX | COLLISION_GROUP_SPHERE | COLLISION_GROUP_MOVEABLE | COLLISION_GROUP_PLANE
    );
    addMeshToScene(seesawPlankMesh);
    phy.rigidBodies.push(seesawPlankMesh);


    // Constraint
    // Constants for pivot points
    let height = scale*2.5;
    let depth = scale*0.8;

    // Pivot point 1
    let pivotPoint1 = new Ammo.btVector3(0, height, depth);
    let p2pConstraint1 = new Ammo.btPoint2PointConstraint(plankRigidBody, baseRigidBody, pivotPoint1, pivotPoint1);
    phy.ammoPhysicsWorld.addConstraint(p2pConstraint1, true);

    // Pivot point 2
    let pivotPoint2 = new Ammo.btVector3(0, height, -depth);
    let p2pConstraint2 = new Ammo.btPoint2PointConstraint(plankRigidBody, baseRigidBody, pivotPoint2, pivotPoint2);
    phy.ammoPhysicsWorld.addConstraint(p2pConstraint2, true);
}


function createBaseMesh(seesawGroupMesh, scale, baseCompoundShape) {
    const seesawColor = 0x5FD85F;

    const sideLength = scale;
    const basePos = {x: 0, y: sideLength, z: 0};

    // Base box
    // THREE
    let lowerBoxMesh = new THREE.Mesh(
    	new THREE.BoxGeometry(sideLength, sideLength*2, sideLength, 1, 1),
    	new THREE.MeshStandardMaterial({color: seesawColor})
    );
    lowerBoxMesh.position.set(basePos.x, basePos.y, basePos.z);
    lowerBoxMesh.receiveShadow = true;
    lowerBoxMesh.castShadow = true;
    seesawGroupMesh.add(lowerBoxMesh);
    
    let width = lowerBoxMesh.geometry.parameters.width;
    let height = lowerBoxMesh.geometry.parameters.height;
    let depth = lowerBoxMesh.geometry.parameters.depth;

    let lowerBoxShape = new Ammo.btBoxShape( new Ammo.btVector3(width/2, height/2, depth/2) );
    
    addToCompound(baseCompoundShape, lowerBoxMesh, lowerBoxShape);
    
    // sideBox 1
    // Three
    let sideBoxMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength, sideLength/2, sideLength/10, 1, 1),
        new THREE.MeshStandardMaterial({color: seesawColor})
    );
    sideBoxMesh.position.set(0, sideLength*1.25, sideLength/2 - sideLength/20);
    sideBoxMesh.castShadow = true;
    sideBoxMesh.receiveShadow = true;
    lowerBoxMesh.add(sideBoxMesh);

    // Ammo
    width = sideBoxMesh.geometry.parameters.width;
    height = sideBoxMesh.geometry.parameters.height;
    depth = sideBoxMesh.geometry.parameters.depth;
    
    let sideBoxShape1 = new Ammo.btBoxShape( new Ammo.btVector3( width/2, height/2, depth/2) );
    addToCompound(baseCompoundShape, sideBoxMesh, sideBoxShape1);
    
    // sideBox 2
    // Three
    let sideBoxMesh2 = sideBoxMesh.clone();
    sideBoxMesh2.position.set(0, sideLength*1.25, sideLength/20 - sideLength/2);
    // sideBox2Mesh.castShadow = true;
    // sideBox2Mesh.receiveShadow = true;
    lowerBoxMesh.add(sideBoxMesh2);
    
    // Ammo
    width = sideBoxMesh2.geometry.parameters.width;
    height = sideBoxMesh2.geometry.parameters.height;
    depth = sideBoxMesh2.geometry.parameters.depth;

    let sideBoxShape2 = new Ammo.btBoxShape( new Ammo.btVector3( width/2, height/2, depth/2) );
    addToCompound(baseCompoundShape, sideBoxMesh2, sideBoxShape2);
}


function createPlankMesh(seesawPlankMesh, scale, seesawCompoundShape) {
    const seesawColor = 0x5FD85F
    const bucketColor = 0xFF0000
    const boxColor = 0xA7ABBF
    const sideLength = scale
    

    // Plank
    // THREE
    let plankMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength*15, sideLength/4, sideLength*0.8, 1, 1),
        new THREE.MeshStandardMaterial({color: seesawColor})
    );
    plankMesh.position.set(0, sideLength * 2.5, 0);
    plankMesh.castShadow = true;
    plankMesh.receiveShadow = true;
    seesawPlankMesh.add(plankMesh);

    // AMMO
    let plankShape = new Ammo.btBoxShape(new Ammo.btVector3(sideLength*7.5, sideLength/8, sideLength/2));
    addToCompound(seesawCompoundShape, plankMesh, plankShape);


    // Bucket on the right side of the board.
    // THREE
    const bucketPosition = {x: sideLength * 7, y: sideLength/8, z: 0}
    const segments = 200;
    let bucketGroup = new THREE.Group();
    bucketGroup.position.set(bucketPosition.x, bucketPosition.y, bucketPosition.z)

    let bucketMaterial = new THREE.MeshStandardMaterial({color: bucketColor});

    // Bottom circle
    let radius = sideLength * 0.4;
    let bottomGeometry = new THREE.CylinderGeometry(radius, radius, radius/10, segments);
	let bottomMesh = new THREE.Mesh( bottomGeometry, bucketMaterial );
    bottomMesh.receiveShadow = true;
    bottomMesh.castShadow = true;
	bucketGroup.add(bottomMesh);

    let shape = new Ammo.btCylinderShape(new Ammo.btVector3(radius, radius/10, radius));
	addToCompound(seesawCompoundShape, bottomMesh, shape);

    // Sides
    for (let i = 0; i < segments; i++) {
        let angle = (i / segments) * Math.PI * 2;
        let x = Math.cos(angle) * radius;
        let z = Math.sin(angle) * radius;
        // THREE
        let sideMesh = new THREE.Mesh(
            new THREE.BoxGeometry(radius / 4, sideLength, radius / 4, 1, 1),
            new THREE.MeshStandardMaterial({color: bucketColor})
        );
        sideMesh.position.set(x, sideLength/2, z);
        sideMesh.rotation.y = Math.PI/2 - angle;
        sideMesh.castShadow = true;
        sideMesh.receiveShadow = true;

        // AMMO
        let width = sideMesh.geometry.parameters.width;
        let height = sideMesh.geometry.parameters.height;
        let depth = sideMesh.geometry.parameters.depth;

        bucketGroup.add(sideMesh);
        let sideShape = new Ammo.btBoxShape(new Ammo.btVector3(width / 2, height / 2, depth / 2));
        addToCompound(seesawCompoundShape, sideMesh, sideShape);
    }
    plankMesh.add(bucketGroup);


    // CounterWeight
    // THREE
    let counterWeightMesh = new THREE.Mesh(
        new THREE.BoxGeometry(sideLength*0.7, sideLength*0.7, sideLength*0.7, 1, 1),
        new THREE.MeshStandardMaterial({color: boxColor})
    );
    counterWeightMesh.position.set(-sideLength * 7, sideLength/2, 0);
    counterWeightMesh.castShadow = true;
    counterWeightMesh.receiveShadow = true;
    plankMesh.add(counterWeightMesh);

    // AMMO
    let counterWeightShape = new Ammo.btBoxShape(new Ammo.btVector3(sideLength*0.35, sideLength*0.35, sideLength*0.35));
    addToCompound(seesawCompoundShape, counterWeightMesh, counterWeightShape);
}
