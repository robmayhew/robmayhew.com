import { UserEvent, UserEventType } from "./userEvents.js";
import { AppEventType } from "../model/appEvents.js";
export class UserEventListener {
    eventFired(event) {
    }
}
export class HtmlControlls {
    constructor() {
        this.dropDiv = null;
        this.speackBtn = null;
        this.stopBtn = null;
        this.speechInput = null;
        this.rateRange = null;
        this.volumeRange = null;
        this.pitchRange = null;
        this.eventListeners = [];
        this.voiceCbx = null;
        this.pauseBtn = null;
        this.saveSettingsBtn = null;
        this.oneMinuteTimerBtn = null;
        this.twoMinutesTimerBtn = null;
        this.forwardBtn = null;
        this.backBtn = null;
    }
    bindToHtml() {
        this.speackBtn = document.getElementById("speakBtn");
        const self = this;
        this.speackBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.SPEAK_CLICKED, null));
        };
        this.stopBtn = document.getElementById("stopBtn");
        this.stopBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.STOP_CLICKED, null));
        };
        this.pauseBtn = document.getElementById("pauseBtn");
        this.pauseBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.PAUSE_CLICKED, null));
        };
        this.backBtn = document.getElementById("backBtn");
        this.backBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.BACK_CLICKED, null));
        };
        this.forwardBtn = document.getElementById("forwardBtn");
        this.forwardBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.FORWARD_CLICKED, null));
        };
        this.speechInput = document.getElementById("speechInput");
        this.dropDiv = document.getElementById("dropZone");
        this.dropDiv.ondrop = function (ev) {
            ev.preventDefault();
            if (ev.dataTransfer.items) {
                if (ev.dataTransfer.items.length == 1) {
                    let file = ev.dataTransfer.items[0].getAsFile();
                    console.log("Dropper file " + file.path);
                    self.fireEvent(new UserEvent(UserEventType.FILE_DROPPED, file));
                }
                else {
                    console.log("Only support dropp one file right now");
                }
            }
            else {
                // Use DataTransfer interface to access the file(s)
                for (let i = 0; i < ev.dataTransfer.files.length; i++) {
                    console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
                }
            }
        };
        this.rateRange = document.getElementById("rateRng");
        this.volumeRange = document.getElementById("volumeRng");
        this.pitchRange = document.getElementById("pitchRng");
        this.rateRange.onchange = function (ev) {
            let value = ev.target.value;
            console.log("Rate :" + value);
            self.fireEvent(new UserEvent(UserEventType.RATE_CHANGE, value));
        };
        this.volumeRange.onchange = function (ev) {
            let value = ev.target.value;
            console.log("Volume :" + value);
            self.fireEvent(new UserEvent(UserEventType.VOLUME_CHANGE, value));
        };
        this.pitchRange.onchange = function (ev) {
            let value = ev.target.value;
            console.log("Pitch :" + value);
            self.fireEvent(new UserEvent(UserEventType.PITCH_CHANGE, value));
        };
        this.voiceCbx = document.getElementById("voiceCbx");
        this.saveSettingsBtn = document.getElementById("saveSettingsBtn");
        this.saveSettingsBtn.onclick = function () {
            self.fireEvent((new UserEvent(UserEventType.SAVE_SETTINGS_CLICKED, null)));
        };
        this.oneMinuteTimerBtn = document.getElementById("oneMinuteTimerBtn");
        this.oneMinuteTimerBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.START_TIMER_CLICKED, 1));
        };
        this.twoMinutesTimerBtn = document.getElementById("twoMinutesTimerBtn");
        this.twoMinutesTimerBtn.onclick = function () {
            self.fireEvent(new UserEvent(UserEventType.START_TIMER_CLICKED, 2));
        };
    }
    processEvent(event) {
        if (event.eventType === AppEventType.INIT_UI) {
            this.initUIFromModel(event.model);
        }
        if (event.eventType == AppEventType.LOAD_TEXT_FROM_UI) {
            event.model.textModel.applyText(this.speechInput.value);
        }
        else if (event.eventType === AppEventType.LOAD_TEXT_INTO_UI) {
            this.speechInput.value = event.model.textModel.text;
        }
    }
    initUIFromModel(model) {
        this.speechInput.value = model.textModel.text;
        let sc = model.speechControl;
        this.rateRange.value = String(sc.rate);
        this.volumeRange.value = String(sc.volume);
        this.pitchRange.value = String(sc.pitch);
        for (let i = 0; i < model.speechControl.voices.length; i++) {
            let option = new HTMLOptionElement();
            option.text = model.speechControl.voices[i];
            option.value = "" + i;
            this.voiceCbx.options.add(option);
        }
    }
    fireEvent(event) {
        for (let listener of this.eventListeners) {
            listener.eventFired(event);
        }
    }
    addListener(listener) {
        this.eventListeners.push(listener);
    }
    renderLine(line, lineNumber) {
        document.getElementById("renderWord").innerText = line;
        let lines = this.speechInput.value.split("\n");
        let startGuess = 0;
        let end = this.speechInput.value.length;
        for (let x = 0; x < lines.length; x++) {
            if (x == lineNumber) {
                break;
            }
            startGuess += lines[x].length + 1;
        }
        end = startGuess + lines[lineNumber].length + 1;
        this.speechInput.focus();
        this.speechInput.selectionStart = startGuess;
        this.speechInput.selectionEnd = end;
    }
}
