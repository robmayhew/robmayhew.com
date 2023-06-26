export class PatchFileTransformer {
    constructor(model) {
        this.source = model.textModel.text;
    }
    read() {
        this.paresed = "";
        let lines = this.source.split("\n");
        let i = 0;
        let lineTypes = [];
        for (i = 0; i < lines.length; i++) {
            let lt = this.buildType(lines[i]);
            if (lt == LineType.ADD_LINE)
                this.paresed += lines[i].substring(1) + "\n";
            if (lt == LineType.FILE_NAME)
                this.paresed += "File: " + lines[i].substring(3) + "\n";
            lineTypes.push(this.buildType(lines[i]));
        }
    }
    buildType(line) {
        if (line == null || line.length == 0)
            return LineType.BLANK;
        if (line.startsWith("Index:"))
            return LineType.INDEX;
        if (line.startsWith("+++"))
            return LineType.FILE_NAME;
        if (line.startsWith("@@ ") && line.endsWith("@@"))
            return LineType.CHANGE_START;
        if (line.startsWith("+"))
            return LineType.ADD_LINE;
        if (line.startsWith("-"))
            return LineType.REMOVED_LINE;
        return LineType.UNKNOWN;
    }
}
var LineType;
(function (LineType) {
    LineType[LineType["BLANK"] = 0] = "BLANK";
    LineType[LineType["INDEX"] = 1] = "INDEX";
    LineType[LineType["FILE_NAME"] = 2] = "FILE_NAME";
    LineType[LineType["CHANGE_START"] = 3] = "CHANGE_START";
    LineType[LineType["ADD_LINE"] = 4] = "ADD_LINE";
    LineType[LineType["CHANGE_LINE"] = 5] = "CHANGE_LINE";
    LineType[LineType["REMOVED_LINE"] = 6] = "REMOVED_LINE";
    LineType[LineType["UNKNOWN"] = 7] = "UNKNOWN";
})(LineType || (LineType = {}));
