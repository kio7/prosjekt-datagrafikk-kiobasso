/*
Modulen lager en sol.
*/


import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';


export function createThreeSun() {
    const sunGeometry = new THREE.SphereGeometry(6, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 });

    // Create a sun mesh
    const sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(115, 150, 150);

    addMeshToScene(sunMesh);
}