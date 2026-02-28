"use strict";
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  Object3D,
  Vector2,
  Vector3,
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
import { VinylSelector } from './vinylSelector';
import { albums } from './album';
import { VinylDisc } from './vinylDisc';

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
let vinylDisc: VinylDisc;
const clock = new Clock();

// Instance de la platine
let turntable: Turntable;

// Vinyl selector instance
let vinylSelector: VinylSelector;

// État d'interaction
let pressedButton: Mesh | null = null;
let hoveredButton: Mesh | null = null;
let isDraggingSlider: boolean = false;

// Map des boutons et leurs actions
const buttonActions = new Map<Mesh, () => void>();

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('chambre.glb', gltfReader);




}

function gltfReader(gltf: GLTF) {
  const testModel = gltf.scene;
  if (!testModel) { console.log("Load FAILED."); return; }

  scene.add(gltf.scene);
  gltf.scene.updateMatrixWorld(true);

  // --- Plateau ---
  plateau = scene.getObjectByName('platter') as Object3D;
  plateau_mesh = scene.getObjectByName('platterMesh') as Mesh;
  if (plateau_mesh?.material) {
    (plateau_mesh.material as MeshStandardMaterial).wireframe = true;
  }


  // --- Vinyles ---
  vinylSelector = new VinylSelector(scene, camera, plateau, albums);
  (window as any).vinylSelector = vinylSelector;



  // --- Boutons ---
  powerButtonMesh = scene.getObjectByName('powerButtonMesh') as Mesh;
  button33Mesh = scene.getObjectByName('speedSelector33Mesh') as Mesh;
  button45Mesh = scene.getObjectByName('speedSelector45Mesh') as Mesh;
  volumeSliderMesh = scene.getObjectByName('volumeButtonMesh') as Mesh;

  [powerButtonMesh, button33Mesh, button45Mesh, volumeSliderMesh].forEach(mesh => {
    if (mesh?.material) {
      mesh.material = (mesh.material as MeshStandardMaterial).clone();
    }
  });

  // --- Bras ---
  const armBase = scene.getObjectByName('armBase') as Object3D;
  const armBase3 = scene.getObjectByName('armBase3') as Object3D;
  const arm = scene.getObjectByName('arm') as Object3D;
  const armEnd = scene.getObjectByName('armEnd') as Object3D;
  const needle = scene.getObjectByName('needle') as Object3D;

  // Pivot centré sur armBase, aligné sur son axe Y
  const armPivot = new Object3D();
  armBase.getWorldPosition(armPivot.position);
  armBase.getWorldQuaternion(armPivot.quaternion);
  scene.add(armPivot);

  // Attache les éléments qui doivent tourner
  [armBase3, arm, armEnd, needle].forEach(obj => {
    if (obj) armPivot.attach(obj);
  });


  vinylDisc = new VinylDisc();

  // --- Turntable ---
  if (plateau) {
    turntable = new Turntable(plateau, armPivot);
  }
  scene.traverse(o => { if (o.name) console.log(o.name, o.type) });
  // --- Actions boutons ---
  buttonActions.set(powerButtonMesh, () => turntable.togglePower());
  buttonActions.set(button33Mesh, () => turntable.setSpeed33());
  buttonActions.set(button45Mesh, () => turntable.setSpeed45());

  // Debug
  (window as any).armPivot = armPivot;
  (window as any).turntable = turntable;
  (window as any).camera = camera;
  (window as any).controls = controls;


  console.log('All components loaded');

}

loadData();

camera.position.z = -5;
camera.position.y = 0;
camera.position.x = 0;

camera.rotation.z = -90;
camera.rotation.y = -83;
camera.rotation.x = -90;

// Détection du bouton sous le pointeur
function getButtonUnderPointer(): Mesh | null {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const validIntersects = intersects.filter(i => i.object.type !== 'GridHelper');

  buttonActions.set(powerButtonMesh, () => turntable.togglePower());
  buttonActions.set(button33Mesh, () => turntable.setSpeed33());
  buttonActions.set(button45Mesh, () => turntable.setSpeed45());

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
  if (vinylSelector) vinylSelector.onPointerMove(raycaster);

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


const topLight = new PointLight(0xffffff, 100);  // Intensité 50
topLight.position.set(0, 10, 0);
scene.add(topLight);

function onPointerDown() {
  const button = getButtonUnderPointer();
  console.log('clicked:', button?.name);
  if (vinylSelector) vinylSelector.onPointerDown(raycaster, plateau_mesh);
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
  if (vinylSelector) vinylSelector.update(deltaTime);
  updateCameraInfo();
  renderer.render(scene, camera);
}

animation();

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mouseup', () => vinylSelector?.onPointerUp(raycaster, plateau_mesh, turntable, vinylDisc));
renderer.domElement.addEventListener('mousedown', onPointerDown);
renderer.domElement.addEventListener('mouseup', onPointerUp);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
