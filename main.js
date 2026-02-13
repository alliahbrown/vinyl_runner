"use strict";
import { PerspectiveCamera, Scene, WebGLRenderer, AmbientLight, Clock, Color } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// INSERT CODE HERE
var scene = new Scene();
var aspect = window.innerWidth / window.innerHeight;
var camera = new PerspectiveCamera(75, aspect, 0.1, 1000);
var light = new AmbientLight(0xffffff, 3.0); // soft white light
scene.add(light);
scene.background = new Color('lightgray');
var renderer = new WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window); // optional
var plateau;
var plateau_mesh;
var clock = new Clock();
function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('vinyl_player.glb', gltfReader);
}
function gltfReader(gltf) {
    var testModel = null;
    testModel = gltf.scene;
    if (testModel != null) {
        console.log("Model loaded: " + testModel);
        scene.add(gltf.scene);
        plateau_mesh = scene.getObjectByName('pCylinder2_dit2_0');
        var plateau_material = plateau_mesh.material;
        plateau_material.wireframe = true;
        plateau = plateau_mesh === null || plateau_mesh === void 0 ? void 0 : plateau_mesh.parent;
    }
    else {
        console.log("Load FAILED.  ");
    }
}
loadData();
camera.position.z = 3;
// Main loop
var animation = function () {
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
//# sourceMappingURL=main.js.map