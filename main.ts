"use strict";
import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  BoxGeometry,
  Mesh,
  Object3D,
  Vector2,
  MeshNormalMaterial,
  AmbientLight,
  Clock,
  Color,
  Raycaster,
  MeshStandardMaterial
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
const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);

let plateau: Object3D | null;
let plateau_mesh: Mesh;
let INTERSECTED: Mesh | null = null;
const clock = new Clock();

function loadData() {
  new GLTFLoader()
    .setPath('assets/models/')
    .load('vinyl.glb', gltfReader);
}

function gltfReader(gltf: GLTF) {
  let testModel = null;
  testModel = gltf.scene;
  if (testModel != null) {
    console.log("Model loaded: " + testModel);
    scene.add(gltf.scene);
    plateau_mesh = scene.getObjectByName('platterMesh') as Mesh;
    let plateau_material = plateau_mesh.material as MeshStandardMaterial;
    // plateau_material.wireframe = true;
    plateau = plateau_mesh?.parent;
  } else {
    console.log("Load FAILED.");
  }
}

loadData();
camera.position.z = 3;

function onPointerMove(event: { clientX: number; clientY: number; }) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

// Main loop

const animation = () => {
  renderer.setAnimationLoop(animation);
  renderer.render(scene, camera);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {

    let found = false;
    for (let i = 0; i < intersects.length; i++) {
      if (intersects[i].object instanceof Mesh) {
        const mesh = intersects[i].object as Mesh;
        if (mesh.material instanceof MeshStandardMaterial) {
          if (INTERSECTED != mesh) {

            if (INTERSECTED) {
              const oldMaterial = INTERSECTED.material as MeshStandardMaterial;
              oldMaterial.emissive.setHex(INTERSECTED.userData.currentHex || 0x000000);
            }

            INTERSECTED = mesh;
            const material = INTERSECTED.material as MeshStandardMaterial;
            INTERSECTED.userData.currentHex = material.emissive.getHex();
            material.emissive.setHex(0xff0000);
          }
          found = true;
          break;
        }
      }
    }


    if (!found && INTERSECTED) {
      const material = INTERSECTED.material as MeshStandardMaterial;
      material.emissive.setHex(INTERSECTED.userData.currentHex || 0x000000);
      INTERSECTED = null;
    }
  } else {

    if (INTERSECTED) {
      const material = INTERSECTED.material as MeshStandardMaterial;
      material.emissive.setHex(INTERSECTED.userData.currentHex || 0x000000);
      INTERSECTED = null;
    }
  }
}

animation();

window.addEventListener('resize', onWindowResize, false);
window.addEventListener('pointermove', onPointerMove);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}