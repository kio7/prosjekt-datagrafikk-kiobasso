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

import { createAmmoXZPlane } from './ammoThreeXZPlane.js';
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
	activator: false,
	num: 0
};

export const XZPLANE_SIDELENGTH = 500;


export function main() {

	// three:
	createThreeScene();

	// ammo
	createAmmoWorld();

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
	// Setter opp container for GUI
	const guiContainer = document.createElement('div');
	guiContainer.className = 'gui-container';
	guiContainer.classList.add("hide");
	document.body.appendChild(guiContainer);



	//Setter opp fps-counter:
    ri.stats = new Stats();
	ri.stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	const statsDOM = ri.stats.dom;
	statsDOM.style.top = "";
	statsDOM.style.bottom = "0px";

	// Legger fpscounter til i gui-container:
	guiContainer.appendChild(ri.stats.dom);

	// Create a div element to display the coordinates on the canvas
    const coordinatesDiv = document.createElement('div');
	coordinatesDiv.id = 'coordinatesText';
	coordinatesDiv.className = 'coordinatesText';
    guiContainer.appendChild(coordinatesDiv);

	// Create settingsbutton and add to gui-container:
	const settingsButton = document.createElement("button");
	settingsButton.className = "settings";
	settingsButton.id = "settingsTray";
	settingsButton.innerHTML = "SETTINGS";
	guiContainer.appendChild(settingsButton);
	let settingsButtonEvent = document.getElementById("settingsTray");	
	settingsButtonEvent.addEventListener("click", animateButton);

	// Toggles settings tray:
	function animateButton() {
		const animatedDiv = document.querySelector(".lil-gui");
		animatedDiv.classList.toggle("open");		
	}

	// Create startbutton and startbutton container:
	const startButtonContainer = document.createElement("div");
	startButtonContainer.className = "startButtonContainer";
	startButtonContainer.id = "startButtonContainer";
	document.body.appendChild(startButtonContainer);

	const startButton = document.createElement("button");
	startButton.className = "startButton";
	startButton.id = "startButton";
	startButton.innerHTML = "START!";
	startButtonContainer.appendChild(startButton);

	let startButtonElement = document.getElementById("startButton");
	startButtonElement.addEventListener("click", startButtonEvent);

	function startButtonEvent() {
		const startButtonContainer = document.getElementById("startButtonContainer");
		const guiContainer = document.querySelector(".gui-container");
		startButtonContainer.classList.toggle("hide");
		guiContainer.classList.toggle("hide");

		// Kill cameramovemnt
		// Load new movement
	}

}


function handleKeyUp(event) {
	ri.currentlyPressedKeys[event.code] = false;
}

function handleKeyDown(event) {
	ri.currentlyPressedKeys[event.code] = true;
}


function addAmmoSceneObjects() {

	const loadingManager = new THREE.LoadingManager();
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
		let element = ( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' )
		const loadingBox = document.querySelector(".loadingBox")
		const createDiv = document.createElement("div")
		createDiv.className = "filnavn"
		createDiv.innerHTML = element
		loadingBox.appendChild(createDiv)
		
		console.log( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' );
	};
	loadingManager.onError = (url) => {
		console.log( 'There was an error loading ' + url );
	};
	
	loadingManager.onLoad = () => {
		let element = ( 'Loading complete!' )
		const loadingBox = document.querySelector(".loadingBox")
		const createDiv = document.createElement("div")
		createDiv.className = "filnavn"
		createDiv.innerHTML = element
		loadingBox.appendChild(createDiv)


		const loadingScreen =  document.querySelector(".loadingScreen")
		loadingScreen.classList.toggle('hide')
		console.log( 'Loading complete!');
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

	// console.log(ri.scene)
	// console.log(phy)

	
	
	
	// createTable({x:8, y:0, z:-9});
	// createTable({x:0, y:0, z:0});
	// createAmmoMarble();
	// createAmmoDomino({x:-3, y:0, z:16});
	
	// createAmmoMarble(0.58, 1.5, 0xF9F9F9, {x:0, y:7, z:0}, 0.5, 0.5);
	
	createAmmoPendulum(5, 0xFEFEFE, {x:4, y:23.5, z:30}, 0.5, 0.5);
	

	createAmmoXZPlane(5, 20, {x:8, y:5.5, z:30}, textureObjects[1], 0x96f1ff);
	// createAmmoWall(0.1, 3, 10, {x:8, y:5.5, z:31});

	
	
	
	// Blocks in the wall fall down on a plane.
	createAmmoXZPlane(10, 30, {x:14, y:-5, z:30}, textureObjects[1], 0x96f1ff);
	createAmmoXZPlane(10, 30, {x:23.5, y:-6.9, z:30}, textureObjects[1], 0x96f1ff, {x: 0, y:0, z:-Math.PI/8});
	// On the plane is a fan that blows the blocks into a funnel of sorts.
	// The funnel leads to a pipe that leads to a button on a lower plane.
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
