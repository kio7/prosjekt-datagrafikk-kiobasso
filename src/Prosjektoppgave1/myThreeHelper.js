import * as THREE from "three";
import GUI from "lil-gui";
// import {applyImpulse, moveRigidBody} from "./myAmmoHelper.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ri} from "./script.js";
import {gsap} from "gsap";
import {CustomEase} from "gsap/CustomEase";
import { createParticles } from "./threeParticles.js";
import { cameraCoordinates as cc } from "./cameraCoord.js";

export function createThreeScene() {
	const canvas = document.createElement('canvas');
	document.body.appendChild(canvas);

	// Renderer:
	ri.renderer = new THREE.WebGLRenderer({canvas: canvas, antialias: true});
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.renderer.setClearColor(0x000000, 0xFF);  //farge, alphaverdi.
	ri.renderer.shadowMap.enabled = true; //NB!
	ri.renderer.shadowMapSoft = true;
	ri.renderer.shadowMap.type = THREE.PCFSoftShadowMap; //THREE.BasicShadowMap;

	// Scene
	ri.scene = new THREE.Scene();
	ri.scene.background = new THREE.Color( 0x000000 );

	// lil-gui kontroller:
	ri.lilGui = new GUI();

	// lil-gui speed slider:
	const speedFolder = ri.lilGui.addFolder('Speed');
	speedFolder.add(ri, 'speed').min(0.1).max(5).step(0.1).name("Speed");

	// Sceneobjekter
	addLights();

	// Kamera, utgangsposisjon:
	ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	ri.camera.position.x = cc.init[0].x;
	ri.camera.position.y = cc.init[0].y;
	ri.camera.position.z = cc.init[0].z;

	// Set up camera timeline
	// ri.cameraTimeline = gsap.timeline();

	// Audio
	ri.listener = new THREE.AudioListener();
	ri.camera.add( ri.listener );
	ri.sound = new THREE.Audio( ri.listener );
	ri.audioLoader = new THREE.AudioLoader();
	ri.audioLoader.load( './sounds/wandering.mp3', function( buffer ) {
		ri.sound.setBuffer( buffer );
		ri.sound.setLoop( true );
		ri.sound.setVolume( 0.5 );
		// Play is activated in script.js/animate()
		// ri.sound.play()
		});

	const soundFolder = ri.lilGui.addFolder('Sound');
	soundFolder.add(ri, 'musicIsOn').name("Music").listen();
	soundFolder.add(ri, 'soundEffectsIsOn').name("Effects").listen();

	// Controls:
	ri.controls = new OrbitControls(ri.camera, ri.renderer.domElement);
	ri.controls.addEventListener( 'change', renderScene);
	ri.controls.target.x = cc.init[0].tx;
	ri.controls.target.y = cc.init[0].ty;
	ri.controls.target.z = cc.init[0].tz;

	// RI-controls for timeline-toggle:
	const timelineFolder = ri.lilGui.addFolder('Kamera');
	timelineFolder.add(ri, 'timelineToggle').name("Timeline").listen();
}

export function createCameraTimeline(cameraPositions) {
	cameraTimeline(cameraPositions);
	controlsTimeline(cameraPositions);
};

function cameraTimeline(cameraPositions) {
	
	if (ri.cameraTimeline.camt != undefined) {ri.cameraTimeline.camt.kill();}
	if (!ri.timelineToggle) {return;};
	ri.cameraTimeline.camt = gsap.timeline();
	gsap.registerPlugin(CustomEase);

	cameraPositions.forEach((position, index) => {
			ri.cameraTimeline.camt.to(ri.camera.position, {
			duration: position.d / ri.speed, // Duration of the animation in seconds
			x: position.x,
			y: position.y,
			z: position.z,
			// ease: CustomEase.create("custom", "M0,0 C0.321,0.114 0.472,0.455 0.496,0.496 0.574,0.63 0.731,0.93 1,1"), // Easing function
			ease: "power1.inOut", // Easing function
		});
	});

	// Start the camera positions timeline
	ri.cameraTimeline.camt.play();
}
function controlsTimeline(cameraPositions) {
	
	if (ri.cameraTimeline.cont != undefined) {ri.cameraTimeline.cont.kill();}
	if (!ri.timelineToggle) {return;};
	ri.cameraTimeline.cont = gsap.timeline();
	gsap.registerPlugin(CustomEase);

	cameraPositions.forEach((position, index) => {
			ri.cameraTimeline.cont.to(ri.controls.target, {
			duration: position.d / ri.speed, // Duration of the animation in seconds
			x: position.tx,
			y: position.ty,
			z: position.tz,
			// ease: CustomEase.create("custom", "M0,0 C0.453,0.131 0.418,0.818 1,0.986 "), // Easing function
			ease: "power1.inOut", // Easing function
			onUpdate: () => {
				ri.camera.lookAt(ri.controls.target);
				ri.controls.update();
			}
		});
	});

	// Start the camera positions timeline
	ri.cameraTimeline.cont.play();
}

export function playAudioOnce(audioFile, setVolume=0.5, pitch=1) {
	if (ri.soundEffectsIsOn === false) {return;}
	const listener = new THREE.AudioListener();
	ri.camera.add( listener );
	const sound = new THREE.Audio( listener );
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load( audioFile, function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( false );
		sound.setVolume( setVolume );
		sound.setPlaybackRate(pitch);
		sound.play()
	});
}

export function addLights() {
	// Ambient:
	let ambientLight1 = new THREE.AmbientLight(0xffffff, 0.2);
	ambientLight1.visible = true;
	ri.scene.add(ambientLight1);

	const ambientFolder = ri.lilGui.addFolder( 'Ambient Light' );
	ambientFolder.add(ambientLight1, 'visible').name("On/Off");
	ambientFolder.add(ambientLight1, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	ambientFolder.addColor(ambientLight1, 'color').name("Color");


	//** RETNINGSORIENTERT LYS (som gir skygge):
	let directionalLight = new THREE.DirectionalLight(0xffffff, 1);
	directionalLight.visible = true;
	directionalLight.position.set(15, 50, 50);

	// Viser lyskilden:
	const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, 10, 0xff0000);
	directionalLightHelper.visible = false;
	ri.scene.add(directionalLightHelper);
	directionalLight.castShadow = true;     //Merk!
	directionalLight.shadow.mapSize.width = 1024;
	directionalLight.shadow.mapSize.height = 1024;
	directionalLight.shadow.camera.near = 5;
	directionalLight.shadow.camera.far = 110;
	directionalLight.shadow.camera.left = -50;
	directionalLight.shadow.camera.right = 50;
	directionalLight.shadow.camera.top = 50;
	directionalLight.shadow.camera.bottom = -50;
	directionalLight.shadow.bias = -0.005;  //NB! Viktig for å unngå artefakter pga. "Peter Panning"
	ri.scene.add(directionalLight);

	// Viser lyskildekamera (hva lyskilden "ser")
	const directionalLightCameraHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
	directionalLightCameraHelper.visible = false;
	ri.scene.add(directionalLightCameraHelper);

	// lil-gui:
	const directionalFolder = ri.lilGui.addFolder( 'Directional Light' );
	directionalFolder.add(directionalLight, 'visible').name("On/Off");
	directionalFolder.add(directionalLight, 'intensity').min(0).max(1).step(0.01).name("Intensity");
	directionalFolder.addColor(directionalLight, 'color').name("Color");
}

//Sjekker tastaturet:
export function handleKeys(delta) {

	printCameraPosition();
	
	// Gir impuls til kula i kanonen:
	const startMessage = document.querySelector(".start-message");
	if (ri.currentlyPressedKeys['KeyS'] && ri.gameIsStarted && ri.activator === false) {
		startMessage.classList.toggle("hide")	
		createParticles({x: 18, y: 0.5, z: -12}, "canon_particles");
		ri.activator = true
		createCameraTimeline(cc.canon_fire)
	}	


	if (ri.currentlyPressedKeys['KeyK']) {
		ri.timelineToggle = !ri.timelineToggle;
		ri.currentlyPressedKeys['KeyK'] = false;
		if (ri.timelineToggle === false) {
			ri.cameraTimeline.camt.kill();
			ri.cameraTimeline.cont.kill();
		};
	}
}

export function onWindowResize() {
	ri.camera.aspect = window.innerWidth / window.innerHeight;
	ri.camera.updateProjectionMatrix();
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	renderScene();
}

export function updateThree(deltaTime) {
	// Endre linje posisjon:
	const lineMeshStartPoint = ri.scene.getObjectByName("anchorBoxMesh");
	const lineMeshEndPoint = ri.scene.getObjectByName("WreckingBall");
	const line = ri.scene.getObjectByName("pendulumLineMesh");

	const lineVertexPositions = line.geometry.attributes.position.array;

	const lineStartPos = new THREE.Vector3();
	lineMeshStartPoint.getWorldPosition(lineStartPos);
	lineVertexPositions[0] = lineStartPos.x;
	lineVertexPositions[1] = lineStartPos.y;
	lineVertexPositions[2] = lineStartPos.z;

	const lineEndPos = new THREE.Vector3();
	lineMeshEndPoint.getWorldPosition(lineEndPos);
	lineVertexPositions[3] = lineEndPos.x;
	lineVertexPositions[4] = lineEndPos.y;
	lineVertexPositions[5] = lineEndPos.z;
	
	line.geometry.attributes.position.needsUpdate = true;
	line.geometry.computeBoundingBox();
	line.geometry.computeBoundingSphere();

	//Oppdater trackball-kontrollen:
	ri.controls.update();
}

export function addMeshToScene(mesh) {
	ri.scene.add(mesh);
}

export function renderScene()
{
	ri.renderer.render(ri.scene, ri.camera);
}

export function getRigidBodyFromMesh(meshName) {
	const mesh = ri.scene.getObjectByName(meshName);
	if (mesh)
		return mesh.userData.physicsBody;
	else
		return null;
}


export function printCameraPosition() {
    const cameraPosition = ri.camera.position;
    const coordinatesText = 
		`Camera Position: x: ${cameraPosition.x.toFixed(2)}, y: ${cameraPosition.y.toFixed(2)}, z: ${cameraPosition.z.toFixed(2)}` +
		`,  tx: ${ri.controls.target.x.toFixed(2)}, ty: ${ri.controls.target.y.toFixed(2)}, tz: ${ri.controls.target.z.toFixed(2)}`;
    document.getElementById('coordinatesText').textContent = coordinatesText;
}