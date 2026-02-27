// buttons.ts
import { Mesh, MeshStandardMaterial, Vector3 } from 'three';

const originalColors = new Map<Mesh, number>();
const originalPositions = new Map<Mesh, Vector3>();

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
    originalPositions.set(powerButtonMesh, powerButtonMesh.position.clone());
  }
  
  // Animation d'enfoncement
  const pressDepth = 0.8;
  powerButtonMesh.position.y -= pressDepth;
  
  const material = powerButtonMesh.material as MeshStandardMaterial;
  if (material.color) {
    material.color.set(0xff0000);
  }
}

export function onButtonRelease(buttonMesh: Mesh) {
  const originalPosition = originalPositions.get(buttonMesh);
  if (originalPosition !== undefined) {
    buttonMesh.position.copy(originalPosition);
  }
}

export function onButtonPressAndRelease(buttonMesh: Mesh, duration: number = 500) {
  console.log('Button pressed!');
  
  // Sauvegarde position originale
  if (!originalPositions.has(buttonMesh)) {
    originalPositions.set(buttonMesh, buttonMesh.position.clone());
  }
  
  const originalPosition = originalPositions.get(buttonMesh)!;
  
  // Animation d'enfoncement
  const pressDepth = 0.05;
  buttonMesh.position.y = originalPosition.y - pressDepth;
  
  // Remonte automatiquement après duration ms
  setTimeout(() => {
    buttonMesh.position.copy(originalPosition);
  }, duration);
}
