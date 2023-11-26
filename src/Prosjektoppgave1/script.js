/* 
Hovedstrukturen i denne filen er hentet fra filer fra faget datamaskingrafikk. Men det meste er 
tweaket i etterkant og tilpasset egen kode.


*/

import * as THREE from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';


// myThreeHelper og myAmmoHelper tar utgangspunkt i filer fra kurset, men
// begge har mange tillegg.
import {
	createThreeScene,
	createCameraTimeline,
	handleKeys,
	onWindowResize,
	renderScene,
	updateThree
} from "./myThreeHelper.js";

import {
	createAmmoWorld, 
	updatePhysics
} from "./myAmmoHelper.js";

// Koordinatliste for automatiske kamerabevegelser.
import { cameraCoordinates as cc} from './cameraCoord.js';

// HTML og Css elementer for GUI.
import { loadScreenElements } from './screenElements.js';

// Grafiske elementer
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
import { createFunnelBox } from './threeAmmoFunnelBox.js';
import { createAmmoPortals } from './threeAmmoPortals.js';
import { createBox } from './threeAmmoBox.js';
import { createVideo } from './threeVideo.js';

//Globale variabler:
//MERK: brukes gjennomgående i flere av prosjektets filer.
export const ri = {
	activator: false,
	animationMixers: [],
	camera: undefined,
	cameraTimeline: {
		camt: undefined,
		cont: undefined,
	},
	clock: undefined,
	controls: undefined,
	currentlyPressedKeys: [],
	gameIsStarted: false,
	models: {},
	lilGui: undefined,
	models: { // .glb modeller som skal lastes inn:
		fan: {url: 'models/rgb_fan.glb', position: {x:10, y:-8, z:30}, scale: {x:20, y:20, z:20}, rotation: {x:0, y:0, z:Math.PI/2}},
		spaceBunny: {url: 'models/space_bunny.glb', position: {x:7.85, y:40.45, z:29.2}, scale: {x:2, y:2, z:2}, rotation: {x:0, y:-Math.PI/1.3, z:0}},
	},
	musicIsOn: false,
	numForceApplied: 0,
	progressBarCount: 0,
	soundEffectsIsOn: true,
	renderer: undefined,
	scene: undefined,
	stats: undefined,
	speed: 1.0,
	timelineToggle: true,
};

// Farger, brukes for det meste her, men er satt til export for å kunne brukes i andre filer:
export const colors = {
	red: 0xFF0000,
	blue: 0x0000FF,
	green: 0x00FF00,
	yellow: 0xFFFF00,
	purple: 0x800080,
	orange: 0xFFA500,
	pink: 0xFFC0CB,
	brown: 0xA52A2A,
	cyan: 0x00FFFF,
	magenta: 0xFF00FF,
	silver: 0xC0C0C0,
  };

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
	loadModelsAndTextures();

	// Kameraanimasjon for "startskjerm":
	createCameraTimeline(cc.pano)

}

// Registrerer tastetrykk:
function handleKeyUp(event) {ri.currentlyPressedKeys[event.code] = false;}
function handleKeyDown(event) {ri.currentlyPressedKeys[event.code] = true;}

// Laster inn teksturer og modeller.
function loadModelsAndTextures() {
	// Setter opp loadingmanager:
	const loadingManager = new THREE.LoadingManager();

	// Legger til tekst til innlastingssidene for hvert element som lastes inn:
	loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
		let element = ( 'Loading file: ' + url + '.\nLoaded ' + itemsLoaded + ' of ' + itemsTotal + ' files.' )
		// Oppdaterer HTML-elementet som viser fremgang:
		const loadingBox = document.querySelector(".loadingBox")
		const createDiv = document.createElement("div")
		createDiv.className = "filnavn"
		createDiv.innerHTML = element
		loadingBox.appendChild(createDiv)
	};
	
	// Laster inn teksturer som er i bruk
	const textureLoader = new THREE.TextureLoader(loadingManager);
	const textureObjects = [];
	textureObjects[0] = textureLoader.load('textures/galaxy.jpeg');
	textureObjects[1] = textureLoader.load('textures/glass.jpg');
	textureObjects[2] = textureLoader.load('textures/wood.jpg');
	textureObjects[3] = textureLoader.load('textures/milky_way_illustration.jpeg');
	
	// Laster inn modeller og 
	const gltfLoader = new GLTFLoader(loadingManager);
	for (const model of Object.values(ri.models)) {
		gltfLoader.load(model.url, (gltf) => {
			model.gltf = gltf;
		});
	}

	// Alle filer er lastet inn:
	loadingManager.onLoad = () => {
		let element = ( 'Loading complete!' )
		// Oppdaterer HTML-elementet som viser fremgang:
		const loadingBox = document.querySelector(".loadingBox")
		const createDiv = document.createElement("div")
		createDiv.className = "filnavn"
		createDiv.innerHTML = element
		loadingBox.appendChild(createDiv)

		// Fjerner loadingScreen:
		const loadingScreen =  document.querySelector(".loadingScreen")
		loadingScreen.classList.toggle('hide')

		// Lager scenen:
		createScene(textureObjects);
	}


}

// Setter opp scenen, legger til modeller og teksturer og setter posisjonering og andre parametere.
function createScene(textureObjects) {

	// Legger SpaceBunny og Vifte til scenen:
	Object.values(ri.models).forEach((model, index) => {
		const clonedScene = SkeletonUtils.clone(model.gltf.scene);
		const root = new THREE.Object3D();
		root.add(clonedScene);
		//Skalerer og posisjonerer:
		root.scale.set(model.scale.x, model.scale.y, model.scale.z);
		root.position.set(model.position.x, model.position.y, model.position.z);
		root.rotation.set(model.rotation.x, model.rotation.y, model.rotation.z);
		ri.scene.add(root);

		// Legger til animasjoner:
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
	
	// Sun and World
	createThreeSun();
	createWorld(textureObjects[0]);
	// Canon
	createAmmoCanon({x:18, y:0, z:-12}, Math.PI/4, Math.PI/8, colors.cyan);
	createAmmoMarble(0.2, 2, colors.red, {x:18, y:0.2, z:-12}, 0.0, 0.0, "marble"); // Canonball
	createAmmoXZPlane(5, 5, {x:18, y:0, z:-12}, textureObjects[1], colors.red)
	// Seesaw
	createAmmoSeeSaw(5, {x:0, y:0, z:0}, colors.yellow, colors.magenta);
	createBucket({x:4, y:5, z:0}, 0.0, 0.0, colors.red);
	createCounterWeight({x:-4, y:5, z:0}, 0.0, 0.0, colors.green);
	createAmmoXZPlane(10, 10, {x:0, y:0, z:0}, textureObjects[1], colors.orange);
	// Funnel
	createAmmoFunnel(0, colors.orange, {x:4, y:7.6, z:0}, 2.9, 0.4, 2.5, textureObjects[1]);
	// Rails
	createRails({x:-4, y:0.2, z:15}, Math.PI/2, colors.silver);
	createAmmoMarble(0.58, 3.0, colors.cyan, {x:-5, y:6, z:-1}, 0.0, 0.0, "railMarble"); // Rolling ball
	// Dominos
	createAmmoDomino({x:-3, y:0, z:16}, 0.5, 7, textureObjects[2]);
	createAmmoXZPlane(15, 25, {x:-3, y:0, z:25}, textureObjects[1], colors.purple, {x: 0, y:0, z:0}, 5.0);
	createAmmoXZPlane(0.5, 2.0, {x:0.25, y:0.5, z:30}, textureObjects[1], colors.yellow, {x: 0, y:0, z:0}, 0.0); // Stopping block
	// Pendulum
	createAmmoPendulum(5, colors.yellow, {x:8, y:40, z:30}, 0.0, 0.0);
	// Wall/Bricks
	createAmmoWall(0.3, 2.75, 8, {x:8, y:5.5, z:31});
	createAmmoXZPlane(5, 20, {x:8, y:5.5, z:30}, textureObjects[1], colors.green, {x: 0, y:0, z:0}, 0.1);
	// FunnelBox
	createFunnelBox(10, 10, textureObjects[1], colors.cyan, {x:20, y:-7, z:30}, {x:0, y:0, z:0});
	// Portals
	createAmmoPortals(0xF3F3F3, {x:26, y:-18, z:30}, 5, textureObjects[3]);
	createAmmoPortals(0xF3F3F3, {x:75, y:25, z:-70}, 5, textureObjects[3]);
	// Box
	createBox(5, {x: 75, y: 17, z: -70}, colors.orange, textureObjects[1]);


	animate(0);
}

// Animasjonsløkke:
function animate(currentTime, myThreeScene, myAmmoPhysicsWorld) {
	window.requestAnimationFrame((currentTime) => {
		animate(currentTime, myThreeScene, myAmmoPhysicsWorld);
	});
	// Tid siden siste frame, ri.speed varierer hastigheten på animasjonen:
	let deltaTime = ri.clock.getDelta() * ri.speed;

	// Oppdaterer fps-counter:
	ri.stats.begin();
	
	// Dersom sann, kula sendes ut fra kanon:
	// Satt opp slik at den bare kan skytes ut en gang:
	if (ri.activator == true && ri.numForceApplied < 1) {
		const activator = ri.scene.getObjectByName("marble");
		activator.userData.physicsBody.applyCentralImpulse(new Ammo.btVector3(-10, 34, 10));
		ri.numForceApplied += 1;
	}
	// Sjekker posisjonen til objekter og utfører handlinger:
	checkPositionsAndMakeActions();

	// Roterer portalene:
	const portal = ri.scene.getObjectByName("visual_portal");
	portal.rotation.y -= 0.02;

	// Slår av og på musikken i bakgrunnen, sjekker for true/false i ri for lyd:
	if (!ri.musicIsOn) {ri.sound.stop()} 
	if (ri.musicIsOn && !ri.sound.isPlaying) {ri.sound.play()}

	// Oppdaterer animasjoner:
	if (ri.animationMixers.length>0) {
		// Merk: Dette vil ikke kjøre før alle modellene er lastet og g_animationMixers er fylt med data.
		for (const mixer of ri.animationMixers) {
			mixer.update(deltaTime);
		}
	}
	
	// Legger til sluttvideo når kameraet er på riktig posisjon:
	if (ri.camera.position.y > 350 && !ri.videoPlayeing) {
		createVideo(670, {x: 0, y: -750, z: 0}, {x: -Math.PI/2, y: 0, z: Math.PI/2});
		ri.videoPlayeing = true;
		const video = document.getElementById('video');
		ri.sound.stop()
		video.play();
		// Fjerner HTML elementer som ikke skal vises under video:
		document.getElementById("progressbar-text").classList.toggle("hide");
		document.getElementById("progressbar-wrapper").classList.toggle("hide");
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

// Hjelpefunksjon for å sjekke posisjonen til objekter,
// og for å utføre handlinger når de er på gitte posisjoner:
function checkPositionsAndMakeActions() {
	ri.scene.children.forEach((object) => {
		// Flytter bricks:
        if (object.name == "brick") {
            let brickPosition = object.userData.physicsBody.getWorldTransform().getOrigin();
            if (brickPosition.y() < -5 && brickPosition.y() > -11 && brickPosition.x() < 27.5 && brickPosition.x() > 10.5) {
                let force = new Ammo.btVector3(0.02, 0, 0);
                object.userData.physicsBody.applyCentralImpulse(force);
            }
        }

		// Animer partikler for portalene:
		if (object.name == "particles") {
            object.material.opacity -= 0.005;
            object.position.y -= 0.04;
            object.material.needsUpdate = true;
            object.time += 1;
            if (object.time > 100) {
                ri.scene.remove(object);
            }
        }

		// Animer partikler fra kanon:
		if (object.name == "canon_particles") {
            object.material.opacity -= 0.02;
			object.position.x -= 0.04;
            object.position.y += 0.08;
			object.position.z += 0.04;
            object.material.needsUpdate = true;
            object.time += 1;
            if (object.time > 30) {
                ri.scene.remove(object);
            }
        }
    });
}