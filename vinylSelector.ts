import {
    Scene, Object3D, Raycaster, Vector3,
    Camera, Mesh, MeshStandardMaterial, TextureLoader, CylinderGeometry, Box3
} from 'three';

import * as TWEEN from '@tweenjs/tween.js';
import { Turntable } from './turntable';
import { VinylDisc, VINYL_RADIUS } from './vinylDisc';

export interface Album {
    name: string;
    cover: string;
    vinylName: string;
    audio?: string;
}

export class VinylSelector {
    private scene: Scene;
    private modal: HTMLDivElement;
    private plateau: Object3D;
    private albums: Album[] = [];
    private currentIndex: number = 0;
    private turntable: Turntable;
    private vinylDisc: VinylDisc;

    constructor(
        scene: Scene,
        camera: Camera,
        plateau: Object3D,
        albums: Album[],
        turntable: Turntable,
        vinylDisc: VinylDisc
    ) {
        this.scene = scene;
        this.plateau = plateau;
        this.albums = albums;
        this.turntable = turntable;
        this.vinylDisc = vinylDisc;
        this.modal = this.createModal();
    }

    private createModal() {
        const modal = document.createElement('div');
        modal.style.cssText = `
            display: none;
            position: absolute; top: 0; left: 0;
            width: 100%; height: 100%;
            background: rgba(0,0,0,0.85);
            z-index: 100;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Helvetica Neue', sans-serif;
        `;
        document.body.appendChild(modal);

        const closeBtn = document.createElement('div');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            position: absolute; top: 20px; right: 30px;
            color: white; cursor: pointer; font-size: 24px; opacity: 0.7;
        `;
        closeBtn.addEventListener('click', () => this.closeModal());
        modal.appendChild(closeBtn);

        const container = document.createElement('div');
        container.style.cssText = `display: flex; align-items: center; gap: 40px;`;
        modal.appendChild(container);

        const leftArrow = document.createElement('div');
        leftArrow.textContent = '‹';
        leftArrow.style.cssText = `
            color: white; font-size: 60px; cursor: pointer;
            opacity: 0.7; user-select: none; padding: 20px;
        `;
        leftArrow.addEventListener('click', () => this.navigate(-1));
        container.appendChild(leftArrow);

        const coverWrapper = document.createElement('div');
        coverWrapper.style.cssText = `
            display: flex; flex-direction: column; align-items: center; gap: 20px;
        `;

        const cover = document.createElement('div');
        cover.id = 'vinyl-cover';
        cover.style.cssText = `
            width: 300px; height: 300px; background: #333;
            border-radius: 4px; background-size: cover; background-position: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.8);
        `;

        const title = document.createElement('div');
        title.id = 'vinyl-title';
        title.style.cssText = `
            font-size: 22px; font-weight: bold; color: white; margin-bottom: 6px;
        `;

        const indexEl = document.createElement('div');
        indexEl.id = 'vinyl-index';
        indexEl.style.cssText = `font-size: 14px; color: white; opacity: 0.5;`;

        const selectBtn = document.createElement('button');
        selectBtn.textContent = '▶ Poser ce vinyle';
        selectBtn.style.cssText = `
            margin-top: 10px; padding: 12px 30px;
            background: #1db954; color: white;
            border: none; border-radius: 25px;
            font-size: 16px; cursor: pointer; font-weight: bold;
        `;
        selectBtn.addEventListener('click', () => this.confirmSelection());

        coverWrapper.appendChild(cover);
        coverWrapper.appendChild(title);
        coverWrapper.appendChild(indexEl);
        coverWrapper.appendChild(selectBtn);
        container.appendChild(coverWrapper);

        const rightArrow = document.createElement('div');
        rightArrow.textContent = '›';
        rightArrow.style.cssText = `
            color: white; font-size: 60px; cursor: pointer;
            opacity: 0.7; user-select: none; padding: 20px;
        `;
        rightArrow.addEventListener('click', () => this.navigate(1));
        container.appendChild(rightArrow);

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
        const cover = document.getElementById('vinyl-cover') as HTMLDivElement;
        new TWEEN.Tween({ opacity: 1 })
            .to({ opacity: 0 }, 150)
            .onUpdate(({ opacity }) => cover.style.opacity = String(opacity))
            .onComplete(() => {
                this.currentIndex = (this.currentIndex + dir + this.albums.length) % this.albums.length;
                this.updateDisplay();
                new TWEEN.Tween({ opacity: 0 })
                    .to({ opacity: 1 }, 150)
                    .onUpdate(({ opacity }) => cover.style.opacity = String(opacity))
                    .start();
            })
            .start();
    }

    private updateDisplay() {
        const album = this.albums[this.currentIndex];
        const cover = document.getElementById('vinyl-cover') as HTMLDivElement;
        const title = document.getElementById('vinyl-title') as HTMLDivElement;
        const indexEl = document.getElementById('vinyl-index') as HTMLDivElement;
        cover.style.backgroundImage = `url('${album.cover}')`;
        title.textContent = album.name;
        indexEl.textContent = `${this.currentIndex + 1} / ${this.albums.length}`;
    }
    private confirmSelection() {
        const album = this.albums[this.currentIndex];
        this.closeModal();

        // Mesure le rayon réel du platter en coordonnées monde
        const box = new Box3().setFromObject(this.plateau);
        const size = new Vector3();
        box.getSize(size);
        const worldRadius = size.x / 2; // rayon réel
        console.log('worldRadius from box:', worldRadius, 'size:', size);

        const textureLoader = new TextureLoader();
        textureLoader.load(album.cover, (texture) => {
            const geo = new CylinderGeometry(worldRadius, worldRadius, 0.01, 64);
            const mat = new MeshStandardMaterial({ map: texture });
            const disc = new Mesh(geo, mat);

            const plateauPos = new Vector3();
            this.plateau.getWorldPosition(plateauPos);
            disc.position.set(plateauPos.x, plateauPos.y + 1.5, plateauPos.z);
            this.scene.add(disc);


            console.log('VINYL_RADIUS:', VINYL_RADIUS);
            console.log('plateau.scale.x:', this.plateau.scale.x);
            console.log('worldRadius calculé:', worldRadius);

            // Et mesure le disc sur le plateau directement
            const plateauParent = this.plateau.parent;
            console.log('plateau parent scale:', plateauParent?.scale);

            new TWEEN.Tween(disc.position)
                .to({ y: plateauPos.y + 0.02 }, 600)
                .easing(TWEEN.Easing.Bounce.Out)
                .onComplete(() => {
                    this.scene.remove(disc);
                    this.vinylDisc.setTexture(album.cover);
                    this.vinylDisc.addToPlatter(this.plateau);
                    if (album.audio) this.turntable.playMusic(album.audio);
                })
                .start();
        });
    }

    openModal() {
        this.modal.style.display = 'flex';
        this.updateDisplay();
    }

    closeModal() {
        this.modal.style.display = 'none';
    }

    onPointerDown(raycaster: Raycaster) {
        const box = this.scene.getObjectByName('box') as Object3D;
        if (box) {
            const hits = raycaster.intersectObject(box, true);
            if (hits.length > 0) this.openModal();
        }
    }
}