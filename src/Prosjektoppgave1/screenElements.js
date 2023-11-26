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

	// create resetbutton and add to gui-container:
	const resetButton = document.createElement("button");
	resetButton.className = "settings";
	resetButton.id = "resetButton";
	resetButton.innerHTML = "RESET";
	// add onclick that loads an href to the page:
	resetButton.onclick = function() {
		window.location.href = "index.html";
	}
	guiContainer.appendChild(resetButton);
	

	// Create playerMessage
	const startMessage = document.createElement("div");
	startMessage.className = "start-message";
	startMessage.innerHTML = "PRESS 'S' TO SHOOT!"
	startMessage.classList.toggle("hide");
	document.body.appendChild(startMessage);

	// Create startbutton and startbutton container:
	const startButtonContainer = document.createElement("div");
	startButtonContainer.className = "startButtonContainer";
	startButtonContainer.id = "startButtonContainer";
	document.body.appendChild(startButtonContainer);

	// Create startbutton and startbutton container:
	const startButtonBorder = document.createElement("div");
	startButtonBorder.className = "startButtonBorder";
	startButtonBorder.id = "startButtonBorder";
	startButtonContainer.appendChild(startButtonBorder);

	const startButton = document.createElement("button");
	startButton.className = "startButton";
	startButton.id = "startButton";
	startButton.innerHTML = "START!";
	startButtonBorder.appendChild(startButton);

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
	// Music checkbox:
	const soundCheckboxLabel = document.createElement("label");
	soundCheckboxLabel.htmlFor = "soundCheckbox";
	soundCheckboxLabel.className = "checkbox-label";
	soundCheckboxLabel.innerHTML = "Music";
	startButtonBorder.appendChild(soundCheckboxLabel);

	const soundCheckbox = document.createElement("input");
	soundCheckbox.type = "checkbox";
	soundCheckbox.id = "soundCheckbox";
	soundCheckbox.checked = false;
	soundCheckbox.className = "checkbox";
	startButtonBorder.appendChild(soundCheckbox);
	
    soundCheckbox.addEventListener("change", function() {
        const soundCheckbox = document.getElementById("soundCheckbox");
        if (soundCheckbox.checked === true) {
            ri.musicIsOn = true;
        } else {
            ri.musicIsOn = false;
        }
        });

	// Sound effects checkbox:
	const soundEffectsCheckboxLabel = document.createElement("label");
	soundEffectsCheckboxLabel.htmlFor = "soundEffectsCheckbox";
	soundEffectsCheckboxLabel.className = "checkbox-label";
	soundEffectsCheckboxLabel.innerHTML = "Effects";
	startButtonBorder.appendChild(soundEffectsCheckboxLabel);

	const soundEffectsCheckbox = document.createElement("input");
	soundEffectsCheckbox.type = "checkbox";
	soundEffectsCheckbox.id = "soundEffectsCheckbox";
	soundEffectsCheckbox.checked = true;
	soundEffectsCheckbox.className = "checkbox";
	startButtonBorder.appendChild(soundEffectsCheckbox);
	

    soundEffectsCheckbox.addEventListener("change", function() {
        const soundEffectsCheckbox = document.getElementById("soundEffectsCheckbox");
        if (soundEffectsCheckbox.checked === true) {
            ri.soundEffectsIsOn = true;
        } else {
            ri.soundEffectsIsOn = false;
        }
        });

	// Camera movement checkbox:
	const cameraMovementCheckboxLabel = document.createElement("label");
	cameraMovementCheckboxLabel.htmlFor = "cameraMovementCheckbox";
	cameraMovementCheckboxLabel.className = "checkbox-label";
	cameraMovementCheckboxLabel.innerHTML = "AutoCamera";
	startButtonBorder.appendChild(cameraMovementCheckboxLabel);

	const cameraMovementCheckbox = document.createElement("input");
	cameraMovementCheckbox.type = "checkbox";
	cameraMovementCheckbox.id = "cameraMovementCheckbox";
	cameraMovementCheckbox.checked = true;
	cameraMovementCheckbox.className = "checkbox";
	startButtonBorder.appendChild(cameraMovementCheckbox);

    cameraMovementCheckbox.addEventListener("change", function() {
        const cameraMovementCheckbox = document.getElementById("cameraMovementCheckbox");
        if (cameraMovementCheckbox.checked === true) {
            ri.timelineToggle = true;
        } else {
            ri.timelineToggle = false;
        }
        });


	// Legger til video:
	const video = document.createElement("video");
	video.id = "video";
	video.playsInline = true;
	video.loop = true;
	video.src = "./videos/video.mp4";
	video.style.display = "none";
	document.body.appendChild(video);
}

// Brukes i threeAmmoPendulum.js
export function addProgressBar() {
	const progressBarWrapper = document.createElement("div");
	progressBarWrapper.className = "progressbar-wrapper";
	progressBarWrapper.id = "progressbar-wrapper";
	document.body.appendChild(progressBarWrapper);

	const progressBar = document.createElement("span");
	progressBar.className = "progressbar";
	progressBar.id = "progressbar";
	progressBarWrapper.appendChild(progressBar);
}
