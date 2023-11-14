import * as THREE from "three";
import {addMeshToScene} from "./myThreeHelper.js";

export function createWorld(textureObject) {
    const world = new THREE.Mesh(
        new THREE.SphereGeometry(1000, 64, 64),
        new THREE.MeshBasicMaterial({
            map: textureObject,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.7,
        })
        )
    world.name = "world";
    addMeshToScene(world);
}