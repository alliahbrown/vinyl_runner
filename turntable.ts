import {Object3D, Mesh, MeshStandardMaterial} from 'three';

export class Turntable {


    private isPlaying: boolean = false;
    private speed: number = 0.01; // Vitesse de rotation
    private volume = 50;
    private plateau: Object3D | null = null;

    constructor(plateau: Object3D) {
        this.plateau = plateau;
    }

    togglePower() {
        this.isPlaying = !this.isPlaying;
    }

    setSpeed33() {
        if (this.isPlaying) {
            this.speed = 33;
            console.log('Speed set to 33 RPM');
        }
    }


    setSpeed45() {
        if (this.isPlaying) {
            this.speed = 45;
            console.log('Speed set to 45 RPM');
        }
    }


    setVolume(volume: number) {
        this.volume = volume;
        console.log('Volume set to ' + volume);
    }

    update(deltaTime: number) {
    if (this.isPlaying && this.speed > 0 && this.plateau) {
      // Rotation du plateau (RPM vers radians/sec)
      const rotationSpeed = (this.speed / 60) * 2 * Math.PI;
      this.plateau.rotation.y += rotationSpeed * deltaTime;
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
