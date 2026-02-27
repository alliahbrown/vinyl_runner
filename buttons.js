// buttons.ts


import { Mesh, MeshStandardMaterial } from 'three';

const originalColors = new Map();
const originalPositions = new Map();


// Change la couleur du bouton pour indiquer qu'il est survolé
export function onButtonHower(buttonMesh) {

    const material = buttonMesh.material;
    if (!originalColors.has(buttonMesh)) {
        originalColors.set(buttonMesh, material.color.clone());
    }

    material.emissive.setHex(0x444444);
    material.emissiveIntensity = 0.3;

}


// Restaure la couleur d'origine
export function onButtonUnhover(buttonMesh) {


    const material = buttonMesh.material;
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;

}

// Enfonce le bouton visuellement
export function onButtonPress(buttonMesh, pressDepth = 0.1) {

    if (!originalPositions.has(buttonMesh)) {
        originalPositions.set(buttonMesh, buttonMesh.position.clone());
    }

    buttonMesh.position.y -= pressDepth;

}

// Restaure la position d'origine du bouton
export function onButtonRelease(buttonMesh) {

  const originalY = originalPositions.get(buttonMesh);
  if (originalY !== undefined) {
    buttonMesh.position.y = originalY;
  }
}      


// export function onPowerButtonClick(powerButtonMesh) {
//     console.log('Power button clicked!');
//     // Animation d'enfoncement du bouton
//     var originalY = powerButtonMesh.position.y;
//     var pressDepth = 0.2;
//     powerButtonMesh.position.y -= pressDepth;
//     var material = powerButtonMesh.material;
//     if (material.color) {
//         material.color.set(0xff0000); // Optionnel : change la couleur pour indiquer que le bouton est pressé
//     }
//     setTimeout(function () {
//         powerButtonMesh.position.y = originalY;
//     }, 100);
// }
// //# sourceMappingURL=buttons.js.map    