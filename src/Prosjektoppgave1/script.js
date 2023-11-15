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

import { createAmmoXZPlane } from './threeAmmoXZPlane.js';
import { createAmmoSeeSaw } from './threeAmmoSeeSaw.js';
import { createBucket } from './threeAmmoSeeSawObj.js';	
import { createCounterWeight } from './threeAmmoSeeSawObj.js';	
import { createAmmoMarble } from './threeAmmoMarbles.js';
import { createAmmoCanon } from "./threeAmmoCanon.js";
import { createRails } from './threeAmmoRails.js';
import { createAmmoFunnel } from './threeAmmoFunnel.js';
import { createAmmoDomino } from './threeAmmoDomino.js';
import { createWorld } from './threeWorld.js';
import { createThreeSun } from './threeSun.js';
import { createAmmoPendulum} from './threeAmmoPendulum.js';
import { createAmmoWall } from './threeAmmoWall.js';
import { createAmmoFan, moveBricks } from './threeAmmoFan.js';

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
	loadingManager: undefined,
	activator: false,
	num: 0,
};

export const XZPLANE_SIDELENGTH = 500;


export function main() {

	// three:
	createThreeScene();

	// ammo
	createAmmoWorld(true);

	// Klokke for animasjon
	ri.clock = new THREE.Clock();

	//Håndterer endring av vindusstørrelse:
	window.addEventListener('resize', onWindowResize, false);

	//Input - standard Javascript / WebGL:
	document.addEventListener('keyup', handleKeyUp, false);
	document.addEventListener('keydown', handleKeyDown, false);

	// GUI
	loadScreenElements();

	// three/ammo-objekter:
	addAmmoSceneObjects();
}


function loadScreenElements() {
	//Setter opp fps-counter:
    ri.stats = new Stats();
	ri.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	const statsDOM = ri.stats.dom;
	statsDOM.style.top = "";
	statsDOM.style.bottom = "0px";

	const statsContainer = document.getElementById("stats-container");
	statsContainer.className = 'stats';
	statsContainer.appendChild(ri.stats.dom);

	// Create a div element to display the coordinates on the canvas
    const coordinatesDiv = document.createElement('div');
	coordinatesDiv.id = 'coordinatesText';
	coordinatesDiv.className = 'coordinatesText';
    document.body.appendChild(coordinatesDiv);

	// Toggles settings tray:
	function animateButton() {
		console.log("her")
		const animatedDiv = document.querySelector(".lil-gui");
		animatedDiv.classList.toggle("open");		
	}
	const animatedButton = document.getElementById("settingsTray");	
	animatedButton.addEventListener("click", animateButton);
}


function handleKeyUp(event) {
	ri.currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
	ri.currentlyPressedKeys[event.code] = true;
}


function addAmmoSceneObjects() {

	const loadingManager = new THREE.LoadingManager();
	ri.loadingManager = loadingManager;
	const textureLoader = new THREE.TextureLoader(loadingManager);
	const textureObjects = [];
	textureObjects[0] = textureLoader.load('textures/galaxy.jpeg');
	textureObjects[1] = textureLoader.load('textures/glass.jpg');
	textureObjects[2] = textureLoader.load('textures/wood.jpg');

	// Implementer dette i forbindelse med loading screen?!?!?

	loadingManager.onStart = (url, itemsLoaded, itemsTotal) => {
		console.log( 'Started loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	};
	loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
		console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	};
	loadingManager.onError = (url) => {
		console.log( 'There was an error loading ' + url );
	};
	
	loadingManager.onLoad = () => {
		createScene(textureObjects);
	}
}

function createScene(textureObjects) {

	createWorld(textureObjects[0]);
	
	createAmmoSeeSaw(5, {x:0, y:0, z:0});
	createBucket({x:4, y:5, z:0});
	createCounterWeight({x:-4, y:5, z:0});
	createAmmoXZPlane(10, 10, {x:0, y:0, z:0}, textureObjects[1], 0x96f1ff);
		
	createAmmoCanon({x:18, y:0, z:-12});
	createAmmoMarble(0.2, 2, 0xF9F9F9, {x:18, y:0.2, z:-12}, 0.5, 0.5, "marble"); // Canonball
	createAmmoXZPlane(5, 5, {x:18, y:0, z:-12}, textureObjects[1], 0x96f1ff);
	
	createAmmoFunnel(0, 0x00F3F3, {x:4, y:7.3, z:0}, 3.2, 0.4, 2.1, textureObjects[1]);
	
	createRails({x:-4, y:0.2, z:15}, Math.PI/2);
	createAmmoMarble(0.58, 3.0, 0xFEFEFE, {x:-5, y:6, z:-1}, 0.1, 0.9, "railMarble"); // Rolling ball
	
	createAmmoDomino({x:-3, y:0, z:16}, 0.5, 7, textureObjects[2]);

	createAmmoXZPlane(15, 25, {x:-3, y:0, z:25}, textureObjects[1], 0x96f1ff);

	createThreeSun();
	

	createAmmoPendulum(5, 0xFEFEFE, {x:4, y:23.5, z:30}, 0.5, 0.5);
	
	createAmmoXZPlane(5, 20, {x:8, y:5.5, z:30}, textureObjects[1], 0x96f1ff);
	createAmmoWall(0.3, 3.5, 8, {x:8, y:5.5, z:31});

	// V-Shape
	createAmmoXZPlane(12, 15, {x:17, y:-7, z:24.5}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:Math.PI/7});
	createAmmoXZPlane(12, 15, {x:17, y:-7, z:35.5}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:-Math.PI/7});

	// V-Shape with a hole in the middle
	createAmmoXZPlane(10, 2.5, {x:25.75, y:-6.57, z:23.6}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:Math.PI/7});
	createAmmoXZPlane(10, 2.5, {x:25.75, y:-6.57, z:36.4}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:-Math.PI/7});
	
	// Back Wall
	createAmmoXZPlane(7, 23, {x:27.25, y:-7, z:30}, textureObjects[1], 0x96f1ff, {x: 0, y:0, z:Math.PI/2});

	// Fan: pos, rot, scale
	createAmmoFan({x:8, y:-7, z:30}, {x:0, y:0, z:Math.PI/2}, {x:2, y:2, z:2}, textureObjects[1], ri.loadingManager);

	// The blocks fall down a pipe and hit a button.
	// The button activates an old TV that plays a video with sound, video: Never gonna give you up.
	// The end.
	
	animate(0);
}


function animate(currentTime, myThreeScene, myAmmoPhysicsWorld) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, myThreeScene, myAmmoPhysicsWorld);
	});
	let deltaTime = ri.clock.getDelta();

	ri.stats.begin();
	
	// Dersom sann, kula sendes ut fra kanon:
	if (ri.activator == true && ri.num < 12) {
		const activator = ri.scene.getObjectByName("marble");
		activator.userData.physicsBody.applyCentralImpulse(new Ammo.btVector3(-1.5, 2.1, 1.5));
		ri.num += 1;
	}
	// Sjekker om bricks skal flyttes:
	moveBricks();

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
