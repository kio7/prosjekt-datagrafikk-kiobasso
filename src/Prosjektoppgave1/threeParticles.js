
// Step 1: Import necessary libraries and modules
import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';

// Step 4: Define the firework explosion effect
export function createParticles(position) {
    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true,
        transparent: true,
        opacity: 1.0,
    });

    let range = 3;
    let vertices = [];
    let colors = [];
    let color = new THREE.Color();
    let z,y,x;
    for (let i = 0; i < 50; i++) {
        x = THREE.MathUtils.randFloatSpread(range);
        y = THREE.MathUtils.randFloat(0, 2);
        z = THREE.MathUtils.randFloatSpread(range);
        vertices.push(x, y, z);
        color.setHex(Math.random() * 0xffffff);
        colors.push(color.r, color.g, color.b);
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    const mesh = new THREE.Points(geometry, material);
    mesh.name = "particles";
    mesh.position.set(position.x, position.y, position.z);
    mesh.time = 0;
    addMeshToScene(mesh);
}