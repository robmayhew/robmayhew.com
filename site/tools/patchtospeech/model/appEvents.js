export var AppEventType;
(function (AppEventType) {
    AppEventType[AppEventType["LOAD_TEXT_FROM_UI"] = 1] = "LOAD_TEXT_FROM_UI";
    AppEventType[AppEventType["LOAD_TEXT_INTO_UI"] = 2] = "LOAD_TEXT_INTO_UI";
    AppEventType[AppEventType["INIT_UI"] = 3] = "INIT_UI";
    AppEventType[AppEventType["PLAY_PLAYBACK"] = 4] = "PLAY_PLAYBACK";
    AppEventType[AppEventType["PAUSE_PLAYBACK"] = 5] = "PAUSE_PLAYBACK";
    AppEventType[AppEventType["RESUME_PLAYBACK"] = 6] = "RESUME_PLAYBACK";
    AppEventType[AppEventType["STOP_PLAYBACK"] = 7] = "STOP_PLAYBACK";
})(AppEventType || (AppEventType = {}));
export class AppEvent {
    get eventType() {
        return this._eventType;
    }
    set eventType(value) {
        this._eventType = value;
    }
    constructor(model, eventType) {
        this._model = model;
        this._eventType = eventType;
    }
    get model() {
        return this._model;
    }
    set model(value) {
        this._model = value;
    }
}
