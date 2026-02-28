import { Mesh, CylinderGeometry, MeshStandardMaterial, Object3D, TextureLoader, Vector3 } from 'three';

export class VinylDisc {
    private disc: Mesh;
    private label: Mesh;
    private isSpinning: boolean = false;

    constructor() {
        // Disque noir
        const discGeo = new CylinderGeometry(0.28, 0.28, 0.01, 64);
        const discMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        this.disc = new Mesh(discGeo, discMat);

        // Label central (pochette)
        const labelGeo = new CylinderGeometry(0.08, 0.08, 0.011, 32);
        const labelMat = new MeshStandardMaterial({ color: 0xff0000 });
        this.label = new Mesh(labelGeo, labelMat);
        this.disc.add(this.label);
    }

    setTexture(coverUrl: string) {
        const loader = new TextureLoader();
        loader.load(coverUrl, (texture) => {
            (this.label.material as MeshStandardMaterial).map = texture;
            (this.label.material as MeshStandardMaterial).needsUpdate = true;
        });
    }
    addToPlatter(platter: Object3D) {
        // Supprime l'ancien disque si existe
        this.remove();

        // Ajoute comme enfant du platter → tourne automatiquement avec lui
        this.disc.position.set(0, 1, 0); // juste au dessus du platter en local
        this.disc.rotation.set(0, 0, 0);
        platter.add(this.disc);
        this.isSpinning = true;
    }

    remove() {
        this.disc.parent?.remove(this.disc);
        this.isSpinning = false;
    }

    update(deltaTime: number, speed: number) {
        if (this.isSpinning) {
            const rotationSpeed = (speed / 60) * 2 * Math.PI;
            this.disc.rotation.y += rotationSpeed * deltaTime;
        }
    }

}