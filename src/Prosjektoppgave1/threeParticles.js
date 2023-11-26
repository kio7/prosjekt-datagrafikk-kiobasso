/*
Modulen lager partikler.
Vi har tatt inspirasjon fra Werner sin kode: modul 8, particles1, eksempel 2.
*/

import * as THREE from 'three';
import { addMeshToScene } from './myThreeHelper';


export function createParticles(position, name="particles") {
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
    const material = new THREE.PointsMaterial({
        size: 0.15,
        vertexColors: true
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

    const mesh = new THREE.Points(geometry, material);
    mesh.name = name;
    mesh.position.set(position.x, position.y, position.z);
    mesh.time = 0; // for animation
    addMeshToScene(mesh);
}