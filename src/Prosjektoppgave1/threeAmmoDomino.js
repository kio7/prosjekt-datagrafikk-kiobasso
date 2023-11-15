import * as THREE from 'three';
import { addMeshToScene, playAudioOnce } from './myThreeHelper';
import { createAmmoRigidBody, phy } from './myAmmoHelper';
import { 
    COLLISION_GROUP_PLANE, 
    COLLISION_GROUP_SPHERE, 
    COLLISION_GROUP_DOMINO,
    COLLISION_GROUP_PENDULUM
} from './myAmmoHelper';

export function createAmmoDomino(
    pos={x:-10, y:0, z:10}, 
    size=0.51, 
    dominoCount = 7,
    textureObject    
    ) {
    let mass=2.5;
    const color=0xFFFFFF; 

    for (let i = 0; i < dominoCount; i++) {;
        size = size + 0.25 * i; // update size
        mass = mass + 1.15 * i; // update mass
        pos.z += size - size * 0.2; // update pos
        

        let mesh = new THREE.Mesh(
            new THREE.BoxGeometry(size, 2*size, size/3),
            new THREE.MeshStandardMaterial({ 
                map: textureObject,
                color: color,
                side: THREE.DoubleSide, 
            }));
        

        mesh.receiveShadow = true;
        mesh.castShadow = true;
        mesh.name = 'domino';

        let j = 0;
        mesh.collisionResponse = (mesh1) => {
            if (j <= 2 && mesh1.name === 'domino') {
                playAudioOnce('./sounds/wood.mp3', 0.5, 1 / ((i+1)/2) );
                j++;
            }
        };

        // AMMO:
        let width = mesh.geometry.parameters.width;
        let height = mesh.geometry.parameters.height;
        let depth = mesh.geometry.parameters.depth;
        let shape = new Ammo.btBoxShape(new Ammo.btVector3(width/2, height/2, depth/2));
        shape.setMargin( 0.1 );
        let rigidBody = createAmmoRigidBody(shape, mesh, 0.7, 0.9, pos, mass);
        mesh.userData.physicsBody = rigidBody;

        phy.ammoPhysicsWorld.addRigidBody(
            rigidBody,
            COLLISION_GROUP_DOMINO,
            COLLISION_GROUP_SPHERE | 
            COLLISION_GROUP_PLANE | 
            COLLISION_GROUP_DOMINO |
            COLLISION_GROUP_PENDULUM
        );


        addMeshToScene(mesh);
        phy.rigidBodies.push(mesh);
        rigidBody.threeMesh = mesh;
        rigidBody.setActivationState(4); //DISABLE_DEACTIVATION
    }



}