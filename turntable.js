var ARM_START_ANGLE = -0.40;
var ARM_END_ANGLE = -0.7;
var ARM_DURATION = 10;
var Turntable = /** @class */ (function () {
    function Turntable(plateau, armPivot) {
        this.isPlaying = false;
        this.speed = 33;
        this.volume = 50;
        this.plateau = null;
        this.armPivot = null;
        this.plateau = plateau;
        this.armPivot = armPivot;
        this.armPivot.rotation.y = 0; // position repos
    }
    Turntable.prototype.setSpeed33 = function () {
        if (this.isPlaying) {
            this.speed = 33;
        }
    };
    Turntable.prototype.setSpeed45 = function () {
        if (this.isPlaying) {
            this.speed = 45;
        }
    };
    Turntable.prototype.setVolume = function (volume) {
        this.volume = volume;
    };
    Turntable.prototype.update = function (deltaTime) {
        if (this.isPlaying && this.plateau && this.armPivot) {
            var rotationSpeed = (this.speed / 60) * 2 * Math.PI;
            this.plateau.rotation.y -= rotationSpeed * deltaTime;
            // Bras avance vers ARM_END_ANGLE
            var armSpeed = Math.abs(ARM_END_ANGLE - ARM_START_ANGLE) / ARM_DURATION;
            this.armPivot.rotation.y += armSpeed * deltaTime;
            this.armPivot.rotation.y = Math.max(this.armPivot.rotation.y, ARM_END_ANGLE);
        }
    };
    Turntable.prototype.togglePower = function () {
        this.isPlaying = !this.isPlaying;
        if (this.isPlaying) {
            this.armPivot.rotation.y = ARM_START_ANGLE;
        }
        else {
            this.armPivot.rotation.y = 0;
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