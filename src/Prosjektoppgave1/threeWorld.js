/*
Denne koden lager bakgrunnen. Det er en kule med en tekstur på.
*/

import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";


export function createWorld(textureObject) {
    const world = new THREE.Mesh(
        new THREE.SphereGeometry(1000, 64, 64),
        new THREE.MeshBasicMaterial({
            map: textureObject,
            side: THREE.BackSide,
            transparent: false,
        })
    )
    world.name = "world";
    addMeshToScene(world);
}