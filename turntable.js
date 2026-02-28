import * as TWEEN from '@tweenjs/tween.js';
var ARM_START_ANGLE = 0.4;
var ARM_END_ANGLE = 0.7;
var ARM_DURATION = 180;
var Turntable = /** @class */ (function () {
    function Turntable(plateau, armPivot) {
        this.isPlaying = false;
        this.speed = 33;
        this.vinylLight = null;
        this.volume = 50;
        this.plateau = null;
        this.armPivot = null;
        this.armTween = null;
        this.audio = null;
        this.plateau = plateau;
        this.armPivot = armPivot;
        this.armPivot.rotation.y = 0;
    }
    Turntable.prototype.setVinylLight = function (light) {
        this.vinylLight = light;
    };
    Turntable.prototype.setSpeed33 = function () {
        if (this.isPlaying)
            this.speed = 33;
    };
    Turntable.prototype.setSpeed45 = function () {
        if (this.isPlaying)
            this.speed = 45;
    };
    Turntable.prototype.setVolume = function (volume) {
        this.volume = volume;
        if (this.audio)
            this.audio.volume = volume / 100;
    };
    Turntable.prototype.playMusic = function (url) {
        if (this.audio)
            this.audio.pause();
        this.audio = new Audio(url);
        this.audio.loop = true;
        this.audio.volume = this.volume / 100;
        if (this.isPlaying)
            this.audio.play();
    };
    Turntable.prototype.stopMusic = function () {
        var _a;
        (_a = this.audio) === null || _a === void 0 ? void 0 : _a.pause();
        this.audio = null;
    };
    Turntable.prototype.togglePower = function () {
        var _this = this;
        var _a, _b, _c, _d;
        this.isPlaying = !this.isPlaying;
        if (this.armTween)
            this.armTween.stop();
        if (this.isPlaying) {
            // Lumière
            new TWEEN.Tween({ intensity: 0 })
                .to({ intensity: 2 }, 1000)
                .onUpdate(function (_a) {
                var intensity = _a.intensity;
                if (_this.vinylLight)
                    _this.vinylLight.intensity = intensity;
            })
                .start();
            // Bras se pose
            this.armPivot.rotation.y = 0;
            this.armTween = new TWEEN.Tween(this.armPivot.rotation)
                .to({ y: ARM_START_ANGLE }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(function () {
                _this.armTween = new TWEEN.Tween(_this.armPivot.rotation)
                    .to({ y: ARM_END_ANGLE }, ARM_DURATION * 1000)
                    .easing(TWEEN.Easing.Linear.None)
                    .start();
            })
                .start();
            (_a = this.audio) === null || _a === void 0 ? void 0 : _a.play();
        }
        else {
            // Lumière s'éteint
            new TWEEN.Tween({ intensity: (_c = (_b = this.vinylLight) === null || _b === void 0 ? void 0 : _b.intensity) !== null && _c !== void 0 ? _c : 0 })
                .to({ intensity: 0 }, 500)
                .onUpdate(function (_a) {
                var intensity = _a.intensity;
                if (_this.vinylLight)
                    _this.vinylLight.intensity = intensity;
            })
                .start();
            // Bras se lève
            this.armTween = new TWEEN.Tween(this.armPivot.rotation)
                .to({ y: 0 }, 1000)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
            (_d = this.audio) === null || _d === void 0 ? void 0 : _d.pause();
        }
    };
    Turntable.prototype.update = function (deltaTime) {
        if (this.isPlaying && this.plateau) {
            var rotationSpeed = (this.speed / 60) * 2 * Math.PI;
            this.plateau.rotation.y -= rotationSpeed * deltaTime;
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