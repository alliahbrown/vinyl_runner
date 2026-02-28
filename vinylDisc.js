import { Mesh, CylinderGeometry, MeshStandardMaterial, TextureLoader } from 'three';
var VinylDisc = /** @class */ (function () {
    function VinylDisc() {
        this.isSpinning = false;
        // Disque noir
        var discGeo = new CylinderGeometry(0.28, 0.28, 0.01, 64);
        var discMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        this.disc = new Mesh(discGeo, discMat);
        // Label central (pochette)
        var labelGeo = new CylinderGeometry(0.08, 0.08, 0.011, 32);
        var labelMat = new MeshStandardMaterial({ color: 0xff0000 });
        this.label = new Mesh(labelGeo, labelMat);
        this.disc.add(this.label);
    }
    VinylDisc.prototype.setTexture = function (coverUrl) {
        var _this = this;
        var loader = new TextureLoader();
        loader.load(coverUrl, function (texture) {
            _this.label.material.map = texture;
            _this.label.material.needsUpdate = true;
        });
    };
    VinylDisc.prototype.addToPlatter = function (platter) {
        // Supprime l'ancien disque si existe
        this.remove();
        // Ajoute comme enfant du platter → tourne automatiquement avec lui
        this.disc.position.set(0, 1, 0); // juste au dessus du platter en local
        this.disc.rotation.set(0, 0, 0);
        platter.add(this.disc);
        this.isSpinning = true;
    };
    VinylDisc.prototype.remove = function () {
        var _a;
        (_a = this.disc.parent) === null || _a === void 0 ? void 0 : _a.remove(this.disc);
        this.isSpinning = false;
    };
    VinylDisc.prototype.update = function (deltaTime, speed) {
        if (this.isSpinning) {
            var rotationSpeed = (speed / 60) * 2 * Math.PI;
            this.disc.rotation.y += rotationSpeed * deltaTime;
        }
    };
    return VinylDisc;
}());
export { VinylDisc };
//# sourceMappingURL=vinylDisc.js.map