import './style.css';
import * as THREE from "three";
import Stats from 'stats.js';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

import {
	createThreeScene,
	createCameraTimeline,
	handleKeys,
	onWindowResize,
	renderScene,
	updateThree
} from "./myThreeHelper.js";

import { cameraCoordinates as cc} from './cameraCoord.js';

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
import { createAmmoFan } from './threeAmmoFan.js';
import { createParticles } from './threeParticles.js';

//Globale variabler:
//MERK: Denne brukes også i myThreeHelper:
export const ri = {
	currentlyPressedKeys: [],
	scene: undefined,
	renderer: undefined,
	camera: undefined,
	cameraTimeline: undefined,
	timelineToggle: false,
	clock: undefined,
	controls: undefined,
	lilGui: undefined,
	stats: undefined,
	loadingManager: undefined,
	activator: false,
	numForceApplied: 0,
	models: {},
	animationMixers: [],
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
		ri.cameraTimeline.kill();
		// Load new movement
		createCameraTimeline(cc.canon.c, cc.canon.d);
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
	ri.loadingManager = loadingManager;
	const textureLoader = new THREE.TextureLoader(loadingManager);
	const textureObjects = [];
	textureObjects[0] = textureLoader.load('textures/galaxy.jpeg');
	textureObjects[1] = textureLoader.load('textures/glass.jpg');
	textureObjects[2] = textureLoader.load('textures/wood.jpg');

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

		createCameraTimeline(cc.pano.c, cc.pano.d)
		console.log( 'Loading complete!');
		createScene(textureObjects);
	}

	ri.models = {
		fan: {url: 'models/rgb_fan.glb', position: {x:10, y:-8, z:30}, scale: {x:20, y:20, z:20}, rotation: {x:0, y:0, z:Math.PI/2}},
		spaceBunny: {url: 'models/space_bunny.glb', position: {x:3.85, y:23.9, z:29.2}, scale: {x:2, y:2, z:2}, rotation: {x:0, y:-Math.PI/1.3, z:0}},
		button: {url: 'models/button.glb', position: {x:26, y:-18, z:30}, scale: {x:7.5, y:7.5, z:7.5}, rotation: {x:0, y:0, z:0}},
	};


	const gltfLoader = new GLTFLoader(loadingManager);
	for (const model of Object.values(ri.models)) {
		gltfLoader.load(model.url, (gltf) => {
			model.gltf = gltf;
		});
	}
}

function createScene(textureObjects) {
	// Add 3d models to scene
	Object.values(ri.models).forEach((model, index) => {
		const clonedScene = SkeletonUtils.clone(model.gltf.scene);
		const root = new THREE.Object3D();
		root.add(clonedScene);
		//Skalerer og posisjonerer:
		root.scale.set(model.scale.x, model.scale.y, model.scale.z);
		root.position.set(model.position.x, model.position.y, model.position.z);
		root.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
		ri.scene.add(root);

		if (model.gltf.animations[0]) {
			let mixer = new THREE.AnimationMixer(clonedScene);
			ri.animationMixers.push(mixer);
			
			const animation0 = model.gltf.animations[0];
			const action0 = mixer.clipAction(animation0);
			action0.setLoop(THREE.LoopRepeat);
			action0.setDuration(2);
			action0.play();
		}
	});


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
	createAmmoWall(0.3, 2.5, 8, {x:8, y:5.5, z:31});

	// V-Shape
	createAmmoXZPlane(12, 15, {x:17, y:-7, z:24.5}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:Math.PI/7});
	createAmmoXZPlane(12, 15, {x:17, y:-7, z:35.5}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:-Math.PI/7});

	// V-Shape with a hole in the middle
	createAmmoXZPlane(10, 2.5, {x:25.75, y:-6.57, z:23.6}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:Math.PI/7});
	createAmmoXZPlane(10, 2.5, {x:25.75, y:-6.57, z:36.4}, textureObjects[1], 0x96f1ff, {x: 0, y:Math.PI/2, z:-Math.PI/7});
	
	// Back Wall
	createAmmoXZPlane(7, 23, {x:27.25, y:-7, z:30}, textureObjects[1], 0x96f1ff, {x: 0, y:0, z:Math.PI/2});

	// Fan: pos, rot, scale
	createAmmoFan({x:8, y:-7, z:30}, {x:0, y:0, z:Math.PI/2}, {x:2, y:2, z:2}, textureObjects[1]);


	animate(0);
}


function animate(currentTime, myThreeScene, myAmmoPhysicsWorld) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, myThreeScene, myAmmoPhysicsWorld);
	});
	let deltaTime = ri.clock.getDelta();

	ri.stats.begin();
	
	// Dersom sann, kula sendes ut fra kanon:
	if (ri.activator == true && ri.numForceApplied < 12) {
		const activator = ri.scene.getObjectByName("marble");
		activator.userData.physicsBody.applyCentralImpulse(new Ammo.btVector3(-1.5, 2.1, 1.5));
		ri.numForceApplied += 1;
	}
	// Sjekker om bricks skal flyttes:
	checkPositions();

	// Oppdaterer animasjoner:
	if (ri.animationMixers.length>0) {
		// Merk: Dette vil ikke kjøre før alle modellene er lastet og g_animationMixers er fylt med data.
		for (const mixer of ri.animationMixers) {
			mixer.update(deltaTime);
		}
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

function checkPositions() {
	ri.scene.children.forEach((object) => {
        if (object.name == "brick") {
            let brickPosition = object.userData.physicsBody.getWorldTransform().getOrigin();
            if (brickPosition.y() < -2 && brickPosition.y() > -11 && brickPosition.x() < 26) {
                let force = new Ammo.btVector3(0.02, 0, 0);
                object.userData.physicsBody.applyCentralImpulse(force);
            }
        }

		if (object.name == "brick" && !object.done) {
            let brickPosition = object.userData.physicsBody.getWorldTransform().getOrigin();
            if (brickPosition.y() < -15.5 && brickPosition.x() > 24) {
                object.visible = false;
                object.done = true;
                createParticles({x: brickPosition.x(), y: brickPosition.y() + 0.5, z: brickPosition.z()});
            }
        }

		if (object.name == "particles") {
            object.material.opacity -= 0.005;
            object.position.y -= 0.04;
            object.material.needsUpdate = true;
            object.time += 1;
            if (object.time > 100) {
                ri.scene.remove(object);
            }
        }
    });
}