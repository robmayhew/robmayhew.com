export class UserEvent {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}
export function UserEventName(event) {
    switch (event) {
        case UserEventType.SPEAK_CLICKED:
            return "SPEAK_CLICKED";
        case UserEventType.FILE_DROPPED:
            return "FILE_DROPPED";
        case UserEventType.RATE_CHANGE:
            return "RATE_CHANGE";
        case UserEventType.VOLUME_CHANGE:
            return "VOLUEM_CHANGE";
        case UserEventType.PITCH_CHANGE:
            return "PITCH_CHANGE";
        case UserEventType.PAUSE_CLICKED:
            return "PAUSE_CLICKED";
        case UserEventType.STOP_CLICKED:
            return "STOP_CLICKED";
        case UserEventType.SAVE_SETTINGS_CLICKED:
            return "STOP_CLICKED";
        case UserEventType.START_TIMER_CLICKED:
            return "START_TIMER_CLICKED";
        case UserEventType.FORWARD_CLICKED:
            return "FORWARD_CLICKED";
        case UserEventType.BACK_CLICKED:
            return "BACK_CLICKED";
    }
    return "NULL";
}
export var UserEventType;
(function (UserEventType) {
    UserEventType[UserEventType["SPEAK_CLICKED"] = 1] = "SPEAK_CLICKED";
    UserEventType[UserEventType["FILE_DROPPED"] = 2] = "FILE_DROPPED";
    UserEventType[UserEventType["RATE_CHANGE"] = 3] = "RATE_CHANGE";
    UserEventType[UserEventType["VOLUME_CHANGE"] = 4] = "VOLUME_CHANGE";
    UserEventType[UserEventType["PITCH_CHANGE"] = 5] = "PITCH_CHANGE";
    UserEventType[UserEventType["PAUSE_CLICKED"] = 6] = "PAUSE_CLICKED";
    UserEventType[UserEventType["STOP_CLICKED"] = 7] = "STOP_CLICKED";
    UserEventType[UserEventType["SAVE_SETTINGS_CLICKED"] = 8] = "SAVE_SETTINGS_CLICKED";
    UserEventType[UserEventType["START_TIMER_CLICKED"] = 9] = "START_TIMER_CLICKED";
    UserEventType[UserEventType["FORWARD_CLICKED"] = 10] = "FORWARD_CLICKED";
    UserEventType[UserEventType["BACK_CLICKED"] = 11] = "BACK_CLICKED";
})(UserEventType || (UserEventType = {}));
