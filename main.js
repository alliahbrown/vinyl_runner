"use strict";
import { PerspectiveCamera, Scene, WebGLRenderer, Object3D, Vector2, Vector3, AmbientLight, Clock, Color, Raycaster, PointLight } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as TWEEN from '@tweenjs/tween.js';
import { Turntable } from './turntable';
import { onButtonHover, onButtonUnhover, onButtonPressAndRelease } from './buttons';
import { VinylSelector } from './vinylSelector';
import { albums } from './album';
import { VinylDisc } from './vinylDisc';
var raycaster = new Raycaster();
var pointer = new Vector2();
var scene = new Scene();
var camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.add(new AmbientLight(0xffffff, 3.0));
scene.background = new Color('lightgray');
var topLight = new PointLight(0xffffff, 100);
topLight.position.set(0, 10, 0);
scene.add(topLight);
var renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
var controls = new OrbitControls(camera, renderer.domElement);
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
var infoDiv = document.createElement('div');
infoDiv.style.cssText = "\n  position: absolute; top: 10px; right: 10px;\n  background: rgba(0,0,0,0.7); color: white;\n  padding: 10px; font-family: monospace;\n  font-size: 12px; border-radius: 5px;\n";
document.body.appendChild(infoDiv);
var plateau;
var plateau_mesh;
var powerButtonMesh;
var button33Mesh;
var button45Mesh;
var volumeSliderMesh;
var vinylDisc;
var turntable;
var vinylSelector;
var hoveredButton = null;
var isDraggingSlider = false;
// Lumières d'ambiance colorées
var warmLight = new PointLight(0xff6633, 2, 8); // orange chaud
warmLight.position.set(-2, 2, -1);
scene.add(warmLight);
var coolLight = new PointLight(0x3366ff, 1.5, 8); // bleu froid
coolLight.position.set(2, 1.5, 2);
scene.add(coolLight);
var vinylLight = new PointLight(0xff0066, 0, 3); // rose — s'allume quand musique joue
vinylLight.position.set(0, 0.5, 0); // au dessus de la platine
scene.add(vinylLight);
var buttonActions = new Map();
var clock = new Clock();
function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('chambre.glb', gltfReader);
}
function gltfReader(gltf) {
    var _a;
    var testModel = gltf.scene;
    if (!testModel) {
        console.log("Load FAILED.");
        return;
    }
    scene.add(gltf.scene);
    gltf.scene.updateMatrixWorld(true);
    // --- Plateau ---
    plateau = scene.getObjectByName('platter');
    plateau_mesh = scene.getObjectByName('platterMesh');
    if (plateau_mesh === null || plateau_mesh === void 0 ? void 0 : plateau_mesh.material) {
        plateau_mesh.material.wireframe = true;
    }
    var plateauPos = new Vector3();
    plateau.getWorldPosition(plateauPos);
    console.log('plateauPos Y:', plateauPos.y);
    // --- Boutons ---
    powerButtonMesh = scene.getObjectByName('powerButtonMesh');
    button33Mesh = scene.getObjectByName('speedSelector33Mesh');
    button45Mesh = scene.getObjectByName('speedSelector45Mesh');
    volumeSliderMesh = scene.getObjectByName('volumeButtonMesh');
    [powerButtonMesh, button33Mesh, button45Mesh, volumeSliderMesh].forEach(function (mesh) {
        if (mesh === null || mesh === void 0 ? void 0 : mesh.material) {
            mesh.material = mesh.material.clone();
        }
    });
    console.log('platter scale:', plateau.scale);
    console.log('platter parent scale:', (_a = plateau.parent) === null || _a === void 0 ? void 0 : _a.scale);
    // --- Bras ---
    var armBase = scene.getObjectByName('armBase');
    var armBase3 = scene.getObjectByName('armBase3');
    var arm = scene.getObjectByName('arm');
    var armEnd = scene.getObjectByName('armEnd');
    var needle = scene.getObjectByName('needle');
    var armPivot = new Object3D();
    armBase.getWorldPosition(armPivot.position);
    armBase.getWorldQuaternion(armPivot.quaternion);
    scene.add(armPivot);
    [armBase3, arm, armEnd, needle].forEach(function (obj) {
        if (obj)
            armPivot.attach(obj);
    });
    // --- Turntable & VinylDisc ---
    turntable = new Turntable(plateau, armPivot);
    vinylDisc = new VinylDisc();
    turntable.setVinylLight(vinylLight);
    // --- VinylSelector ---
    vinylSelector = new VinylSelector(scene, camera, plateau, albums, turntable, vinylDisc);
    // --- Actions boutons ---
    buttonActions.set(powerButtonMesh, function () { return turntable.togglePower(); });
    buttonActions.set(button33Mesh, function () { return turntable.setSpeed33(); });
    buttonActions.set(button45Mesh, function () { return turntable.setSpeed45(); });
    window.armPivot = armPivot;
    window.turntable = turntable;
    window.camera = camera;
    window.controls = controls;
    window.vinylDisc = vinylDisc;
    console.log('All components loaded');
}
loadData();
camera.position.set(0, 2, 4);
function getButtonUnderPointer() {
    raycaster.setFromCamera(pointer, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    var validIntersects = intersects.filter(function (i) { return i.object.type !== 'GridHelper'; });
    if (validIntersects.length > 0) {
        var clickedObject = validIntersects[0].object;
        for (var _i = 0, _a = Array.from(buttonActions.keys()); _i < _a.length; _i++) {
            var button = _a[_i];
            var current = clickedObject;
            while (current) {
                if (current === button)
                    return button;
                current = current.parent;
            }
        }
        if (volumeSliderMesh) {
            var current = clickedObject;
            while (current) {
                if (current === volumeSliderMesh)
                    return volumeSliderMesh;
                current = current.parent;
            }
        }
    }
    return null;
}
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    if (isDraggingSlider && turntable) {
        var newVolume = Math.round(((pointer.y + 1) / 2) * 100);
        turntable.setVolume(newVolume);
        return;
    }
    var foundButton = getButtonUnderPointer();
    if (foundButton && foundButton !== hoveredButton) {
        if (hoveredButton)
            onButtonUnhover(hoveredButton);
        hoveredButton = foundButton;
        onButtonHover(hoveredButton);
        renderer.domElement.style.cursor = 'pointer';
    }
    else if (!foundButton && hoveredButton) {
        onButtonUnhover(hoveredButton);
        hoveredButton = null;
        renderer.domElement.style.cursor = 'default';
    }
}
function onPointerDown() {
    raycaster.setFromCamera(pointer, camera);
    var button = getButtonUnderPointer();
    if (vinylSelector)
        vinylSelector.onPointerDown(raycaster);
    if (button) {
        if (button === volumeSliderMesh) {
            isDraggingSlider = true;
        }
        else {
            onButtonPressAndRelease(button, 500);
            var action = buttonActions.get(button);
            if (action)
                action();
        }
    }
}
function onPointerUp() {
    isDraggingSlider = false;
}
function updateCameraInfo() {
    var pos = camera.position;
    var rot = camera.rotation;
    var stateInfo = '';
    if (turntable) {
        var state = turntable.getState();
        stateInfo = "<br><br><strong>Turntable</strong><br>\n    Power: ".concat(state.isPlaying ? 'ON' : 'OFF', "<br>\n    Speed: ").concat(state.speed, " RPM<br>\n    Volume: ").concat(state.volume, "%");
    }
    infoDiv.innerHTML = "\n    <strong>Camera</strong><br>\n    x: ".concat(pos.x.toFixed(2), " y: ").concat(pos.y.toFixed(2), " z: ").concat(pos.z.toFixed(2), "<br>\n    rx: ").concat((rot.x * 180 / Math.PI).toFixed(1), "\u00B0\n    ry: ").concat((rot.y * 180 / Math.PI).toFixed(1), "\u00B0\n    rz: ").concat((rot.z * 180 / Math.PI).toFixed(1), "\u00B0\n    ").concat(stateInfo, "\n  ");
}
var time = 0;
var animation = function () {
    renderer.setAnimationLoop(animation);
    TWEEN.update();
    var deltaTime = clock.getDelta();
    time += deltaTime;
    // Légère oscillation des lumières
    warmLight.intensity = 2 + Math.sin(time * 0.7) * 0.3;
    coolLight.intensity = 1.5 + Math.sin(time * 0.5 + 1) * 0.2;
    controls.update();
    if (turntable)
        turntable.update(deltaTime);
    if (vinylDisc && turntable)
        vinylDisc.update(deltaTime, turntable.getState().speed);
    updateCameraInfo();
    renderer.render(scene, camera);
};
animation();
window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
window.addEventListener('pointermove', onPointerMove);
renderer.domElement.addEventListener('mousedown', onPointerDown);
window.addEventListener('mouseup', onPointerUp);
//# sourceMappingURL=main.js.map