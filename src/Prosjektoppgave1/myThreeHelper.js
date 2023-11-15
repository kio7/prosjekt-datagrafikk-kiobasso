import * as THREE from "three";
import GUI from "lil-gui";
import {applyImpulse, moveRigidBody} from "./myAmmoHelper.js";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {ri} from "./script.js";
import {gsap} from "gsap";

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
	// ri.renderer.shadowMap.type = THREE.VSMShadowMap;
	// ri.renderer.shadowMap.type = THREE.BasicShadowMap;

	// Scene
	ri.scene = new THREE.Scene();
	ri.scene.background = new THREE.Color( 0x000000 );

	// lil-gui kontroller:
	ri.lilGui = new GUI();

	// Sceneobjekter
	addLights();

	// Kamera:
	ri.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
	ri.camera.position.x = -9;
	ri.camera.position.y = 18;
	ri.camera.position.z = -4;

	// Create the camera positions timeline
	// const cameraPositions = [
	// 	{ x: 290, y: 90, z: 80 },
	// 	// Add more camera positions as needed
	// ];

	// const cameraTimeline = gsap.timeline();

	// cameraPositions.forEach((position, index) => {
	// 	cameraTimeline.to(ri.camera.position, {
	// 	duration: 50, // Duration of the animation in seconds
	// 	x: position.x,
	// 	y: position.y,
	// 	z: position.z,
	// 	ease: 'power1.inOut', // Easing function
	// 	onStart: () => {
	// 		// This function will be called when the animation starts for each position
	// 		console.log(`Animating to camera position ${index + 1}`);
	// 	},
	// 	onComplete: () => {
	// 		// This function will be called when the animation completes for each position
	// 		console.log(`Animation to camera position ${index + 1} complete`);
	// 	},
	// 	});
	// });

	// Start the camera positions timeline
  	// cameraTimeline.play();



    

	// Audio
	const listener = new THREE.AudioListener();
	ri.camera.add( listener );
	const sound = new THREE.Audio( listener );
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load( './sounds/wandering.mp3', function( buffer ) {
		sound.setBuffer( buffer );
		sound.setLoop( true );
		sound.setVolume( 0.5 );
		sound.play()
		});

	const soundFolder = ri.lilGui.addFolder({title: 'Sound', open: false});
	soundFolder.add(sound, 'play').name("Play");
	soundFolder.add(sound, 'pause').name("Pause");

	// Controls:
	ri.controls = new OrbitControls(ri.camera, ri.renderer.domElement);
	ri.controls.addEventListener( 'change', renderScene);
}

export function playAudioOnce(audioFile, setVolume=0.5, pitch=1) {
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

	const ambientFolder = ri.lilGui.addFolder({title: 'Ambient Light', open: false});
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
	const activator = ri.scene.getObjectByName("marble");
	if (ri.currentlyPressedKeys['KeyS']) {
		ri.activator = true
	}	
}

export function onWindowResize() {
	ri.camera.aspect = window.innerWidth / window.innerHeight;
	ri.camera.updateProjectionMatrix();
	ri.renderer.setSize(window.innerWidth, window.innerHeight);
	ri.controls.handleResize();
	renderScene();
}

//Oppdater trackball-kontrollen:
export function updateThree(deltaTime) {ri.controls.update();}
// Legger mesh til scene
export function addMeshToScene(mesh) {ri.scene.add(mesh);}
// Rendrer scenen:
export function renderScene() {ri.renderer.render(ri.scene, ri.camera);}

export function getRigidBodyFromMesh(meshName) {
	const mesh = ri.scene.getObjectByName(meshName);
	if (mesh)
		return mesh.userData.physicsBody;
	else
		return null;
}


export function printCameraPosition() {
    const cameraPosition = ri.camera.position;
    const coordinatesText = `Camera Position: x: ${cameraPosition.x.toFixed(2)}, y: ${cameraPosition.y.toFixed(2)}, z: ${cameraPosition.z.toFixed(2)}`;
    document.getElementById('coordinatesText').textContent = coordinatesText;
}