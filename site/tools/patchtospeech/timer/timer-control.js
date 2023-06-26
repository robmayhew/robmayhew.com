export class TimerControl {
    constructor() {
        this.context = new AudioContext();
    }
    startTimer(minutes) {
        clearTimeout(this.currentTimer);
        this.currentTimer = setTimeout(function () { this.playSound(); }.bind(this), minutes * 60 * 1000);
    }
    playSound() {
        let osc = this.context.createOscillator();
        osc.type = 'sawtooth';
        osc.frequency.value = 140; // Hz
        let gainNode = this.context.createGain();
        gainNode.gain.value = 0.01; // 10 %
        gainNode.connect(this.context.destination);
        osc.connect(this.context.destination);
        osc.connect(gainNode);
        osc.start();
        osc.stop(this.context.currentTime + 0.2);
    }
}
