import './style.css';
import * as THREE from "three";
import Stats from 'stats.js';

import {
	createThreeScene,
	handleKeys,
	onWindowResize,
	renderScene,
	updateThree
} from "./myThreeHelper.js";

import {
	phy,
	createAmmoWorld,
	updatePhysics
} from "./myAmmoHelper.js";

// import { createAmmoXZPlane } from "./threeAmmoShapes.js";
import { createAmmoXZPlane } from './ammoThreeXZPlane.js';
import { createAmmoSeeSaw } from './threeAmmoSeeSaw.js';
import { createBucket } from './threeAmmoSeeSawObj.js';	
import { createCounterWeight } from './threeAmmoSeeSawObj.js';	
import { createAmmoMarble } from './threeAmmoMarbles.js';
import { createAmmoCanon } from "./threeAmmoCanon.js";
import { createRails } from './threeAmmoRails.js';
import { createAmmoFunnel } from './threeAmmoFunnel.js';
import { createAmmoDomino } from './threeAmmoDomino.js';

//Globale variabler:
//MERK: Denne brukes også i myThreeHelper:
export const ri = {
	currentlyPressedKeys: [],
	scene: undefined,
	renderer: undefined,
	camera: undefined,
	clock: undefined,
	controls: undefined,
	lilGui: undefined,
	stats: undefined,
	activator: 0
};

export const XZPLANE_SIDELENGTH = 500;


export function main() {

    //Setter opp fps-counter:
    ri.stats = new Stats();
	ri.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( ri.stats.dom );

    	//Input - standard Javascript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// three:
	createThreeScene();

	// ammo
	createAmmoWorld(true);  //<<=== MERK!

	// Klokke for animasjon
	ri.clock = new THREE.Clock();

	//Håndterer endring av vindusstørrelse:
	window.addEventListener('resize', onWindowResize, false);

	//Input - standard Javascript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// three/ammo-objekter:
	addAmmoSceneObjects();
}

function handleKeyUp(event) {
	ri.currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
	ri.currentlyPressedKeys[event.code] = true;
}


function addAmmoSceneObjects() {

	createAmmoXZPlane(10, 10, {x:0, y:0, z:0});
	
	createAmmoSeeSaw(5, {x:0, y:0, z:0});
	createBucket({x:4, y:5, z:0});
	createCounterWeight({x:-4, y:5, z:0});
	
	
	createAmmoXZPlane(5, 5, {x:18, y:0, z:-12});
	createAmmoCanon({x:18, y:0, z:-12});
	createAmmoMarble(0.2, 1, 0xF9F9F9, {x:18, y:0.2, z:-12}, 0.5, 0.5, "marble"); // Canonball
	
	createAmmoFunnel(0, 0x0000FF, {x:4, y:7.2, z:0},3.5 , 0.4, 1.7);
	
	createRails({x:-4, y:0.2, z:15}, Math.PI/2);
	createAmmoMarble(0.58, 2.5, 0xFEFEFE, {x:-5, y:6, z:-2}, 0.1, 0.9); // Rolling ball
	

	createAmmoXZPlane(15, 25, {x:-3, y:0, z:25});
	createAmmoDomino({x:-3, y:0, z:16}, 0.5, 7);

	

	// createTable({x:8, y:0, z:-9});
	// createTable({x:0, y:0, z:0});
	// createAmmoMarble();
	// createAmmoMarble(0.58, 1.5, 0xF9F9F9, {x:0, y:7, z:0}, 0.5, 0.5);


	animate(0);
}

function animate(currentTime, myThreeScene, myAmmoPhysicsWorld) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, myThreeScene, myAmmoPhysicsWorld);
	});
	let deltaTime = ri.clock.getDelta();

	ri.stats.begin();
	
	//Oppdaterer grafikken:
	updateThree(deltaTime);
	//Oppdaterer fysikken:
	updatePhysics(deltaTime);
	//Sjekker input:
	handleKeys(deltaTime);
	//Tegner scenen med gitt kamera:
	renderScene();
	ri.stats.end();
}


// Starter scriptet, gjør at man slipper å legge dette inn i html-fila.
// Ammo().then(async function (AmmoLib) {
//     Ammo = AmmoLib;
//     main();
// });