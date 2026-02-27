var originalColors = new Map();
var originalPositions = new Map();
export function onButtonHover(buttonMesh) {
    var material = buttonMesh.material;
    // Sauvegarde la couleur originale si pas déjà fait
    if (!originalColors.has(buttonMesh)) {
        originalColors.set(buttonMesh, material.color.getHex());
    }
    // Augmente l'émissivité pour la surbrillance
    material.emissive.setHex(0x444444);
    material.emissiveIntensity = 0.3;
}
export function onButtonUnhover(buttonMesh) {
    var material = buttonMesh.material;
    // Retire la surbrillance
    material.emissive.setHex(0x000000);
    material.emissiveIntensity = 0;
}
export function onPowerButtonPress(powerButtonMesh) {
    console.log('Power button pressed!');
    // Sauvegarde position originale
    if (!originalPositions.has(powerButtonMesh)) {
        originalPositions.set(powerButtonMesh, powerButtonMesh.position.clone());
    }
    // Animation d'enfoncement
    var pressDepth = 0.8;
    powerButtonMesh.position.y -= pressDepth;
    var material = powerButtonMesh.material;
    if (material.color) {
        material.color.set(0xff0000);
    }
}
export function onButtonRelease(buttonMesh) {
    var originalPosition = originalPositions.get(buttonMesh);
    if (originalPosition !== undefined) {
        buttonMesh.position.copy(originalPosition);
    }
}
export function onButtonPressAndRelease(buttonMesh, duration) {
    if (duration === void 0) { duration = 500; }
    console.log('Button pressed!');
    // Sauvegarde position originale
    if (!originalPositions.has(buttonMesh)) {
        originalPositions.set(buttonMesh, buttonMesh.position.clone());
    }
    var originalPosition = originalPositions.get(buttonMesh);
    // Animation d'enfoncement
    var pressDepth = 0.05;
    buttonMesh.position.y = originalPosition.y - pressDepth;
    // Remonte automatiquement après duration ms
    setTimeout(function () {
        buttonMesh.position.copy(originalPosition);
    }, duration);
}
//# sourceMappingURL=buttons.js.map