import { Scene, Object3D, Raycaster, Vector3, Camera, Plane, Mesh, MeshStandardMaterial, TextureLoader } from 'three';
import { Turntable } from 'turntable';
import { VinylDisc } from 'vinylDisc';

export interface Album {
    name: string;
    cover: string;
    vinylName: string;
}

export class VinylSelector {
    private scene: Scene;
    private camera: Camera;
    private modal: HTMLDivElement;
    private selectedVinyl: Object3D | null = null;
    private isDragging: boolean = false;
    private isFalling: boolean = false;
    private fallingVinyl: Object3D | null = null;
    private targetY: number = 0;
    private plateau: Object3D;
    private albums: Album[] = [];
    private currentIndex: number = 0;

    constructor(scene: Scene, camera: Camera, plateau: Object3D, albums: Album[]) {
        this.scene = scene;
        this.camera = camera;
        this.plateau = plateau;
        this.albums = albums;
        this.modal = this.createModal();
    }

    private createModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
      display: none;
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 100;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: 'Helvetica Neue', sans-serif;
    `;
        document.body.appendChild(modal);

        // Bouton fermer
        const closeBtn = document.createElement('div');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
      position: absolute;
      top: 20px; right: 30px;
      color: white;
      cursor: pointer;
      font-size: 24px;
      opacity: 0.7;
    `;
        closeBtn.addEventListener('click', () => this.closeModal());
        modal.appendChild(closeBtn);

        // Conteneur principal
        const container = document.createElement('div');
        container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 40px;
    `;
        modal.appendChild(container);

        // Flèche gauche
        const leftArrow = document.createElement('div');
        leftArrow.textContent = '‹';
        leftArrow.style.cssText = `
      color: white;
      font-size: 60px;
      cursor: pointer;
      opacity: 0.7;
      user-select: none;
      padding: 20px;
    `;
        leftArrow.addEventListener('click', () => this.navigate(-1));
        container.appendChild(leftArrow);

        // Pochette
        const coverWrapper = document.createElement('div');
        coverWrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    `;

        const cover = document.createElement('div');
        cover.id = 'vinyl-cover';
        cover.style.cssText = `
      width: 300px;
      height: 300px;
      background: #333;
      border-radius: 4px;
      background-size: cover;
      background-position: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    `;

        const info = document.createElement('div');
        info.id = 'vinyl-info';
        info.style.cssText = `
      color: white;
      text-align: center;
    `;

        const title = document.createElement('div');
        title.id = 'vinyl-title';
        title.style.cssText = `
      font-size: 22px;
      font-weight: bold;
      margin-bottom: 6px;
    `;

        const index = document.createElement('div');
        index.id = 'vinyl-index';
        index.style.cssText = `
      font-size: 14px;
      opacity: 0.5;
    `;

        // Bouton sélectionner
        const selectBtn = document.createElement('button');
        selectBtn.textContent = '▶ Poser ce vinyle';
        selectBtn.style.cssText = `
      margin-top: 10px;
      padding: 12px 30px;
      background: #1db954;
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 16px;
      cursor: pointer;
      font-weight: bold;
    `;
        selectBtn.addEventListener('click', () => this.confirmSelection());

        info.appendChild(title);
        info.appendChild(index);
        coverWrapper.appendChild(cover);
        coverWrapper.appendChild(info);
        coverWrapper.appendChild(selectBtn);
        container.appendChild(coverWrapper);

        // Flèche droite
        const rightArrow = document.createElement('div');
        rightArrow.textContent = '›';
        rightArrow.style.cssText = `
      color: white;
      font-size: 60px;
      cursor: pointer;
      opacity: 0.7;
      user-select: none;
      padding: 20px;
    `;
        rightArrow.addEventListener('click', () => this.navigate(1));
        container.appendChild(rightArrow);

        // Touches clavier
        window.addEventListener('keydown', (e) => {
            if (modal.style.display === 'none') return;
            if (e.key === 'ArrowLeft') this.navigate(-1);
            if (e.key === 'ArrowRight') this.navigate(1);
            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'Enter') this.confirmSelection();
        });

        return modal;
    }

    private navigate(dir: number) {
        this.currentIndex = (this.currentIndex + dir + this.albums.length) % this.albums.length;
        this.updateDisplay();
    }

    private updateDisplay() {
        const album = this.albums[this.currentIndex];
        const cover = document.getElementById('vinyl-cover') as HTMLDivElement;
        const title = document.getElementById('vinyl-title') as HTMLDivElement;
        const index = document.getElementById('vinyl-index') as HTMLDivElement;

        cover.style.backgroundImage = `url('${album.cover}')`;
        title.textContent = album.name;
        index.textContent = `${this.currentIndex + 1} / ${this.albums.length}`;
    }

    private confirmSelection() {
        const album = this.albums[this.currentIndex];
        this.closeModal();
        this.selectedVinyl = this.scene.getObjectByName(album.vinylName) as Object3D;
        this.scene.attach(this.selectedVinyl);

        // Applique la texture sur le mesh du vinyle
        const textureLoader = new TextureLoader();
        textureLoader.load(album.cover, (texture) => {
            this.selectedVinyl?.traverse((child) => {
                if (child instanceof Mesh) {
                    child.material = new MeshStandardMaterial({ map: texture });
                }
            });
        });

        this.isDragging = true;
    }
    openModal() {
        this.modal.style.display = 'flex';
        this.updateDisplay();
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    // Dans vinylSelector.ts, méthode onPointerMove
    onPointerMove(raycaster: Raycaster) {
        if (!this.isDragging || !this.selectedVinyl) return;

        const plateauPos = new Vector3();
        this.plateau.getWorldPosition(plateauPos);
        console.log('plateauPos:', plateauPos);
        console.log('vinylPos:', this.selectedVinyl.position);

        const target = new Vector3();
        const plane = new Plane(new Vector3(0, 1, 0), -plateauPos.y - 0.1);
        raycaster.ray.intersectPlane(plane, target);
        console.log('target:', target);

        if (target) this.selectedVinyl.position.copy(target);
    }

    onPointerUp(raycaster: Raycaster, plateau_mesh: Mesh, turntable: Turntable, vinylDisc: VinylDisc) {
        if (!this.isDragging || !this.selectedVinyl) return;

        const hits = raycaster.intersectObject(plateau_mesh, true);
        // détecte la proximité avec le plateau
        const plateauPos = new Vector3();
        this.plateau.getWorldPosition(plateauPos);
        const vinylPos = new Vector3();
        this.selectedVinyl.getWorldPosition(vinylPos);

        const dist = plateauPos.distanceTo(vinylPos);

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
    }

    onPointerDown(raycaster: Raycaster, plateau_mesh: Mesh) {
        if (this.isDragging) return;

        const box = this.scene.getObjectByName('box') as Object3D;
        if (box) {
            const hits = raycaster.intersectObject(box, true);
            if (hits.length > 0) {
                this.openModal();
            }
        }
    }

    update(deltaTime: number) {
        if (this.isFalling && this.fallingVinyl) {
            this.fallingVinyl.position.y -= 9.8 * deltaTime * 50;

            if (this.fallingVinyl.position.y <= this.targetY) {
                this.fallingVinyl.position.y = this.targetY;
                this.isFalling = false;
                this.fallingVinyl = null;
            }
        }
    }

    isDraggingVinyl() {
        return this.isDragging;
    }
}