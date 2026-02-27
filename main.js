"use strict";
import { PerspectiveCamera, Scene, WebGLRenderer, Vector2, AmbientLight, Clock, Color, Raycaster, GridHelper } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
var raycaster = new Raycaster();
var pointer = new Vector2();
var scene = new Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
var light = new AmbientLight(0xffffff, 3.0);
scene.add(light);
scene.background = new Color('lightgray');
var renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.listenToKeyEvents(window);
var controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.enableDamping = true; // optionnel mais recommandé
// Désactive temporairement pour tester
// controls.enabled = false;
// Grille
var gridHelper = new GridHelper(10, 10);
scene.add(gridHelper);
// Info overlay
var infoDiv = document.createElement('div');
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
var plateau;
var plateau_mesh;
var powerButtonMesh;
var INTERSECTED = null;
var clock = new Clock();
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
function gltfReader(gltf) {
    var testModel = null;
    testModel = gltf.scene;
    if (testModel != null) {
        console.log("Model loaded: " + testModel);
        scene.add(gltf.scene);
        plateau_mesh = scene.getObjectByName('platterMesh');
        powerButtonMesh = scene.getObjectByName('powerButtonMesh');
        // Clone le matériau pour avoir une instance unique
        if (powerButtonMesh.material) {
            powerButtonMesh.material = powerButtonMesh.material.clone();
        }
        var plateau_material = plateau_mesh.material;
        plateau = plateau_mesh === null || plateau_mesh === void 0 ? void 0 : plateau_mesh.parent;
    }
    else {
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
    var intersects = raycaster.intersectObjects(scene.children, true);
    // Filtre pour ignorer le GridHelper
    var validIntersects = intersects.filter(function (i) { return i.object.type !== 'GridHelper'; });
    if (validIntersects.length > 0) {
        var clickedObject = validIntersects[0].object;
        console.log('Clicked object name:', clickedObject.name);
        var current = clickedObject;
        while (current) {
            if (current === powerButtonMesh) {
                onPowerButtonClick(powerButtonMesh);
                break;
            }
            current = current.parent;
        }
    }
}
renderer.domElement.addEventListener('click', function (event) {
    onPointerClick();
});
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
function updateCameraInfo() {
    var pos = camera.position;
    var rot = camera.rotation;
    infoDiv.innerHTML = "\n    <strong>Camera Position</strong><br>\n    x: ".concat(pos.x.toFixed(2), "<br>\n    y: ").concat(pos.y.toFixed(2), "<br>\n    z: ").concat(pos.z.toFixed(2), "<br>\n    <br>\n    <strong>Camera Rotation</strong><br>\n    x: ").concat((rot.x * 180 / Math.PI).toFixed(1), "\u00B0<br>\n    y: ").concat((rot.y * 180 / Math.PI).toFixed(1), "\u00B0<br>\n    z: ").concat((rot.z * 180 / Math.PI).toFixed(1), "\u00B0\n  ");
}
// Main loop
var animation = function () {
    renderer.setAnimationLoop(animation);
    updateCameraInfo();
    renderer.render(scene, camera);
    raycaster.setFromCamera(pointer, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
};
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
//# sourceMappingURL=main.js.map