// buttons.ts
import { Mesh, MeshStandardMaterial } from 'three';

const originalColors = new Map<Mesh, number>();
const originalPositions = new Map<Mesh, number>();

export function onButtonHover(buttonMesh: Mesh) {
  const material = buttonMesh.material as MeshStandardMaterial;
  
  // Sauvegarde la couleur originale si pas déjà fait
  if (!originalColors.has(buttonMesh)) {
    originalColors.set(buttonMesh, material.color.getHex());
  }
  
  // Augmente l'émissivité pour la surbrillance
  material.emissive.setHex(0x444444);
  material.emissiveIntensity = 0.3;
}

export function onButtonUnhover(buttonMesh: Mesh) {
  const material = buttonMesh.material as MeshStandardMaterial;
  
  // Retire la surbrillance
  material.emissive.setHex(0x000000);
  material.emissiveIntensity = 0;
}

export function onPowerButtonPress(powerButtonMesh: Mesh) {
  console.log('Power button pressed!');
  
  // Sauvegarde position originale
  if (!originalPositions.has(powerButtonMesh)) {
    originalPositions.set(powerButtonMesh, powerButtonMesh.position.y);
  }
  
  // Animation d'enfoncement
  const pressDepth = 0.3;
  powerButtonMesh.position.y -= pressDepth;
  
  const material = powerButtonMesh.material as MeshStandardMaterial;
  if (material.color) {
    material.color.set(0xff0000);
  }
}

export function onPowerButtonRelease(powerButtonMesh: Mesh) {
  console.log('Power button released!');
  
  // Restaure la position originale
  const originalY = originalPositions.get(powerButtonMesh);
  if (originalY !== undefined) {
    powerButtonMesh.position.y = originalY;
  }
  
  // Restaure la couleur originale
  const material = powerButtonMesh.material as MeshStandardMaterial;
  const originalColor = originalColors.get(powerButtonMesh);
  if (originalColor !== undefined) {
    material.color.setHex(originalColor);
  }
}