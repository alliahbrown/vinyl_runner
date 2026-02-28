import { Mesh, CylinderGeometry, MeshStandardMaterial, Object3D, TextureLoader, Vector3 } from 'three';

export const VINYL_RADIUS = 0.7; // rayon monde réel

export class VinylDisc {
    private disc: Mesh;
    private label: Mesh;
    private isSpinning: boolean = false;
    private platter: Object3D | null = null;

    constructor() {
        const discGeo = new CylinderGeometry(VINYL_RADIUS, VINYL_RADIUS, 0.01, 64);
        const discMat = new MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
        this.disc = new Mesh(discGeo, discMat);

        const labelGeo = new CylinderGeometry(0.12, 0.12, 0.011, 32);
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
        this.remove();
        this.platter = platter;

        // Position monde du platter
        const plateauPos = new Vector3();
        platter.getWorldPosition(plateauPos);

        // Ajoute directement à la scène parente du platter
        // this.disc.position.set(plateauPos.x, plateauPos.y + 0.02, plateauPos.z);
        this.disc.position.set(0.003, 0.185, 1.359);
        this.disc.rotation.set(0, 0, 0);
        platter.parent!.add(this.disc);
        this.isSpinning = true;
    }

    remove() {
        this.disc.parent?.remove(this.disc);
        this.isSpinning = false;
        this.platter = null;
    }

    update(deltaTime: number, speed: number) {
        if (this.isSpinning && this.platter) {
            // Suit la rotation du platter
            this.disc.rotation.y = this.platter.rotation.y;
        }
    }
}