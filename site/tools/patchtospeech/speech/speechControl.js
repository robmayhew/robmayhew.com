import { SpeechSystem } from "./speechSystem.js";
export var SpeechEventType;
(function (SpeechEventType) {
    SpeechEventType[SpeechEventType["START"] = 0] = "START";
    SpeechEventType[SpeechEventType["END"] = 1] = "END";
    SpeechEventType[SpeechEventType["PAUSED"] = 2] = "PAUSED";
    SpeechEventType[SpeechEventType["RESUMED"] = 3] = "RESUMED";
    SpeechEventType[SpeechEventType["BOUNDRY"] = 4] = "BOUNDRY";
    SpeechEventType[SpeechEventType["SPEAKING_LINE"] = 5] = "SPEAKING_LINE";
})(SpeechEventType || (SpeechEventType = {}));
export function SpeechEventName(et) {
    switch (et) {
        case SpeechEventType.START:
            return "START";
        case SpeechEventType.END:
            return "END";
        case SpeechEventType.PAUSED:
            return "PAUSED";
        case SpeechEventType.RESUMED:
            return "RESUMED";
        case SpeechEventType.BOUNDRY:
            return "BOUNDRY";
        case SpeechEventType.SPEAKING_LINE:
            return "SPEAKING_LINE";
    }
    return "NULL";
}
export class SpeechEvent {
    constructor(type) {
        this._type = type;
    }
    get type() {
        return this._type;
    }
    get line() {
        return this._line;
    }
    set line(value) {
        this._line = value;
    }
    get lineNumber() {
        return this._lineNumber;
    }
    set lineNumber(value) {
        this._lineNumber = value;
    }
}
export class SpeechEventListener {
    eventFired(event) {
    }
}
export class SpeechControl {
    constructor(appModel) {
        this.voices = [];
        this.eventListeners = [];
        this.talking = false;
        this.muteEvents = false;
        this.speechSynthesis = window.speechSynthesis;
        this.appModel = appModel;
        this.voices = window.speechSynthesis.getVoices();
        let voices = [];
        console.log("Voices length " + this.voices.length);
        for (let i = 0; this.voices.length; i++) {
            let v = this.voices[i];
            voices.push(v.name);
        }
        let self = this;
        this.speechSystem = new SpeechSystem(appModel, function () {
            self.fireEvent(new SpeechEvent(SpeechEventType.END));
        });
        appModel.speechControl.voices = voices;
        this.speechSynthesis.addEventListener("audiostart", function (ev) {
            console.log("Audio start");
        });
        this.speechSynthesis.addEventListener("audioennd", function (ev) {
            console.log("Audio end");
        });
        this.speechSynthesis.addEventListener("pause", function (ev) {
            console.log("pause");
        });
        this.speechSynthesis.addEventListener("resume", function (ev) {
            console.log("resume");
        });
    }
    pauseClicked() {
        console.log("Pause Clicked " + window.speechSynthesis.paused);
        if (window.speechSynthesis.paused) {
            window.speechSynthesis.resume();
        }
        else {
            console.log("Pausing");
            window.speechSynthesis.pause();
        }
    }
    stopClicked() {
        this.muteEvents = true;
        try {
            window.speechSynthesis.pause();
            window.speechSynthesis.cancel();
            window.speechSynthesis.resume();
        }
        finally {
            this.muteEvents = false;
        }
    }
    init() {
        this.msg = new SpeechSynthesisUtterance();
        let self = this;
        this.msg.onend = function (ev) {
            self.talking = false;
            if (self.muteEvents)
                return;
            self.fireEvent(new SpeechEvent(SpeechEventType.END));
        };
        this.msg.onstart = function (ev) {
            self.talking = true;
            if (self.muteEvents)
                return;
            self.fireEvent(new SpeechEvent(SpeechEventType.START));
        };
        this.msg.onpause = function (ev) {
            if (self.muteEvents)
                return;
            self.fireEvent(new SpeechEvent(SpeechEventType.PAUSED));
        };
        this.msg.onboundary = function (ev) {
            if (self.muteEvents)
                return;
            self.fireEvent(new SpeechEvent(SpeechEventType.BOUNDRY));
        };
        this.msg.onresume = function (ev) {
            if (self.muteEvents)
                return;
            self.fireEvent(new SpeechEvent(SpeechEventType.RESUMED));
        };
        this.msg.onmark = function (ev) {
            if (self.muteEvents)
                return;
            console.log("mark");
        };
    }
    transformLine(text) {
        text = text.replace("!", " not ");
        text = text.replace(new RegExp('_', 'g'), " ");
        return text;
    }
    speakLine(text, lineNumber) {
        this.speechSystem.stop();
        if ((!text || /^\s*$/.test(text))) {
            this.fireEvent(new SpeechEvent(SpeechEventType.END));
            return;
        }
        let event = new SpeechEvent(SpeechEventType.SPEAKING_LINE);
        event.line = text;
        event.lineNumber = lineNumber;
        this.fireEvent(event);
        let tt = this.transformLine(text);
        let sm = this.appModel.speechControl;
        // this.msg.voice = this.voices[sm.voice];
        // this.msg.volume = sm.voice;
        // this.msg.rate = sm.rate;
        // this.msg.pitch = sm.pitch;
        this.speechSystem.sayThisNow(tt);
        // this.msg.lang= 'en-US';
        // console.debug("Speaking [" + text + "]");
        // window.speechSynthesis.speak(this.msg);
    }
    fireEvent(event) {
        for (let listener of this.eventListeners) {
            listener.eventFired(event);
        }
    }
    addListener(listener) {
        this.eventListeners.push(listener);
    }
}
