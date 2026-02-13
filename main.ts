"use strict";

import { Object3D } from 'node_modules/@types/three/build/three.cjs';
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  MeshNormalMaterial,
  AmbientLight,
  Clock,
  Color,
  MeshStandardMaterial
} from 'three';


import {
  OrbitControls
} from 'three/addons/controls/OrbitControls.js';

import {
  GLTF,
  GLTFLoader
} from 'three/addons/loaders/GLTFLoader.js';



// INSERT CODE HERE

const scene = new Scene();

const aspect = window.innerWidth / window.innerHeight;
const camera = new PerspectiveCamera(75, aspect, 0.1, 1000);

const light = new AmbientLight(0xffffff, 3.0); // soft white light
scene.add(light);
scene.background = new Color('lightgray');

const renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional

let plateau: Object3D | null;
let plateau_mesh: Mesh;
const clock = new Clock();

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('vinyl_player.glb', gltfReader);
}

function gltfReader(gltf: GLTF) {
  let testModel = null;

  testModel = gltf.scene;

  if (testModel != null) {
    console.log("Model loaded: " + testModel);
    scene.add(gltf.scene);
    plateau_mesh = scene.getObjectByName('pCylinder2_dit2_0') as Mesh;
    let plateau_material = plateau_mesh.material as MeshStandardMaterial
    plateau_material.wireframe = true;
    plateau = plateau_mesh?.parent;


  } else {
    console.log("Load FAILED.  ");
  }
}

loadData();


camera.position.z = 3;



// Main loop
const animation = () => {

  renderer.setAnimationLoop(animation); // requestAnimationFrame() replacement, compatible with XR 
  // plateau?.rotateY(45);
  renderer.render(scene, camera);
};

animation();

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();



  renderer.setSize(window.innerWidth, window.innerHeight);

}
