"use strict";
import { PerspectiveCamera, Scene, WebGLRenderer, Object3D, Vector2, AmbientLight, Clock, Color, Raycaster, GridHelper } from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { Turntable } from './turntable';
import { onButtonHover, onButtonUnhover, onButtonPressAndRelease } from './buttons';
import { VinylSelector } from './vinylSelector';
import { albums } from './album';
import { VinylDisc } from './vinylDisc';
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
var controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
controls.enableDamping = true;
// Grille
var gridHelper = new GridHelper(10, 10);
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.3;
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
var button33Mesh;
var button45Mesh;
var volumeSliderMesh;
var INTERSECTED = null;
var vinylDisc;
var clock = new Clock();
// Instance de la platine
var turntable;
// Vinyl selector instance
var vinylSelector;
// État d'interaction
var pressedButton = null;
var hoveredButton = null;
var isDraggingSlider = false;
// Map des boutons et leurs actions
var buttonActions = new Map();
function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('chambre.glb', gltfReader);
}
function gltfReader(gltf) {
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
    // --- Vinyles ---
    vinylSelector = new VinylSelector(scene, camera, plateau, albums);
    window.vinylSelector = vinylSelector;
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
    // --- Bras ---
    var armBase = scene.getObjectByName('armBase');
    var armBase3 = scene.getObjectByName('armBase3');
    var arm = scene.getObjectByName('arm');
    var armEnd = scene.getObjectByName('armEnd');
    var needle = scene.getObjectByName('needle');
    // Pivot centré sur armBase, aligné sur son axe Y
    var armPivot = new Object3D();
    armBase.getWorldPosition(armPivot.position);
    armBase.getWorldQuaternion(armPivot.quaternion);
    scene.add(armPivot);
    // Attache les éléments qui doivent tourner
    [armBase3, arm, armEnd, needle].forEach(function (obj) {
        if (obj)
            armPivot.attach(obj);
    });
    vinylDisc = new VinylDisc();
    // --- Turntable ---
    if (plateau) {
        turntable = new Turntable(plateau, armPivot);
    }
    scene.traverse(function (o) { if (o.name)
        console.log(o.name, o.type); });
    // --- Actions boutons ---
    buttonActions.set(powerButtonMesh, function () { return turntable.togglePower(); });
    buttonActions.set(button33Mesh, function () { return turntable.setSpeed33(); });
    buttonActions.set(button45Mesh, function () { return turntable.setSpeed45(); });
    // Debug
    window.armPivot = armPivot;
    window.turntable = turntable;
    window.camera = camera;
    window.controls = controls;
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
function getButtonUnderPointer() {
    raycaster.setFromCamera(pointer, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    var validIntersects = intersects.filter(function (i) { return i.object.type !== 'GridHelper'; });
    buttonActions.set(powerButtonMesh, function () { return turntable.togglePower(); });
    buttonActions.set(button33Mesh, function () { return turntable.setSpeed33(); });
    buttonActions.set(button45Mesh, function () { return turntable.setSpeed45(); });
    if (validIntersects.length > 0) {
        var clickedObject = validIntersects[0].object;
        // Cherche dans tous les boutons
        for (var _i = 0, _a = Array.from(buttonActions.keys()); _i < _a.length; _i++) {
            var button = _a[_i];
            var current = clickedObject;
            while (current) {
                if (current === button)
                    return button;
                current = current.parent;
            }
        }
        // Vérifie aussi le slider
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
    // Gestion du slider en cours de drag
    if (isDraggingSlider && volumeSliderMesh && turntable) {
        var newVolume = Math.round(((pointer.y + 1) / 2) * 100);
        turntable.setVolume(newVolume);
        return;
    }
    if (vinylSelector)
        vinylSelector.onPointerMove(raycaster);
    // Détection du hover
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
import { PointLight } from 'three'; // Ajoute dans les imports
var topLight = new PointLight(0xffffff, 100); // Intensité 50
topLight.position.set(0, 10, 0);
scene.add(topLight);
function onPointerDown() {
    var button = getButtonUnderPointer();
    console.log('clicked:', button === null || button === void 0 ? void 0 : button.name);
    if (vinylSelector)
        vinylSelector.onPointerDown(raycaster, plateau_mesh);
    if (button) {
        if (button === volumeSliderMesh) {
            isDraggingSlider = true;
        }
        else {
            // Animation d'enfoncement automatique avec rebond
            onButtonPressAndRelease(button, 500);
            // Exécute l'action immédiatement
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
    infoDiv.innerHTML = "\n    <strong>Camera Position</strong><br>\n    x: ".concat(pos.x.toFixed(2), "<br>\n    y: ").concat(pos.y.toFixed(2), "<br>\n    z: ").concat(pos.z.toFixed(2), "<br>\n    <br>\n    <strong>Camera Rotation</strong><br>\n    x: ").concat((rot.x * 180 / Math.PI).toFixed(1), "\u00B0<br>\n    y: ").concat((rot.y * 180 / Math.PI).toFixed(1), "\u00B0<br>\n    z: ").concat((rot.z * 180 / Math.PI).toFixed(1), "\u00B0").concat(stateInfo, "\n  ");
}
// Main loop
var animation = function () {
    renderer.setAnimationLoop(animation);
    var deltaTime = clock.getDelta();
    // Update de la platine
    if (turntable) {
        turntable.update(deltaTime);
    }
    if (vinylSelector)
        vinylSelector.update(deltaTime);
    updateCameraInfo();
    renderer.render(scene, camera);
};
animation();
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointermove', onPointerMove);
window.addEventListener('mouseup', function () { return vinylSelector === null || vinylSelector === void 0 ? void 0 : vinylSelector.onPointerUp(raycaster, plateau_mesh, turntable, vinylDisc); });
renderer.domElement.addEventListener('mousedown', onPointerDown);
renderer.domElement.addEventListener('mouseup', onPointerUp);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
//# sourceMappingURL=main.js.map