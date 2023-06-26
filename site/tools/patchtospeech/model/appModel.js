import { TextModel } from "./textModel.js";
export class AppModel {
    constructor() {
        this._textModel = new TextModel();
        this._speechControl = new SpeechControlsModel();
    }
    get speechControl() {
        return this._speechControl;
    }
    get textModel() {
        return this._textModel;
    }
    loadSettings(appSettings) {
        this._speechControl.rate = appSettings.playbackRate;
        this._speechControl.pitch = appSettings.pitch;
        this._speechControl.volume = appSettings.volume;
    }
}
export var SpeechControlState;
(function (SpeechControlState) {
    SpeechControlState[SpeechControlState["IDLE"] = 0] = "IDLE";
    SpeechControlState[SpeechControlState["PLAYING"] = 1] = "PLAYING";
    SpeechControlState[SpeechControlState["PAUSED"] = 2] = "PAUSED";
})(SpeechControlState || (SpeechControlState = {}));
export class SpeechControlsModel {
    get voices() {
        return this._voices;
    }
    set voices(value) {
        this._voices = value;
    }
    constructor() {
        this._state = SpeechControlState.IDLE;
        this._rate = 0.0;
        this._pitch = 2;
        this._volume = 1;
        this._voice = 10;
        this._voices = [];
    }
    get state() {
        return this._state;
    }
    set state(value) {
        this._state = value;
    }
    get rate() {
        return this._rate;
    }
    set rate(value) {
        this._rate = value;
    }
    get volume() {
        return this._volume;
    }
    set volume(value) {
        this._volume = value;
    }
    get voice() {
        return this._voice;
    }
    set voice(value) {
        this._voice = value;
    }
    get pitch() {
        return this._pitch;
    }
    set pitch(value) {
        this._pitch = value;
    }
}
