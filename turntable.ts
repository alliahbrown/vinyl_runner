import { Object3D, PointLight } from 'three';
import * as TWEEN from '@tweenjs/tween.js';

const ARM_START_ANGLE = 0.4;
const ARM_END_ANGLE = 0.7;
const ARM_DURATION = 180;

export class Turntable {
    private isPlaying: boolean = false;
    private speed: number = 33;
    private vinylLight: PointLight | null = null;
    private volume = 50;
    private plateau: Object3D | null = null;
    private armPivot: Object3D | null = null;
    private armTween: TWEEN.Tween<{ y: number }> | null = null;
    private audio: HTMLAudioElement | null = null;

    constructor(plateau: Object3D, armPivot: Object3D) {
        this.plateau = plateau;
        this.armPivot = armPivot;
        this.armPivot.rotation.y = 0;
    }

    setVinylLight(light: PointLight) {
        this.vinylLight = light;
    }

    setSpeed33() {
        if (this.isPlaying) this.speed = 33;
    }

    setSpeed45() {
        if (this.isPlaying) this.speed = 45;
    }

    setVolume(volume: number) {
        this.volume = volume;
        if (this.audio) this.audio.volume = volume / 100;
    }

    playMusic(url: string) {
        if (this.audio) this.audio.pause();
        this.audio = new Audio(url);
        this.audio.loop = true;
        this.audio.volume = this.volume / 100;
        if (this.isPlaying) this.audio.play();
    }

    stopMusic() {
        this.audio?.pause();
        this.audio = null;
    }

    togglePower() {
        this.isPlaying = !this.isPlaying;
        if (this.armTween) this.armTween.stop();

        if (this.isPlaying) {
            // Lumière
            new TWEEN.Tween({ intensity: 0 })
                .to({ intensity: 2 }, 1000)
                .onUpdate(({ intensity }) => {
                    if (this.vinylLight) this.vinylLight.intensity = intensity;
                })
                .start();

            // Bras se pose
            this.armPivot!.rotation.y = 0;
            this.armTween = new TWEEN.Tween(this.armPivot!.rotation)
                .to({ y: ARM_START_ANGLE }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    this.armTween = new TWEEN.Tween(this.armPivot!.rotation)
                        .to({ y: ARM_END_ANGLE }, ARM_DURATION * 1000)
                        .easing(TWEEN.Easing.Linear.None)
                        .start();
                })
                .start();

            this.audio?.play();

        } else {
            // Lumière s'éteint
            new TWEEN.Tween({ intensity: this.vinylLight?.intensity ?? 0 })
                .to({ intensity: 0 }, 500)
                .onUpdate(({ intensity }) => {
                    if (this.vinylLight) this.vinylLight.intensity = intensity;
                })
                .start();

            // Bras se lève
            this.armTween = new TWEEN.Tween(this.armPivot!.rotation)
                .to({ y: 0 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();

            this.audio?.pause();
        }
    }

    update(deltaTime: number) {
        if (this.isPlaying && this.plateau) {
            const rotationSpeed = (this.speed / 60) * 2 * Math.PI;
            this.plateau.rotation.y -= rotationSpeed * deltaTime;
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