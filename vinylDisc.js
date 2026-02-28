import { Mesh, CylinderGeometry, MeshStandardMaterial, TextureLoader, Vector3 } from 'three';
export var VINYL_RADIUS = 0.7; // rayon monde réel
var VinylDisc = /** @class */ (function () {
    function VinylDisc() {
        this.isSpinning = false;
        this.platter = null;
        var discGeo = new CylinderGeometry(VINYL_RADIUS, VINYL_RADIUS, 0.01, 64);
        var discMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        this.disc = new Mesh(discGeo, discMat);
        var labelGeo = new CylinderGeometry(0.12, 0.12, 0.011, 32);
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
        this.remove();
        this.platter = platter;
        // Position monde du platter
        var plateauPos = new Vector3();
        platter.getWorldPosition(plateauPos);
        // Ajoute directement à la scène parente du platter
        // this.disc.position.set(plateauPos.x, plateauPos.y + 0.02, plateauPos.z);
        this.disc.position.set(0.003, 0.185, 1.359);
        this.disc.rotation.set(0, 0, 0);
        platter.parent.add(this.disc);
        this.isSpinning = true;
    };
    VinylDisc.prototype.remove = function () {
        var _a;
        (_a = this.disc.parent) === null || _a === void 0 ? void 0 : _a.remove(this.disc);
        this.isSpinning = false;
        this.platter = null;
    };
    VinylDisc.prototype.update = function (deltaTime, speed) {
        if (this.isSpinning && this.platter) {
            // Suit la rotation du platter
            this.disc.rotation.y = this.platter.rotation.y;
        }
    };
    return VinylDisc;
}());
export { VinylDisc };
//# sourceMappingURL=vinylDisc.js.map