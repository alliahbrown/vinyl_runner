import { Vector3, Mesh, MeshStandardMaterial, TextureLoader, CylinderGeometry, Box3 } from 'three';
import * as TWEEN from '@tweenjs/tween.js';
import { VINYL_RADIUS } from './vinylDisc';
var VinylSelector = /** @class */ (function () {
    function VinylSelector(scene, camera, plateau, albums, turntable, vinylDisc) {
        this.albums = [];
        this.currentIndex = 0;
        this.scene = scene;
        this.plateau = plateau;
        this.albums = albums;
        this.turntable = turntable;
        this.vinylDisc = vinylDisc;
        this.modal = this.createModal();
    }
    VinylSelector.prototype.createModal = function () {
        var _this = this;
        var modal = document.createElement('div');
        modal.style.cssText = "\n            display: none;\n            position: absolute; top: 0; left: 0;\n            width: 100%; height: 100%;\n            background: rgba(0,0,0,0.85);\n            z-index: 100;\n            flex-direction: column;\n            align-items: center;\n            justify-content: center;\n            font-family: 'Helvetica Neue', sans-serif;\n        ";
        document.body.appendChild(modal);
        var closeBtn = document.createElement('div');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = "\n            position: absolute; top: 20px; right: 30px;\n            color: white; cursor: pointer; font-size: 24px; opacity: 0.7;\n        ";
        closeBtn.addEventListener('click', function () { return _this.closeModal(); });
        modal.appendChild(closeBtn);
        var container = document.createElement('div');
        container.style.cssText = "display: flex; align-items: center; gap: 40px;";
        modal.appendChild(container);
        var leftArrow = document.createElement('div');
        leftArrow.textContent = '‹';
        leftArrow.style.cssText = "\n            color: white; font-size: 60px; cursor: pointer;\n            opacity: 0.7; user-select: none; padding: 20px;\n        ";
        leftArrow.addEventListener('click', function () { return _this.navigate(-1); });
        container.appendChild(leftArrow);
        var coverWrapper = document.createElement('div');
        coverWrapper.style.cssText = "\n            display: flex; flex-direction: column; align-items: center; gap: 20px;\n        ";
        var cover = document.createElement('div');
        cover.id = 'vinyl-cover';
        cover.style.cssText = "\n            width: 300px; height: 300px; background: #333;\n            border-radius: 4px; background-size: cover; background-position: center;\n            box-shadow: 0 20px 60px rgba(0,0,0,0.8);\n        ";
        var title = document.createElement('div');
        title.id = 'vinyl-title';
        title.style.cssText = "\n            font-size: 22px; font-weight: bold; color: white; margin-bottom: 6px;\n        ";
        var indexEl = document.createElement('div');
        indexEl.id = 'vinyl-index';
        indexEl.style.cssText = "font-size: 14px; color: white; opacity: 0.5;";
        var selectBtn = document.createElement('button');
        selectBtn.textContent = '▶ Poser ce vinyle';
        selectBtn.style.cssText = "\n            margin-top: 10px; padding: 12px 30px;\n            background: #1db954; color: white;\n            border: none; border-radius: 25px;\n            font-size: 16px; cursor: pointer; font-weight: bold;\n        ";
        selectBtn.addEventListener('click', function () { return _this.confirmSelection(); });
        coverWrapper.appendChild(cover);
        coverWrapper.appendChild(title);
        coverWrapper.appendChild(indexEl);
        coverWrapper.appendChild(selectBtn);
        container.appendChild(coverWrapper);
        var rightArrow = document.createElement('div');
        rightArrow.textContent = '›';
        rightArrow.style.cssText = "\n            color: white; font-size: 60px; cursor: pointer;\n            opacity: 0.7; user-select: none; padding: 20px;\n        ";
        rightArrow.addEventListener('click', function () { return _this.navigate(1); });
        container.appendChild(rightArrow);
        window.addEventListener('keydown', function (e) {
            if (modal.style.display === 'none')
                return;
            if (e.key === 'ArrowLeft')
                _this.navigate(-1);
            if (e.key === 'ArrowRight')
                _this.navigate(1);
            if (e.key === 'Escape')
                _this.closeModal();
            if (e.key === 'Enter')
                _this.confirmSelection();
        });
        return modal;
    };
    VinylSelector.prototype.navigate = function (dir) {
        var _this = this;
        var cover = document.getElementById('vinyl-cover');
        new TWEEN.Tween({ opacity: 1 })
            .to({ opacity: 0 }, 150)
            .onUpdate(function (_a) {
            var opacity = _a.opacity;
            return cover.style.opacity = String(opacity);
        })
            .onComplete(function () {
            _this.currentIndex = (_this.currentIndex + dir + _this.albums.length) % _this.albums.length;
            _this.updateDisplay();
            new TWEEN.Tween({ opacity: 0 })
                .to({ opacity: 1 }, 150)
                .onUpdate(function (_a) {
                var opacity = _a.opacity;
                return cover.style.opacity = String(opacity);
            })
                .start();
        })
            .start();
    };
    VinylSelector.prototype.updateDisplay = function () {
        var album = this.albums[this.currentIndex];
        var cover = document.getElementById('vinyl-cover');
        var title = document.getElementById('vinyl-title');
        var indexEl = document.getElementById('vinyl-index');
        cover.style.backgroundImage = "url('".concat(album.cover, "')");
        title.textContent = album.name;
        indexEl.textContent = "".concat(this.currentIndex + 1, " / ").concat(this.albums.length);
    };
    VinylSelector.prototype.confirmSelection = function () {
        var _this = this;
        var album = this.albums[this.currentIndex];
        this.closeModal();
        // Mesure le rayon réel du platter en coordonnées monde
        var box = new Box3().setFromObject(this.plateau);
        var size = new Vector3();
        box.getSize(size);
        var worldRadius = size.x / 2; // rayon réel
        console.log('worldRadius from box:', worldRadius, 'size:', size);
        var textureLoader = new TextureLoader();
        textureLoader.load(album.cover, function (texture) {
            var geo = new CylinderGeometry(worldRadius, worldRadius, 0.01, 64);
            var mat = new MeshStandardMaterial({ map: texture });
            var disc = new Mesh(geo, mat);
            var plateauPos = new Vector3();
            _this.plateau.getWorldPosition(plateauPos);
            disc.position.set(plateauPos.x, plateauPos.y + 1.5, plateauPos.z);
            _this.scene.add(disc);
            console.log('VINYL_RADIUS:', VINYL_RADIUS);
            console.log('plateau.scale.x:', _this.plateau.scale.x);
            console.log('worldRadius calculé:', worldRadius);
            // Et mesure le disc sur le plateau directement
            var plateauParent = _this.plateau.parent;
            console.log('plateau parent scale:', plateauParent === null || plateauParent === void 0 ? void 0 : plateauParent.scale);
            new TWEEN.Tween(disc.position)
                .to({ y: plateauPos.y + 0.02 }, 600)
                .easing(TWEEN.Easing.Bounce.Out)
                .onComplete(function () {
                _this.scene.remove(disc);
                _this.vinylDisc.setTexture(album.cover);
                _this.vinylDisc.addToPlatter(_this.plateau);
                if (album.audio)
                    _this.turntable.playMusic(album.audio);
            })
                .start();
        });
    };
    VinylSelector.prototype.openModal = function () {
        this.modal.style.display = 'flex';
        this.updateDisplay();
    };
    VinylSelector.prototype.closeModal = function () {
        this.modal.style.display = 'none';
    };
    VinylSelector.prototype.onPointerDown = function (raycaster) {
        var box = this.scene.getObjectByName('box');
        if (box) {
            var hits = raycaster.intersectObject(box, true);
            if (hits.length > 0)
                this.openModal();
        }
    };
    return VinylSelector;
}());
export { VinylSelector };
//# sourceMappingURL=vinylSelector.js.map