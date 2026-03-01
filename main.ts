"use strict";
import {
  PerspectiveCamera, Scene, WebGLRenderer, Object3D,
  Vector2, Vector3, AmbientLight, Clock, Color,
  Raycaster, MeshStandardMaterial, Mesh, GridHelper, PointLight
} from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTF, GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

import { Turntable } from './turntable';
import { onButtonHover, onButtonUnhover, onButtonPressAndRelease } from './buttons';
import { VinylSelector } from './vinylSelector';
import { albums } from './album';
import { VinylDisc } from './vinylDisc';

const raycaster = new Raycaster();
const pointer = new Vector2();
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

scene.add(new AmbientLight(0xffffff, 3.0));
scene.background = new Color('lightgray');

const topLight = new PointLight(0xffffff, 100);
topLight.position.set(0, 10, 0);
scene.add(topLight);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableZoom = true;
controls.zoomSpeed = 0.5;
controls.enableRotate = true;
controls.rotateSpeed = 0.5;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 10;
controls.maxPolarAngle = Math.PI / 2;
controls.enableDamping = false;
controls.dampingFactor = 0.05;



const infoDiv = document.createElement('div');
infoDiv.style.cssText = `
  position: absolute; top: 10px; right: 10px;
  background: rgba(0,0,0,0.7); color: white;
  padding: 10px; font-family: monospace;
  font-size: 12px; border-radius: 5px;
`;
document.body.appendChild(infoDiv);

let plateau: Object3D;
let plateau_mesh: Mesh;
let powerButtonMesh: Mesh;
let button33Mesh: Mesh;
let button45Mesh: Mesh;
let volumeSliderMesh: Mesh;
let vinylDisc: VinylDisc;
let turntable: Turntable;
let vinylSelector: VinylSelector;
let hoveredButton: Mesh | null = null;
let isDraggingSlider = false;


// Lumières d'ambiance colorées
const warmLight = new PointLight(0xff6633, 2, 8);  // orange chaud
warmLight.position.set(-2, 2, -1);
scene.add(warmLight);

const coolLight = new PointLight(0x3366ff, 1.5, 8); // bleu froid
coolLight.position.set(2, 1.5, 2);
scene.add(coolLight);

const vinylLight = new PointLight(0xff0066, 0, 3); // rose — s'allume quand musique joue
vinylLight.position.set(0, 0.5, 0); // au dessus de la platine
scene.add(vinylLight);
const buttonActions = new Map<Mesh, () => void>();
const clock = new Clock();

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
  const plateauPos = new Vector3();
  plateau.getWorldPosition(plateauPos);
  console.log('plateauPos Y:', plateauPos.y);
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
  console.log('platter scale:', plateau.scale);
  console.log('platter parent scale:', plateau.parent?.scale);
  // --- Tapis --- 
  const carpet = scene.getObjectByName('Carpet__0');
  if (carpet && 'material' in carpet) {
    (carpet as any).material.color.set(0x6b7a8d);
  }


  // --- Box ---

  const box = scene.getObjectByName('box') as Object3D;
  if (box) {
    box.position.y += 0.1;
  }
  // --- Bras ---
  const armBase = scene.getObjectByName('armBase') as Object3D;
  const armBase3 = scene.getObjectByName('armBase3') as Object3D;
  const arm = scene.getObjectByName('arm') as Object3D;
  const armEnd = scene.getObjectByName('armEnd') as Object3D;
  const needle = scene.getObjectByName('needle') as Object3D;

  const armPivot = new Object3D();
  armBase.getWorldPosition(armPivot.position);
  armBase.getWorldQuaternion(armPivot.quaternion);
  scene.add(armPivot);

  [armBase3, arm, armEnd, needle].forEach(obj => {
    if (obj) armPivot.attach(obj);
  });

  // --- Turntable & VinylDisc ---
  turntable = new Turntable(plateau, armPivot);
  vinylDisc = new VinylDisc();
  turntable.setVinylLight(vinylLight);
  // --- VinylSelector ---
  vinylSelector = new VinylSelector(scene, camera, plateau, albums, turntable, vinylDisc);

  // --- Actions boutons ---
  buttonActions.set(powerButtonMesh, () => turntable.togglePower());
  buttonActions.set(button33Mesh, () => turntable.setSpeed33());
  buttonActions.set(button45Mesh, () => turntable.setSpeed45());

  (window as any).armPivot = armPivot;
  (window as any).turntable = turntable;
  (window as any).camera = camera;
  (window as any).controls = controls;
  (window as any).vinylDisc = vinylDisc;

  console.log('All components loaded');
}

loadData();
camera.position.set(0, 2, 4);

function getButtonUnderPointer(): Mesh | null {
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  const validIntersects = intersects.filter(i => i.object.type !== 'GridHelper');

  if (validIntersects.length > 0) {
    const clickedObject = validIntersects[0].object as Mesh;

    for (const button of Array.from(buttonActions.keys())) {
      let current: any = clickedObject;
      while (current) {
        if (current === button) return button;
        current = current.parent;
      }
    }

    if (volumeSliderMesh) {
      let current: any = clickedObject;
      while (current) {
        if (current === volumeSliderMesh) return volumeSliderMesh;
        current = current.parent;
      }
    }
  }
  return null;
}

function onPointerMove(event: { clientX: number; clientY: number }) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  if (isDraggingSlider && turntable) {
    const newVolume = Math.round(((pointer.y + 1) / 2) * 100);
    turntable.setVolume(newVolume);
    return;
  }

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

function onPointerDown() {
  raycaster.setFromCamera(pointer, camera);
  const button = getButtonUnderPointer();

  if (vinylSelector) vinylSelector.onPointerDown(raycaster);

  if (button) {
    if (button === volumeSliderMesh) {
      isDraggingSlider = true;
    } else {
      onButtonPressAndRelease(button, 500);
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
    <strong>Camera</strong><br>
    x: ${pos.x.toFixed(2)} y: ${pos.y.toFixed(2)} z: ${pos.z.toFixed(2)}<br>
    rx: ${(rot.x * 180 / Math.PI).toFixed(1)}°
    ry: ${(rot.y * 180 / Math.PI).toFixed(1)}°
    rz: ${(rot.z * 180 / Math.PI).toFixed(1)}°
    ${stateInfo}
  `;
}
let time = 0;
const animation = () => {
  renderer.setAnimationLoop(animation);
  TWEEN.update();
  const deltaTime = clock.getDelta();
  time += deltaTime;

  // Légère oscillation des lumières
  warmLight.intensity = 2 + Math.sin(time * 0.7) * 0.3;
  coolLight.intensity = 1.5 + Math.sin(time * 0.5 + 1) * 0.2;

  controls.update();
  if (turntable) turntable.update(deltaTime);
  if (vinylDisc && turntable) vinylDisc.update(deltaTime, turntable.getState().speed);
  updateCameraInfo();
  renderer.render(scene, camera);
};
animation();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('mousedown', onPointerDown);
window.addEventListener('mouseup', onPointerUp);