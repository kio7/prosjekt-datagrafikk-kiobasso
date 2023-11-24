import {ri} from './script.js'
import { createCameraTimeline } from './myThreeHelper';
import { cameraCoordinates as cc } from './cameraCoord.js';
import Stats from 'stats.js';


export function loadScreenElements() {
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

	// Create playerMessage
	const startMessage = document.createElement("div");
	startMessage.className = "start-message";
	startMessage.innerHTML = "PRESS SPACE TO BEGIN"
	startMessage.classList.toggle("hide");
	document.body.appendChild(startMessage);

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
        const startButton = document.querySelector(".startButton")
        const guiContainer = document.querySelector(".gui-container");
        startButtonContainer.classList.toggle("hide");
        guiContainer.classList.toggle("hide");
        startMessage.classList.toggle("hide")
        ri.gameIsStarted = true;
        startButton.remove()
        // Load new movement
        createCameraTimeline(cc.canon);
    }

    // Create checkboxes for sound and camera movement:
	const soundCheckbox = document.createElement("input");
	soundCheckbox.type = "checkbox";
	soundCheckbox.id = "soundCheckbox";
	soundCheckbox.checked = true;
	soundCheckbox.className = "soundCheckbox";
	startButtonContainer.appendChild(soundCheckbox);
	
	const soundCheckboxLabel = document.createElement("label");
	soundCheckboxLabel.htmlFor = "soundCheckbox";
	soundCheckboxLabel.className = "soundCheckboxLabel";
	soundCheckboxLabel.innerHTML = "Sound";
	startButtonContainer.appendChild(soundCheckboxLabel);

    soundCheckbox.addEventListener("change", function() {
        const soundCheckbox = document.getElementById("soundCheckbox");
        const videoSound = document.getElementById("video");
        if (soundCheckbox.checked === true) {
            ri.sound.play()
            ri.soundOn = true;
            videoSound.muted = false;
        } else {
            ri.soundOn = false;
            ri.sound.stop()
            videoSound.muted = true;
        }
        });

	const cameraMovementCheckbox = document.createElement("input");
	cameraMovementCheckbox.type = "checkbox";
	cameraMovementCheckbox.id = "cameraMovementCheckbox";
	cameraMovementCheckbox.checked = true;
	cameraMovementCheckbox.className = "cameraMovementCheckbox";
	startButtonContainer.appendChild(cameraMovementCheckbox);

	const cameraMovementCheckboxLabel = document.createElement("label");
	cameraMovementCheckboxLabel.htmlFor = "cameraMovementCheckbox";
	cameraMovementCheckboxLabel.className = "cameraMovementCheckboxLabel";
	cameraMovementCheckboxLabel.innerHTML = "Camera movement";
	startButtonContainer.appendChild(cameraMovementCheckboxLabel);
    
    cameraMovementCheckbox.addEventListener("change", function() {
        const cameraMovementCheckbox = document.getElementById("cameraMovementCheckbox");
        if (cameraMovementCheckbox.checked === true) {
            ri.timelineToggle = true;
        } else {
            ri.timelineToggle = false;
        }
        });
}


