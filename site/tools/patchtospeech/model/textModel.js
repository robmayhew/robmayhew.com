export var TextModelEventType;
(function (TextModelEventType) {
    TextModelEventType[TextModelEventType["LINE_BACK"] = 0] = "LINE_BACK";
    TextModelEventType[TextModelEventType["LINE_ADVANCED"] = 1] = "LINE_ADVANCED";
    TextModelEventType[TextModelEventType["RESET"] = 2] = "RESET";
})(TextModelEventType || (TextModelEventType = {}));
export class TextModelEvent {
    constructor(eventType) {
        this.type = eventType;
    }
}
export class TextModelEventListener {
    eventFired(event) {
    }
}
export class TextModel {
    constructor() {
        this._lines = [];
        this._text = `Instructions:
        
        Locate Your Patch File: Find the patch file and drop it here.
        
        Speak!: After your patch file is placed, click on the \"Speak\" button. 
`;
        this._currentRow = 0;
        this.listeners = [];
    }
    clear() {
        this._currentRow = 0;
        this._lines = [];
        this._text = "";
        this.fireEvent(new TextModelEvent(TextModelEventType.RESET));
    }
    resetWordTracking() {
        this._currentRow = 0;
        this.fireEvent(new TextModelEvent(TextModelEventType.RESET));
    }
    advanceLine() {
        let nextRow = this._currentRow + 1;
        if (nextRow < this._lines.length) {
            let line = this._lines[this._currentRow];
            if (line === null)
                return false;
            this._currentRow++;
            let readyLine = this._lines[this._currentRow];
            if (readyLine) {
                this.fireEvent(new TextModelEvent(TextModelEventType.LINE_ADVANCED));
            }
            else {
                return this.advanceLine();
            }
            return true;
        }
        return false;
    }
    backLine() {
        let prevRow = this._currentRow - 1;
        if (prevRow < 0)
            return false;
        this._currentRow--;
        this.fireEvent(new TextModelEvent(TextModelEventType.LINE_BACK));
    }
    get currentLine() {
        if (this._currentRow < this._lines.length) {
            return this._lines[this._currentRow];
        }
        return null;
    }
    get currentRow() {
        return this._currentRow;
    }
    applyText(text) {
        this.clear();
        this._text = text;
        this.build(text);
    }
    get text() {
        return this._text;
    }
    build(text) {
        let lines = text.split('\n');
        this._lines = [];
        for (let i = 0; i < lines.length; i++) {
            this._lines.push(lines[i]);
        }
    }
    addListener(l) {
        this.listeners.push(l);
    }
    fireEvent(event) {
        for (let listener of this.listeners) {
            listener.eventFired(event);
        }
    }
}
