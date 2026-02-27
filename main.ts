"use strict";
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Object3D,
  Vector2,
  AmbientLight,
  Clock,
  Color,
  Raycaster,
  MeshStandardMaterial,
  Mesh,
  GridHelper
} from 'three';
import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';
import {
  GLTF,
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';

import { Turntable } from './turntable';
import { onButtonHover, onButtonUnhover, onButtonRelease, onButtonPressAndRelease } from './buttons';

const raycaster = new Raycaster();
const pointer = new Vector2();
const scene = new Scene();
const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

const light = new AmbientLight(0xffffff, 3.0);
scene.add(light);
scene.background = new Color('lightgray');

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.enableDamping = true;

// Grille
const gridHelper = new GridHelper(10, 10);
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.3;
scene.add(gridHelper);

// Info overlay
const infoDiv = document.createElement('div');
infoDiv.style.position = 'absolute';
infoDiv.style.top = '10px';
infoDiv.style.right = '10px';
infoDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
infoDiv.style.color = 'white';
infoDiv.style.padding = '10px';
infoDiv.style.fontFamily = 'monospace';
infoDiv.style.fontSize = '12px';
infoDiv.style.borderRadius = '5px';
document.body.appendChild(infoDiv);

let plateau: Object3D | null;
let plateau_mesh: Mesh;
let powerButtonMesh: Mesh;
let button33Mesh: Mesh;
let button45Mesh: Mesh;
let volumeSliderMesh: Mesh;
let INTERSECTED: Mesh | null = null;

const clock = new Clock();

// Instance de la platine
let turntable: Turntable;

// État d'interaction
let pressedButton: Mesh | null = null;
let hoveredButton: Mesh | null = null;
let isDraggingSlider: boolean = false;

// Map des boutons et leurs actions
const buttonActions = new Map<Mesh, () => void>();

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('v2.glb', gltfReader);
}

// Change les noms des meshes dans gltfReader
function gltfReader(gltf: GLTF) {
  let testModel = null;
  testModel = gltf.scene;
  if (testModel != null) {
    console.log("Model loaded: " + testModel);
    scene.add(gltf.scene);
    
    // Récupération des meshes avec les bons noms
    plateau_mesh = scene.getObjectByName('platter') as Mesh;
    powerButtonMesh = scene.getObjectByName('powerButton') as Mesh;
    button33Mesh = scene.getObjectByName('speedSelector33') as Mesh;
    button45Mesh = scene.getObjectByName('speedSelector45') as Mesh;
    volumeSliderMesh = scene.getObjectByName('volumeSliderMesh') as Mesh;
    
    // Clone des matériaux pour chaque mesh
    [powerButtonMesh, button33Mesh, button45Mesh, volumeSliderMesh].forEach(mesh => {
      if (mesh && mesh.material) {
        mesh.material = (mesh.material as MeshStandardMaterial).clone();
      }
    });
    
    plateau = scene.getObjectByName('platter') as Object3D;

    // Ajoute ça :
if (plateau_mesh && plateau_mesh.material) {
  (plateau_mesh.material as MeshStandardMaterial).wireframe = true;
}

plateau?.traverse((child) => {
  if (child instanceof Mesh) {
    (child.material as MeshStandardMaterial).wireframe = true;
  }
});
    // Initialisation de la platine
    if (plateau) {
      turntable = new Turntable(plateau);
    }
    
    // Configuration des actions des boutons
    buttonActions.set(powerButtonMesh, () => turntable.togglePower());
    buttonActions.set(button33Mesh, () => turntable.setSpeed33());
    buttonActions.set(button45Mesh, () => turntable.setSpeed45());
    
    console.log('All components loaded');
  } else {
    console.log("Load FAILED.");
  }
}

loadData();

camera.position.z = 0;
camera.position.y = 2;
camera.position.x = 4;

camera.rotation.z = 80;
camera.rotation.y = 50;
camera.rotation.x = -80;

// Détection du bouton sous le pointeur
function getButtonUnderPointer(): Mesh | null {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const validIntersects = intersects.filter(i => i.object.type !== 'GridHelper');
  
  if (validIntersects.length > 0) {
    const clickedObject = validIntersects[0].object as Mesh;
    
    // Cherche dans tous les boutons
    for (const button of Array.from(buttonActions.keys())) {
      let current = clickedObject;
      while (current) {
        if (current === button) return button;
        current = current.parent as Mesh;
      }
    }
    
    // Vérifie aussi le slider
    if (volumeSliderMesh) {
      let current = clickedObject;
      while (current) {
        if (current === volumeSliderMesh) return volumeSliderMesh;
        current = current.parent as Mesh;
      }
    }
  }
  
  return null;
}

function onPointerMove(event: { clientX: number; clientY: number; }) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  
  // Gestion du slider en cours de drag
  if (isDraggingSlider && volumeSliderMesh && turntable) {
    const newVolume = Math.round(((pointer.y + 1) / 2) * 100);
    turntable.setVolume(newVolume);
    return;
  }
  
  // Détection du hover
  const foundButton = getButtonUnderPointer();
  
  if (foundButton && foundButton !== hoveredButton) {
    if (hoveredButton) onButtonUnhover(hoveredButton);
    hoveredButton = foundButton;
    onButtonHover(hoveredButton);
    renderer.domElement.style.cursor = 'pointer';
  } else if (!foundButton && hoveredButton) {
    onButtonUnhover(hoveredButton);
    hoveredButton = null;
    renderer.domElement.style.cursor = 'default';
  }
}
import { PointLight } from 'three';  // Ajoute dans les imports
import { Wireframe } from 'three/examples/jsm/Addons.js';

const topLight = new PointLight(0xffffff, 100);  // Intensité 50
topLight.position.set(0, 10, 0);
scene.add(topLight);

function onPointerDown() {
  const button = getButtonUnderPointer();
  
  if (button) {
    if (button === volumeSliderMesh) {
      isDraggingSlider = true;
    } else {
      // Animation d'enfoncement automatique avec rebond
      onButtonPressAndRelease(button, 500);
      
      // Exécute l'action immédiatement
      const action = buttonActions.get(button);
      if (action) action();
    }
  }
}

function onPointerUp() {
  isDraggingSlider = false;
}

function updateCameraInfo() {
  const pos = camera.position;
  const rot = camera.rotation;
  
  let stateInfo = '';
  if (turntable) {
    const state = turntable.getState();
    stateInfo = `<br><br><strong>Turntable</strong><br>
    Power: ${state.isPlaying ? 'ON' : 'OFF'}<br>
    Speed: ${state.speed} RPM<br>
    Volume: ${state.volume}%`;
  }
  
  infoDiv.innerHTML = `
    <strong>Camera Position</strong><br>
    x: ${pos.x.toFixed(2)}<br>
    y: ${pos.y.toFixed(2)}<br>
    z: ${pos.z.toFixed(2)}<br>
    <br>
    <strong>Camera Rotation</strong><br>
    x: ${(rot.x * 180 / Math.PI).toFixed(1)}°<br>
    y: ${(rot.y * 180 / Math.PI).toFixed(1)}°<br>
    z: ${(rot.z * 180 / Math.PI).toFixed(1)}°${stateInfo}
  `;
}

// Main loop
const animation = () => {
  renderer.setAnimationLoop(animation);
  
  const deltaTime = clock.getDelta();
  
  // Update de la platine
  if (turntable) {
    turntable.update(deltaTime);
  }
  
  updateCameraInfo();
  renderer.render(scene, camera);
}

animation();

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('mousedown', onPointerDown);
renderer.domElement.addEventListener('mouseup', onPointerUp);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
