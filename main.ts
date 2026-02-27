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

// const controls = new OrbitControls(camera, renderer.domElement);
// controls.listenToKeyEvents(window);


const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.enableDamping = true; // optionnel mais recommandé

// Désactive temporairement pour tester
// controls.enabled = false;

// Grille
const gridHelper = new GridHelper(10, 10);
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
let INTERSECTED: Mesh | null = null;
const clock = new Clock();

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('v2.glb', gltfReader);
}

// function gltfReader(gltf: GLTF) {
//   let testModel = null;
//   testModel = gltf.scene;
//   if (testModel != null) {
//     console.log("Model loaded: " + testModel);
//     scene.add(gltf.scene);
//     plateau_mesh = scene.getObjectByName('platterMesh') as Mesh;
//     powerButtonMesh = scene.getObjectByName('powerButtonMesh') as Mesh;

// console.log('PowerButton found:', powerButtonMesh);
//     let plateau_material = plateau_mesh.material as MeshStandardMaterial;
//     plateau = plateau_mesh?.parent;
//   } else {
//     console.log("Load FAILED.");
//   }
// }


function gltfReader(gltf: GLTF) {
  let testModel = null;
  testModel = gltf.scene;
  if (testModel != null) {
    console.log("Model loaded: " + testModel);
    scene.add(gltf.scene);
    plateau_mesh = scene.getObjectByName('platterMesh') as Mesh;
    powerButtonMesh = scene.getObjectByName('powerButtonMesh') as Mesh;
    
    // Clone le matériau pour avoir une instance unique
    if (powerButtonMesh.material) {
      powerButtonMesh.material = (powerButtonMesh.material as MeshStandardMaterial).clone();
    }
    
    let plateau_material = plateau_mesh.material as MeshStandardMaterial;
    plateau = plateau_mesh?.parent;
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

import { onPowerButtonClick } from './buttons';
function onPointerClick() {

  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
  
  // Filtre pour ignorer le GridHelper
  const validIntersects = intersects.filter(i => i.object.type !== 'GridHelper');
  
  if (validIntersects.length > 0) {
    const clickedObject = validIntersects[0].object;
    console.log('Clicked object name:', clickedObject.name);
    
    let current: Object3D | null = clickedObject;
    while (current) {
      if (current === powerButtonMesh) {
        onPowerButtonClick(powerButtonMesh);
        break;
      }
      current = current.parent;
    }
  }
}
renderer.domElement.addEventListener('click', (event) => {
  onPointerClick();
});

function onPointerMove(event: { clientX: number; clientY: number; }) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function updateCameraInfo() {
  const pos = camera.position;
  const rot = camera.rotation;
  
  infoDiv.innerHTML = `
    <strong>Camera Position</strong><br>
    x: ${pos.x.toFixed(2)}<br>
    y: ${pos.y.toFixed(2)}<br>
    z: ${pos.z.toFixed(2)}<br>
    <br>
    <strong>Camera Rotation</strong><br>
    x: ${(rot.x * 180 / Math.PI).toFixed(1)}°<br>
    y: ${(rot.y * 180 / Math.PI).toFixed(1)}°<br>
    z: ${(rot.z * 180 / Math.PI).toFixed(1)}°
  `;
}

// Main loop
const animation = () => {
  renderer.setAnimationLoop(animation);
  updateCameraInfo();
  renderer.render(scene, camera);
  raycaster.setFromCamera(pointer, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);
}

animation();

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointermove', onPointerMove);
// window.addEventListener('click', onPointerClick);
renderer.domElement.addEventListener('click', onPointerClick);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}