import { HtmlControlls, UserEventListener } from "./ui/htmlControllers.js";
import { UserEventName, UserEventType } from "./ui/userEvents.js";
import { AppModel } from "./model/appModel.js";
import { AppEvent, AppEventType } from "./model/appEvents.js";
import { SpeechControl, SpeechEventListener, SpeechEventName, SpeechEventType } from "./speech/speechControl.js";
import { PatchFileTransformer } from "./model/patchFileTransformer.js";
import { TextModelEventListener } from "./model/textModel.js";
import { AppSettings, SettingsStorage } from "./settings/appsettings.js";
import { TimerControl } from "./timer/timer-control.js";
let appModel = new AppModel();
let view = new HtmlControlls();
let speechControl = new SpeechControl(appModel);
view.bindToHtml();
let defaultUserEventHandlers = [];
let timerControl = new TimerControl();
defaultUserEventHandlers[UserEventType.SAVE_SETTINGS_CLICKED] = function (event) {
    console.debug("Saving Settings");
    let settings = new AppSettings();
    settings.playbackRate = appModel.speechControl.rate;
    settings.pitch = appModel.speechControl.pitch;
    settings.volume = appModel.speechControl.volume;
    let store = new SettingsStorage();
    store.save(settings);
};
defaultUserEventHandlers[UserEventType.RATE_CHANGE] = function (event) {
    appModel.speechControl.rate = event.data;
};
defaultUserEventHandlers[UserEventType.PITCH_CHANGE] = function (event) {
    appModel.speechControl.pitch = event.data;
};
defaultUserEventHandlers[UserEventType.VOLUME_CHANGE] = function (event) {
    appModel.speechControl.volume = event.data;
};
defaultUserEventHandlers[UserEventType.START_TIMER_CLICKED] = function (event) {
    timerControl.startTimer(event.data);
};
class MainState {
    processUserEvent(event) { return this; }
    processSpeechEvent(event) { return this; }
    processTextModelEvent(event) { return this; }
}
function startSpeaking() {
    let appEvent = new AppEvent(appModel, AppEventType.LOAD_TEXT_FROM_UI);
    appEvent = new AppEvent(appModel, AppEventType.LOAD_TEXT_FROM_UI);
    view.processEvent(appEvent);
    speechControl.init();
    speechControl.speakLine(appModel.textModel.currentLine, appModel.textModel.currentRow);
}
class IdleState extends MainState {
    processUserEvent(event) {
        if (defaultUserEventHandlers[event.type] != undefined) {
            defaultUserEventHandlers[event.type](event);
        }
        let appEvent;
        if (event.type == UserEventType.SPEAK_CLICKED) {
            startSpeaking();
            return new PlayingState();
        }
        if (event.type == UserEventType.FILE_DROPPED) {
            let fileReader = new FileReader();
            fileReader.readAsText(event.data);
            fileReader.onload = (e) => {
                let text = fileReader.result;
                appModel.textModel.applyText(text + "");
                let pft = new PatchFileTransformer(appModel);
                pft.read();
                text = pft.paresed;
                appModel.textModel.applyText(text);
                appEvent = new AppEvent(appModel, AppEventType.LOAD_TEXT_INTO_UI);
                view.processEvent(appEvent);
            };
        }
        else if (event.type == UserEventType.RATE_CHANGE) {
            appModel.speechControl.rate = event.data;
        }
        else if (event.type == UserEventType.PITCH_CHANGE) {
            appModel.speechControl.pitch = event.data;
        }
        else if (event.type == UserEventType.VOLUME_CHANGE) {
            appModel.speechControl.volume = event.data;
        }
        return this;
    }
    processSpeechEvent(event) {
        if (event.type == SpeechEventType.SPEAKING_LINE) {
            view.renderLine(event.line, event.lineNumber);
        }
        return this;
    }
    processTextModelEvent(event) { return this; }
}
class PlayingState extends MainState {
    processUserEvent(event) {
        if (defaultUserEventHandlers[event.type] != undefined) {
            defaultUserEventHandlers[event.type](event);
        }
        if (event.type == UserEventType.PAUSE_CLICKED) {
            speechControl.pauseClicked();
            return new PausedState();
        }
        if (event.type == UserEventType.STOP_CLICKED) {
            speechControl.stopClicked();
            return new IdleState();
        }
        if (event.type == UserEventType.BACK_CLICKED) {
            appModel.textModel.backLine();
        }
        if (event.type == UserEventType.FORWARD_CLICKED) {
            appModel.textModel.advanceLine();
        }
        return this;
    }
    processSpeechEvent(event) {
        if (event.type == SpeechEventType.END) {
            if (!appModel.textModel.advanceLine()) {
                return new IdleState();
            }
        }
        if (event.type == SpeechEventType.SPEAKING_LINE) {
            view.renderLine(event.line, event.lineNumber);
        }
        return this;
    }
    processTextModelEvent(event) {
        speechControl.speakLine(appModel.textModel.currentLine, appModel.textModel.currentRow);
        return this;
    }
}
class PausedState extends MainState {
    processUserEvent(event) {
        if (defaultUserEventHandlers[event.type] != undefined) {
            defaultUserEventHandlers[event.type](event);
        }
        if (event.type == UserEventType.PAUSE_CLICKED) {
            speechControl.pauseClicked();
            return new PlayingState();
        }
        if (event.type == UserEventType.STOP_CLICKED) {
            speechControl.stopClicked();
            return new IdleState();
        }
        return this;
    }
    processSpeechEvent(event) { return this; }
    processTextModelEvent(event) { return this; }
}
let currentState = new IdleState();
class MainSpeechEventListener extends SpeechEventListener {
    eventFired(event) {
        console.debug("Speech Event " + SpeechEventName(event.type) + " current state " + currentState.constructor.name);
        currentState = currentState.processSpeechEvent(event);
    }
}
class MainTextModelListener extends TextModelEventListener {
    eventFired(event) {
        console.debug("Text Model Event " + event.type + " current state " + currentState.constructor.name);
        currentState = currentState.processTextModelEvent(event);
    }
}
class MainUserEventListener extends UserEventListener {
    eventFired(event) {
        console.debug("User Event " + UserEventName(event.type) + " current state " + currentState.constructor.name);
        currentState = currentState.processUserEvent(event);
    }
}
speechControl.addListener(new MainSpeechEventListener());
view.addListener(new MainUserEventListener());
appModel.textModel.addListener(new MainTextModelListener());
let settingsStore = new SettingsStorage();
let appSettings = settingsStore.load();
appModel.loadSettings(appSettings);
let initEvent = new AppEvent(appModel, AppEventType.INIT_UI);
view.processEvent(initEvent);
