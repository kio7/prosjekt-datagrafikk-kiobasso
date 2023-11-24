import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';

export function createVideo(scale = 10, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
    const video = document.getElementById('video');

    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.LinearFilter;
    videoTexture.magFilter = THREE.LinearFilter;
    

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2, 2),
        new THREE.MeshBasicMaterial({ map: videoTexture, side: THREE.FrontSide, toneMapped: false})
    );

    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.set(rotation.x, rotation.y, rotation.z);
    mesh.scale.set(scale, scale, scale);
    mesh.name = 'video';
    mesh.receiveShadow = false;

    addMeshToScene(mesh);
}
