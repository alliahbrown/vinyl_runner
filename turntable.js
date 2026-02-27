var Turntable = /** @class */ (function () {
    function Turntable(plateau) {
        this.isPlaying = false;
        this.speed = 0.01; // Vitesse de rotation
        this.volume = 50;
        this.plateau = null;
        this.plateau = plateau;
    }
    Turntable.prototype.togglePower = function () {
        this.isPlaying = !this.isPlaying;
    };
    Turntable.prototype.setSpeed33 = function () {
        if (this.isPlaying) {
            this.speed = 33;
            console.log('Speed set to 33 RPM');
        }
    };
    Turntable.prototype.setSpeed45 = function () {
        if (this.isPlaying) {
            this.speed = 45;
            console.log('Speed set to 45 RPM');
        }
    };
    Turntable.prototype.setVolume = function (volume) {
        this.volume = volume;
        console.log('Volume set to ' + volume);
    };
    Turntable.prototype.update = function (deltaTime) {
        if (this.isPlaying && this.speed > 0 && this.plateau) {
            // Rotation du plateau (RPM vers radians/sec)
            var rotationSpeed = (this.speed / 60) * 2 * Math.PI;
            this.plateau.rotation.y += rotationSpeed * deltaTime;
        }
    };
    Turntable.prototype.getState = function () {
        return {
            isPlaying: this.isPlaying,
            speed: this.speed,
            volume: this.volume
        };
    };
    return Turntable;
}());
export { Turntable };
//# sourceMappingURL=turntable.js.map