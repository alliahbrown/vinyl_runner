"use strict";
import { PerspectiveCamera, Scene, WebGLRenderer, Mesh, Vector2, AmbientLight, Clock, Color, Raycaster, MeshStandardMaterial } from 'three';
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
var controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);
var plateau;
var plateau_mesh;
var INTERSECTED = null;
var clock = new Clock();
function loadData() {
    new GLTFLoader()
        .setPath('assets/models/')
        .load('vinyl.glb', gltfReader);
}
function gltfReader(gltf) {
    var testModel = null;
    testModel = gltf.scene;
    if (testModel != null) {
        console.log("Model loaded: " + testModel);
        scene.add(gltf.scene);
        plateau_mesh = scene.getObjectByName('platterMesh');
        var plateau_material = plateau_mesh.material;
        // plateau_material.wireframe = true;
        plateau = plateau_mesh === null || plateau_mesh === void 0 ? void 0 : plateau_mesh.parent;
    }
    else {
        console.log("Load FAILED.");
    }
}
loadData();
camera.position.z = 3;
function onPointerMove(event) {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}
// Main loop
var animation = function () {
    renderer.setAnimationLoop(animation);
    renderer.render(scene, camera);
    raycaster.setFromCamera(pointer, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        var found = false;
        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object instanceof Mesh) {
                var mesh = intersects[i].object;
                if (mesh.material instanceof MeshStandardMaterial) {
                    if (INTERSECTED != mesh) {
                        if (INTERSECTED) {
                            var oldMaterial = INTERSECTED.material;
                            oldMaterial.emissive.setHex(INTERSECTED.userData.currentHex || 0x000000);
                        }
                        INTERSECTED = mesh;
                        var material = INTERSECTED.material;
                        INTERSECTED.userData.currentHex = material.emissive.getHex();
                        material.emissive.setHex(0xff0000);
                    }
                    found = true;
                    break;
                }
            }
        }
        if (!found && INTERSECTED) {
            var material = INTERSECTED.material;
            material.emissive.setHex(INTERSECTED.userData.currentHex || 0x000000);
            INTERSECTED = null;
        }
    }
    else {
        if (INTERSECTED) {
            var material = INTERSECTED.material;
            material.emissive.setHex(INTERSECTED.userData.currentHex || 0x000000);
            INTERSECTED = null;
        }
    }
};
animation();
window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointermove', onPointerMove);
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
//# sourceMappingURL=main.js.map