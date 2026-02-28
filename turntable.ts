import { Object3D, Mesh, MeshStandardMaterial } from 'three';

const ARM_START_ANGLE = -0.40;
const ARM_END_ANGLE = -0.7;
const ARM_DURATION = 10;


export class Turntable {
    private isPlaying: boolean = false;
    private speed: number = 33;
    private volume = 50;
    private plateau: Object3D | null = null;
    private armPivot: Object3D | null = null;

    constructor(plateau: Object3D, armPivot: Object3D) {
        this.plateau = plateau;
        this.armPivot = armPivot;
        this.armPivot.rotation.y = 0; // position repos
    }



    setSpeed33() {
        if (this.isPlaying) {
            this.speed = 33;
        }
    }

    setSpeed45() {
        if (this.isPlaying) {
            this.speed = 45;
        }
    }

    setVolume(volume: number) {
        this.volume = volume;
    }
    update(deltaTime: number) {
        if (this.isPlaying && this.plateau && this.armPivot) {
            const rotationSpeed = (this.speed / 60) * 2 * Math.PI;
            this.plateau.rotation.y -= rotationSpeed * deltaTime;

            // Bras avance vers ARM_END_ANGLE
            const armSpeed = Math.abs(ARM_END_ANGLE - ARM_START_ANGLE) / ARM_DURATION;
            this.armPivot.rotation.y += armSpeed * deltaTime;
            this.armPivot.rotation.y = Math.max(this.armPivot.rotation.y, ARM_END_ANGLE);
        }
    }

    togglePower() {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.armPivot!.rotation.y = ARM_START_ANGLE;
        } else {
            this.armPivot!.rotation.y = 0;
        }
    }

    getState() {
        return {
            isPlaying: this.isPlaying,
            speed: this.speed,
            volume: this.volume
        };
    }
}