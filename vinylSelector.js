import { Vector3, Plane, Mesh, MeshStandardMaterial, TextureLoader } from 'three';
var VinylSelector = /** @class */ (function () {
    function VinylSelector(scene, camera, plateau, albums) {
        this.selectedVinyl = null;
        this.isDragging = false;
        this.isFalling = false;
        this.fallingVinyl = null;
        this.targetY = 0;
        this.albums = [];
        this.currentIndex = 0;
        this.scene = scene;
        this.camera = camera;
        this.plateau = plateau;
        this.albums = albums;
        this.modal = this.createModal();
    }
    VinylSelector.prototype.createModal = function () {
        var _this = this;
        var modal = document.createElement('div');
        modal.style.cssText = "\n      display: none;\n      position: absolute;\n      top: 0; left: 0;\n      width: 100%; height: 100%;\n      background: rgba(0,0,0,0.85);\n      z-index: 100;\n      flex-direction: column;\n      align-items: center;\n      justify-content: center;\n      font-family: 'Helvetica Neue', sans-serif;\n    ";
        document.body.appendChild(modal);
        // Bouton fermer
        var closeBtn = document.createElement('div');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = "\n      position: absolute;\n      top: 20px; right: 30px;\n      color: white;\n      cursor: pointer;\n      font-size: 24px;\n      opacity: 0.7;\n    ";
        closeBtn.addEventListener('click', function () { return _this.closeModal(); });
        modal.appendChild(closeBtn);
        // Conteneur principal
        var container = document.createElement('div');
        container.style.cssText = "\n      display: flex;\n      align-items: center;\n      gap: 40px;\n    ";
        modal.appendChild(container);
        // Flèche gauche
        var leftArrow = document.createElement('div');
        leftArrow.textContent = '‹';
        leftArrow.style.cssText = "\n      color: white;\n      font-size: 60px;\n      cursor: pointer;\n      opacity: 0.7;\n      user-select: none;\n      padding: 20px;\n    ";
        leftArrow.addEventListener('click', function () { return _this.navigate(-1); });
        container.appendChild(leftArrow);
        // Pochette
        var coverWrapper = document.createElement('div');
        coverWrapper.style.cssText = "\n      display: flex;\n      flex-direction: column;\n      align-items: center;\n      gap: 20px;\n    ";
        var cover = document.createElement('div');
        cover.id = 'vinyl-cover';
        cover.style.cssText = "\n      width: 300px;\n      height: 300px;\n      background: #333;\n      border-radius: 4px;\n      background-size: cover;\n      background-position: center;\n      box-shadow: 0 20px 60px rgba(0,0,0,0.8);\n    ";
        var info = document.createElement('div');
        info.id = 'vinyl-info';
        info.style.cssText = "\n      color: white;\n      text-align: center;\n    ";
        var title = document.createElement('div');
        title.id = 'vinyl-title';
        title.style.cssText = "\n      font-size: 22px;\n      font-weight: bold;\n      margin-bottom: 6px;\n    ";
        var index = document.createElement('div');
        index.id = 'vinyl-index';
        index.style.cssText = "\n      font-size: 14px;\n      opacity: 0.5;\n    ";
        // Bouton sélectionner
        var selectBtn = document.createElement('button');
        selectBtn.textContent = '▶ Poser ce vinyle';
        selectBtn.style.cssText = "\n      margin-top: 10px;\n      padding: 12px 30px;\n      background: #1db954;\n      color: white;\n      border: none;\n      border-radius: 25px;\n      font-size: 16px;\n      cursor: pointer;\n      font-weight: bold;\n    ";
        selectBtn.addEventListener('click', function () { return _this.confirmSelection(); });
        info.appendChild(title);
        info.appendChild(index);
        coverWrapper.appendChild(cover);
        coverWrapper.appendChild(info);
        coverWrapper.appendChild(selectBtn);
        container.appendChild(coverWrapper);
        // Flèche droite
        var rightArrow = document.createElement('div');
        rightArrow.textContent = '›';
        rightArrow.style.cssText = "\n      color: white;\n      font-size: 60px;\n      cursor: pointer;\n      opacity: 0.7;\n      user-select: none;\n      padding: 20px;\n    ";
        rightArrow.addEventListener('click', function () { return _this.navigate(1); });
        container.appendChild(rightArrow);
        // Touches clavier
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
        this.currentIndex = (this.currentIndex + dir + this.albums.length) % this.albums.length;
        this.updateDisplay();
    };
    VinylSelector.prototype.updateDisplay = function () {
        var album = this.albums[this.currentIndex];
        var cover = document.getElementById('vinyl-cover');
        var title = document.getElementById('vinyl-title');
        var index = document.getElementById('vinyl-index');
        cover.style.backgroundImage = "url('".concat(album.cover, "')");
        title.textContent = album.name;
        index.textContent = "".concat(this.currentIndex + 1, " / ").concat(this.albums.length);
    };
    VinylSelector.prototype.confirmSelection = function () {
        var _this = this;
        var album = this.albums[this.currentIndex];
        this.closeModal();
        this.selectedVinyl = this.scene.getObjectByName(album.vinylName);
        this.scene.attach(this.selectedVinyl);
        // Applique la texture sur le mesh du vinyle
        var textureLoader = new TextureLoader();
        textureLoader.load(album.cover, function (texture) {
            var _a;
            (_a = _this.selectedVinyl) === null || _a === void 0 ? void 0 : _a.traverse(function (child) {
                if (child instanceof Mesh) {
                    child.material = new MeshStandardMaterial({ map: texture });
                }
            });
        });
        this.isDragging = true;
    };
    VinylSelector.prototype.openModal = function () {
        this.modal.style.display = 'flex';
        this.updateDisplay();
    };
    VinylSelector.prototype.closeModal = function () {
        this.modal.style.display = 'none';
    };
    // Dans vinylSelector.ts, méthode onPointerMove
    VinylSelector.prototype.onPointerMove = function (raycaster) {
        if (!this.isDragging || !this.selectedVinyl)
            return;
        var plateauPos = new Vector3();
        this.plateau.getWorldPosition(plateauPos);
        console.log('plateauPos:', plateauPos);
        console.log('vinylPos:', this.selectedVinyl.position);
        var target = new Vector3();
        var plane = new Plane(new Vector3(0, 1, 0), -plateauPos.y - 0.1);
        raycaster.ray.intersectPlane(plane, target);
        console.log('target:', target);
        if (target)
            this.selectedVinyl.position.copy(target);
    };
    VinylSelector.prototype.onPointerUp = function (raycaster, plateau_mesh, turntable, vinylDisc) {
        if (!this.isDragging || !this.selectedVinyl)
            return;
        var hits = raycaster.intersectObject(plateau_mesh, true);
        // détecte la proximité avec le plateau
        var plateauPos = new Vector3();
        this.plateau.getWorldPosition(plateauPos);
        var vinylPos = new Vector3();
        this.selectedVinyl.getWorldPosition(vinylPos);
        var dist = plateauPos.distanceTo(vinylPos);
        if (dist < 0.5) {
            // Pose sur la platine
            vinylDisc.setTexture(this.albums[this.currentIndex].cover);
            vinylDisc.addToPlatter(this.plateau);
            // if (this.albums[this.currentIndex].audio) {
            //   turntable.playMusic(this.albums[this.currentIndex].audio!);
            // }
            // Cache le vinyle du casier
            this.selectedVinyl.visible = false;
        }
        this.isDragging = false;
        this.selectedVinyl = null;
    };
    VinylSelector.prototype.onPointerDown = function (raycaster, plateau_mesh) {
        if (this.isDragging)
            return;
        var box = this.scene.getObjectByName('box');
        if (box) {
            var hits = raycaster.intersectObject(box, true);
            if (hits.length > 0) {
                this.openModal();
            }
        }
    };
    VinylSelector.prototype.update = function (deltaTime) {
        if (this.isFalling && this.fallingVinyl) {
            this.fallingVinyl.position.y -= 9.8 * deltaTime * 50;
            if (this.fallingVinyl.position.y <= this.targetY) {
                this.fallingVinyl.position.y = this.targetY;
                this.isFalling = false;
                this.fallingVinyl = null;
            }
        }
    };
    VinylSelector.prototype.isDraggingVinyl = function () {
        return this.isDragging;
    };
    return VinylSelector;
}());
export { VinylSelector };
//# sourceMappingURL=vinylSelector.js.map